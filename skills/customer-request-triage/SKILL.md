---
name: Customer Request Triage
description: |
  Classifies incoming customer requests by type and urgency, routes
  them to the appropriate team, and drafts initial responses. Use when
  the user asks to triage, classify, route, or prioritize customer
  requests. Requires customer message text and routing rules.
---

## When to use this skill

Use this skill when the user provides a customer request, complaint, or inquiry and asks for classification, routing, or prioritization. The skill analyzes the request, determines urgency, identifies the responsible team, and drafts a response.

## When not to use this skill

Do not use this skill for:
- Internal employee requests or IT tickets
- Automated system alerts (not customer-initiated)
- Requests that have already been resolved

## Instructions

1. Read the customer request.
2. Classify the request type: billing, technical support, feature request, complaint, or general inquiry.
3. Determine urgency based on keywords, sentiment, and impact indicators.
4. Check confidence level. If confidence is low, escalate to a human.
5. Route to the appropriate team using the routing rules.
6. Draft an initial response if the request is straightforward.
7. Present the classification, routing, and draft response for human approval.
8. Do not send any response or make any system changes without explicit approval.

## Rules

- Do NOT send customer-facing communications without human approval.
- Do NOT access or modify customer account data beyond what is necessary for classification.
- Do NOT make promises about resolution timelines without team confirmation.
- If the request is ambiguous, draft a follow-up question rather than guessing.
- If the request does not match known categories, escalate to a human.
- Log every classification decision for audit purposes.

## Confidence levels

- **High**: The request clearly matches a known category with strong keyword signals.
- **Medium**: The request likely matches a category but has ambiguous elements.
- **Low**: The request is unclear, mixed, or does not match known categories. Escalate.

## Routing rules

Refer to `references/routing-rules.md` for the complete routing table.

## Response language

Refer to `references/approved-response-language.md` for approved phrasing and prohibited language.

## What still requires human review

- **Response tone**: The AI drafts a response but humans must verify the tone is appropriate for the specific customer situation.
- **Resolution commitments**: The AI should not commit to specific resolution times without human confirmation.
- **Escalation decisions**: When confidence is low, the AI recommends escalation but the team lead decides how to handle it.
- **Complex requests**: Multi-issue requests, legal threats, or VIP customer situations always require human handling.

## Approval boundaries

This skill produces classifications and draft responses only. It must not:
- Send emails or messages to customers
- Modify customer account status
- Issue refunds or credits
- Create or close support tickets in external systems

All customer-facing actions require explicit human approval.

## Example files

- `examples/sample-requests.md` — Sample customer requests for testing
- `examples/sample-triage-output.md` — Expected triage output format
