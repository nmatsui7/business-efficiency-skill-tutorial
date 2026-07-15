#!/usr/bin/env python3
"""
Weekly KPI Report Generator

Business purpose:
    Combines multiple department CSV files (sales, operations, support)
    into a unified weekly KPI summary. Produces both a detailed CSV with
    all normalized rows and a Markdown summary with metric totals and
    variance flags.

Input assumptions:
    - Each input file is a valid CSV with UTF-8 encoding.
    - Column names may vary in case, spacing, and separators (normalized
      to lowercase snake_case during processing).
    - Numeric values may contain commas or percent signs.

Validation behavior:
    - Checks that every input file exists before processing.
    - Normalizes column names to handle inconsistent naming across files.
    - Coerces numeric values, leaving non-numeric values as strings or None.

Output behavior:
    - Writes {output-dir}/weekly_kpi_detail.csv with all combined rows.
    - Writes {output-dir}/weekly_kpi_summary.md with metric totals.
    - The output directory is created if it does not exist.
    - Source files are never modified.

Exit codes:
    0 — Report generated successfully.
    1 — Input files missing or no data loaded.

Why human review remains necessary:
    The script calculates totals and flags variances, but it cannot
    determine whether a variance is expected, beneficial, or concerning.
    The AI agent or human reviewer must interpret the numbers and draft
    the narrative summary with business context.
"""

import argparse
import csv
import json
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def load_csv(filepath: str) -> List[Dict[str, str]]:
    """Load a CSV file and return rows as dictionaries.

    Args:
        filepath: Path to the CSV file.

    Returns:
        A list of dicts, one per row.
    """
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def normalize_column_name(col: str) -> str:
    """Normalize a column name to lowercase snake_case.

    Handles spaces, hyphens, periods, and leading/trailing whitespace.
    This allows the script to combine files with slightly different
    column naming conventions.

    Args:
        col: The raw column name.

    Returns:
        A normalized lowercase snake_case string.
    """
    return (
        col.strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
        .replace(".", "_")
    )


