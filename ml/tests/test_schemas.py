"""Unit tests for ML schemas and scenario sweep generation."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from pathlib import Path
import pytest
from pydantic import ValidationError

from ml.schemas import (
    BreachScenarioParams,
    Hydrograph,
    HydrographSource,
    InundationFrame,
    ScenarioRun,
    SplitAssignment,
    TerrainSlopeClass,
    ValleyConfinementClass,
)
from ml.scenario_sweep import (
    DEFAULT_PARAM_RANGES,
    assign_basin_splits,
    generate_lhs_sweep,
)


# =====================================================================
# BreachScenarioParams Tests
# =====================================================================


def test_breach_scenario_params_valid_instantiation():
    """Test valid instantiation of BreachScenarioParams with explicit values."""
    params = BreachScenarioParams(
        volume_m3=500_000.0,
        breach_width_m=45.0,
        breach_formation_time_min=60.0,
        terrain_slope_class=TerrainSlopeClass.STEEP,
        mannings_n=0.035,
        valley_confinement_class=ValleyConfinementClass.CONFINED,
        basin_id="teesta_basin",
    )
    assert params.volume_m3 == 500_000.0
    assert params.breach_width_m == 45.0
    assert params.breach_formation_time_min == 60.0
    assert params.terrain_slope_class == TerrainSlopeClass.STEEP
    assert params.mannings_n == 0.035
    assert params.valley_confinement_class == ValleyConfinementClass.CONFINED
    assert params.basin_id == "teesta_basin"
    assert isinstance(params.scenario_id, str)
    assert len(params.scenario_id) > 0


def test_breach_scenario_params_aliases():
    """Test that field aliases work correctly."""
    params = BreachScenarioParams(
        dam_lake_volume_m3=1_000_000.0,
        breach_width_m=80.0,
        formation_time_min=45.0,
        slope_class="moderate",
        mannings_n=0.04,
        confinement_class="open",
        basin_id="alaknanda_basin",
    )
    assert params.volume_m3 == 1_000_000.0
    assert params.breach_formation_time_min == 45.0
    assert params.terrain_slope_class == TerrainSlopeClass.MODERATE
    assert params.valley_confinement_class == ValleyConfinementClass.OPEN


def test_breach_scenario_params_validation_errors():
    """Test that invalid values trigger Pydantic ValidationError."""
    base_kwargs = {
        "volume_m3": 500_000.0,
        "breach_width_m": 50.0,
        "breach_formation_time_min": 60.0,
        "terrain_slope_class": TerrainSlopeClass.MODERATE,
        "mannings_n": 0.035,
        "valley_confinement_class": ValleyConfinementClass.OPEN,
        "basin_id": "test_basin",
    }

    # Negative / zero volume
    with pytest.raises(ValidationError):
        BreachScenarioParams(**{**base_kwargs, "volume_m3": 0})
    with pytest.raises(ValidationError):
        BreachScenarioParams(**{**base_kwargs, "volume_m3": -100})

    # Negative / zero breach width
    with pytest.raises(ValidationError):
        BreachScenarioParams(**{**base_kwargs, "breach_width_m": 0})

    # Negative / zero formation time
    with pytest.raises(ValidationError):
        BreachScenarioParams(**{**base_kwargs, "breach_formation_time_min": -10})

    # Negative / zero mannings_n
    with pytest.raises(ValidationError):
        BreachScenarioParams(**{**base_kwargs, "mannings_n": 0})

    # Invalid slope enum
    with pytest.raises(ValidationError):
        BreachScenarioParams(**{**base_kwargs, "terrain_slope_class": "flat_plains"})

    # Invalid confinement enum
    with pytest.raises(ValidationError):
        BreachScenarioParams(**{**base_kwargs, "valley_confinement_class": "canyon_deep"})


# =====================================================================
# Hydrograph Tests
# =====================================================================


def test_hydrograph_valid_instantiation():
    """Test valid instantiation with pairs and sources."""
    scenario_uuid = str(uuid.uuid4())
    series = [(0.0, 0.0), (10.0, 150.0), (30.0, 1200.0), (60.0, 300.0)]
    hg = Hydrograph(
        scenario_id=scenario_uuid,
        time_series=series,
        source=HydrographSource.SPH,
    )
    assert hg.scenario_id == scenario_uuid
    assert hg.time_series == series
    assert hg.source == HydrographSource.SPH

    # Test synthetic_placeholder
    hg2 = Hydrograph(
        scenario_id=scenario_uuid,
        series=series,
        source=HydrographSource.SYNTHETIC_PLACEHOLDER,
    )
    assert hg2.source == HydrographSource.SYNTHETIC_PLACEHOLDER


def test_hydrograph_validation_errors():
    """Test validation errors on invalid hydrograph inputs."""
    s_id = str(uuid.uuid4())

    # Empty time series
    with pytest.raises(ValidationError):
        Hydrograph(scenario_id=s_id, time_series=[], source=HydrographSource.SPH)

    # Negative timestep
    with pytest.raises(ValidationError):
        Hydrograph(
            scenario_id=s_id,
            time_series=[(-5.0, 100.0)],
            source=HydrographSource.SPH,
        )

    # Negative discharge
    with pytest.raises(ValidationError):
        Hydrograph(
            scenario_id=s_id,
            time_series=[(0.0, -10.0)],
            source=HydrographSource.SPH,
        )

    # Invalid source enum
    with pytest.raises(ValidationError):
        Hydrograph(
            scenario_id=s_id,
            time_series=[(0.0, 100.0)],
            source="unknown_model",  # type: ignore
        )


# =====================================================================
# InundationFrame Tests
# =====================================================================


def test_inundation_frame_valid():
    """Test valid InundationFrame referencing paths."""
    s_id = str(uuid.uuid4())
    frame = InundationFrame(
        scenario_id=s_id,
        timestep_minutes=30.0,
        depth_raster_path="/data/sims/raster_t30.tif",
        extent_polygon_path=Path("/data/sims/extent_t30.geojson"),
        crs="EPSG:32644",
    )
    assert frame.scenario_id == s_id
    assert frame.timestep_minutes == 30.0
    assert frame.depth_raster_path == "/data/sims/raster_t30.tif"
    assert "extent_t30.geojson" in frame.extent_polygon_path
    assert frame.crs == "EPSG:32644"


def test_inundation_frame_validation_errors():
    """Test invalid InundationFrame attributes."""
    s_id = str(uuid.uuid4())

    # Negative timestep
    with pytest.raises(ValidationError):
        InundationFrame(
            scenario_id=s_id,
            timestep_minutes=-1.0,
            depth_raster_path="/data/raster.tif",
            extent_polygon_path="/data/extent.geojson",
            crs="EPSG:4326",
        )

    # Empty path references
    with pytest.raises(ValidationError):
        InundationFrame(
            scenario_id=s_id,
            timestep_minutes=10.0,
            depth_raster_path="",
            extent_polygon_path="/data/extent.geojson",
            crs="EPSG:4326",
        )


# =====================================================================
# ScenarioRun Tests
# =====================================================================


def test_scenario_run_composition_and_metadata():
    """Test composing ScenarioRun with params, hydrograph, frames, and metadata."""
    params = BreachScenarioParams(
        volume_m3=2_000_000.0,
        breach_width_m=60.0,
        breach_formation_time_min=45.0,
        terrain_slope_class=TerrainSlopeClass.BRAIDED_PLAINS,
        mannings_n=0.03,
        valley_confinement_class=ValleyConfinementClass.SEMI_CONFINED,
        basin_id="bhagirathi_basin",
    )
    hg = Hydrograph(
        scenario_id=params.scenario_id,
        time_series=[(0.0, 0.0), (15.0, 800.0)],
        source=HydrographSource.SYNTHETIC_PLACEHOLDER,
    )
    frame = InundationFrame(
        scenario_id=params.scenario_id,
        timestep_minutes=15.0,
        depth_raster_path="runs/sim_1/depth_15.tif",
        extent_polygon_path="runs/sim_1/extent_15.geojson",
        crs="EPSG:32644",
    )

    run = ScenarioRun(
        params=params,
        hydrograph=hg,
        frames=[frame],
        split=SplitAssignment.TRAIN,
    )

    assert run.scenario_id == params.scenario_id
    assert run.basin_id == "bhagirathi_basin"
    assert run.split == SplitAssignment.TRAIN
    assert len(run.inundation_frames) == 1
    assert run.metadata["basin_id"] == "bhagirathi_basin"
    assert run.metadata["split"] == "train"
    assert "created_at" in run.metadata


def test_scenario_run_id_mismatch_validation():
    """Test that mismatched scenario_id across components raises ValidationError."""
    params = BreachScenarioParams(
        volume_m3=100_000.0,
        breach_width_m=25.0,
        breach_formation_time_min=30.0,
        terrain_slope_class=TerrainSlopeClass.MODERATE,
        mannings_n=0.03,
        valley_confinement_class=ValleyConfinementClass.CONFINED,
        basin_id="basin_a",
    )
    hg_different_id = Hydrograph(
        scenario_id=str(uuid.uuid4()),  # different id!
        time_series=[(0.0, 0.0)],
        source=HydrographSource.SPH,
    )

    with pytest.raises(ValidationError):
        ScenarioRun(scenario_params=params, hydrograph=hg_different_id)


# =====================================================================
# LHS Sweep Tests
# =====================================================================


def test_generate_lhs_sweep_produces_distinct_in_range_samples():
    """Test that generate_lhs_sweep produces n_samples distinct, in-range parameter sets."""
    n_samples = 30
    basin = "demo_test_basin"
    sweep = generate_lhs_sweep(n_samples=n_samples, basin_id=basin, seed=42)

    assert len(sweep) == n_samples

    # Check distinct scenario IDs
    scenario_ids = [s.scenario_id for s in sweep]
    assert len(set(scenario_ids)) == n_samples

    # Check distinct parameter values (no duplicate rows)
    param_signatures = [
        (s.volume_m3, s.breach_width_m, s.breach_formation_time_min, s.mannings_n)
        for s in sweep
    ]
    assert len(set(param_signatures)) == n_samples

    # Verify bounds
    vol_min, vol_max = DEFAULT_PARAM_RANGES["volume_m3"]
    w_min, w_max = DEFAULT_PARAM_RANGES["breach_width_m"]
    t_min, t_max = DEFAULT_PARAM_RANGES["breach_formation_time_min"]
    n_min, n_max = DEFAULT_PARAM_RANGES["mannings_n"]

    for s in sweep:
        assert s.basin_id == basin
        assert vol_min <= s.volume_m3 <= vol_max
        assert w_min <= s.breach_width_m <= w_max
        assert t_min <= s.breach_formation_time_min <= t_max
        assert n_min <= s.mannings_n <= n_max
        assert s.terrain_slope_class in [
            TerrainSlopeClass.STEEP,
            TerrainSlopeClass.MODERATE,
            TerrainSlopeClass.BRAIDED_PLAINS,
        ]
        assert s.valley_confinement_class in [
            ValleyConfinementClass.CONFINED,
            ValleyConfinementClass.SEMI_CONFINED,
            ValleyConfinementClass.OPEN,
        ]


def test_generate_lhs_sweep_seed_reproducibility():
    """Test that passing the same seed produces identical parameter sweeps."""
    sweep1 = generate_lhs_sweep(n_samples=10, seed=123)
    sweep2 = generate_lhs_sweep(n_samples=10, seed=123)

    for s1, s2 in zip(sweep1, sweep2):
        assert pytest.approx(s1.volume_m3) == s2.volume_m3
        assert pytest.approx(s1.breach_width_m) == s2.breach_width_m
        assert pytest.approx(s1.breach_formation_time_min) == s2.breach_formation_time_min
        assert pytest.approx(s1.mannings_n) == s2.mannings_n
        assert s1.terrain_slope_class == s2.terrain_slope_class
        assert s1.valley_confinement_class == s2.valley_confinement_class


def test_generate_lhs_sweep_custom_ranges():
    """Test LHS generation with custom user-supplied parameter ranges."""
    custom_ranges = {
        "volume_m3": (50_000.0, 80_000.0),
        "breach_width_m": (10.0, 15.0),
        "breach_formation_time_min": (20.0, 25.0),
        "mannings_n": (0.02, 0.03),
        "terrain_slope_class": [TerrainSlopeClass.STEEP],
        "valley_confinement_class": [ValleyConfinementClass.OPEN],
    }
    sweep = generate_lhs_sweep(n_samples=5, param_ranges=custom_ranges, seed=99)
    assert len(sweep) == 5
    for s in sweep:
        assert 50_000.0 <= s.volume_m3 <= 80_000.0
        assert 10.0 <= s.breach_width_m <= 15.0
        assert 20.0 <= s.breach_formation_time_min <= 25.0
        assert 0.02 <= s.mannings_n <= 0.03
        assert s.terrain_slope_class == TerrainSlopeClass.STEEP
        assert s.valley_confinement_class == ValleyConfinementClass.OPEN


# =====================================================================
# Basin-Level Split Tests
# =====================================================================


def test_assign_basin_splits_strictly_basin_level():
    """Verify that scenarios are split strictly by basin (no cross-basin contamination)."""
    basin_ids = ["basin_alpha", "basin_beta", "basin_gamma", "basin_delta"]
    val_basins = ["basin_beta"]
    test_basins = ["basin_gamma"]

    # Generate 5 scenarios per basin
    scenarios = []
    for b in basin_ids:
        sweep = generate_lhs_sweep(n_samples=5, basin_id=b, seed=7)
        scenarios.extend(sweep)

    splits = assign_basin_splits(
        scenarios=scenarios,
        basin_ids=basin_ids,
        val_basins=val_basins,
        test_basins=test_basins,
    )

    # Verification of sizes
    assert len(splits["train"]) == 10  # alpha (5) + delta (5)
    assert len(splits["val"]) == 5     # beta (5)
    assert len(splits["test"]) == 5    # gamma (5)
    assert len(splits) == 20

    # Strict partition verification: all alpha & delta in train
    for s in splits.train:
        assert s.basin_id in ["basin_alpha", "basin_delta"]

    # All beta in val
    for s in splits.val:
        assert s.basin_id == "basin_beta"

    # All gamma in test
    for s in splits.test:
        assert s.basin_id == "basin_gamma"


def test_assign_basin_splits_validation_checks():
    """Test validation errors on overlapping or invalid basin split configurations."""
    basin_ids = ["b1", "b2", "b3"]

    # Overlapping val and test
    with pytest.raises(ValueError, match="disjoint"):
        assign_basin_splits(scenarios=[], basin_ids=basin_ids, val_basins=["b2"], test_basins=["b2"])

    # Unknown validation basin
    with pytest.raises(ValueError, match="Validation basins not found"):
        assign_basin_splits(scenarios=[], basin_ids=basin_ids, val_basins=["b99"], test_basins=["b3"])

    # Unknown scenario basin
    fake_scenario = {"basin_id": "b_unknown"}
    with pytest.raises(ValueError, match="not found in provided basin_ids"):
        assign_basin_splits(
            scenarios=[fake_scenario],
            basin_ids=basin_ids,
            val_basins=["b2"],
            test_basins=["b3"],
        )
