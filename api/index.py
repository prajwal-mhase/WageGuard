import sys
from pathlib import Path

# Make the existing backend modules importable inside Vercel's Python runtime.
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from main import app

__all__ = ["app"]
