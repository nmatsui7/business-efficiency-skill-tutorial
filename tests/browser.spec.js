// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:8080';

test.describe.configure({ mode: 'serial' });

/* ============================================================
   1. PAGE LOADING
   ============================================================ */
test.describe('Page Loading', () => {
  test('page loads with correct title and meta', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const response = await page.goto(BASE + '/index.html');
    expect(response.status()).toBe(200);

    await expect(page).toHaveTitle('The SKILL.md Pattern for Business Efficiency');

    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveAttribute('content', /AI-agent skills/i);

    expect(consoleErrors).toEqual([]);
  });

  test('CSS and JS assets load without 404', async ({ page }) => {
    const failedRequests = [];
    page.on('response', resp => {
      if (resp.status() >= 400) {
        failedRequests.push({ url: resp.url(), status: resp.status() });
      }
    });

    await page.goto(BASE + '/index.html');
    await page.waitForTimeout(2000);

    expect(failedRequests).toEqual([]);
  });

  test('layout is usable before JS finishes', async ({ page }) => {
    // Load with JS disabled briefly
    await page.goto(BASE + '/index.html', { waitUntil: 'domcontentloaded' });
    // Check that main structural elements exist
    await expect(page.locator('.nav')).toBeVisible();
    await expect(page.locator('.hero')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('page has correct HTML structure', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('meta[charset="UTF-8"]')).toHaveCount(1);
  });
});

/* ============================================================
   2. NAVIGATION
   ============================================================ */
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.waitForTimeout(500);
  });

  test('logo navigates to top', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(300);
    await page.click('.nav-logo');
    await page.waitForTimeout(500);
    const scrollY = await page.evaluate(() => window.pageYOffset);
    expect(scrollY).toBeLessThan(100);
  });

  test('Build Your First Skill button works', async ({ page }) => {
    await page.click('a.btn-primary:has-text("Build Your First Skill")');
    await page.waitForTimeout(800);
    const section = page.locator('#section-what-is-skill');
    await expect(section).toBeVisible();
  });

  test('View Practical Examples button works', async ({ page }) => {
    await page.click('a.btn-secondary:has-text("View Practical Examples")');
    await page.waitForTimeout(800);
    const section = page.locator('#section-meeting-example');
    await expect(section).toBeVisible();
  });

  test('nav links have correct href targets', async ({ page }) => {
    const links = page.locator('.nav-links a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toMatch(/^#/);
      const target = page.locator(href);
      await expect(target).toHaveCount(1);
    }
  });

  test('back-to-top button appears after scrolling', async ({ page }) => {
    const btn = page.locator('#backToTop');
    // Should be hidden initially
    await expect(btn).not.toHaveClass(/visible/);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(500);
    await expect(btn).toHaveClass(/visible/);
  });

  test('back-to-top returns to top', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(500);
    await page.click('#backToTop');
    await page.waitForTimeout(800);
    const scrollY = await page.evaluate(() => window.pageYOffset);
    expect(scrollY).toBeLessThan(50);
  });
});

/* ============================================================
   3. READING PROGRESS
   ============================================================ */
test.describe('Reading Progress', () => {
  test('progress bar starts near zero', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const width = await page.locator('#progressBar').evaluate(el => el.style.width);
    expect(width).toBe('0%');
  });

  test('progress bar updates on scroll', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(300);
    const val = await page.locator('#progressBar').getAttribute('aria-valuenow');
    expect(Number(val)).toBeGreaterThan(0);
  });

  test('progress bar reaches near 100% at bottom', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.waitForTimeout(1000);
    // Use keyboard End key to reliably scroll to the absolute bottom
    await page.keyboard.press('End');
    await page.waitForTimeout(500);
    const val = await page.locator('#progressBar').getAttribute('aria-valuenow');
    expect(Number(val)).toBeGreaterThanOrEqual(90);
  });

  test('progress bar does not produce invalid values', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.waitForTimeout(1000);
    // Scroll to various positions using keyboard and scroll events
    const positions = [0, 1000, 5000];
    for (const pos of positions) {
      await page.evaluate(p => window.scrollTo(0, p), pos);
      await page.waitForTimeout(200);
      const val = await page.locator('#progressBar').getAttribute('aria-valuenow');
      const num = Number(val);
      expect(num).not.toBeNaN();
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(100);
    }
    // Also test at bottom
    await page.keyboard.press('End');
    await page.waitForTimeout(300);
    const endVal = await page.locator('#progressBar').getAttribute('aria-valuenow');
    expect(Number(endVal)).toBeGreaterThanOrEqual(0);
    expect(Number(endVal)).toBeLessThanOrEqual(100);
  });
});

