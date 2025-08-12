document.addEventListener('DOMContentLoaded', function() {
    const regexInput = document.getElementById('regex-input');
    const flagG = document.getElementById('flag-g');
    const flagI = document.getElementById('flag-i');
    const flagM = document.getElementById('flag-m');
    const textTypeSelect = document.getElementById('text-type-select');
    const extractBtn = document.getElementById('extract-btn');
    const resultsContainer = document.getElementById('results');
    const matchCount = document.getElementById('match-count');
    const copyBtn = document.getElementById('copy-btn');
    const clearBtn = document.getElementById('clear-btn');
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    // HTML extraction elements
    const htmlOptions = document.getElementById('html-options');
    const htmlSelector = document.getElementById('html-selector');
    const htmlTypeOptions = document.querySelectorAll('input[name="html-type"]');
    
    // Attribute parser elements
    const enableAttributeParser = document.getElementById('enable-attribute-parser');
    const attributeParserOptions = document.getElementById('attribute-parser-options');
    const attributeNames = document.getElementById('attribute-names');
    const attributeSelector = document.getElementById('attribute-selector');
    const attributeFormat = document.getElementById('attribute-format');
    
    // Capture group elements
    const captureGroupsCheckbox = document.getElementById('capture-groups');
    const captureGroupSelect = document.getElementById('capture-group-select');
    const groupNumber = document.getElementById('group-number');
    
    // String composer elements
    const enableStringComposer = document.getElementById('enable-string-composer');
    const stringComposerOptions = document.getElementById('string-composer-options');
    const stringTemplate = document.getElementById('string-template');

    let currentMatches = [];

    // Load saved settings
    browser.storage.local.get([
        'regexPattern', 'flags', 'textType', 'htmlSelector', 'htmlType', 
        'attributeParserEnabled', 'attributeNames', 'attributeSelector', 'attributeFormat',
        'useCaptureGroups', 'captureGroupNumber', 'stringComposerEnabled', 'stringTemplate'
    ]).then(result => {
        if (result.regexPattern) {
            regexInput.value = result.regexPattern;
        }
        if (result.flags) {
            flagG.checked = result.flags.includes('g');
            flagI.checked = result.flags.includes('i');
            flagM.checked = result.flags.includes('m');
        }
        if (result.textType) {
            textTypeSelect.value = result.textType;
            toggleOptions();
        }
        if (result.htmlSelector) {
            htmlSelector.value = result.htmlSelector;
        }
        if (result.htmlType) {
            document.querySelector(`input[name="html-type"][value="${result.htmlType}"]`).checked = true;
        }
        if (result.attributeParserEnabled !== undefined) {
            enableAttributeParser.checked = result.attributeParserEnabled;
            toggleAttributeParser();
        }
        if (result.attributeNames) {
            attributeNames.value = result.attributeNames;
        }
        if (result.attributeSelector) {
            attributeSelector.value = result.attributeSelector;
        }
        if (result.attributeFormat) {
            attributeFormat.value = result.attributeFormat;
        }
        if (result.useCaptureGroups !== undefined) {
            captureGroupsCheckbox.checked = result.useCaptureGroups;
            toggleCaptureGroupSelect();
        }
        if (result.captureGroupNumber !== undefined) {
            groupNumber.value = result.captureGroupNumber;
        }
        if (result.stringComposerEnabled !== undefined) {
            enableStringComposer.checked = result.stringComposerEnabled;
            toggleStringComposer();
        }
        if (result.stringTemplate) {
            stringTemplate.value = result.stringTemplate;
        }
    });

    // Save settings when changed
    function saveSettings() {
        const flags = [
            flagG.checked ? 'g' : '',
            flagI.checked ? 'i' : '',
            flagM.checked ? 'm' : ''
        ].join('');

        const htmlType = document.querySelector('input[name="html-type"]:checked')?.value || 'outerHTML';

        browser.storage.local.set({
            regexPattern: regexInput.value,
            flags: flags,
            textType: textTypeSelect.value,
            htmlSelector: htmlSelector.value,
            htmlType: htmlType,
            attributeParserEnabled: enableAttributeParser.checked,
            attributeNames: attributeNames.value,
            attributeSelector: attributeSelector.value,
            attributeFormat: attributeFormat.value,
            useCaptureGroups: captureGroupsCheckbox.checked,
            captureGroupNumber: parseInt(groupNumber.value),
            stringComposerEnabled: enableStringComposer.checked,
            stringTemplate: stringTemplate.value
        });
    }

    // Toggle options visibility based on text type
    function toggleOptions() {
        const textType = textTypeSelect.value;
        htmlOptions.style.display = textType === 'html' ? 'block' : 'none';
    }

    // Toggle attribute parser options
    function toggleAttributeParser() {
        attributeParserOptions.style.display = enableAttributeParser.checked ? 'block' : 'none';
    }

    // Toggle capture group select visibility
    function toggleCaptureGroupSelect() {
        captureGroupSelect.style.display = captureGroupsCheckbox.checked ? 'block' : 'none';
    }

    // Toggle string composer options
    function toggleStringComposer() {
        stringComposerOptions.style.display = enableStringComposer.checked ? 'block' : 'none';
    }

    regexInput.addEventListener('input', saveSettings);
    flagG.addEventListener('change', saveSettings);
    flagI.addEventListener('change', saveSettings);
    flagM.addEventListener('change', saveSettings);
    textTypeSelect.addEventListener('change', function() {
        saveSettings();
        toggleOptions();
    });
    htmlSelector.addEventListener('input', saveSettings);
    htmlTypeOptions.forEach(radio => radio.addEventListener('change', saveSettings));
    enableAttributeParser.addEventListener('change', function() {
        toggleAttributeParser();
        saveSettings();
    });
    attributeNames.addEventListener('input', saveSettings);
    attributeSelector.addEventListener('input', saveSettings);
    attributeFormat.addEventListener('change', saveSettings);
    captureGroupsCheckbox.addEventListener('change', function() {
        toggleCaptureGroupSelect();
        saveSettings();
    });
    groupNumber.addEventListener('change', saveSettings);
    enableStringComposer.addEventListener('change', function() {
        toggleStringComposer();
        saveSettings();
    });
    stringTemplate.addEventListener('input', saveSettings);

    // Extract button click
    extractBtn.addEventListener('click', function() {
        const pattern = regexInput.value.trim();
        if (!pattern) {
            showError('Please enter a regex pattern');
            return;
        }

        const flags = [
            flagG.checked ? 'g' : '',
            flagI.checked ? 'i' : '',
            flagM.checked ? 'm' : ''
        ].join('');

        const textType = textTypeSelect.value;
        const htmlType = document.querySelector('input[name="html-type"]:checked')?.value || 'outerHTML';

        // Show loading state
        extractBtn.classList.add('loading');
        extractBtn.disabled = true;
        extractBtn.textContent = 'Extracting...';

        // Send message to content script
        browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
            browser.tabs.sendMessage(tabs[0].id, {
                action: 'extract',
                pattern: pattern,
                flags: flags,
                textType: textType,
                htmlSelector: htmlSelector.value.trim(),
                htmlType: htmlType,
                attributeParserEnabled: enableAttributeParser.checked,
                attributeNames: attributeNames.value.trim(),
                attributeSelector: attributeSelector.value.trim(),
                attributeFormat: attributeFormat.value,
                useCaptureGroups: captureGroupsCheckbox.checked,
                captureGroupNumber: parseInt(groupNumber.value),
                stringComposerEnabled: enableStringComposer.checked,
                stringTemplate: stringTemplate.value.trim()
            }).then(response => {
                if (response.success) {
                    displayResults(response.matches);
                } else {
                    showError(response.error || 'Failed to extract text');
                }
            }).catch(error => {
                showError('Error communicating with page: ' + error.message);
            }).finally(() => {
                // Remove loading state
                extractBtn.classList.remove('loading');
                extractBtn.disabled = false;
                extractBtn.textContent = 'Extract Text';
            });
        });
    });

    // Display results
    function displayResults(matches) {
        currentMatches = matches;
        matchCount.textContent = matches.length;

        if (matches.length === 0) {
            resultsContainer.innerHTML = '<div class="empty">No matches found</div>';
            resultsContainer.classList.add('empty');
            copyBtn.disabled = true;
            clearBtn.disabled = true;
            return;
        }

        resultsContainer.classList.remove('empty');
        resultsContainer.innerHTML = matches.map((match, index) => 
            `<div class="match-item" title="Click to copy">${escapeHtml(match)}</div>`
        ).join('');

        // Add click handlers to copy individual matches
        document.querySelectorAll('.match-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                copyToClipboard(matches[index]);
                item.style.background = '#d4edda';
                setTimeout(() => {
                    item.style.background = '';
                }, 300);
            });
        });

        copyBtn.disabled = false;
        clearBtn.disabled = false;
    }

    // Copy all matches
    copyBtn.addEventListener('click', function() {
        if (currentMatches.length > 0) {
            copyToClipboard(currentMatches.join('\\n'));
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy All';
            }, 1000);
        }
    });

    // Clear results
    clearBtn.addEventListener('click', function() {
        currentMatches = [];
        matchCount.textContent = '0';
        resultsContainer.innerHTML = '<div class="empty">Results will appear here</div>';
        resultsContainer.classList.add('empty');
        copyBtn.disabled = true;
        clearBtn.disabled = true;
    });

    // Preset buttons
    presetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pattern = button.getAttribute('data-pattern');
            const flags = button.getAttribute('data-flags') || '';
            const textType = button.getAttribute('data-target') || 'all';
            const useCapture = button.getAttribute('data-capture') === 'true';
            const captureGroup = button.getAttribute('data-group') || '1';
            
            regexInput.value = pattern;
            flagG.checked = flags.includes('g');
            flagI.checked = flags.includes('i');
            flagM.checked = flags.includes('m');
            textTypeSelect.value = textType;
            
            if (useCapture) {
                captureGroupsCheckbox.checked = true;
                groupNumber.value = captureGroup;
            } else {
                captureGroupsCheckbox.checked = false;
            }
            
            toggleOptions();
            toggleCaptureGroupSelect();
            saveSettings();
        });
    });

    // Helper functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }

    function showError(message) {
        resultsContainer.innerHTML = `<div class="empty" style="color: #e74c3c;">${escapeHtml(message)}</div>`;
        resultsContainer.classList.add('empty');
        matchCount.textContent = '0';
        copyBtn.disabled = true;
        clearBtn.disabled = true;
    }

    // Initialize with empty state
    clearBtn.click();
    
    // Initialize options visibility
    toggleOptions();
    toggleAttributeParser();
    toggleCaptureGroupSelect();
    toggleStringComposer();
});
