The SKILL.md Pattern for Business Efficiency

Open index.html in a modern browser. No server or build step is required.

Skill folders:
- skills/expense-report-validator/
- skills/weekly-kpi-report/
- skills/meeting-action-register/
- skills/customer-request-triage/

Basic checks:
  node --check script.js
  python3 -m py_compile skills/expense-report-validator/scripts/validate_expenses.py skills/weekly-kpi-report/scripts/summarize_kpis.py
  bash -n skills/weekly-kpi-report/scripts/check_report_files.sh

The example scripts are educational. Test them on synthetic data before adapting them to business data.
