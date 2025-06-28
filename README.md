# 🦊 concopy

A Firefox/Chrome extension for copying web content with custom JavaScript
functions. Create your own clipboard formatting rules with a beautiful,
intuitive interface!

## ✨ Features

### 🎯 **Core Functionality**

- Create custom copy functions with safe template-based execution
- Access page title, URL, selected text, and metadata
- Built-in utility functions for common formatting tasks
- Rich HTML and plain text output support

### 🎨 **Beautiful Interface**

- Modern, responsive design with orange fox theme
- Drag & drop function reordering
- Random color generation with harmonious palette (22 curated colors)
- Visual function customization with background/text colors

### 🔄 **Import/Export & Sharing**

- Share functions via encoded URLs
- Import/export functions as JSON files
- URL-based function installation from share links
- Firefox-compatible import dialog (no chrome-extension:// dependency)

### 🛡️ **Security & Performance**

- CSP-compliant execution (no eval/Function constructor)
- Template-based safe function execution
- Custom code editing for all templates - templates serve as starting points
- Firefox Manifest V3 compatible
- Automatic clipboard API integration

### ⌨️ **Convenience Features**

- Keyboard shortcut support (`Ctrl+Shift+L` / `Cmd+Shift+L`)
- Automatic Firefox extension packaging
- Content script injection fallback
- Cross-browser compatibility (Firefox/Chrome)

## 🚀 Installation

### For Users

1. Download the latest `concopy-extension.zip` from releases
2. **Firefox**:
   - Open `about:debugging` → This Firefox → Load Temporary Add-on
   - Select the downloaded zip file
3. **Chrome**:
   - Open `chrome://extensions/` → Enable Developer mode
   - Drag & drop the zip file

### For Developers

```bash
# Clone and install dependencies
git clone <repository-url>
cd concopy
npm install

# Build the extension
npm run build

# The extension will be packaged as concopy-extension.zip
```

## 📖 Usage

### Basic Usage

1. Click the fox icon in your browser toolbar (or use `Ctrl+Shift+L`)
2. Click "Create your first function" or go to Options
3. Choose from 6 built-in templates or create custom functions
4. Save and use on any webpage!

### Template Functions

- **Rich Text Link**: HTML link with title and URL
- **Markdown Link**: Markdown-formatted link
- **Title and URL**: Simple title + URL combination
- **Selected Text**: Copy selected text or fallback to title
- **Page Summary**: Comprehensive page information
- **Custom Template**: Create your own with template variables

All templates are fully editable - they serve as starting points that you can customize to your needs!

### Function Interface

Your functions receive a `page` parameter with:

```typescript
interface PageContext {
  title: string; // Page title
  url: string; // Page URL
  selection: string; // Selected text
  content: string; // Full page text
  meta: { // Meta tag information
    description?: string;
    keywords?: string;
    author?: string;
    [key: string]: string | undefined;
  };
}
```

### Template Rendering

Use the `render()` function for dynamic content:

```javascript
// Template variables: {{variable}} for escaped, {{&variable}} for unescaped
render("Visit {{title}} at {{&url}}", page);
// Result: "Visit My Page at https://example.com"
```

### Library Functions

The `lib` object provides utilities:

```javascript
lib.formatDate(date, "YYYY-MM-DD HH:mm"); // Format dates
lib.escapeHtml(text); // Escape HTML
lib.truncate(text, 100, "..."); // Truncate text
lib.toMarkdownLink(title, url); // [title](url)
lib.toHtmlLink(title, url); // <a href="url">title</a>
lib.extractDomain(url); // Get domain
lib.simplifyUrl(url); // Remove query params
```

## 🎨 Example Functions

### Rich HTML Link

```javascript
((page) => {
  return {
    html: render('<a href="{{&url}}">{{title}}</a>', page),
    text: page.title,
  };
});
```

### Markdown with Date

```javascript
((page) => {
  const date = lib.formatDate(new Date(), "YYYY-MM-DD");
  return `[${page.title}](${page.url}) - ${date}`;
});
```

### Page Summary

```javascript
((page) => {
  const summary = [
    "Title: " + page.title,
    "URL: " + page.url,
  ];

  if (page.meta?.description) {
    summary.push("Description: " + page.meta.description);
  }

  return summary.join("\n");
});
```

## 🛠️ Development

### Development Server

```bash
npm run dev
```

### Building

```bash
npm run build          # Build and package extension
npm run package        # Package existing build
npm run lint          # Check code quality
npm run typecheck     # Type checking
```

### Project Structure

```
src/
├── background/       # Extension background script
├── content/         # Content script for page interaction
├── popup/           # Extension popup interface  
├── options/         # Options page for function management
├── components/      # Reusable React components
└── lib/            # Core functionality
    ├── colors.ts   # Color palette and utilities
    ├── library.ts  # Helper functions
    ├── storage.ts  # Browser storage management
    ├── templates.ts # Template system and execution
    └── types.ts    # TypeScript definitions
```

### Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Bundler**: Vite 5 with React plugin
- **Extension**: Manifest V3 with webextension-polyfill
- **UI Components**: react-beautiful-dnd for drag & drop
- **Code Quality**: ESLint + TypeScript strict mode

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Run `npm run lint` and `npm run typecheck`
4. Commit your changes
5. Open a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🦊 About

concopy makes it easy to create custom clipboard formatting rules for any
website. Whether you need markdown links, rich HTML content, or custom formatted
text, concopy's template system has you covered with a beautiful, user-friendly
interface.

