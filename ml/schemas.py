"""Core data contracts and schemas for flood simulation workflows."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, List, Optional, Tuple, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class TerrainSlopeClass(str, Enum):
    """Terrain slope classification downstream of breach."""

    STEEP = "steep"
    MODERATE = "moderate"
    BRAIDED_PLAINS = "braided_plains"


class ValleyConfinementClass(str, Enum):
    """Valley confinement classification."""

    CONFINED = "confined"
    SEMI_CONFINED = "semi-confined"
    OPEN = "open"


class HydrographSource(str, Enum):
    """Source provenance of hydrograph data."""

    SPH = "SPH"
    SYNTHETIC_PLACEHOLDER = "synthetic_placeholder"


class SplitAssignment(str, Enum):
    """Dataset partition assignment."""

    TRAIN = "train"
    VAL = "val"
    TEST = "test"


class BreachScenarioParams(BaseModel):
    """Breach scenario parameter contract for hydrodynamics and surrogate modeling.

    Attributes:
        volume_m3: Dam or glacial lake impounded volume in cubic meters (m3).
        breach_width_m: Final breach width in meters (m).
        breach_formation_time_min: Breach formation time in minutes (min).
        terrain_slope_class: Terrain slope category (steep, moderate, braided_plains).
        mannings_n: Manning's hydraulic roughness coefficient n.
        valley_confinement_class: Valley confinement category (confined, semi-confined, open).
        basin_id: Unique identifier for the drainage basin.
        scenario_id: Unique scenario identifier (UUID string).
    """

    model_config = ConfigDict(
        populate_by_name=True,
        use_enum_values=True,
        validate_assignment=True,
    )

    volume_m3: float = Field(
        ...,
        gt=0,
        description="Dam / lake volume in cubic meters (m3)",
        alias="dam_lake_volume_m3",
    )
    breach_width_m: float = Field(
        ...,
        gt=0,
        description="Breach width in meters (m)",
    )
    breach_formation_time_min: float = Field(
        ...,
        gt=0,
        description="Breach formation time in minutes (min)",
        alias="formation_time_min",
    )
    terrain_slope_class: TerrainSlopeClass = Field(
        ...,
        description="Terrain slope classification (steep/moderate/braided_plains)",
        alias="slope_class",
    )
    mannings_n: float = Field(
        ...,
        gt=0,
        description="Manning's roughness coefficient n (float)",
    )
    valley_confinement_class: ValleyConfinementClass = Field(
        ...,
        description="Valley confinement classification (confined/semi-confined/open)",
        alias="confinement_class",
    )
    basin_id: str = Field(
        ...,
        min_length=1,
        description="Unique drainage basin identifier",
    )
    scenario_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Scenario UUID string",
    )

    @model_validator(mode="before")
    @classmethod
    def remap_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            aliases = {
                "dam_lake_volume_m3": "volume_m3",
                "dam_volume_m3": "volume_m3",
                "lake_volume_m3": "volume_m3",
                "volume": "volume_m3",
                "breach_width": "breach_width_m",
                "formation_time_min": "breach_formation_time_min",
                "formation_time_mins": "breach_formation_time_min",
                "breach_formation_time": "breach_formation_time_min",
                "slope_class": "terrain_slope_class",
                "confinement_class": "valley_confinement_class",
            }
            for alias, target in aliases.items():
                if alias in data and target not in data:
                    data[target] = data[alias]
        return data

    @field_validator("scenario_id", mode="before")
    @classmethod
    def validate_scenario_id(cls, v: Any) -> str:
        if isinstance(v, uuid.UUID):
            return str(v)
        if isinstance(v, str):
            v_str = v.strip()
            if not v_str:
                raise ValueError("scenario_id cannot be empty")
            return v_str
        raise ValueError("scenario_id must be a UUID or string")

    @field_validator("volume_m3", "breach_width_m", "breach_formation_time_min", "mannings_n")
    @classmethod
    def validate_positive(cls, v: float, info) -> float:
        if v <= 0:
            raise ValueError(f"{info.field_name} must be strictly positive (> 0), got {v}")
        return float(v)


class Hydrograph(BaseModel):
    """Inflow or breach hydrograph time series contract.

    Attributes:
        scenario_id: Unique scenario identifier (UUID string).
        time_series: List of (timestep_minutes, discharge_cumecs) coordinate pairs.
        source: Hydrograph generation provenance (SPH or synthetic_placeholder).
    """

    model_config = ConfigDict(
        populate_by_name=True,
        use_enum_values=True,
        validate_assignment=True,
    )

    scenario_id: str = Field(..., min_length=1, description="Associated scenario identifier")
    time_series: List[Tuple[float, float]] = Field(
        ...,
        description="List of (timestep_minutes: float, discharge_cumecs: float) pairs",
        alias="series",
    )
    source: HydrographSource = Field(
        ...,
        description="Hydrograph source (enum: SPH/synthetic_placeholder)",
    )

    @model_validator(mode="before")
    @classmethod
    def remap_hydrograph_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            for alias in ("series", "points", "discharge_series", "data"):
                if alias in data and "time_series" not in data:
                    data["time_series"] = data[alias]
                    break
        return data

    @field_validator("scenario_id", mode="before")
    @classmethod
    def validate_scenario_id(cls, v: Any) -> str:
        if isinstance(v, uuid.UUID):
            return str(v)
        if isinstance(v, str) and v.strip():
            return v.strip()
        raise ValueError("scenario_id must be a valid non-empty string or UUID")

    @field_validator("time_series")
    @classmethod
    def validate_time_series(cls, v: List[Tuple[float, float]]) -> List[Tuple[float, float]]:
        if not v:
            raise ValueError("time_series must contain at least one (timestep, discharge) point")
        validated: List[Tuple[float, float]] = []
        for idx, item in enumerate(v):
            if not isinstance(item, (tuple, list)) or len(item) != 2:
                raise ValueError(
                    f"Each hydrograph point must be a (timestep_minutes, discharge_cumecs) pair, got {item} at index {idx}"
                )
            t = float(item[0])
            q = float(item[1])
            if t < 0:
                raise ValueError(f"timestep_minutes cannot be negative, got {t} at index {idx}")
            if q < 0:
                raise ValueError(f"discharge_cumecs cannot be negative, got {q} at index {idx}")
            validated.append((t, q))
        return validated


class InundationFrame(BaseModel):
    """Spatial inundation frame contract referencing raster and polygon outputs.

    Attributes:
        scenario_id: Associated scenario identifier.
        timestep_minutes: Time offset in minutes from simulation start.
        depth_raster_path: File path reference to inundation depth raster (e.g. GeoTIFF).
        extent_polygon_path: File path reference to flood extent boundary polygon.
        crs: Coordinate Reference System string (e.g. 'EPSG:4326', 'EPSG:32644').
    """

    model_config = ConfigDict(
        populate_by_name=True,
        use_enum_values=True,
        validate_assignment=True,
    )

    scenario_id: str = Field(..., min_length=1, description="Associated scenario identifier")
    timestep_minutes: float = Field(..., ge=0, description="Timestep in minutes")
    depth_raster_path: str = Field(
        ...,
        min_length=1,
        description="Depth raster file path reference (not embedded array)",
        alias="depth_raster_ref",
    )
    extent_polygon_path: str = Field(
        ...,
        min_length=1,
        description="Extent polygon file path reference",
        alias="extent_polygon_ref",
    )
    crs: str = Field(..., min_length=1, description="Coordinate Reference System string")

    @model_validator(mode="before")
    @classmethod
    def remap_frame_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "depth_raster_ref" in data and "depth_raster_path" not in data:
                data["depth_raster_path"] = data["depth_raster_ref"]
            elif "depth_raster" in data and "depth_raster_path" not in data:
                data["depth_raster_path"] = data["depth_raster"]

            if "extent_polygon_ref" in data and "extent_polygon_path" not in data:
                data["extent_polygon_path"] = data["extent_polygon_ref"]
            elif "extent_polygon" in data and "extent_polygon_path" not in data:
                data["extent_polygon_path"] = data["extent_polygon"]
        return data

    @field_validator("scenario_id", mode="before")
    @classmethod
    def validate_scenario_id(cls, v: Any) -> str:
        if isinstance(v, uuid.UUID):
            return str(v)
        if isinstance(v, str) and v.strip():
            return v.strip()
        raise ValueError("scenario_id must be a non-empty string or UUID")

    @field_validator("depth_raster_path", "extent_polygon_path", mode="before")
    @classmethod
    def validate_path_string(cls, v: Any) -> str:
        if isinstance(v, Path):
            return str(v)
        if isinstance(v, str) and v.strip():
            return v.strip()
        raise ValueError("Path reference must be a non-empty string or Path object")


class ScenarioRun(BaseModel):
    """Composed flood simulation run bundle combining inputs, hydrograph, frames, and metadata.

    Attributes:
        scenario_params: BreachScenarioParams instance.
        hydrograph: Hydrograph instance.
        inundation_frames: Chronological sequence of InundationFrame outputs.
        created_at: Run creation timestamp (UTC).
        basin_id: Basin identifier (synchronized with scenario_params.basin_id).
        split: Train/val/test split assignment.
        metadata: Dictionary containing metadata (created_at, basin_id, split assignment, etc.).
    """

    model_config = ConfigDict(
        populate_by_name=True,
        use_enum_values=True,
        validate_assignment=True,
    )

    scenario_params: BreachScenarioParams = Field(..., alias="params")
    hydrograph: Hydrograph
    inundation_frames: List[InundationFrame] = Field(default_factory=list, alias="frames")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    basin_id: Optional[str] = None
    split: Optional[SplitAssignment] = Field(default=None, alias="split_assignment")
    metadata: dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="before")
    @classmethod
    def extract_metadata_and_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "params" in data and "scenario_params" not in data:
                data["scenario_params"] = data["params"]
            if "frames" in data and "inundation_frames" not in data:
                data["inundation_frames"] = data["frames"]
            if "split_assignment" in data and "split" not in data:
                data["split"] = data["split_assignment"]

            # Unpack metadata fields if nested inside metadata dict
            meta = data.get("metadata")
            if isinstance(meta, dict):
                if "created_at" in meta and "created_at" not in data:
                    data["created_at"] = meta["created_at"]
                if "basin_id" in meta and "basin_id" not in data:
                    data["basin_id"] = meta["basin_id"]
                if "split" in meta and "split" not in data:
                    data["split"] = meta["split"]
                elif "split_assignment" in meta and "split" not in data:
                    data["split"] = meta["split_assignment"]
        return data

    @model_validator(mode="after")
    def sync_and_validate(self) -> "ScenarioRun":
        # Synchronize basin_id
        if self.basin_id is None:
            self.basin_id = self.scenario_params.basin_id
        elif self.basin_id != self.scenario_params.basin_id:
            raise ValueError(
                f"ScenarioRun basin_id '{self.basin_id}' does not match "
                f"scenario_params.basin_id '{self.scenario_params.basin_id}'"
            )

        # Cross-validate scenario_id consistency
        if self.scenario_params.scenario_id != self.hydrograph.scenario_id:
            raise ValueError(
                f"Hydrograph scenario_id '{self.hydrograph.scenario_id}' does not match "
                f"scenario_params.scenario_id '{self.scenario_params.scenario_id}'"
            )

        for idx, frame in enumerate(self.inundation_frames):
            if frame.scenario_id != self.scenario_params.scenario_id:
                raise ValueError(
                    f"InundationFrame[{idx}] scenario_id '{frame.scenario_id}' does not match "
                    f"scenario_params.scenario_id '{self.scenario_params.scenario_id}'"
                )

        # Populate metadata dictionary
        self.metadata["created_at"] = self.created_at.isoformat()
        self.metadata["basin_id"] = self.basin_id
        if self.split is not None:
            split_str = self.split.value if hasattr(self.split, "value") else str(self.split)
            self.metadata["split"] = split_str
            self.metadata["split_assignment"] = split_str

        return self

    @property
    def scenario_id(self) -> str:
        """Convenience property for accessing the scenario UUID."""
        return self.scenario_params.scenario_id
