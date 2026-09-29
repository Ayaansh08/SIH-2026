"""Latin Hypercube Sampling (LHS) sweep generator and basin-level dataset splitters."""

from __future__ import annotations

import uuid
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set

from scipy.stats.qmc import LatinHypercube

try:
    from ml.schemas import (
        BreachScenarioParams,
        ScenarioRun,
        SplitAssignment,
        TerrainSlopeClass,
        ValleyConfinementClass,
    )
except ImportError:
    from schemas import (  # type: ignore
        BreachScenarioParams,
        ScenarioRun,
        SplitAssignment,
        TerrainSlopeClass,
        ValleyConfinementClass,
    )

# Module-level default parameter ranges for Latin Hypercube Sampling (LHS).
#
# NOTE ON LITERATURE CALIBRATION (FEMA / USBR):
# These initial default parameter ranges represent engineering estimates for dam breach and
# glacial lake outburst flood (GLOF) hydrodynamics. They MUST BE VALIDATED and calibrated
# against FEMA literature (e.g., FEMA P-946: Federal Guidelines for Inundation Mapping of
# Flood Risks Associated with Dam Incidents and Failures) and USBR guidelines (e.g.,
# USBR DSO-98-004: Prediction of Embankment Dam Breach Parameters by Tony L. Wahl;
# USBR ACER Technical Memorandum No. 11) for the specific demonstration basin under study.
DEFAULT_PARAM_RANGES: Dict[str, Any] = {
    "volume_m3": (100_000.0, 10_000_000.0),  # Impounded reservoir / lake volume (m3, 0.1 to 10 MCM)
    "breach_width_m": (20.0, 200.0),  # Final breach width in meters (USBR / Froehlich empirical envelope)
    "breach_formation_time_min": (15.0, 180.0),  # Breach formation time in minutes (0.25 to 3.0 hours)
    "mannings_n": (0.025, 0.075),  # Hydraulic roughness coefficient n (Chow 1959 gravel/boulder beds)
    "terrain_slope_class": [
        TerrainSlopeClass.STEEP,
        TerrainSlopeClass.MODERATE,
        TerrainSlopeClass.BRAIDED_PLAINS,
    ],
    "valley_confinement_class": [
        ValleyConfinementClass.CONFINED,
        ValleyConfinementClass.SEMI_CONFINED,
        ValleyConfinementClass.OPEN,
    ],
}


def generate_lhs_sweep(
    n_samples: int,
    param_ranges: Optional[Dict[str, Any]] = None,
    basin_id: str = "demo_basin",
    seed: Optional[int] = None,
) -> List[BreachScenarioParams]:
    """Generate n_samples parameter sets using Latin Hypercube Sampling (LHS).

    Samples continuous parameters uniformly over their [min, max] intervals and
    samples categorical parameters uniformly across their allowed categories.

    Args:
        n_samples: Number of parameter sets to generate (must be >= 1).
        param_ranges: Dictionary defining parameter bounds or categories. Defaults to
                      DEFAULT_PARAM_RANGES.
        basin_id: Basin identifier assigned to all generated parameter sets.
        seed: Optional integer random seed for repeatable LHS sampling.

    Returns:
        List of n_samples distinct BreachScenarioParams instances within the specified ranges.
    """
    if n_samples < 1:
        raise ValueError(f"n_samples must be a positive integer, got {n_samples}")

    ranges = dict(DEFAULT_PARAM_RANGES) if param_ranges is None else dict(param_ranges)

    canonical_order = [
        "volume_m3",
        "breach_width_m",
        "breach_formation_time_min",
        "mannings_n",
        "terrain_slope_class",
        "valley_confinement_class",
    ]
    # Retain canonical order, appending any extra custom keys
    keys: List[str] = [k for k in canonical_order if k in ranges]
    for k in ranges:
        if k not in keys:
            keys.append(k)

    num_dims = len(keys)
    sampler = LatinHypercube(d=num_dims, seed=seed)
    lhs_sample = sampler.random(n=n_samples)

    scenarios: List[BreachScenarioParams] = []
    for row in lhs_sample:
        kwargs: Dict[str, Any] = {
            "basin_id": basin_id,
            "scenario_id": str(uuid.uuid4()),
        }

        for dim_idx, key in enumerate(keys):
            spec = ranges[key]
            u = float(row[dim_idx])

            # Check if continuous range (tuple/list of 2 numbers)
            if (
                isinstance(spec, (list, tuple))
                and len(spec) == 2
                and isinstance(spec[0], (int, float))
                and isinstance(spec[1], (int, float))
            ):
                min_val = float(spec[0])
                max_val = float(spec[1])
                sampled_val = min_val + u * (max_val - min_val)
                kwargs[key] = sampled_val
            elif isinstance(spec, (list, tuple)):
                # Categorical discrete choices
                num_choices = len(spec)
                choice_idx = min(int(u * num_choices), num_choices - 1)
                kwargs[key] = spec[choice_idx]
            else:
                raise ValueError(
                    f"Invalid specification for parameter '{key}': expected (min, max) tuple or list of choices, got {spec}"
                )

        scenarios.append(BreachScenarioParams(**kwargs))

    return scenarios


