# Weekly Customer Portal Project Meeting Minutes

**Date:** July 14, 2026
**Time:** 10:00–11:00 a.m.
**Location:** Microsoft Teams
**Meeting chair:** Elena Park, Project Manager
**Minutes prepared by:** Sam Reed, Business Analyst

## Attendees

* Elena Park — Project Manager
* Sam Reed — Business Analyst
* Priya Shah — Customer Support Manager
* Daniel Wu — Software Development Lead
* Rachel Morgan — Quality Assurance Lead
* Marcus Green — Training and Communications Lead

## Meeting purpose

Review progress toward the August 10 internal launch of the new customer-service portal, resolve current blockers, and confirm work required before user testing begins.

---

## 1. Project status

Elena confirmed that the project remains broadly on schedule, but the testing window is becoming tight.

Development of the main portal functions is approximately 85 percent complete. The remaining work includes:

* Password-reset functionality
* Customer account search improvements
* Final notification-email templates
* A small number of interface corrections from the previous review

Daniel said the password-reset function is the largest remaining development item. His team expects to complete it by Friday, July 17, provided there are no issues with the identity-management test environment.

Elena asked whether the August 10 launch date was still realistic.

Daniel said it was achievable, but only if formal user acceptance testing begins by July 27. Rachel agreed and noted that delays beyond that date would reduce the time available for defect correction.

**Decision:** The August 10 internal launch date remains unchanged.

---

## 2. User acceptance testing

Rachel presented the draft user acceptance testing plan.

The first testing round will include eight employees from Customer Support. Testers will complete common tasks such as:

* Searching for a customer account
* Reviewing recent requests
* Updating contact information
* Resetting a customer password
* Recording a customer interaction
* Escalating a request to another team

Priya said eight testers should be sufficient, but the group should include both experienced employees and newer team members. Newer employees may identify usability issues that experienced staff overlook.

Priya will select the eight testers and provide their names to Rachel.

Rachel requested the names by Wednesday, July 22, so accounts and test data can be prepared.

Marcus asked whether testers would need instructions before the session. Rachel said they should receive only a short introduction because the test is intended to show whether the portal is understandable without detailed training.

The group agreed that Marcus will prepare a one-page testing introduction rather than a full training guide.

**Decision:** User acceptance testing will begin on Monday, July 27.

### Actions

* Priya to provide the names of eight testers to Rachel by July 22.
* Marcus to prepare a one-page testing introduction by July 24.
* Rachel to prepare test accounts and sample customer records before July 27.

---

## 3. Customer account search issue

Priya reported that the current search function requires exact spelling for customer names. This could create problems when employees receive incomplete or slightly incorrect information from callers.

Daniel confirmed that partial-name searching is already being added. He demonstrated the current development version, which returns results based on the beginning of a customer’s name.

Priya asked whether the search could also use phone numbers and email addresses.

Daniel said phone-number search is already supported. Email-address search is possible but is not currently included in the project scope.

The group discussed whether email search was necessary for launch. Priya said it would be useful but not essential because employees can normally obtain a name or phone number.

Elena recommended recording email search as a post-launch enhancement rather than delaying current work.

**Decision:** Email-address search will not be required for the August launch. It will be added to the post-launch improvement list.

### Action

* Sam to add email-address search to the post-launch enhancement register.

---

## 4. Notification-email templates

Marcus shared draft email templates for:

* Password-reset confirmations
* Customer-information updates
* Request escalations
* Request closures

Priya said the escalation email may confuse customers because it states that their request has been “transferred.” In practice, some requests remain with Customer Support while another team provides assistance.

The group agreed to replace “transferred” with wording that says the request has been “referred to the appropriate team for review.”

Daniel noted that the system currently inserts an estimated response time into escalation emails. Priya said the estimate should not be included until each receiving team confirms its service target.

Elena agreed that an inaccurate estimate would create unnecessary customer complaints.

**Decision:** Estimated response times will be removed from escalation emails for the initial launch.

### Actions

* Marcus to revise the escalation template and circulate it by July 16.
* Daniel to remove the estimated-response-time field from the initial email configuration.

---

## 5. Training approach

Marcus proposed two 45-minute online training sessions during the week before launch. Both sessions would cover the same material so employees could attend either one.

Priya asked for a short practice exercise after the demonstration. She said employees need to complete at least one account search and one customer update before using the system with live customers.

Rachel recommended using the same sample records prepared for user acceptance testing.

The group agreed that the training should include:

1. A 20-minute demonstration
2. A 15-minute guided practice exercise
3. A 10-minute question period

Training dates were not finalized because Priya needs to review team schedules.

### Actions

* Priya to send Marcus two suitable training dates by July 20.
* Marcus to draft the training outline after receiving the dates.
* Rachel to confirm whether testing records can also be used for training.

---

## 6. Risks and blockers

Elena summarized the main current risks.

### Identity-management test environment

The password-reset function depends on access to the identity-management test environment. Daniel said access was temporarily unavailable earlier in the week but had been restored.

If the environment becomes unavailable again, completion of the feature may be delayed.

### Limited testing window

User acceptance testing must begin on July 27 to leave enough time for corrections before launch.

Late delivery of test accounts, test data, or the password-reset function would reduce the available correction period.

### Training schedule

Training dates have not yet been confirmed. Marcus said the training materials can be completed on time, but employees need sufficient notice to arrange coverage.

No additional risks were raised.

---

## 7. Summary of decisions

1. The August 10 internal launch date remains unchanged.
2. User acceptance testing will begin on July 27.
3. Eight Customer Support employees will participate in testing.
4. Email-address search will be treated as a post-launch enhancement.
5. Estimated response times will be removed from escalation emails for the initial launch.
6. Training will include a demonstration, guided practice, and questions.

---

## 8. Action register

| Action                                                             | Owner  | Due date              |
| ------------------------------------------------------------------ | ------ | --------------------- |
| Complete password-reset functionality                              | Daniel | July 17               |
| Provide names of eight user acceptance testers                     | Priya  | July 22               |
| Prepare test accounts and sample records                           | Rachel | Before July 27        |
| Prepare one-page testing introduction                              | Marcus | July 24               |
| Add email-address search to enhancement register                   | Sam    | July 15               |
| Revise escalation email template                                   | Marcus | July 16               |
| Remove estimated response time from escalation email configuration | Daniel | Before testing begins |
| Propose two training dates                                         | Priya  | July 20               |
| Confirm whether test records can be reused for training            | Rachel | July 20               |

---

## 9. Open questions

* Will the identity-management test environment remain stable through completion of password-reset testing?
* Which two dates will be used for employee training?
* Can the user acceptance testing records be reused safely during training?

## Next meeting

**Date:** July 21, 2026
**Time:** 10:00–11:00 a.m.
**Main focus:** Readiness for user acceptance testing