/* ============================================================
   4. CODE COPY CONTROLS
   ============================================================ */
test.describe('Code Copy Controls', () => {
  test('copy buttons exist and are clickable', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const buttons = page.locator('.copy-btn');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(5);

    // Check that buttons not inside closed <details> or hidden skill panels are visible
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i);
      const isHidden = await btn.evaluate(el => {
        const details = el.closest('details');
        if (details && !details.hasAttribute('open')) return true;
        const panel = el.closest('.skill-panel');
        if (panel && !panel.classList.contains('active')) return true;
        return false;
      });
      if (!isHidden) {
        await expect(btn).toBeVisible();
      }
    }
  });

  test('copy button shows confirmation text', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    // Grant clipboard permissions
    const context = page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Find a visible copy button (not inside closed details or hidden skill panels)
    const firstBtn = page.locator('.copy-btn').filter({ hasNot: page.locator('details:not([open])') }).filter({ hasNot: page.locator('.skill-panel:not(.active)') }).first();
    await firstBtn.scrollIntoViewIfNeeded();
    await firstBtn.click();

    await expect(firstBtn).toHaveText('Copied!');
    await expect(firstBtn).toHaveClass(/copied/);

    // Wait for text to restore
    await page.waitForTimeout(2500);
    await expect(firstBtn).not.toHaveText('Copied!');
    await expect(firstBtn).not.toHaveClass(/copied/);
  });

  test('copy button copies correct code content', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const context = page.context();
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Find a visible copy button (not inside closed details or hidden skill panels)
    const visibleBtn = page.locator('.copy-btn').filter({ hasNot: page.locator('details:not([open])') }).filter({ hasNot: page.locator('.skill-panel:not(.active)') }).first();
    const targetId = await visibleBtn.getAttribute('data-copy');
    const expectedText = await page.locator('#' + targetId).textContent();

    await visibleBtn.scrollIntoViewIfNeeded();
    await visibleBtn.click();
    await page.waitForTimeout(300);

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain(expectedText.substring(0, 50));
  });
});

/* ============================================================
   5. EXPANDABLE CONTENT (ACCORDIONS)
   ============================================================ */
test.describe('Expandable Content', () => {
  test('accordion items open and close', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-debugging').scrollIntoViewIfNeeded();

    const triggers = page.locator('.accordion-trigger');
    const count = await triggers.count();
    expect(count).toBe(10);

    // Click first accordion
    const first = triggers.first();
    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    const panel = first.locator('+ .accordion-panel');
    await expect(panel).toBeVisible();

    // Close it
    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).not.toBeVisible();
  });

  test('accordion keyboard operation works', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-debugging').scrollIntoViewIfNeeded();

    const first = page.locator('.accordion-trigger').first();
    await first.focus();

    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  test('details elements open and close', async ({ page }) => {
    await page.goto(BASE + '/index.html');

    // Find the first visible details element (skip those inside hidden skill panels)
    const details = page.locator('details');
    const count = await details.count();

    let visibleDetails = null;
    for (let i = 0; i < count; i++) {
      const d = details.nth(i);
      const vis = await d.evaluate(el => {
        const panel = el.closest('.skill-panel');
        if (panel && !panel.classList.contains('active')) return false;
        return true;
      });
      if (vis) { visibleDetails = d; break; }
    }

    if (visibleDetails) {
      // Open it
      await visibleDetails.locator('summary').scrollIntoViewIfNeeded();
      await visibleDetails.locator('summary').click();
      await expect(visibleDetails).toHaveAttribute('open', '');

      // Close it
      await visibleDetails.locator('summary').click();
      await expect(visibleDetails).not.toHaveAttribute('open', '');
    }
  });
});

/* ============================================================
   6. PROCESS SELECTION SCORECARD
   ============================================================ */
