---
name: Weekly KPI Report
description: |
  Generates the weekly KPI summary report from department CSV files.
  Use when the user asks to create, generate, build, or run the weekly
  KPI report. Triggers on phrases like "run the weekly report",
  "generate KPI summary", "build the operations report", or
  "create the Monday report". Requires sales.csv, operations.csv,
  and support.csv in the current working directory.
---

## When to use this skill

Use this skill when the user asks to generate a weekly KPI report from department CSV files. The skill combines data from multiple sources, calculates totals, flags variances, and produces a management-ready summary.

## When not to use this skill

Do not use this skill for:
- Generating monthly or annual reports (different aggregation period)
- Creating ad-hoc analyses of specific KPIs
- Sending reports via email (requires separate approval)

## Instructions

1. Inspect the provided files to confirm sales.csv, operations.csv, and support.csv are present.
2. Run the shell preflight script to verify all dependencies and required files exist.
3. Stop if files, dependencies, or required columns are missing. Report the specific issue.
4. Run the Python summarization script with the appropriate output directory.
5. Check its exit code and warnings.
6. Review the generated detailed and summary outputs.
7. Apply metric definitions and variance rules from the references.
8. Draft the executive summary with context and interpretation.
9. Flag unsupported conclusions or data quality issues.
10. Present the report for human review before distribution.

## Script usage

### check_report_files.sh (Preflight)

**When to use:** Run this script before the Python summarizer to verify prerequisites.

**Inputs:**
- Expects sales.csv, operations.csv, and support.csv in the specified directory.

**Outputs:**
- Prints pass/fail status for each check to stdout.

**Exit codes:**
- `0`: All preflight checks passed
- `1`: One or more checks failed (missing files, Python not available)

**Agent behavior after failure:**
- Read the error messages and report which specific check failed.
- Suggest corrective actions (install Python, provide missing files).
- Do not proceed to the summarization step.

**Example command:**
```bash
bash skills/weekly-kpi-report/scripts/check_report_files.sh \
  skills/weekly-kpi-report/examples
```

### summarize_kpis.py (Data processing)

**When to use:** Run this script after preflight passes to combine and analyze department data.

**Inputs:**
- Positional arguments: one or more CSV files to combine
- `--output-dir`: directory for output files (default: output)
- `--threshold`: variance threshold percentage (default: 10.0)

**Outputs:**
- `{output-dir}/weekly_kpi_detail.csv` — All combined rows with source file labels
- `{output-dir}/weekly_kpi_summary.md` — Markdown summary with metric totals and variance flags

**Exit codes:**
- `0`: Report generated successfully
- `1`: Input files missing or no data loaded

**Agent behavior after the script runs:**
- If exit code is 0, read the summary file and the detailed CSV.
- Apply metric definitions from `references/metric-definitions.md`.
- Apply variance rules from `references/variance-rules.md`.
- Draft an executive summary interpreting the numbers.
- Flag any metrics where variance flags indicate material changes.

**Example command:**
```bash
python3 skills/weekly-kpi-report/scripts/summarize_kpis.py \
  skills/weekly-kpi-report/examples/sales.csv \
  skills/weekly-kpi-report/examples/operations.csv \
  skills/weekly-kpi-report/examples/support.csv \
  --output-dir output/weekly-kpi-report
```

## What still requires human review

- **Variance interpretation**: A MATERIAL UP flag does not automatically indicate a problem. The operations lead must decide whether the change is expected, beneficial, or concerning.
- **Narrative emphasis**: The AI drafts the executive summary but the human determines which metrics deserve leadership attention.
- **Data quality**: The script processes what it receives. If source data is inaccurate, the report will be inaccurate.
- **Cross-metric correlations**: The script analyzes each metric independently. Humans must identify when multiple variances are related.

## Approval boundaries

This skill produces a report draft. It must not:
- Send the report to distribution lists
- Post to dashboards without approval
- Make hiring, budget, or resource allocation decisions based on the numbers

The operations lead must review and approve before distribution.
