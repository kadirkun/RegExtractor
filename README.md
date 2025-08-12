# RegExtractor - Firefox Extension

A powerful Firefo5. **Choose Source**: Select whether to extract from:
   - Entire page text
   - Visible text only
   - Selected text (you must first select text on the page)
   - HTML source (with optional CSS selector)
   - HTML attributes (specify attribute name and CSS selector)
   - HTML tags only
6. **HTML Options**: When extracting from HTML:
   - Enter a CSS selector to target specific elements
   - Choose between outerHTML, innerHTML, or textContent
   - For attributes: specify both attribute name and CSS selector
7. **Extract**: Click "Extract Text" to find matches
8. **View Results**: Matches will appear in the results area
9. **Copy**: Click individual matches to copy them, or use "Copy All"sion that allows you to extract text from web pages using custom regular expressions (regex patterns).

## Features

- **4-Step Workflow**: Structured extraction process for maximum control
  1. **Text Type Selection**: Choose source (page text, visible text, selected text, or HTML)
  2. **HTML Attribute Parser**: Optional extraction of HTML attributes before regex processing
  3. **Regex Processing**: Apply custom patterns with capture group support
  4. **String Composer**: Create custom output formats using captured groups
- **Advanced HTML Processing**: 
  - CSS selector targeting for HTML extraction
  - Attribute parsing with multiple output formats (values, key=value, JSON)
  - Choose between outerHTML, innerHTML, or textContent
- **Powerful Regex Features**: 
  - Custom regex patterns with full flag support
  - Capture group extraction (groups 0-5)
  - String composition using placeholder templates
- **Quick Presets**: Built-in patterns for common extractions:
  - Email addresses
  - URLs  
  - Phone numbers
  - Numbers and prices
  - HTML tags and structure
  - CSS classes and IDs
  - Heading text content
- **User-Friendly Interface**: 
  - Step-by-step workflow
  - Copy functionality for results
  - Persistent settings
  - Real-time match counter

## Installation

### For Development/Testing:
1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from this directory
6. The extension will be loaded and ready to use

### For Production:
1. Package the extension files into a ZIP
2. Submit to Mozilla Add-ons store, or
3. Load as a temporary add-on for personal use

## Usage

### 4-Step Extraction Process:

1. **Select Text Type**: Choose your data source:
   - **Entire page text**: All text content from the page
   - **Visible text only**: Only text that's currently visible
   - **Selected text**: Text you've highlighted on the page
   - **HTML source**: Raw HTML with optional CSS selector targeting

2. **HTML Attribute Parser** (optional): 
   - Check "Extract HTML attributes" to parse attributes before regex
   - Specify attribute names (comma-separated): `href, src, class, id`
   - Set CSS selector to target specific elements: `a, img, div[data-id]`
   - Choose output format: values only, key=value pairs, or JSON

3. **Apply Regex Pattern**:
   - Enter your custom regex pattern
   - Set flags (Global, Ignore Case, Multiline)
   - Optional: Use capture groups to extract specific parts of matches

4. **String Composer** (optional):
   - Check "Compose custom strings" to format output
   - Use placeholders: `{0}` for full match, `{1}-{5}` for capture groups
   - Example template: `"Title: {1}, URL: {2}"`

5. **Extract & View Results**: Click "Extract Text" and copy results

### Example Workflows:

#### Workflow 1: Extract h3 headings
1. **Text Type**: Select "HTML source"
2. **HTML Attribute Parser**: Leave disabled
3. **Regex**: `<h3>(.*?)</h3>` with capture group 1 enabled  
4. **Result**: Gets just the text content inside h3 tags

#### Workflow 2: Extract all links with custom formatting
1. **Text Type**: Select "HTML source"
2. **HTML Attribute Parser**: Enable, set attributes to "href" and selector to "a"
3. **Regex**: `(.*)` (matches everything) with capture group 1
4. **String Composer**: Enable with template `"Link: {1}"`
5. **Result**: Formatted list like "Link: https://example.com"