test.describe('Process Selection Scorecard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-choose-process').scrollIntoViewIfNeeded();
  });

  test('scorecard has 8 sliders', async ({ page }) => {
    const sliders = page.locator('.score-slider');
    await expect(sliders).toHaveCount(8);
  });

  test('all sliders at min = score 8', async ({ page }) => {
    const sliders = page.locator('.score-slider');
    for (let i = 0; i < 8; i++) {
      await sliders.nth(i).fill('1');
    }
    await page.waitForTimeout(200);
    const score = await page.locator('#totalScore').textContent();
    expect(score).toBe('8');
  });

  test('all sliders at max = score 40', async ({ page }) => {
    const sliders = page.locator('.score-slider');
    for (let i = 0; i < 8; i++) {
      await sliders.nth(i).fill('5');
    }
    await page.waitForTimeout(200);
    const score = await page.locator('#totalScore').textContent();
    expect(score).toBe('40');
  });

  test('mixed values calculate correctly', async ({ page }) => {
    const sliders = page.locator('.score-slider');
    const values = [3, 4, 5, 2, 4, 3, 5, 4]; // sum = 30
    for (let i = 0; i < 8; i++) {
      await sliders.nth(i).fill(String(values[i]));
    }
    await page.waitForTimeout(200);
    const score = await page.locator('#totalScore').textContent();
    expect(score).toBe('30');
  });

  test('interpretation changes at thresholds', async ({ page }) => {
    const sliders = page.locator('.score-slider');

    // Low (score 8)
    for (let i = 0; i < 8; i++) await sliders.nth(i).fill('1');
    await page.waitForTimeout(200);
    let interp = await page.locator('#scoreInterpretation').textContent();
    expect(interp).toMatch(/Low priority/i);

    // Medium (score 24)
    for (let i = 0; i < 8; i++) await sliders.nth(i).fill('3');
    await page.waitForTimeout(200);
    interp = await page.locator('#scoreInterpretation').textContent();
    expect(interp).toMatch(/Worth investigating/i);

    // High (score 36)
    for (let i = 0; i < 8; i++) await sliders.nth(i).fill('5');
    await page.waitForTimeout(200);
    interp = await page.locator('#scoreInterpretation').textContent();
    expect(interp).toMatch(/Strong first skill/i);
  });
});

/* ============================================================
   7. SAVINGS CALCULATOR
   ============================================================ */
test.describe('Savings Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-measurement').scrollIntoViewIfNeeded();
  });

  async function setCalcValues(page, values) {
    await page.fill('#calcMinutesBefore', String(values.before));
    await page.fill('#calcMinutesAfter', String(values.after));
    await page.fill('#calcRunsPerMonth', String(values.runs));
    await page.fill('#calcHourlyCost', String(values.cost));
    await page.fill('#calcErrorsBefore', String(values.errorsBefore));
    await page.fill('#calcErrorsAfter', String(values.errorsAfter));
  }

  test('normal case: 120→30, 8 runs, $50/hr, 10→4 errors', async ({ page }) => {
    await setCalcValues(page, {
      before: 120, after: 30, runs: 8,
      cost: 50, errorsBefore: 10, errorsAfter: 4
    });

    const hours = await page.locator('#resultHoursValue').textContent();
    expect(hours).toBe('12.0 hours');

    const value = await page.locator('#resultValueValue').textContent();
    expect(value).toBe('$7,200');

    const errors = await page.locator('#resultErrorsValue').textContent();
    expect(errors).toBe('60.0% reduction');
  });

  test('no time saved (before = after)', async ({ page }) => {
    await setCalcValues(page, {
      before: 60, after: 60, runs: 4,
      cost: 75, errorsBefore: 5, errorsAfter: 2
    });

    const hours = await page.locator('#resultHoursValue').textContent();
    expect(hours).toBe('0.0 hours');
  });

  test('negative saving clamped to zero', async ({ page }) => {
    await setCalcValues(page, {
      before: 30, after: 120, runs: 4,
      cost: 75, errorsBefore: 5, errorsAfter: 2
    });

    const hours = await page.locator('#resultHoursValue').textContent();
    expect(hours).toBe('0.0 hours');
  });

  test('zero errors before - no divide by zero', async ({ page }) => {
    await setCalcValues(page, {
      before: 60, after: 30, runs: 4,
      cost: 50, errorsBefore: 0, errorsAfter: 0
    });

    const errors = await page.locator('#resultErrorsValue').textContent();
    expect(errors).toBe('0.0% reduction');
    expect(errors).not.toContain('Infinity');
    expect(errors).not.toContain('NaN');
  });

  test('empty values produce no NaN', async ({ page }) => {
    await page.fill('#calcMinutesBefore', '');
    await page.fill('#calcMinutesAfter', '');
    await page.fill('#calcRunsPerMonth', '');
    await page.fill('#calcHourlyCost', '');
    await page.fill('#calcErrorsBefore', '');
    await page.fill('#calcErrorsAfter', '');

    await page.waitForTimeout(300);

    const hours = await page.locator('#resultHoursValue').textContent();
    const value = await page.locator('#resultValueValue').textContent();
    const errors = await page.locator('#resultErrorsValue').textContent();

    expect(hours).not.toContain('NaN');
    expect(value).not.toContain('NaN');
    expect(errors).not.toContain('NaN');
  });

  test('currency formatting uses dollar sign and commas', async ({ page }) => {
    await setCalcValues(page, {
      before: 120, after: 30, runs: 10,
      cost: 100, errorsBefore: 5, errorsAfter: 1
    });

    const value = await page.locator('#resultValueValue').textContent();
    expect(value).toMatch(/^\$/);
    expect(value).toContain(',');
  });
});

