# Legacy Mortgage Chatbot - Duda Embed Instructions

## Quick Start (Copy & Paste)

Add this code to your Duda site:

```html
<script
  src="https://nsull042790.github.io/Legacy-Chat-Bot/widget.js"
  data-lo-id="loan-officer-id"
  data-lo-name="John Smith"
  data-site-id="unique-site-id">
</script>
```

---

## Installation Options in Duda

### Option 1: Site-Wide (Recommended)
1. Go to **Site Settings** → **Head HTML**
2. Paste the script code
3. Save and publish

### Option 2: Specific Pages Only
1. Open the page in Duda editor
2. Click **Add Widget** → **HTML Embed**
3. Paste the script code
4. Position anywhere (widget floats in corner)

### Option 3: Global Widget (All 100 Sites)
1. In Duda Dashboard, go to **Site Templates**
2. Add script to template's Head HTML
3. All sites using template get the widget

---

## Configuration Options

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-lo-id` | Loan officer ID for lead attribution | `default` |
| `data-lo-name` | Loan officer name shown in chat | `Legacy Mortgage` |
| `data-site-id` | Unique site identifier | Page hostname |
| `data-position` | Widget position: `bottom-right`, `bottom-left`, `top-right`, `top-left` | `bottom-right` |
| `data-primary-color` | Button color (hex) | `#0056b3` |
| `data-auto-open` | Auto-open after 2 seconds | `false` |
| `data-widget-url` | Custom chatbot URL | GitHub Pages URL |

---

## Examples

### Basic Setup
```html
<script
  src="https://nsull042790.github.io/Legacy-Chat-Bot/widget.js"
  data-lo-id="jsmith"
  data-lo-name="John Smith">
</script>
```

### Custom Colors & Position
```html
<script
  src="https://nsull042790.github.io/Legacy-Chat-Bot/widget.js"
  data-lo-id="mjohnson"
  data-lo-name="Mary Johnson"
  data-site-id="mary-johnson-loans"
  data-position="bottom-left"
  data-primary-color="#2ecc71">
</script>
```

### Auto-Open Widget
```html
<script
  src="https://nsull042790.github.io/Legacy-Chat-Bot/widget.js"
  data-lo-id="bwilliams"
  data-lo-name="Bob Williams"
  data-auto-open="true">
</script>
```

---

## Lead Capture Integration

### Option 1: JavaScript Callback
Add this BEFORE the widget script to capture leads:

```html
<script>
  window.legacyMortgageWidgetOnLead = function(lead, config) {
    console.log('New lead:', lead);
    console.log('From LO:', config.loName);

    // Send to your CRM, Duda form, etc.
    // Example: send to webhook
    fetch('https://your-webhook-url.com/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lead: lead,
        loanOfficer: config.loId,
        site: config.siteId
      })
    });
  };
</script>
```

### Option 2: Duda Form Integration
The widget can submit to Duda's native forms. Contact support for setup.

---

## JavaScript API

Control the widget programmatically:

```javascript
// Open the chat
LegacyMortgageWidget.open();

// Close the chat
LegacyMortgageWidget.close();

// Toggle open/closed
LegacyMortgageWidget.toggle();

// Get current config
console.log(LegacyMortgageWidget.config);
```

### Trigger from Button
```html
<button onclick="LegacyMortgageWidget.open()">
  Chat with a Loan Officer
</button>
```

---

## Troubleshooting

### Widget not showing?
1. Check browser console for errors
2. Verify script URL is correct
3. Make sure script is in `<body>` or `<head>`

### Widget behind other elements?
The widget uses `z-index: 999999`. If still hidden:
```css
#legacy-mortgage-widget-container {
  z-index: 9999999 !important;
}
```

### Mobile display issues?
Widget auto-adjusts for mobile. If issues persist, check for viewport meta tag:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

---

## Support

For technical support, contact Legacy Mortgage Division.
