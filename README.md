# Ruwinika Rodrigo — portfolio

A responsive portfolio built with Vite, semantic HTML, CSS, and JavaScript. Includes an animated CSS glass sculpture, light/dark themes, project filtering and accessible project dialogs, a mobile menu, contact links, and a downloadable CV.

## Run
```sh
npm install
npm run dev
```
## Build
```sh
npm run build
npm run preview
```
Deploy the generated `dist/` directory to any static host. No server or environment variables are required. The project currently assumes deployment at the domain root.

## Verify
```sh
npm test
```
Tests start a temporary Vite server and exercise the desktop/mobile flows with an installed Google Chrome browser (headless).

## Content
- Main content: `index.html`
- Project details and interactions: `src/main.js`
- Design tokens, responsiveness, and reduced-motion behavior: `src/style.css`
- Downloadable CV: `public/ruwinika-rodrigo-cv.pdf`

Career and project information is based on the supplied CV. Project previews are original illustrative interface studies, not screenshots of delivered client work. Replace them with approved project assets and verified outcomes when available. The source CV includes personal contact and referee details; review the downloadable PDF before public publication. Employment and study statuses reproduce the supplied CV and should be kept current.

Google Fonts is optional; system font fallbacks are included. All illustration and interface artwork is rendered locally with HTML/CSS. Motion respects the user's reduced-motion preference. The contact form validates details and prepares a mailto draft, with a copy-message alternative. Visitors review and send from their email app; no backend delivery service is configured. Form entries are not stored, and no analytics are included.

