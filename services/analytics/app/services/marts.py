from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

from app.core.config import MARTS_DIR


def mart_path(name: str) -> Path:
    return MARTS_DIR / f"{name}.csv"


def read_mart(name: str) -> list[dict[str, Any]]:
    path = mart_path(name)
    if not path.exists():
        return []

    with path.open("r", encoding="utf-8", newline="") as handle:
        return [normalize_row(row) for row in csv.DictReader(handle)]


def normalize_row(row: dict[str, str]) -> dict[str, Any]:
    normalized: dict[str, Any] = {}
    for key, value in row.items():
        if value == "":
            normalized[key] = None
            continue
        normalized[key] = parse_value(value)
    return normalized


def parse_value(value: str) -> Any:
    try:
        if value.strip() == "":
            return None
        number = float(value)
        if number.is_integer() and "." not in value:
            return int(number)
        return number
    except ValueError:
        return value


def sort_by_month(rows: list[dict[str, Any]], descending: bool = False) -> list[dict[str, Any]]:
    return sorted(rows, key=lambda row: str(row.get("month", "")), reverse=descending)


def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default
