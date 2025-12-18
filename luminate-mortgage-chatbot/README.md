# Luminate Mortgage Chatbot

A React-based mortgage chatbot widget for Luminate Bank, designed for GitHub Pages deployment and embedding in Duda websites.

**Version: 1.0.4**

## Changelog

| Version | Changes |
|---------|---------|
| v1.0.4 | Production release - removed debug elements, expanded knowledge base (40+ topics), added lead capture flow, fixed message rendering |
| v1.0.3 | Debug version with content diagnostics |
| v1.0.2 | Debug version (message in state, bubble empty) |
| v1.0.1 | Attempted fix with unique IDs |
| v1.0.0 | Initial release |

## Features

- Interactive chat interface with typing indicators
- Mortgage FAQ knowledge base (40+ topics including FHA, VA, PMI, self-employed, refinance, etc.)
- Quick reply buttons for common questions
- Lead capture flow (name, phone, email)
- Responsive design with Luminate brand colors
- NMLS #1281698 compliance footer

## Tech Stack

- **React 18** - UI framework with useReducer for state management
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **GitHub Actions** - Automated deployment to GitHub Pages

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/luminate-mortgage-chatbot.git
   cd luminate-mortgage-chatbot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Deploy to GitHub Pages |

### Project Structure

```
luminate-mortgage-chatbot/
├── src/
│   ├── components/
│   │   └── MortgageChatbot.jsx  # Main chatbot component (v1.0.4)
│   ├── App.jsx                   # Root app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind styles
├── index.html
├── vite.config.js                # Vite config with base path
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js
└── package.json
```

## Deploying to GitHub Pages (GitHub Actions)

Deployment is automated via GitHub Actions. Every push to `main` triggers a build and deploy.

### First-Time Setup

1. Go to your repository on GitHub

2. Navigate to **Settings** > **Pages**

3. Under "Build and deployment":
   - **Source**: Select "GitHub Actions"

4. Update the `base` in `vite.config.js` to match your repo name:
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/Legacy-Chat-Bot/',  // Your repo name
   })
   ```

5. Push to the `main` branch - GitHub Actions will automatically build and deploy!

### How It Works

The workflow (`.github/workflows/deploy.yml`) automatically:
1. Checks out the code
2. Installs dependencies
3. Builds the production bundle
4. Deploys to GitHub Pages

### Manual Trigger

You can also trigger deployment manually:
1. Go to **Actions** tab in your repository
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

Your site will be live at: `https://YOUR_USERNAME.github.io/Legacy-Chat-Bot/`

## Embedding in Duda

To embed the chatbot in a Duda website, add this iframe code:

```html
<iframe
  src="https://YOUR_USERNAME.github.io/Legacy-Chat-Bot/"
  width="400"
  height="720"
  frameborder="0"
  style="border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

Or as a floating widget (add to Duda's custom HTML):

```html
<div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
  <iframe
    src="https://YOUR_USERNAME.github.io/Legacy-Chat-Bot/"
    width="400"
    height="720"
    frameborder="0"
    style="border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);"
  ></iframe>
</div>
```

## Knowledge Base Topics

The chatbot can answer questions about:

- **Loan Types**: FHA, VA, Conventional, Jumbo, USDA, ARM
- **Down Payment**: Requirements by loan type, gift funds
- **PMI**: What it is, how to avoid it
- **Self-Employed**: Documentation, bank statement loans
- **Pre-Approval**: Process, required documents, timeline
- **Credit Scores**: Requirements by loan type
- **Refinancing**: Cash-out, rate reduction
- **Closing Costs**: What to expect
- **Investment Properties**: Requirements, rates
- **And more...**

## Customization

### Brand Colors

The component uses inline Tailwind colors:
- Navy: `#0D1834` - Header & user messages
- Light Blue: `#96DAF8` - Accents & highlights

### Knowledge Base

Edit the `KNOWLEDGE_BASE` object in `MortgageChatbot.jsx` to add or modify FAQ responses.

### Lead Capture

Leads are logged to console. In production, update the `handleLeadCapture` function to send to your CRM.

### NMLS Number

Update the footer in `MortgageChatbot.jsx`:

```jsx
<p className="text-xs text-gray-500 text-center">
  Luminate Home Loans Inc. · NMLS #1281698 · Equal Housing Lender
</p>
```

## License

MIT License - Luminate Home Loans Inc.

---

**NMLS #1281698** | Luminate Home Loans Inc.
