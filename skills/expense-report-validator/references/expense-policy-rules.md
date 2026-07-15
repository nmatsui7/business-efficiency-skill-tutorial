# Expense Policy Rules

## Required columns

Every expense report CSV must contain these columns:
- `date` — The date the expense was incurred
- `description` — A brief description of the expense
- `amount` — The dollar amount (numeric)
- `category` — The expense category

## Accepted date formats

- `YYYY-MM-DD` (preferred)
- `MM/DD/YYYY`
- `MM-DD-YYYY`

## Threshold rules

- Default threshold: $1,000.00
- Expenses at or above the threshold require manager approval before reimbursement.
- Thresholds may be adjusted per department or per expense type.

## Duplicate detection

A transaction is flagged as a likely duplicate if two or more rows share the same:
- Date
- Description
- Amount

Common false positives:
- Recurring subscriptions (monthly software charges)
- Split reimbursements (same amount for different purposes on the same day)
- Legitimate repeated expenses (daily parking fees)

## Category rules

- Every expense must have a non-empty category.
- Empty categories indicate a data entry error and should be corrected before submission.

## Description rules

- Every expense must have a non-empty description.
- Descriptions should be specific enough to understand the business purpose.

## Review process

1. The script identifies data quality issues.
2. The agent categorizes issues as "confirmed error" or "review flag."
3. Confirmed errors (invalid dates, missing fields) should be returned to the submitter.
4. Review flags (threshold exceeded, possible duplicates) require manager judgment.
5. The agent presents the summary but does not make approval decisions.
