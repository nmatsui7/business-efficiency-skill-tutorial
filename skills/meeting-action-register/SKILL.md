---
name: Meeting Action Register
description: |
  Extracts action items, decisions, and owners from meeting notes and
  produces a structured action register. Use when the user provides
  meeting notes, meeting minutes, or a transcript and wants a
  structured list of action items, owners, deadlines, and decisions.
  Accepts plain-text meeting notes pasted directly or provided as a
  file path.
---

## When to use this skill

Use this skill when the user provides meeting notes, meeting minutes, or a transcript. The user may explicitly ask for action items, or they may simply share the notes expecting structured output. The skill works with informal notes, formal minutes, and partially structured documents.

## When not to use this skill

Do not use this skill for:
- Generating fake or hypothetical meeting notes
- Creating meeting agendas (this extracts from existing notes only)
- Summarizing meeting content without action items

## Instructions

1. Read the meeting notes provided by the user.
2. Identify every action item mentioned in the notes.
3. For each action item, extract:
   - **Owner:** The person assigned to perform the task. Use the exact name mentioned in the notes.
   - **Action:** A clear, specific description of what needs to be done.
   - **Deadline:** The due date or timeframe mentioned. If none is stated, write "No deadline stated."
   - **Priority:** Infer from context. Use "High" if it blocks other work or has a near-term deadline. Use "Medium" for standard follow-ups. Use "Low" for items with flexible timing.
4. Identify any decisions made during the meeting. List each decision with a one-sentence summary.
5. List any open questions or topics that need follow-up but were not assigned to a specific person.

## Rules

- Do NOT invent owners. If a task has no clear owner, write "Unassigned."
- Do NOT invent deadlines. If no date or timeframe is mentioned, write "No deadline stated."
- Do NOT add tasks that were not mentioned in the notes.
- Do NOT change the meaning of any action item. Preserve the original intent even if the wording is informal.
- If the notes are too vague to extract a specific action, skip it and note that it was unclear.

## Bundled resources

Use the bundled files in this skill directory to keep extraction rules and output format consistent:

- `references/action-item-rules.md` — Expanded rules for owner identification, deadline interpretation, and priority assignment
- `assets/action-register-template.md` — Blank template for output format
- `examples/sample-meeting-notes.txt` — Short informal meeting notes for testing
- `examples/sample-minutes.md` — Formal project meeting minutes for testing
- `examples/sample-action-register.md` — Example completed register showing the expected output style

## Output format

Present the results using `assets/action-register-template.md`:

### Action Items

| # | Owner | Action | Deadline | Priority |
|---|-------|--------|----------|----------|
| 1 | Name  | Task   | Date     | Level    |

### Decisions

1. Decision summary.

### Open Questions

1. Question or follow-up topic.

## What still requires human review

- Priority assignments are inferred from context and may not reflect actual business urgency.
- Deadlines that are ambiguous (e.g., "soon", "next week") should be confirmed with the meeting participants.
- Actions that span multiple teams may need clarification on primary ownership.
- The skill extracts what is stated but cannot verify whether action items are complete or already done.

## Approval boundaries

This skill produces a structured document only. It does not send notifications, assign tasks in project management tools, or create calendar events. Any follow-up actions (such as sending reminders or creating tickets) require explicit user approval.

## Example files

- `examples/sample-meeting-notes.txt` — A short standup meeting with informal notes
- `examples/sample-minutes.md` — Formal project meeting minutes with structured sections
- `examples/sample-action-register.md` — Expected action register style