class ScenarioSplitList(list):
    """Container for split scenarios providing both list and dict-like access.

    Access by split name:
        splits['train'], splits['val'], splits['test']
        splits.train, splits.val, splits.test
    Access as list of all scenarios:
        len(splits), splits[0], for s in splits
    """

    def __init__(
        self,
        train: Optional[List[Any]] = None,
        val: Optional[List[Any]] = None,
        test: Optional[List[Any]] = None,
        all_items: Optional[List[Any]] = None,
    ) -> None:
        train_list = list(train or [])
        val_list = list(val or [])
        test_list = list(test or [])
        items = list(all_items) if all_items is not None else (train_list + val_list + test_list)
        super().__init__(items)
        self._splits: Dict[str, List[Any]] = {
            "train": train_list,
            "val": val_list,
            "test": test_list,
        }

    def __getitem__(self, item: Any) -> Any:
        if isinstance(item, str):
            if item in self._splits:
                return self._splits[item]
            raise KeyError(f"Invalid split partition '{item}'. Expected one of: {list(self._splits.keys())}")
        return super().__getitem__(item)

    def __contains__(self, item: Any) -> bool:
        if isinstance(item, str) and item in self._splits:
            return True
        return super().__contains__(item)

    def get(self, key: str, default: Any = None) -> Any:
        return self._splits.get(key, default)

    @property
    def train(self) -> List[Any]:
        return self._splits["train"]

    @property
    def val(self) -> List[Any]:
        return self._splits["val"]

    @property
    def test(self) -> List[Any]:
        return self._splits["test"]

    def keys(self):
        return self._splits.keys()

    def values(self):
        return self._splits.values()

    def items(self):
        return self._splits.items()


def assign_basin_splits(
    scenarios: Sequence[Any],
    basin_ids: Iterable[str],
    val_basins: Iterable[str],
    test_basins: Iterable[str],
) -> ScenarioSplitList:
    """Implement basin-level (not per-scenario) train/val/test split per spec section 4.4.

    Assigns all scenarios originating from a given basin to the same partition
    (train, val, or test) to prevent spatial data leakage and evaluate spatial generalization.

    Args:
        scenarios: Sequence of scenarios (e.g. BreachScenarioParams, ScenarioRun, or dicts).
        basin_ids: Universe of known valid basin identifiers.
        val_basins: Basins designated for the validation set.
        test_basins: Basins designated for the test set.

    Returns:
        ScenarioSplitList containing the partitioned scenarios accessible via
        splits['train'], splits['val'], splits['test'] or as a flat scenario sequence.
    """
    basin_set: Set[str] = set(basin_ids)
    val_set: Set[str] = set(val_basins)
    test_set: Set[str] = set(test_basins)

    # Validate disjoint splits
    overlap = val_set & test_set
    if overlap:
        raise ValueError(f"val_basins and test_basins must be disjoint, found overlap: {overlap}")

    unknown_val = val_set - basin_set
    if unknown_val:
        raise ValueError(f"Validation basins not found in basin_ids: {unknown_val}")

    unknown_test = test_set - basin_set
    if unknown_test:
        raise ValueError(f"Test basins not found in basin_ids: {unknown_test}")

    train_scenarios: List[Any] = []
    val_scenarios: List[Any] = []
    test_scenarios: List[Any] = []
    processed_all: List[Any] = []

    for item in scenarios:
        # Extract basin_id
        if hasattr(item, "basin_id"):
            item_basin_id = item.basin_id
        elif isinstance(item, dict) and "basin_id" in item:
            item_basin_id = item["basin_id"]
        else:
            raise ValueError(f"Scenario item missing 'basin_id' attribute or key: {item}")

        if item_basin_id not in basin_set:
            raise ValueError(
                f"Scenario has basin_id '{item_basin_id}' not found in provided basin_ids: {basin_set}"
            )

        if item_basin_id in test_set:
            split_enum = SplitAssignment.TEST
            target_list = test_scenarios
        elif item_basin_id in val_set:
            split_enum = SplitAssignment.VAL
            target_list = val_scenarios
        else:
            split_enum = SplitAssignment.TRAIN
            target_list = train_scenarios

        # Assign split if scenario supports it
        if hasattr(item, "split"):
            try:
                item.split = split_enum
                if hasattr(item, "metadata") and isinstance(item.metadata, dict):
                    item.metadata["split"] = split_enum.value
                    item.metadata["split_assignment"] = split_enum.value
            except Exception:
                pass
        elif isinstance(item, dict):
            item["split"] = split_enum.value

        target_list.append(item)
        processed_all.append(item)

    return ScenarioSplitList(
        train=train_scenarios,
        val=val_scenarios,
        test=test_scenarios,
        all_items=processed_all,
    )
