# Radar Studio

Radar Studio is a modern, responsive radar chart generator built with HTML, CSS, JavaScript, and Chart.js. It runs entirely in the browser and is ready for GitHub Pages hosting.

## Features

- Professional landing/header section
- Live radar chart preview
- Editable chart title and dataset name
- Add/remove radar chart data points
- Custom line, fill, grid, and background colors
- Adjustable maximum scale and fill opacity
- Sample data and reset controls
- PNG image export
- Fully responsive layout for desktop and mobile
- No backend required

## Project structure

```text
radar-studio/
├── index.html
├── styles.css
├── script.js
└── README.md
```

## How to run locally

Open `index.html` directly in your browser.

For a local server, you can also use:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## How to host on GitHub Pages

1. Create a new GitHub repository.
2. Upload these files to the root of the repository:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/root**
5. Click **Save**.
6. GitHub will give you a public Pages link after deployment.

## Technologies used

- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js through CDN
- Google Fonts through CDN

## Notes

This project is frontend-only and does not store user data. Exported images are generated directly from the chart canvas in the browser.
