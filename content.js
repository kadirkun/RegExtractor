// Content script - injected into web pages
(function() {
    'use strict';

    // Listen for messages from popup
    browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'extract') {
            try {
                const matches = extractTextWithRegex(
                    request.pattern, 
                    request.flags, 
                    request.textType,
                    request.htmlSelector,
                    request.htmlType,
                    request.attributeParserEnabled,
                    request.attributeNames,
                    request.attributeSelector,
                    request.attributeFormat,
                    request.useCaptureGroups,
                    request.captureGroupNumber,
                    request.stringComposerEnabled,
                    request.stringTemplate
                );
                sendResponse({
                    success: true,
                    matches: matches
                });
            } catch (error) {
                sendResponse({
                    success: false,
                    error: error.message
                });
            }
        }
    });

    function extractTextWithRegex(pattern, flags, textType, htmlSelector, htmlType, 
        attributeParserEnabled, attributeNames, attributeSelector, attributeFormat,
        useCaptureGroups, captureGroupNumber, stringComposerEnabled, stringTemplate) {
        
        let text = '';
        
        try {
            // Step 1: Get text based on text type selection
            switch (textType) {
                case 'selection':
                    const selection = window.getSelection();
                    text = selection.toString();
                    if (!text) {
                        throw new Error('No text selected. Please select some text on the page.');
                    }
                    break;
                    
                case 'visible':
                    text = getVisibleText();
                    break;
                    
                case 'html':
                    text = getHtmlContent(htmlSelector, htmlType);
                    break;
                    
                case 'all':
                default:
                    text = document.body.innerText || document.body.textContent || '';
                    break;
            }

            if (!text) {
                throw new Error('No text found to extract from');
            }

            // Step 2: Apply HTML attribute parser if enabled
            if (attributeParserEnabled && attributeNames && attributeSelector) {
                text = parseHtmlAttributes(text, attributeNames, attributeSelector, attributeFormat);
            }

            // Step 3: Apply regex pattern
            const regex = new RegExp(pattern, flags);
            const rawMatches = [];
            
            if (flags.includes('g')) {
                // Global flag - find all matches
                let match;
                while ((match = regex.exec(text)) !== null) {
                    rawMatches.push(match);
                    
                    // Prevent infinite loop with zero-width matches
                    if (match.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    
                    // Safety limit to prevent browser freeze
                    if (rawMatches.length > 10000) {
                        throw new Error('Too many matches found (>10,000). Please refine your regex pattern.');
                    }
                }
            } else {
                // Non-global - find first match
                const match = text.match(regex);
                if (match) {
                    rawMatches.push(match);
                }
            }

            // Step 4: Process matches (capture groups and string composition)
            let processedMatches = [];
            
            rawMatches.forEach(match => {
                if (stringComposerEnabled && stringTemplate) {
                    // Use string composition
                    let composedString = stringTemplate;
                    for (let i = 0; i <= 5; i++) {
                        const groupValue = match[i] || '';
                        composedString = composedString.replace(new RegExp(`\\{${i}\\}`, 'g'), groupValue);
                    }
                    processedMatches.push(composedString);
                } else if (useCaptureGroups && captureGroupNumber !== undefined) {
                    // Use specific capture group
                    const groupValue = match[captureGroupNumber];
                    if (groupValue !== undefined) {
                        processedMatches.push(groupValue);
                    }
                } else {
                    // Use full match
                    processedMatches.push(match[0]);
                }
            });

            // Remove duplicates and sort
            const uniqueMatches = [...new Set(processedMatches)].sort();
            
            return uniqueMatches;
            
        } catch (error) {
            if (error.name === 'SyntaxError') {
                throw new Error('Invalid regex pattern: ' + error.message);
            }
            throw error;
        }
    }

    function getVisibleText() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style elements
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    
                    const tagName = parent.tagName.toLowerCase();
                    if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                        return NodeFilter.FILTER_REJECT;
                    }

                    // Check if element is visible
                    const style = window.getComputedStyle(parent);
                    if (style.display === 'none' || 
                        style.visibility === 'hidden' || 
                        style.opacity === '0' ||
                        parent.offsetWidth === 0 || 
                        parent.offsetHeight === 0) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    // Check if text node has content
                    if (node.textContent.trim() === '') {
                        return NodeFilter.FILTER_REJECT;
                    }

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node.textContent);
        }

        return textNodes.join(' ');
    }

    // Helper function to check if element is in viewport
    function isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Get HTML content from elements
    function getHtmlContent(selector, htmlType) {
        let elements;
        
        if (selector && selector.trim()) {
            try {
                elements = document.querySelectorAll(selector);
            } catch (error) {
                throw new Error(`Invalid CSS selector: ${selector}`);
            }
            
            if (elements.length === 0) {
                throw new Error(`No elements found matching selector: ${selector}`);
            }
        } else {
            // If no selector, get all elements
            elements = document.querySelectorAll('*');
        }

        const content = [];
        elements.forEach(element => {
            let elementContent = '';
            
            switch (htmlType) {
                case 'outerHTML':
                    elementContent = element.outerHTML;
                    break;
                case 'innerHTML':
                    elementContent = element.innerHTML;
                    break;
                case 'textContent':
                    elementContent = element.textContent || '';
                    break;
                default:
                    elementContent = element.outerHTML;
            }
            
            if (elementContent.trim()) {
                content.push(elementContent);
            }
        });

        return content.join('\n');
    }

    // Get HTML tags only
    function getHtmlTags(selector) {
        let elements;
        
        if (selector && selector.trim()) {
            try {
                elements = document.querySelectorAll(selector);
            } catch (error) {
                throw new Error(`Invalid CSS selector: ${selector}`);
            }
            
            if (elements.length === 0) {
                throw new Error(`No elements found matching selector: ${selector}`);
            }
        } else {
            // If no selector, get all elements
            elements = document.querySelectorAll('*');
        }

        const tags = [];
        elements.forEach(element => {
            const tagMatch = element.outerHTML.match(/^<[^>]+>/);
            if (tagMatch) {
                tags.push(tagMatch[0]);
            }
        });

        return tags.join('\n');
    }

    // Get attribute values
    function getAttributeContent(attributeName, selector) {
        if (!attributeName || !attributeName.trim()) {
            throw new Error('Attribute name is required');
        }
        
        if (!selector || !selector.trim()) {
            throw new Error('CSS selector is required for attribute extraction');
        }

        let elements;
        try {
            elements = document.querySelectorAll(selector);
        } catch (error) {
            throw new Error(`Invalid CSS selector: ${selector}`);
        }

        if (elements.length === 0) {
            throw new Error(`No elements found matching selector: ${selector}`);
        }

        const attributeValues = [];
        elements.forEach(element => {
            const value = element.getAttribute(attributeName);
            if (value !== null && value.trim()) {
                attributeValues.push(value);
            }
        });

        if (attributeValues.length === 0) {
            throw new Error(`No elements found with attribute "${attributeName}"`);
        }

        return attributeValues.join('\n');
    }

    // Parse HTML attributes from text content
    function parseHtmlAttributes(htmlText, attributeNames, selector, format) {
        if (!attributeNames || !selector) {
            return htmlText; // Return original text if no parsing configured
        }

        // Create a temporary DOM parser
        const parser = new DOMParser();
        let doc;
        
        try {
            // Try to parse as HTML document
            doc = parser.parseFromString(htmlText, 'text/html');
        } catch (error) {
            // If parsing fails, try to wrap in a div and parse
            try {
                doc = parser.parseFromString(`<div>${htmlText}</div>`, 'text/html');
            } catch (innerError) {
                throw new Error('Could not parse HTML content for attribute extraction');
            }
        }

        let elements;
        try {
            elements = doc.querySelectorAll(selector);
        } catch (error) {
            throw new Error(`Invalid CSS selector for attribute parsing: ${selector}`);
        }

        if (elements.length === 0) {
            throw new Error(`No elements found matching selector: ${selector}`);
        }

        const attributeNamesArray = attributeNames.split(',').map(name => name.trim()).filter(name => name);
        if (attributeNamesArray.length === 0) {
            throw new Error('No valid attribute names provided');
        }

        const results = [];
        
        elements.forEach(element => {
            const elementData = {};
            let hasValidAttributes = false;
            
            attributeNamesArray.forEach(attrName => {
                const value = element.getAttribute(attrName);
                if (value !== null) {
                    elementData[attrName] = value;
                    hasValidAttributes = true;
                }
            });
            
            if (hasValidAttributes) {
                switch (format) {
                    case 'values':
                        // Just the values
                        Object.values(elementData).forEach(value => {
                            if (value.trim()) results.push(value);
                        });
                        break;
                        
                    case 'key-value':
                        // key=value format
                        Object.entries(elementData).forEach(([key, value]) => {
                            if (value.trim()) results.push(`${key}=${value}`);
                        });
                        break;
                        
                    case 'json':
                        // JSON format
                        if (Object.keys(elementData).length > 0) {
                            results.push(JSON.stringify(elementData));
                        }
                        break;
                        
                    default:
                        // Default to values only
                        Object.values(elementData).forEach(value => {
                            if (value.trim()) results.push(value);
                        });
                }
            }
        });

        if (results.length === 0) {
            throw new Error(`No elements found with the specified attributes: ${attributeNames}`);
        }

        return results.join('\n');
    }

})();