#### Workflow 3: Complex attribute extraction
1. **Text Type**: Select "HTML source", target `div.product`
2. **HTML Attribute Parser**: Enable, attributes: "data-price,data-name", format: JSON
3. **Regex**: `"data-price":"([^"]*)".*"data-name":"([^"]*)"`
4. **String Composer**: Template: `"{2} costs {1}"`  
5. **Result**: "Product Name costs $19.99"

## Quick Presets

The extension includes several preset patterns for common extractions:

- **Emails**: Finds email addresses
- **URLs**: Finds web URLs and links
- **Phone Numbers**: Finds various phone number formats
- **Numbers/Prices**: Finds numbers and currency values
- **HTML Tags**: Extracts HTML tag structures
- **CSS Classes**: Finds CSS class names (uses capture groups)
- **HTML IDs**: Extracts HTML ID values (uses capture groups)
- **Heading Text**: Extracts text content from headings (uses capture groups)

## Regex Examples

Here are some useful regex patterns you can try:

```regex
# Email addresses
\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b

# URLs
https?://[^\s<>"]+|www\.[^\s<>"]+

# Phone numbers (US format)
\b\d{3}-\d{3}-\d{4}\b|\b\(\d{3}\)\s*\d{3}-\d{4}\b

# Dates (MM/DD/YYYY)
\b\d{1,2}/\d{1,2}/\d{4}\b

# IP addresses
\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b

# Hashtags
#\w+

# Mentions
@\w+

# Credit card numbers (basic pattern)
\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b

# HTML class attributes (extract class names only)
class=["']([^"']*)["'] 
# Use capture group 1 to get just the class name

# HTML heading content (extract text inside any heading)
<h([1-6])>(.*?)</h\1>
# Use capture group 2 to get just the heading text

# Extract email usernames only
([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}
# Use capture group 1 to get just the username part

# Extract domain from URLs
https?://(?:www\.)?([^/\s<>"]+)
# Use capture group 1 to get just the domain

# HTML src attributes (extract URLs only)
src=["']([^"']*)["']
# Use capture group 1 to get just the URL
```

## Capture Groups Examples

The extension now supports regex capture groups, allowing you to extract specific parts of matches:

```regex
# Example: Extract heading text
Pattern: <h3>(.*?)</h3>
Capture Group: 1
Result: Gets only the text inside h3 tags, not the full HTML

# Example: Extract email domains
Pattern: [A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})
Capture Group: 1
Result: Gets only the domain part of email addresses

# Example: Extract class names
Pattern: class=["']([^"']*)["']
Capture Group: 1
Result: Gets only the class name without the attribute syntax
```

## HTML Extraction Examples

When using HTML extraction modes:

```css
/* CSS Selectors */
.article        # Elements with class 'article'
#main-content   # Element with ID 'main-content'
div > p         # Paragraphs that are direct children of divs
a[href^="http"] # Links starting with 'http'
img[alt]        # Images with alt attributes

/* For Attribute Extraction */
Selector: a[href]
Attribute: href
Result: Extracts all href values from links

Selector: img
Attribute: src
Result: Extracts all image source URLs
```

## File Structure

```
regextractor/
├── manifest.json       # Extension manifest
├── popup.html          # Extension popup HTML
├── popup.css           # Popup styling
├── popup.js            # Popup JavaScript logic
├── content.js          # Content script for page interaction
├── background.js       # Background script
├── icons/              # Extension icons
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md           # This file
```

## Permissions

The extension requires the following permissions:
- `activeTab`: To access the current tab's content
- `storage`: To save user preferences

## Browser Compatibility

- Firefox 57+ (supports WebExtensions API)
- Uses modern JavaScript features and Web APIs

## Development

To modify or extend the extension:

1. Edit the relevant files
2. Reload the extension in `about:debugging`
3. Test the changes

## Privacy

This extension:
- Does not collect or send any data
- Only accesses the current tab when you click "Extract"
- Stores preferences locally in your browser
- Does not communicate with external servers

## Support

For issues or feature requests, please check the project repository.

## License

This project is open source. Feel free to modify and distribute.
