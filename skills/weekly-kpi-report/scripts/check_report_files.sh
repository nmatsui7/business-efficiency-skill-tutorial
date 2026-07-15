#!/usr/bin/env bash
# check_report_files.sh
#
# Business purpose:
#     Pre-flight checks for the weekly KPI report pipeline. Verifies that
#     the required input files exist, Python is installed, and the output
#     directory is ready. Running this script before the Python summarizer
#     prevents wasted work and confusing error messages from downstream tools.
#
# Exit codes:
#     0 — All preflight checks passed. Safe to proceed.
#     1 — One or more checks failed. Fix the issues and re-run.
#
# Why set -euo pipefail:
#     A partial preflight check could allow an incomplete business report
#     to be generated. The script stops immediately on any failure instead.
#     -e: Exit if any command fails.
#     -u: Exit if an undefined variable is referenced.
#     -o pipefail: A pipeline fails if any command in it fails.
#
# Why variables and paths are quoted:
#     Unquoted variables undergo word splitting and glob expansion. A file
#     path with spaces or special characters would break the script silently.
#
# Why dependencies are checked first:
#     The Python summarizer requires Python 3.8+. If Python is missing,
#     the script should stop before any file operations, not after.
#
# Why source files are never deleted or overwritten:
#     This script is a read-only preflight. It checks state; it does not
#     modify the input data.
#
# Why output directories are separate:
#     Generated files should not mix with source files. Keeping them
#     separate prevents accidental overwrites and makes cleanup easier.

# Exit if a command fails, an undefined variable is referenced, or any command
# in a pipeline fails. A partial preflight check could allow an incomplete
# business report to be generated, so the script stops immediately instead.
set -euo pipefail

# ---- Configuration ----
# The three CSV files required by the weekly KPI report.
# If the naming convention changes, update this list.
REQUIRED_FILES=(
    "sales.csv"
    "operations.csv"
    "support.csv"
)

PYTHON_MIN_VERSION="3.8"
OUTPUT_DIR="output"

# Accept an optional directory argument. If provided, check for files
# in that directory instead of the current working directory.
CHECK_DIR="${1:-.}"

# ---- Functions ----

log_info() {
    echo "[INFO]  $*"
}

log_ok() {
    echo "[OK]    $*"
}

log_error() {
    echo "[ERROR] $*" >&2
}

# Check that Python 3 is available on PATH.
# Tries 'python3' first, then falls back to 'python'.
# Prints the detected version for diagnostic purposes.
check_python() {
    log_info "Checking Python availability..."
    if command -v python3 &>/dev/null; then
        PY_VERSION=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
        log_ok "Python ${PY_VERSION} found."
    elif command -v python &>/dev/null; then
        PY_VERSION=$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
        log_ok "Python ${PY_VERSION} found (as 'python')."
    else
        log_error "Python is not installed or not on PATH."
        return 1
    fi
}

# Verify that each required CSV file exists in the check directory.
# Reports all missing files, not just the first one.
check_files() {
    local missing=0
    log_info "Checking required input files in: ${CHECK_DIR}"
    for file in "${REQUIRED_FILES[@]}"; do
        if [[ -f "${CHECK_DIR}/${file}" ]]; then
            log_ok "Found: ${file}"
        else
            log_error "Missing: ${file}"
            missing=$((missing + 1))
        fi
    done
    return "${missing}"
}

# Ensure the output directory exists. Create it if missing.
# This is the only write operation in the entire script.
check_output_dir() {
    log_info "Checking output directory..."
    if [[ -d "${OUTPUT_DIR}" ]]; then
        log_ok "Output directory exists: ${OUTPUT_DIR}"
    else
        log_info "Creating output directory: ${OUTPUT_DIR}"
        mkdir -p "${OUTPUT_DIR}"
        log_ok "Created: ${OUTPUT_DIR}"
    fi
}

# ---- Main ----

main() {
    echo "============================================"
    echo "  WEEKLY KPI REPORT - PRE-FLIGHT CHECKS"
    echo "============================================"
    echo ""

    errors=0

    check_python || errors=$((errors + 1))
    check_files || errors=$((errors + 1))
    check_output_dir

    echo ""
    echo "--------------------------------------------"
    if [[ ${errors} -eq 0 ]]; then
        log_ok "All preflight checks passed."
        echo "============================================"
        return 0
    else
        log_error "${errors} check(s) failed. Fix the issues above and re-run."
        echo "============================================"
        return 1
    fi
}

main "$@"
