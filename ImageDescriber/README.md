# ImageDescribe AI

A free, private, browser-based AI image description tool. Upload any image and get an AI-generated description — no signup, no server, and your images never leave your device.

## Features

- Drag & drop or click to upload images
- Description length slider
- Copy to clipboard
- Download as `.txt`
- Fully client-side (powered by Transformers.js + vit-gpt2)
- No account required
- Works offline after the first model download

## Deploy on GitHub Pages

1. Create a new public GitHub repository
2. Upload these files to the root of the repo:
   - `index.html`
   - `README.md` (optional)
3. Go to **Settings → Pages**
4. Under **Source**, select **Deploy from a branch**
5. Choose `main` (or `master`) branch and `/ (root)` folder
6. Click **Save**

Your site will be live at:  
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Alternative: docs folder

If you prefer, put `index.html` inside a `/docs` folder and select `/docs` as the source in GitHub Pages settings.

## Local Testing

Just open `index.html` in any modern browser (Chrome, Edge, Firefox, etc.).

## How It Works

The first time you click "Describe Image", the browser downloads the AI model (~200 MB) from Hugging Face. After that, it is cached and descriptions are generated instantly. All processing happens locally on your device.

## License

This tool is provided as-is for educational and personal use. The underlying model (`vit-gpt2-image-captioning`) is open source.
