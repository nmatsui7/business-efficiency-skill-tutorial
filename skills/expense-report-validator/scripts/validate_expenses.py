#!/usr/bin/env python3
"""
Expense Report Validator

Business purpose:
    Validates a CSV expense report for common data quality issues before
    management review. Identifies invalid dates, non-numeric amounts,
    missing fields, threshold violations, and likely duplicate transactions.

Input assumptions:
    - The input file is a valid CSV with UTF-8 encoding.
    - Required columns: date, description, amount, category.
    - Accepted date formats: YYYY-MM-DD, MM/DD/YYYY, MM-DD-YYYY.
    - Amounts may include dollar signs and commas (e.g., "$1,234.56").

Validation behavior:
    - Checks required columns exist before processing any rows.
    - Validates each row independently, appending all issues found.
    - Detects duplicates by comparing date + description + amount.

Output behavior:
    - Prints a human-readable summary to stdout.
    - Writes exceptions to {basename}_exceptions.csv if any are found.
    - The original source file is never modified.

Exit codes:
    0 — No exceptions found (all rows passed validation).
    1 — Exceptions found, or a structural/file error occurred.

Why human review remains necessary:
    The script flags data quality issues but cannot determine business
    context. An amount exceeding the threshold may be pre-approved. A
    "duplicate" may be a legitimate recurring charge. The script provides
    evidence; humans make decisions.
"""

import argparse
import csv
import os
import sys
from datetime import datetime
from typing import List, Dict, Tuple


# Required CSV columns. The script refuses to process a file that is
# missing any of these, because the downstream validation logic depends
# on their presence.
REQUIRED_COLUMNS = ["date", "description", "amount", "category"]

# Date formats tried in order during parsing. The first match wins.
DATE_FORMATS = ["%Y-%m-%d", "%m/%d/%Y", "%m-%d-%Y"]


def load_csv(filepath: str) -> Tuple[List[str], List[Dict[str, str]]]:
    """Load a CSV file and return headers and rows.

    Args:
        filepath: Path to the CSV file.

    Returns:
        A tuple of (headers, rows) where rows is a list of dicts.

    Raises:
        Exception: If the file cannot be read or parsed.
    """
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        rows = list(reader)
    return headers, rows


def check_required_columns(headers: List[str]) -> List[str]:
    """Return a list of missing required columns.

    Args:
        headers: The actual column headers from the CSV.

    Returns:
        A list of column names that are in REQUIRED_COLUMNS but not in headers.
    """
    missing = [col for col in REQUIRED_COLUMNS if col not in headers]
    return missing


def parse_date(value: str) -> Tuple[bool, str]:
    """Try to parse a date string against known formats.

    Args:
        value: The raw date string from the CSV.

    Returns:
        A tuple of (success, cleaned_value). On success, cleaned_value
        is the stripped original. On failure, it is the original string.
    """
    for fmt in DATE_FORMATS:
        try:
            datetime.strptime(value.strip(), fmt)
            return True, value.strip()
        except ValueError:
            continue
    return False, value


def parse_amount(value: str) -> Tuple[bool, float]:
    """Try to parse a numeric amount from a string.

    Strips dollar signs, commas, and whitespace before attempting
    float conversion.

    Args:
        value: The raw amount string from the CSV.

    Returns:
        A tuple of (success, numeric_value). On failure, numeric_value is 0.0.
    """
    cleaned = value.strip().replace(",", "").replace("$", "")
    try:
        amount = float(cleaned)
        return True, amount
    except ValueError:
        return False, 0.0


def detect_duplicates(rows: List[Dict[str, str]], headers: List[str]) -> List[int]:
    """Detect likely duplicate rows based on date, description, and amount.

    A row is considered a duplicate if its combination of date, description,
    and amount (all lowercased and stripped) matches a previously seen row.

    Args:
        rows: The list of row dicts from the CSV.
        headers: The CSV headers.

    Returns:
        A list of row indices that are likely duplicates (not the first occurrence).
    """
    seen: Dict[str, List[int]] = {}
    duplicates: List[int] = []
    for i, row in enumerate(rows):
        key_parts = []
        for col in ["date", "description", "amount"]:
            if col in headers:
                key_parts.append(row.get(col, "").strip().lower())
        key = "|".join(key_parts)
        if key in seen and seen[key]:
            duplicates.append(i)
        else:
            seen.setdefault(key, []).append(i)
    return duplicates


