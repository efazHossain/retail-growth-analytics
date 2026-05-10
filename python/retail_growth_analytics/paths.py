from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
MARTS_DIR = DATA_DIR / "marts"
PYTHON_OUTPUTS_DIR = PROJECT_ROOT / "python" / "outputs"


def ensure_outputs_dir() -> Path:
    PYTHON_OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    return PYTHON_OUTPUTS_DIR