/* ============================================================
   8. SAFETY CHECKLIST
   ============================================================ */
test.describe('Safety Checklist', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-safe-scripting').scrollIntoViewIfNeeded();
    // Clear localStorage
    await page.evaluate(() => localStorage.removeItem('safetyChecklist'));
    await page.reload();
    await page.locator('#section-safe-scripting').scrollIntoViewIfNeeded();
  });

  test('checklist has 12 items', async ({ page }) => {
    const checkboxes = page.locator('.checklist-cb');
    await expect(checkboxes).toHaveCount(12);
  });

  test('checkbox can be checked and unchecked', async ({ page }) => {
    const cb = page.locator('#check-1');
    await expect(cb).not.toBeChecked();
    await cb.check();
    await expect(cb).toBeChecked();
    await cb.uncheck();
    await expect(cb).not.toBeChecked();
  });

  test('state saves to localStorage', async ({ page }) => {
    const cb = page.locator('#check-1');
    await cb.check();

    const stored = await page.evaluate(() => localStorage.getItem('safetyChecklist'));
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored);
    expect(parsed['check-1']).toBe(true);
  });

  test('state survives reload', async ({ page }) => {
    await page.locator('#check-1').check();
    await page.locator('#check-3').check();
    await page.reload();
    await page.locator('#section-safe-scripting').scrollIntoViewIfNeeded();

    await expect(page.locator('#check-1')).toBeChecked();
    await expect(page.locator('#check-3')).toBeChecked();
    await expect(page.locator('#check-2')).not.toBeChecked();
  });

  test('invalid localStorage does not break page', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('safetyChecklist', '{invalid json'));
    await page.reload();
    // Page should load without errors
    await expect(page.locator('.checklist-cb')).toHaveCount(12);
  });

  test('clearing storage restores defaults', async ({ page }) => {
    await page.locator('#check-1').check();
    await page.evaluate(() => localStorage.removeItem('safetyChecklist'));
    await page.reload();
    await page.locator('#section-safe-scripting').scrollIntoViewIfNeeded();
    await expect(page.locator('#check-1')).not.toBeChecked();
  });
});

/* ============================================================
   9. TEST CASE BUILDER
   ============================================================ */
