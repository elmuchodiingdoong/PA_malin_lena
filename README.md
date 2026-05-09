# Basel Project Homepage

Static homepage for a project about special spots in Basel city.

## Project structure

- `index.html`: homepage layout
- `app.js`: loads topic data from JSON and renders 8 topic cards
- `styles.css`: visual design and responsive layout
- `content/topics.json`: all topic titles, texts, and image paths
- `content/images/`: put your topic images here
- `.github/workflows/deploy.yml`: GitHub Pages deployment workflow

## Add your pictures and text

1. Put all your images in `content/images/`.
2. Open `content/topics.json`.
3. For each of the 8 topics:
   - set `title`
   - set `text`
   - set two image paths in `images` (for example `content/images/topic1-1.jpg`)

The page expects 8 topics, 2 pictures per topic, and 1 text per topic.

## Local preview

Run this in the project folder:

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## Deploy to GitHub Pages

1. Create a new GitHub repository.
2. In this folder, run:

```bash
git init
git add .
git commit -m "Initial Basel homepage"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

3. In GitHub repository settings:
   - Go to `Settings` -> `Pages`
   - Under `Build and deployment`, choose `Source: GitHub Actions`

4. Wait for the action to finish in the `Actions` tab.
5. Your site will be live at:
   - `https://<your-username>.github.io/<your-repo>/`
