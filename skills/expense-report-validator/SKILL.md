---
name: Expense Report Validator
description: |
  Validates expense report CSVs for missing fields, invalid dates,
  amounts exceeding threshold, and duplicate transactions. Use when
  the user asks to check, validate, audit, or review an expense report.
  Requires a CSV file with date, description, amount, and category columns.
---

## When to use this skill

Use this skill when the user provides a CSV file containing expense report data and asks to validate, check, audit, or review it for data quality issues. The skill checks for structural problems, format errors, and policy violations.

## When not to use this skill

Do not use this skill for:
- Approving or rejecting expenses (the agent should never approve, reject, reimburse, or change expenses automatically)
- Reimbursing employees
- Calculating tax deductions
- Creating expense reports from scratch

## Instructions

1. Validate that the input is a CSV file with the expected columns: date, description, amount, category.
2. Preserve the source file. Never modify, overwrite, or delete the original CSV.
3. Create a separate output directory for validation results.
4. Run the Python validator script with the appropriate threshold.
5. Check the exit code. A non-zero exit code means exceptions were found; this is expected behavior, not an error.
6. Inspect the generated exceptions file.
7. Apply the policy rules in `references/expense-policy-rules.md`.
8. Separate confirmed data errors (invalid dates, missing fields) from review flags (threshold exceeded, possible duplicates).
9. Produce a management summary showing totals, exceptions, and recommended actions.
10. Avoid approving, rejecting, reimbursing, or changing expenses automatically.

## Script usage

### validate_expenses.py

**When to use:** Run this script to perform deterministic validation of an expense CSV.

**Inputs:**
- Positional argument: path to the expense CSV file
- `--threshold`: amount threshold for flagging transactions (default: $1,000.00)

**Outputs:**
- Prints a validation summary to stdout
- Writes a `{filename}_exceptions.csv` file if exceptions are found

**Exit codes:**
- `0`: No exceptions found — all rows passed validation
- `1`: Exceptions found, or a file/structural error occurred

**Agent behavior after the script runs:**
- If exit code is 0, confirm that the report passed validation and note that human review is still recommended for business context.
- If exit code is 1, read the exceptions file, categorize each issue, and present a summary to the user.
- Always recommend corrective actions — never take corrective actions automatically.

**Example command:**
```bash
python3 skills/expense-report-validator/scripts/validate_expenses.py \
  skills/expense-report-validator/examples/sample-expenses.csv \
  --threshold 1000
```

## What still requires human review

- **Threshold flags**: An amount exceeding the threshold may be legitimate (e.g., a pre-approved conference registration). The script flags the amount; the human decides whether it is acceptable.
- **Duplicate detection**: The script identifies rows with matching date, description, and amount. These may be intentional (e.g., recurring subscriptions) or genuine errors. A human should confirm.
- **Category validity**: The script checks for empty categories but does not validate whether the category is appropriate for the expense.
- **Business context**: The script cannot determine whether an expense is reasonable given the business purpose.

## Approval boundaries

This skill produces evidence and flags only. It must not:
- Approve expenses for reimbursement
- Reject expenses
- Modify expense data
- Submit expenses to any external system

All approval and rejection decisions require explicit human action.
