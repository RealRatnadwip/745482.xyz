# 745482.xyz

A minimal, high-end, responsive landing page for the `745482.xyz` domain. Built with vanilla HTML and CSS, designed to deliver professional developer vibes with a clean, dark-themed, flat user interface.

## Tech Stack & Design Architecture

- **Core**: Vanilla HTML5 (semantic layout) and Vanilla CSS3.
- **Typography**:
  - Sans-Serif: [Inter](https://fonts.google.com/specimen/Inter) for clean, modern readability.
  - Monospace: [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for node telemetry and technical aesthetics.
- **Color System**:
  - **Base Background**: Deep matte black (`#09080a`).
  - **Surface/Cards**: Soft dark purple-gray (`#121014` / `#19171d`).
  - **Accent Highlight**: Sophisticated amethyst/plum purple (`#745482`).
  - **No Gradients**: Strictly flat colors with sharp borders, subtle active shadow indicators, and micro-animations to mimic a high-end personal portal or system terminal dashboard.
- **Responsiveness**: Fully fluid mobile-first design targeting mobile devices, tablets, and wide-screen PCs.

## File Structure

```
├── .gitignore         # Configured ignore files for systems, editors, and temp logs
├── content.md         # Content source copy
├── subdomain.md       # Directory of configured network subdomains
├── index.html         # Main semantic markup
├── style.css          # Core design system stylesheet
└── README.md          # Documentation (this file)
```

## Local Development & Preview

Since the project uses vanilla HTML and CSS, you can run and view the site locally without any build steps:

1. Open `index.html` directly in your browser, or
2. Run a simple local dev server in this directory:
   ```bash
   npx http-server .
   ```
   Or using Python:
   ```bash
   python -m http.server 8000
   ```
   And visit `http://localhost:8000`.

## Maintenance & Updates

### Subdomains

To add or update subdomains:
1. Document the change in `subdomain.md` for historical records.
2. Add the corresponding link to the `.subdomain-grid` section in `index.html`. For consistency, use the established markup structure:
   ```html
   <a href="https://yoursubdomain.745482.xyz" class="subdomain-card" target="_blank" rel="noopener">
       <div class="card-header">
           <span class="subdomain-url">yoursubdomain.745482.xyz</span>
           <span class="arrow-icon">→</span>
       </div>
       <p class="subdomain-desc">Subdomain Description</p>
   </a>
   ```

## License

Created and maintained by Ratnadwip Sarkar as part of the RealRatnadwip network.
See [ratnadwip.com](https://ratnadwip.com) for details.