test.describe('Test Case Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-testing').scrollIntoViewIfNeeded();
  });

  test('can add a valid test case', async ({ page }) => {
    await page.fill('#testName', 'Valid CSV passes');
    await page.fill('#testInput', 'CSV with all columns');
    await page.fill('#testExpected', 'Exit code 0');
    await page.fill('#testCriterion', 'All rows pass');
    await page.click('#addTestCase');

    const rows = page.locator('#testCasesBody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first().locator('td').nth(1)).toHaveText('Valid CSV passes');
  });

  test('multiple test cases can be added', async ({ page }) => {
    await page.fill('#testName', 'Test 1');
    await page.click('#addTestCase');
    await page.fill('#testName', 'Test 2');
    await page.click('#addTestCase');
    await page.fill('#testName', 'Test 3');
    await page.click('#addTestCase');

    await expect(page.locator('#testCasesBody tr')).toHaveCount(3);
  });

  test('empty test name is rejected', async ({ page }) => {
    await page.fill('#testName', '');
    await page.click('#addTestCase');
    await expect(page.locator('#testCasesBody tr')).toHaveCount(0);
  });

  test('form clears after adding', async ({ page }) => {
    await page.fill('#testName', 'My test');
    await page.fill('#testInput', 'Some input');
    await page.click('#addTestCase');

    const nameVal = await page.inputValue('#testName');
    expect(nameVal).toBe('');
  });

  test('XSS injection is rendered as text not HTML', async ({ page }) => {
    const xssPayload = '<img src=x onerror="document.body.dataset.injection=\'failed\'">';
    await page.fill('#testName', xssPayload);
    await page.click('#addTestCase');

    // Check it appears as text in the table
    const cellText = await page.locator('#testCasesBody tr td').nth(1).textContent();
    expect(cellText).toContain('<img');
    expect(cellText).toContain('onerror');

    // Check the injection did NOT execute
    const injected = await page.evaluate(() => document.body.dataset.injection);
    expect(injected).toBeUndefined();
  });

  test('remove button deletes test case', async ({ page }) => {
    await page.fill('#testName', 'To remove');
    await page.click('#addTestCase');
    await expect(page.locator('#testCasesBody tr')).toHaveCount(1);

    await page.locator('#testCasesBody .btn-outline').click();
    await expect(page.locator('#testCasesBody tr')).toHaveCount(0);
  });
});

/* ============================================================
   10. CSV DOWNLOAD
   ============================================================ */
test.describe('CSV Download', () => {
  test('download button exists', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-testing').scrollIntoViewIfNeeded();
    await expect(page.locator('#downloadCSV')).toBeVisible();
  });

  test('clicking with no test cases does nothing', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-testing').scrollIntoViewIfNeeded();

    const downloadPromise = page.waitForEvent('download', { timeout: 2000 }).catch(() => null);
    await page.click('#downloadCSV');
    const download = await downloadPromise;
    expect(download).toBeNull();
  });

  test('download produces valid CSV with test cases', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-testing').scrollIntoViewIfNeeded();

    // Add test cases
    await page.fill('#testName', 'Test with, comma');
    await page.fill('#testExpected', 'Passes "quoted" ok');
    await page.click('#addTestCase');
    await page.fill('#testName', 'Unicode test — café');
    await page.click('#addTestCase');

    const downloadPromise = page.waitForEvent('download');
    await page.click('#downloadCSV');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('test_cases.csv');

    const content = await download.path().then(async p => {
      const fs = require('fs');
      return fs.readFileSync(p, 'utf8');
    });

    // Verify header
    expect(content).toContain('Test Name,Input Condition,Expected Behavior,Acceptance Criterion');

    // Verify rows
    expect(content).toContain('Test with, comma');
    expect(content).toContain('Unicode test');
    expect(content).toContain('café');

    // Verify CSV escaping
    expect(content).toContain('"Test with, comma"');
    expect(content).toContain('"Passes ""quoted"" ok"');
  });
});

/* ============================================================
   11. SKILL.MD TEMPLATE DOWNLOAD
   ============================================================ */
test.describe('SKILL.md Template Download', () => {
  test('download button exists', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-template').scrollIntoViewIfNeeded();
    await expect(page.locator('#downloadTemplate')).toBeVisible();
  });

  test('download creates correct file', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-template').scrollIntoViewIfNeeded();

    const downloadPromise = page.waitForEvent('download');
    await page.click('#downloadTemplate');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('SKILL.md');

    const content = await download.path().then(async p => {
      const fs = require('fs');
      return fs.readFileSync(p, 'utf8');
    });

    expect(content).toContain('---');
    expect(content).toContain('name:');
    expect(content).toContain('description:');
    expect(content).toContain('# Skill Title');
    expect(content).toContain('## Business outcome');
    expect(content).toContain('## Process');
    expect(content).toContain('### Step 1: Inspect the inputs');
    expect(content).toContain('## Quality checklist');
    expect(content).toContain('## Test prompts');
  });

  test('repeated downloads work', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#section-template').scrollIntoViewIfNeeded();

    for (let i = 0; i < 3; i++) {
      const downloadPromise = page.waitForEvent('download');
      await page.click('#downloadTemplate');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toBe('SKILL.md');
    }
  });
});

