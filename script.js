/**
 * script.js - Interactive features for The SKILL.md Pattern for Business Efficiency
 * Handles: navigation, progress, copy buttons, calculators, checklists,
 * test builder, template download, back-to-top, accordion, and scorecard.
 */
document.addEventListener('DOMContentLoaded', function () {

  // Remove no-js class to indicate JS is available
  document.documentElement.classList.remove('no-js');

  // ============================================================
  // 1. Mobile Navigation Toggle
  // ============================================================
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    var navItems = navLinks.querySelectorAll('a');
    navItems.forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ============================================================
  // 2. Active Navigation Section Highlighting
  // ============================================================
  var sections = document.querySelectorAll('section.section[id]');
  var navLinkElements = document.querySelectorAll('.nav-links a');

  if (sections.length && navLinkElements.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinkElements.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // ============================================================
  // 3. Reading Progress Indicator
  // ============================================================
  var progressBar = document.getElementById('progressBar');

  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight;
    var winHeight = window.innerHeight;
    var scrolled = (scrollTop / (docHeight - winHeight)) * 100;
    if (scrolled < 0) scrolled = 0;
    if (scrolled > 100) scrolled = 100;
    progressBar.style.width = scrolled + '%';
    progressBar.setAttribute('aria-valuenow', String(Math.round(scrolled)));
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ============================================================
  // 4. Code Copy Buttons
  // ============================================================
  var copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-copy');
      var codeEl = document.getElementById(targetId);
      if (!codeEl) return;

      var text = codeEl.textContent || codeEl.innerText;
      var originalText = btn.textContent;

      function showCopied() {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 2000);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied).catch(function () {
          fallbackCopy(text, showCopied);
        });
      } else {
        fallbackCopy(text, showCopied);
      }
    });
  });

  function fallbackCopy(text, callback) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      callback();
    } catch (e) {
      // Silently fail
    }
    document.body.removeChild(textarea);
  }

  // ============================================================
  // 5. Accordion (Debugging Guide)
  // ============================================================
  var accordionTriggers = document.querySelectorAll('.accordion-trigger');

  accordionTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var panel = trigger.nextElementSibling;
      if (!panel) return;

      var isOpen = trigger.getAttribute('aria-expanded') === 'true';

      if (isOpen) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
      }
    });

    // Keyboard support
    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });

  // ============================================================
  // 6. Process Selection Scorecard Calculator
  // ============================================================
  var scoreSliders = document.querySelectorAll('.score-slider');
  var totalScoreEl = document.getElementById('totalScore');
  var scoreInterpretation = document.getElementById('scoreInterpretation');

  function updateScorecard() {
    var total = 0;
    scoreSliders.forEach(function (slider) {
      total += parseInt(slider.value, 10);
      // Update the adjacent score-value span
      var valueSpan = slider.parentElement.querySelector('.score-value');
      if (valueSpan) {
        valueSpan.textContent = slider.value;
      }
    });

    if (totalScoreEl) {
      totalScoreEl.textContent = String(total);
    }

    if (scoreInterpretation) {
      if (total <= 16) {
        scoreInterpretation.textContent = 'Low priority — Consider a different process first. This process may not deliver enough value to justify automation effort.';
        scoreInterpretation.style.color = '';
      } else if (total <= 28) {
        scoreInterpretation.textContent = 'Worth investigating — This could be a good candidate. Document the workflow and estimate potential savings before committing.';
        scoreInterpretation.style.color = '';
      } else {
        scoreInterpretation.textContent = 'Strong first skill candidate — This process is ideal for automation. High frequency, clear inputs, and measurable outputs make it a great starting point.';
        scoreInterpretation.style.color = '';
      }
    }
  }

  scoreSliders.forEach(function (slider) {
    slider.addEventListener('input', updateScorecard);
  });
  updateScorecard();

  // ============================================================
  // 7. Savings Calculator
  // ============================================================
  var calcMinutesBefore = document.getElementById('calcMinutesBefore');
  var calcMinutesAfter = document.getElementById('calcMinutesAfter');
  var calcRunsPerMonth = document.getElementById('calcRunsPerMonth');
  var calcHourlyCost = document.getElementById('calcHourlyCost');
  var calcErrorsBefore = document.getElementById('calcErrorsBefore');
  var calcErrorsAfter = document.getElementById('calcErrorsAfter');
  var calcCalculate = document.getElementById('calcCalculate');
  var resultHoursValue = document.getElementById('resultHoursValue');
  var resultValueValue = document.getElementById('resultValueValue');
  var resultErrorsValue = document.getElementById('resultErrorsValue');

  function updateCalculator() {
    var minutesBefore = parseFloat(calcMinutesBefore.value) || 0;
    var minutesAfter = parseFloat(calcMinutesAfter.value) || 0;
    var runs = parseFloat(calcRunsPerMonth.value) || 1;
    var hourlyCost = parseFloat(calcHourlyCost.value) || 0;
    var errorsBefore = parseFloat(calcErrorsBefore.value) || 0;
    var errorsAfter = parseFloat(calcErrorsAfter.value) || 0;

    // Hours saved per month
    var hoursSaved = ((minutesBefore - minutesAfter) * runs) / 60;
    if (hoursSaved < 0) hoursSaved = 0;

    // Estimated annual value
    var annualValue = hoursSaved * 12 * hourlyCost;

    // Error reduction percentage
    var errorReduction = 0;
    if (errorsBefore > 0) {
      errorReduction = ((errorsBefore - errorsAfter) / errorsBefore) * 100;
    }
    if (errorReduction < 0) errorReduction = 0;

    if (resultHoursValue) {
      resultHoursValue.textContent = hoursSaved.toFixed(1) + ' hours';
    }
    if (resultValueValue) {
      resultValueValue.textContent = '$' + annualValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    if (resultErrorsValue) {
      resultErrorsValue.textContent = errorReduction.toFixed(1) + '% reduction';
    }
  }

  if (calcCalculate) {
    calcCalculate.addEventListener('click', updateCalculator);
  }

  // Also update on input change
  [calcMinutesBefore, calcMinutesAfter, calcRunsPerMonth, calcHourlyCost, calcErrorsBefore, calcErrorsAfter].forEach(function (el) {
    if (el) {
      el.addEventListener('input', updateCalculator);
    }
  });
  updateCalculator();

  // ============================================================
  // 8. Persistent Safety Checklist
  // ============================================================
  var checklistCheckboxes = document.querySelectorAll('.checklist-cb');
  var STORAGE_KEY = 'safetyChecklist';

  function loadChecklistState() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }

  function saveChecklistState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Silently fail if localStorage is unavailable
    }
  }

  function restoreChecklist() {
    var state = loadChecklistState();
    checklistCheckboxes.forEach(function (cb) {
      if (state[cb.id]) {
        cb.checked = true;
        var label = cb.parentElement.querySelector('label');
        if (label) label.classList.add('checked');
      }
    });
  }

  checklistCheckboxes.forEach(function (cb) {
    cb.addEventListener('change', function () {
      var state = loadChecklistState();
      state[cb.id] = cb.checked;
      saveChecklistState(state);

      var label = cb.parentElement.querySelector('label');
      if (label) {
        if (cb.checked) {
          label.classList.add('checked');
        } else {
          label.classList.remove('checked');
        }
      }
    });
  });

  restoreChecklist();

  // ============================================================
  // 9. Test Case Builder
  // ============================================================
  var testName = document.getElementById('testName');
  var testInput = document.getElementById('testInput');
  var testExpected = document.getElementById('testExpected');
  var testCriterion = document.getElementById('testCriterion');
  var addTestCaseBtn = document.getElementById('addTestCase');
  var testCasesBody = document.getElementById('testCasesBody');
  var testCases = [];

  function addTestCase() {
    var name = testName ? testName.value.trim() : '';
    if (!name) {
      if (testName) testName.focus();
      return;
    }

    var inputVal = testInput ? testInput.value.trim() : '';
    var expectedVal = testExpected ? testExpected.value.trim() : '';
    var criterionVal = testCriterion ? testCriterion.value.trim() : '';

    testCases.push({
      name: name,
      input: inputVal,
      expected: expectedVal,
      criterion: criterionVal
    });

    renderTestCaseTable();

    // Clear form
    if (testName) testName.value = '';
    if (testInput) testInput.value = '';
    if (testExpected) testExpected.value = '';
    if (testCriterion) testCriterion.value = '';
    if (testName) testName.focus();
  }

  function renderTestCaseTable() {
    if (!testCasesBody) return;
    testCasesBody.innerHTML = '';

    testCases.forEach(function (tc, index) {
      var row = document.createElement('tr');

      var tdNum = document.createElement('td');
      tdNum.textContent = String(index + 1);
      row.appendChild(tdNum);

      var tdName = document.createElement('td');
      tdName.textContent = tc.name;
      row.appendChild(tdName);

      var tdInput = document.createElement('td');
      tdInput.textContent = tc.input;
      row.appendChild(tdInput);

      var tdExpected = document.createElement('td');
      tdExpected.textContent = tc.expected;
      row.appendChild(tdExpected);

      var tdCriterion = document.createElement('td');
      tdCriterion.textContent = tc.criterion;
      row.appendChild(tdCriterion);

      var tdAction = document.createElement('td');
      var removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-sm btn-outline';
      removeBtn.textContent = 'Remove';
      removeBtn.setAttribute('aria-label', 'Remove test case ' + tc.name);
      removeBtn.addEventListener('click', function () {
        testCases.splice(index, 1);
        renderTestCaseTable();
      });
      tdAction.appendChild(removeBtn);
      row.appendChild(tdAction);

      testCasesBody.appendChild(row);
    });
  }

  if (addTestCaseBtn) {
    addTestCaseBtn.addEventListener('click', addTestCase);
  }

  // Allow Enter key to add test case from any field
  [testName, testInput, testExpected, testCriterion].forEach(function (el) {
    if (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          addTestCase();
        }
      });
    }
  });

  // ============================================================
  // 10. CSV Download for Test Cases
  // ============================================================
  var downloadCSVBtn = document.getElementById('downloadCSV');

  if (downloadCSVBtn) {
    downloadCSVBtn.addEventListener('click', function () {
      if (testCases.length === 0) return;

      var headers = ['Test Name', 'Input Condition', 'Expected Behavior', 'Acceptance Criterion'];
      var rows = testCases.map(function (tc) {
        return [
          escapeCSV(tc.name),
          escapeCSV(tc.input),
          escapeCSV(tc.expected),
          escapeCSV(tc.criterion)
        ].join(',');
      });

      var csv = headers.join(',') + '\n' + rows.join('\n');
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = 'test_cases.csv';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  function escapeCSV(value) {
    if (!value) return '""';
    if (value.indexOf(',') !== -1 || value.indexOf('"') !== -1 || value.indexOf('\n') !== -1) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return '"' + value + '"';
  }

  // ============================================================
  // 11. SKILL.md Template Download
  // ============================================================
  var downloadTemplateBtn = document.getElementById('downloadTemplate');

  if (downloadTemplateBtn) {
    downloadTemplateBtn.addEventListener('click', function () {
      var template = [
        '---',
        'name: ',
        'description: ',
        '---',
        '',
        '# Skill Title',
        '',
        '## Business outcome',
        '',
        '## When to use this skill',
        '',
        '## When not to use this skill',
        '',
        '## Required inputs',
        '',
        '## Optional inputs',
        '',
        '## Process',
        '',
        '### Step 1: Inspect the inputs',
        '',
        '### Step 2: Validate the inputs',
        '',
        '### Step 3: Perform deterministic processing',
        '',
        '### Step 4: Apply business rules',
        '',
        '### Step 5: Handle exceptions',
        '',
        '### Step 6: Present the proposed result',
        '',
        '### Step 7: Obtain approval for consequential actions',
        '',
        '### Step 8: Produce and verify the final output',
        '',
        '## Output format',
        '',
        '## Approval boundaries',
        '',
        '## Error handling',
        '',
        '## Quality checklist',
        '',
        '## Test prompts',
        ''
      ].join('\n');

      var blob = new Blob([template], { type: 'text/markdown;charset=utf-8;' });
      var url = URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = 'SKILL.md';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  // ============================================================
  // 12. Skill Explorer Tabs
  // ============================================================
  var skillExplorers = document.querySelectorAll('.skill-explorer');

  skillExplorers.forEach(function (explorer) {
    var tabs = explorer.querySelectorAll('.skill-tab');
    var panels = explorer.querySelectorAll('.skill-panel');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var targetId = tab.getAttribute('data-panel');
        // Deactivate all tabs and panels
        tabs.forEach(function (t) {
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
        });
        panels.forEach(function (p) {
          p.classList.remove('active');
          p.setAttribute('hidden', '');
        });
        // Activate selected tab and panel
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        var targetPanel = explorer.querySelector('#' + targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
          targetPanel.removeAttribute('hidden');
        }
      });

      // Keyboard navigation between tabs
      tab.addEventListener('keydown', function (e) {
        var tabArray = Array.from(tabs);
        var currentIndex = tabArray.indexOf(tab);
        var newIndex = currentIndex;

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (currentIndex + 1) % tabArray.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (currentIndex - 1 + tabArray.length) % tabArray.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          newIndex = tabArray.length - 1;
        }

        if (newIndex !== currentIndex) {
          tabArray[newIndex].focus();
          tabArray[newIndex].click();
        }
      });
    });
  });

  // ============================================================
  // 13. Back to Top Button
  // ============================================================
  var backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    function updateBackToTop() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', updateBackToTop, { passive: true });
    updateBackToTop();

    backToTopBtn.addEventListener('click', function () {
      // Check for reduced motion preference
      var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

});
