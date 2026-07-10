#!/usr/bin/env python3
"""Run the complete local verification gate for the showcase."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CHECKS = [
    ("Tests", ["test"]),
    ("Content validation", ["validate"]),
    ("TypeScript", ["typecheck"]),
    ("Lint", ["lint"]),
    ("Production build", ["build"]),
]


def run_pnpm(arguments: list[str]) -> int:
    pnpm = shutil.which("pnpm")
    if not pnpm:
        print("[FAIL] pnpm is not installed or is not on PATH.", flush=True)
        return 1

    command = [pnpm, *arguments]
    if os.name == "nt":
        completed = subprocess.run(
            subprocess.list2cmdline(command),
            cwd=ROOT,
            shell=True,
            check=False,
        )
    else:
        completed = subprocess.run(command, cwd=ROOT, check=False)
    return completed.returncode


def main() -> int:
    print(f"Verifying {ROOT.name} with pnpm\n", flush=True)
    for label, arguments in CHECKS:
        print(f"[RUN ] {label}: pnpm {' '.join(arguments)}", flush=True)
        code = run_pnpm(arguments)
        if code:
            print(f"[FAIL] {label} exited with code {code}.", flush=True)
            return code
        print(f"[PASS] {label}\n", flush=True)

    print("[PASS] All verification gates completed successfully.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