def validate_rows(
    rows: List[Dict[str, str]],
    headers: List[str],
    threshold: float,
) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
    """Validate each row against all rules.

    Checks performed per row:
    - Date format validity
    - Amount numeric validity and threshold compliance
    - Non-empty category
    - Non-empty description
    - Duplicate detection

    Args:
        rows: The list of row dicts from the CSV.
        headers: The CSV headers.
        threshold: Dollar amount above which a row is flagged.

    Returns:
        A tuple of (valid_rows, exception_rows). Exception rows include
        an added 'issue' column describing all problems found.
    """
    valid_rows: List[Dict[str, str]] = []
    exceptions: List[Dict[str, str]] = []
    duplicate_indices = detect_duplicates(rows, headers)

    for i, row in enumerate(rows):
        issues: List[str] = []

        # Date validation
        if "date" in headers:
            date_valid, _ = parse_date(row.get("date", ""))
            if not date_valid:
                issues.append(f"Invalid date: '{row.get('date', '')}'")

        # Amount validation
        if "amount" in headers:
            amt_valid, amount = parse_amount(row.get("amount", ""))
            if not amt_valid:
                issues.append(f"Invalid amount: '{row.get('amount', '')}'")
            elif amount > threshold:
                issues.append(
                    f"Amount ${amount:,.2f} exceeds threshold ${threshold:,.2f}"
                )

        # Category validation
        if "category" in headers:
            cat = row.get("category", "").strip()
            if not cat:
                issues.append("Empty category")

        # Description validation
        if "description" in headers:
            desc = row.get("description", "").strip()
            if not desc:
                issues.append("Empty description")

        # Duplicate detection
        if i in duplicate_indices:
            issues.append("Likely duplicate transaction")

        if issues:
            exception_row = dict(row)
            exception_row["issue"] = "; ".join(issues)
            exceptions.append(exception_row)
        else:
            valid_rows.append(row)

    return valid_rows, exceptions


def write_exceptions(filepath: str, exceptions: List[Dict[str, str]]) -> None:
    """Write exception rows to a CSV file.

    The output file contains all original columns plus an 'issue' column.

    Args:
        filepath: Output file path for the exceptions CSV.
        exceptions: List of row dicts with 'issue' added.
    """
    if not exceptions:
        return
    fieldnames = list(exceptions[0].keys())
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(exceptions)


def print_summary(
    filepath: str,
    total: int,
    valid: int,
    exceptions: int,
    exception_file: str,
    threshold: float,
) -> None:
    """Print a human-readable validation summary to stdout.

    Args:
        filepath: The original input file path.
        total: Total number of rows processed.
        valid: Number of rows that passed validation.
        exceptions: Number of rows with issues.
        exception_file: Path to the exceptions CSV (if any).
        threshold: The dollar threshold used.
    """
    print("=" * 55)
    print("  EXPENSE REPORT VALIDATION SUMMARY")
    print("=" * 55)
    print(f"  File:              {os.path.basename(filepath)}")
    print(f"  Threshold:         ${threshold:,.2f}")
    print(f"  Total rows:        {total}")
    print(f"  Valid rows:        {valid}")
    print(f"  Exceptions:        {exceptions}")
    if exceptions > 0:
        print(f"  Exception file:    {exception_file}")
    print("=" * 55)
    if exceptions == 0:
        print("  Status: PASSED - No issues detected.")
    else:
        print(f"  Status: {exceptions} issue(s) found. Review exception file.")
    print()


def main() -> int:
    """Main entry point. Parses arguments, validates, and reports.

    Exit code 0 means all rows passed. Exit code 1 means exceptions
    were found or a structural error occurred. Both are valid outcomes;
    exit code 1 does not indicate a script failure.
    """
    parser = argparse.ArgumentParser(
        description="Validate an expense report CSV file."
    )
    parser.add_argument("file", help="Path to the expense CSV file")
    parser.add_argument(
        "--threshold",
        type=float,
        default=1000.0,
        help="Amount threshold for flagging transactions (default: 1000.00)",
    )
    args = parser.parse_args()

    filepath = args.file
    if not os.path.isfile(filepath):
        print(f"Error: File not found: {filepath}", file=sys.stderr)
        return 1

    # Load data
    try:
        headers, rows = load_csv(filepath)
    except Exception as e:
        print(f"Error reading CSV: {e}", file=sys.stderr)
        return 1

    if not headers:
        print("Error: CSV file has no headers.", file=sys.stderr)
        return 1

    # Check required columns before processing any rows
    missing = check_required_columns(headers)
    if missing:
        print(
            f"Error: Missing required columns: {', '.join(missing)}",
            file=sys.stderr,
        )
        return 1

    # Validate rows
    valid_rows, exceptions = validate_rows(rows, headers, args.threshold)

    # Write exceptions to a separate file (never overwrite the source)
    base = os.path.splitext(os.path.basename(filepath))[0]
    exception_file = f"{base}_exceptions.csv"
    if exceptions:
        write_exceptions(exception_file, exceptions)

    # Print summary
    print_summary(
        filepath, len(rows), len(valid_rows), len(exceptions),
        exception_file, args.threshold,
    )

    # Non-zero exit if exceptions found — this is expected, not an error
    return 1 if exceptions else 0


if __name__ == "__main__":
    sys.exit(main())
