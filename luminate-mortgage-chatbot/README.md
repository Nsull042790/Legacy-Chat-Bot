# Luminate Mortgage Chatbot

A React-based mortgage chatbot widget for Luminate Bank, designed for GitHub Pages deployment and embedding in Duda websites.

**Version: 1.0.3**

## Features

- Interactive chat interface with typing indicators
- Mortgage FAQ knowledge base (down payment, FHA, VA, PMI, self-employed, etc.)
- Quick reply buttons for common questions
- Lead capture flow (name, phone, email)
- Responsive design with Luminate brand colors
- NMLS #1281698 compliance footer

## Tech Stack

- **React 18** - UI framework
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **gh-pages** - GitHub Pages deployment

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
│   │   └── MortgageChatbot.jsx  # Main chatbot component
│   ├── App.jsx                   # Root app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Tailwind styles
├── index.html
├── vite.config.js                # Vite config with base path
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js
└── package.json
```

## Deploying to GitHub Pages

### First-Time Setup

1. Create a new repository on GitHub named `luminate-mortgage-chatbot`

2. Update the `base` in `vite.config.js` if your repo name is different:
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/',
   })
   ```

3. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/luminate-mortgage-chatbot.git
   git push -u origin main
   ```

### Deploying Updates

Run the deploy command:

```bash
npm run deploy
```

This will:
1. Build the production bundle
2. Push to the `gh-pages` branch
3. Your site will be live at: `https://YOUR_USERNAME.github.io/luminate-mortgage-chatbot/`

### Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Pages**
3. Under "Source", select `gh-pages` branch
4. Click Save
5. Wait a few minutes for deployment

## Embedding in Duda

To embed the chatbot in a Duda website, add this iframe code:

```html
<iframe
  src="https://YOUR_USERNAME.github.io/luminate-mortgage-chatbot/"
  width="400"
  height="620"
  frameborder="0"
  style="border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
></iframe>
```

Or as a floating widget (add to Duda's custom HTML):

```html
<div style="position: fixed; bottom: 20px; right: 20px; z-index: 9999;">
  <iframe
    src="https://YOUR_USERNAME.github.io/luminate-mortgage-chatbot/"
    width="380"
    height="600"
    frameborder="0"
    style="border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);"
  ></iframe>
</div>
```

## Customization

### Brand Colors

Update colors in `tailwind.config.js`:

```js
colors: {
  'luminate-navy': '#0D1834',  // Header & user messages
  'luminate-blue': '#96DAF8',  // Accents & highlights
}
```

### Knowledge Base

Edit the `knowledgeBase` object in `MortgageChatbot.jsx` to add or modify FAQ responses.

### NMLS Number

Update the footer in `MortgageChatbot.jsx`:

```jsx
<p className="text-center text-xs text-gray-500">
  Luminate Home Loans Inc. | NMLS #1281698
</p>
```

## License

MIT License - Luminate Home Loans Inc.

---

**NMLS #1281698** | Luminate Home Loans Inc.
