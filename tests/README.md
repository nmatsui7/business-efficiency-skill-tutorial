# Browser Test Suite

## Prerequisites

- Node.js 18+
- Playwright (installed via npm)

## Setup

```bash
cd business-efficiency-skill-tutorial
npm install
npx playwright install chromium
```

## Running Tests

1. Start the local server:
   ```bash
   python3 -m http.server 8080
   ```

2. Run the tests:
   ```bash
   npx playwright test
   ```

3. View the HTML report:
   ```bash
   npx playwright show-report
   ```

## Test Coverage

The suite covers:
- Page loading and asset verification
- Navigation links and scroll behavior
- Mobile navigation toggle
- Reading progress indicator
- Code copy buttons
- Expandable content (accordions, details)
- Process selection scorecard calculator
- Savings calculator (multiple edge cases)
- Safety checklist with localStorage persistence
- Test case builder with XSS protection
- CSV download with proper escaping
- SKILL.md template download
- Dark mode rendering
- Reduced motion support
- Responsive layouts (375px, 768px, 1440px)
- Accessibility (heading hierarchy, ARIA, duplicate IDs)
- Print layout
- Internal link validation
