# Variance Rules

## Threshold

The default variance threshold is 10%. A metric is flagged when the absolute percentage change exceeds this threshold.

## Flag meanings

- **OK**: Variance is within the threshold. No action required.
- **MATERIAL UP**: Variance exceeds the threshold in the positive direction. Investigate whether the increase is expected or requires attention.
- **MATERIAL DOWN**: Variance exceeds the threshold in the negative direction. Investigate whether the decrease is expected or requires attention.
- **UNDEFINED**: The previous period value was zero and the current value is non-zero, making percentage change undefined.

## Review process

1. Review all MATERIAL flags before including them in the executive summary.
2. Determine whether each flagged metric is:
   - Expected (seasonal, planned, or known)
   - Beneficial (improvement in a desired direction)
   - Concerning (deterioration requiring action)
   - Data quality issue (incorrect source data)
3. Add a brief note to each flagged metric explaining the interpretation.
4. Escalate concerning variances to the operations lead.