/* ============================================================
   12. MOBILE NAVIGATION
   ============================================================ */
test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('mobile nav toggle is visible', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await expect(page.locator('#navToggle')).toBeVisible();
  });

  test('nav toggle opens and closes menu', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const toggle = page.locator('#navToggle');
    const navLinks = page.locator('#navLinks');

    // Initially closed
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    // Open
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(navLinks).toHaveClass(/open/);

    // Close
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(navLinks).not.toHaveClass(/open/);
  });

  test('menu closes after selecting a link', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#navToggle').click();
    await page.locator('#navLinks a').first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('#navLinks')).not.toHaveClass(/open/);
  });

  test('menu closes when clicking outside', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.locator('#navToggle').click();
    await expect(page.locator('#navLinks')).toHaveClass(/open/);
    // Click on a section far from the nav to ensure it's outside both toggle and links
    await page.locator('#section-what-is-skill').click({ force: true });
    await page.waitForTimeout(500);
    await expect(page.locator('#navLinks')).not.toHaveClass(/open/);
  });

  test('keyboard operation works', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const toggle = page.locator('#navToggle');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

/* ============================================================
   13. DARK MODE
   ============================================================ */
test.describe('Dark Mode', () => {
  test('page renders in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(BASE + '/index.html');

    // Check that page loads and is visible
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    // Check background color is dark
    const bgColor = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    // Dark bg should have low RGB values
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('text remains readable in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(BASE + '/index.html');

    const textColor = await page.evaluate(() =>
      getComputedStyle(document.body).color
    );
    // Should be light-colored text
    const match = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const brightness = (Number(match[1]) + Number(match[2]) + Number(match[3])) / 3;
      expect(brightness).toBeGreaterThan(100);
    }
  });
});

/* ============================================================
   14. REDUCED MOTION
   ============================================================ */
test.describe('Reduced Motion', () => {
  test('transitions are disabled with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BASE + '/index.html');

    // Check that the html element has scroll-behavior: auto
    const scrollBehavior = await page.evaluate(() =>
      getComputedStyle(document.documentElement).scrollBehavior
    );
    expect(scrollBehavior).toBe('auto');
  });
});

/* ============================================================
   15. RESPONSIVE LAYOUTS
   ============================================================ */
test.describe('Responsive Layouts', () => {
  test('375px width - no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/index.html');

    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test('768px width - no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE + '/index.html');

    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test('1440px width - no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE + '/index.html');

    const hasHScroll = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHScroll).toBe(false);
  });

  test('hero buttons are visible at mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/index.html');
    await expect(page.locator('.hero-ctas .btn-primary')).toBeVisible();
    await expect(page.locator('.hero-ctas .btn-secondary')).toBeVisible();
  });
});

/* ============================================================
   16. ACCESSIBILITY
   ============================================================ */
