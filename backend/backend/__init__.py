"""Compatibility package for running uvicorn from inside /backend.

When the shell is already in /backend, `uvicorn backend.main:app` looks for a
nested package named backend. Point this shim at the real backend package one
directory up so both project-root and backend-directory launch commands work.
"""

from pathlib import Path

__path__ = [str(Path(__file__).resolve().parents[1])]
