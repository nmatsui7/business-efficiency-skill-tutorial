# Routing Rules

## Request type → Team routing

| Request Type | Primary Team | Backup Team | Escalation |
|-------------|-------------|-------------|------------|
| Billing dispute | Billing Support | Finance | Finance Manager |
| Refund request | Billing Support | Finance | Finance Manager |
| Technical bug | Engineering | DevOps | Engineering Lead |
| Feature request | Product | Engineering | Product Manager |
| Service complaint | Customer Support | Account Management | Support Director |
| Account access | Account Management | Security | Security Team |
| General inquiry | Customer Support | — | Support Lead |

## Urgency routing

| Urgency Level | Response Target | Routing |
|--------------|----------------|---------|
| Critical | 1 hour | Direct to team lead, skip queue |
| High | 4 hours | Priority queue, team lead notified |
| Medium | 24 hours | Standard queue |
| Low | 48 hours | Standard queue |

## Escalation triggers

- Customer mentions legal action
- Customer is a VIP or enterprise account
- Request involves data breach or security concern
- Request does not match any known category
- AI confidence level is low
- Customer explicitly asks for a manager