def normalize_rows(rows: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    """Normalize column names and coerce numeric values.

    For each cell, attempts to convert the value to a float. Handles
    percent signs (strips and converts) and comma-separated numbers.
    Falls back to the original string (or None if empty) when conversion
    fails.

    Args:
        rows: Raw rows from load_csv.

    Returns:
        Rows with normalized column names and coerced numeric values.
    """
    normalized: List[Dict[str, Any]] = []
    for row in rows:
        new_row: Dict[str, Any] = {}
        for key, value in row.items():
            norm_key = normalize_column_name(key)
            cleaned = value.strip() if value else ""
            # Try to convert to number
            try:
                if cleaned.endswith("%"):
                    new_row[norm_key] = float(cleaned.rstrip("%"))
                else:
                    new_row[norm_key] = float(cleaned.replace(",", ""))
            except (ValueError, TypeError):
                new_row[norm_key] = cleaned if cleaned else None
        normalized.append(new_row)
    return normalized


def combine_files(filepaths: List[str]) -> List[Dict[str, Any]]:
    """Load and combine multiple CSV files, adding a source column.

    Each row gets a 'source_file' key with the stem of its originating
    filename (e.g., "sales" from "sales.csv").

    Args:
        filepaths: List of CSV file paths to combine.

    Returns:
        A combined list of all rows from all files.
    """
    all_rows: List[Dict[str, Any]] = []
    for fp in filepaths:
        logger.info("Loading %s", fp)
        rows = load_csv(fp)
        norm_rows = normalize_rows(rows)
        source_name = Path(fp).stem
        for row in norm_rows:
            row["source_file"] = source_name
        all_rows.extend(norm_rows)
    return all_rows


def calculate_totals(rows: List[Dict[str, Any]], key: str) -> float:
    """Sum a numeric field across all rows, ignoring None values.

    Args:
        rows: The combined data rows.
        key: The column name to sum.

    Returns:
        The total as a float.
    """
    total = 0.0
    for row in rows:
        val = row.get(key)
        if isinstance(val, (int, float)):
            total += val
    return total


def calculate_percentage_change(old: float, new: float) -> Optional[float]:
    """Calculate percentage change, avoiding division by zero.

    Args:
        old: The previous period value.
        new: The current period value.

    Returns:
        The percentage change, or None if old is zero and new is non-zero
        (undefined change).
    """
    if old == 0:
        if new == 0:
            return 0.0
        return None  # Undefined
    return ((new - old) / abs(old)) * 100


def flag_variances(
    current: float, previous: float, threshold: float = 10.0
) -> str:
    """Return a flag if the variance exceeds the threshold.

    Args:
        current: The current period total.
        previous: The previous period total (used for comparison).
        threshold: Percentage threshold for flagging (default 10.0).

    Returns:
        "OK" if within threshold, "MATERIAL UP" or "MATERIAL DOWN" with
        the percentage if exceeded, or "UNDEFINED" if change cannot be
        calculated.
    """
    change = calculate_percentage_change(previous, current)
    if change is None:
        return "UNDEFINED"
    if abs(change) > threshold:
        direction = "UP" if change > 0 else "DOWN"
        return f"MATERIAL {direction} ({change:+.1f}%)"
    return "OK"


def write_detailed_csv(filepath: str, rows: List[Dict[str, Any]]) -> None:
    """Write detailed results to a CSV file.

    Args:
        filepath: Output file path.
        rows: The combined and normalized data rows.
    """
    if not rows:
        logger.warning("No rows to write to detailed CSV.")
        return
    # Collect all fieldnames across all rows since different source files
    # may contribute different columns (e.g., sales has 'revenue' but
    # operations has 'tasks_completed').
    all_keys: set = set()
    for row in rows:
        all_keys.update(row.keys())
    fieldnames = sorted(all_keys)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    logger.info("Detailed CSV written to %s", filepath)


def write_summary_md(filepath: str, summary: Dict[str, Any]) -> None:
    """Write a Markdown summary file.

    Generates a structured Markdown document with metric totals and
    variance flags for each numeric column found in the data.

    Args:
        filepath: Output file path for the summary.
        summary: A dict containing 'generated', 'source_count', and 'metrics'.
    """
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("# Weekly KPI Summary\n\n")
        f.write(f"**Generated:** {summary.get('generated', 'N/A')}\n\n")
        f.write(f"**Sources combined:** {summary.get('source_count', 0)}\n\n")
        f.write("## Key Metrics\n\n")
        for metric in summary.get("metrics", []):
            f.write(f"### {metric['name']}\n\n")
            f.write(f"- **Total:** {metric['total']:,.2f}\n")
            f.write(f"- **Rows:** {metric['row_count']}\n")
            f.write(f"- **Variance flag:** {metric['variance_flag']}\n\n")
        f.write("## Notes\n\n")
        f.write(
            "- Variance flags marked MATERIAL indicate changes exceeding "
            "10% from the previous period.\n"
        )
        f.write(
            "- Review flagged metrics before including in the management "
            "summary.\n"
        )
    logger.info("Summary written to %s", filepath)


def main() -> int:
    """Main entry point. Parses arguments, combines data, and writes reports.

    The script accepts one or more CSV files as positional arguments.
    All files are combined, normalized, and summarized. The previous
    period is approximated as 90% of the current total for variance
    demonstration purposes; in production, actual prior-period data
    should be provided.
    """
    parser = argparse.ArgumentParser(
        description="Combine department CSVs into a weekly KPI report."
    )
    parser.add_argument(
        "files", nargs="+", help="CSV files to combine"
    )
    parser.add_argument(
        "--output-dir",
        default="output",
        help="Directory for output files (default: output)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=10.0,
        help="Variance threshold percentage (default: 10.0)",
    )
    args = parser.parse_args()

    # Validate inputs exist before doing any work
    for fp in args.files:
        if not os.path.isfile(fp):
            logger.error("File not found: %s", fp)
            return 1

    # Create output directory if needed
    os.makedirs(args.output_dir, exist_ok=True)

    # Combine data from all input files
    all_rows = combine_files(args.files)
    if not all_rows:
        logger.error("No data loaded from input files.")
        return 1

    logger.info("Combined %d rows from %d file(s).", len(all_rows), len(args.files))

    # Identify numeric columns for summary
    sample = all_rows[0]
    numeric_keys = [
        k for k, v in sample.items()
        if isinstance(v, (int, float))
    ]

    # Build summary metrics for each numeric column
    metrics = []
    for key in numeric_keys:
        total = calculate_totals(all_rows, key)
        metrics.append({
            "name": key,
            "total": total,
            "row_count": len(all_rows),
            "variance_flag": flag_variances(total, total * 0.9, args.threshold),
        })

    from datetime import datetime
    summary = {
        "generated": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source_count": len(args.files),
        "total_rows": len(all_rows),
        "metrics": metrics,
    }

    # Write output files
    detail_path = os.path.join(args.output_dir, "weekly_kpi_detail.csv")
    summary_path = os.path.join(args.output_dir, "weekly_kpi_summary.md")

    write_detailed_csv(detail_path, all_rows)
    write_summary_md(summary_path, summary)

    print(f"\nReport generated successfully.")
    print(f"  Detailed CSV:   {detail_path}")
    print(f"  Summary MD:     {summary_path}")
    print(f"  Total rows:     {len(all_rows)}")
    print(f"  Metrics:        {len(metrics)}")
    print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
