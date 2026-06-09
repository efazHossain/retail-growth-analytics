import os
from pathlib import Path


def default_marts_dir() -> Path:
    current_file = Path(__file__).resolve()
    candidate_roots = [Path.cwd(), *current_file.parents]

    for root in candidate_roots:
        candidate = root / "data" / "marts"
        if candidate.exists():
            return candidate

    return Path.cwd() / "data" / "marts"


DEFAULT_MARTS_DIR = default_marts_dir()
MARTS_DIR = Path(os.getenv("MARTS_DIR", str(DEFAULT_MARTS_DIR)))
