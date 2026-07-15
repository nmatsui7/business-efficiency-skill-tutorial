# Metric Definitions

## Revenue metrics (sales.csv)

- **revenue**: Total dollar amount of sales in the period
- **units_sold**: Number of individual units sold
- **returns**: Number of units returned by customers

## Operational metrics (operations.csv)

- **tasks_completed**: Number of tasks finished during the period
- **tasks_pending**: Number of tasks still in progress
- **avg_completion_hours**: Average time from task creation to completion
- **satisfaction_score**: Internal satisfaction rating (0–100 scale)

## Support metrics (support.csv)

- **ticket_type**: Category of support ticket
- **opened**: Number of new tickets created during the period
- **closed**: Number of tickets resolved during the period
- **avg_response_minutes**: Average time from ticket creation to first response
- **customer_satisfaction**: Customer satisfaction rating (0–100 scale)

## Derived metrics

- **Close rate**: closed / opened (for support tickets)
- **Return rate**: returns / units_sold (for sales)
- **Backlog ratio**: tasks_pending / (tasks_completed + tasks_pending)