test.describe('Accessibility', () => {
  test('heading hierarchy is sequential', async ({ page }) => {
    await page.goto(BASE + '/index.html');

    const headings = await page.evaluate(() => {
      const hs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(hs).map(h => ({ tag: h.tagName, text: h.textContent.trim().substring(0, 40) }));
    });

    expect(headings[0].tag).toBe('H1');

    // Check no h2 follows h4, etc.
    let prevLevel = 1;
    for (let i = 1; i < headings.length; i++) {
      const level = parseInt(headings[i].tag.substring(1));
      // Allow same level or one level deeper
      expect(level - prevLevel).toBeLessThanOrEqual(1);
      prevLevel = level;
    }
  });

  test('all sections have IDs', async ({ page }) => {
    await page.goto(BASE + '/index.html');

    const sectionsWithoutId = await page.evaluate(() => {
      const sections = document.querySelectorAll('section');
      return Array.from(sections).filter(s => !s.id).length;
    });

    expect(sectionsWithoutId).toBe(0);
  });

  test('nav has proper ARIA', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await expect(page.locator('nav[role="navigation"]')).toHaveCount(1);
    await expect(page.locator('nav[aria-label]')).toHaveCount(1);
  });

  test('progress bar has proper ARIA', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const pb = page.locator('#progressBar');
    await expect(pb).toHaveAttribute('role', 'progressbar');
    await expect(pb).toHaveAttribute('aria-valuemin', '0');
    await expect(pb).toHaveAttribute('aria-valuemax', '100');
  });

  test('all copy buttons have accessible names', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const btns = page.locator('.copy-btn');
    const count = await btns.count();
    for (let i = 0; i < count; i++) {
      const text = await btns.nth(i).textContent();
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test('accordion triggers have aria-expanded', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const triggers = page.locator('.accordion-trigger');
    const count = await triggers.count();
    for (let i = 0; i < count; i++) {
      const expanded = await triggers.nth(i).getAttribute('aria-expanded');
      expect(expanded).toMatch(/^(true|false)$/);
    }
  });

  test('no duplicate IDs', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const dupes = await page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
      const seen = new Set();
      const duplicates = [];
      for (const id of ids) {
        if (seen.has(id)) duplicates.push(id);
        seen.add(id);
      }
      return duplicates;
    });
    expect(dupes).toEqual([]);
  });
});

/* ============================================================
   17. PRINT LAYOUT
   ============================================================ */
test.describe('Print Layout', () => {
  test('navigation is hidden in print', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.emulateMedia({ media: 'print' });

    const navVisible = await page.locator('.nav').isVisible();
    // In print CSS, nav should be hidden
    expect(navVisible).toBe(false);
  });

  test('content is still visible in print', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#section-what-is-skill')).toBeVisible();
  });
});

/* ============================================================
   18. DETAILS ELEMENTS (NO JS)
   ============================================================ */
test.describe('Details Elements', () => {
  test('native details elements work without JS', async ({ page }) => {
    await page.goto(BASE + '/index.html');

    const details = page.locator('details');
    const count = await details.count();

    // Find first 3 visible details elements (skip those in hidden skill panels)
    let tested = 0;
    for (let i = 0; i < count && tested < 3; i++) {
      const d = details.nth(i);
      const isVisible = await d.evaluate(el => {
        const panel = el.closest('.skill-panel');
        if (panel && !panel.classList.contains('active')) return false;
        return true;
      });
      if (!isVisible) continue;

      const summary = d.locator('summary');
      await summary.scrollIntoViewIfNeeded();

      // Open
      await summary.click();
      await expect(d).toHaveAttribute('open', '');

      // Close
      await summary.click();
      await expect(d).not.toHaveAttribute('open', '');
      tested++;
    }
  });
});

/* ============================================================
   19. CODE BLOCKS DISPLAY
   ============================================================ */
test.describe('Code Blocks', () => {
  test('all code blocks are visible', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const codeBlocks = page.locator('.code-block-wrapper');
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < count; i++) {
      const wrapper = codeBlocks.nth(i);
      // Skip code blocks inside closed <details> or hidden skill panels
      const inClosedDetails = await wrapper.evaluate(el => {
        const details = el.closest('details');
        if (details && !details.hasAttribute('open')) return true;
        const panel = el.closest('.skill-panel');
        if (panel && !panel.classList.contains('active')) return true;
        return false;
      });
      if (inClosedDetails) continue;

      const pre = wrapper.locator('pre');
      await pre.scrollIntoViewIfNeeded();
      await expect(pre).toBeVisible();
      const text = await pre.textContent();
      expect(text.length).toBeGreaterThan(50);
    }
  });
});

/* ============================================================
   20. INTERNAL LINKS
   ============================================================ */
test.describe('Internal Links', () => {
  test('all anchor links point to existing IDs', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const anchors = page.locator('a[href^="#"]');
    const count = await anchors.count();

    const brokenLinks = [];
    for (let i = 0; i < count; i++) {
      const href = await anchors.nth(i).getAttribute('href');
      if (href === '#' || href === '#hero') continue;
      const target = await page.locator(href).count();
      if (target === 0) brokenLinks.push(href);
    }

    expect(brokenLinks).toEqual([]);
  });
});
