# NAOPAKI — website

A one-page portfolio site with a project view that opens when you click a project. It's plain HTML, CSS and JavaScript: no build step and nothing to install.

```
index.html            the page
css/style.css         all styling (brand colours are at the top)
content/projects.json ← projects (edited with Pages CMS)
content/site.json     ← homepage slideshow, About text, email, socials (edited with Pages CMS)
.pages.yml            the editor's setup (Pages CMS)
js/main.js            behaviour (list/grid, filter, project view)
assets/brand/         logo, seal, favicon, Pirata One font + licence
assets/img/work/      project photos (currently placeholders)
assets/img/hero/      homepage slideshow images (currently placeholders)
assets/video/         small video files (currently a placeholder loop)
```

## Preview it on your computer
The content is loaded from `content/*.json`, which browsers block when `index.html` is opened straight from disk. Run a tiny local server instead: in this folder run `python -m http.server`, then open http://localhost:8000. The live site is not affected.

## Where it lives
- **Repository:** https://github.com/naopakirecords/naopakiwebsite (company account, branch `main`)
- **Live site:** https://naopakirecords.github.io/naopakiwebsite/
- Hosted free on GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**. The repo must stay **public** for free Pages.

## Editing content (no code): Pages CMS
1. Go to **https://app.pagescms.org** and sign in with the **naopakirecords** GitHub account (or with the email invite you were sent).
2. Open **naopakirecords / naopakiwebsite** (branch `main`).
3. Edit and click **Save**. The live site updates within 1–2 minutes.

What you can edit:
- **Projects**: add, remove and drag to reorder. Each has a title, type (PHOTO/VIDEO, used by the filter), year, one short line, a cover image and a list of photos/videos. For each item fill in ONE box: a photo, a YouTube/Vimeo link, or a small mp4.
- **Homepage, About & Contact**: the slideshow behind the logo (images, seconds per image, black & white on/off), the About statement and its three columns, the email and social links (leave a link empty to hide that row).

Media tips:
- **Photos:** JPG, about **2000 px on the long side**, quality 75–80, under ~500 KB. Slideshow images: landscape works best.
- **Videos:** upload to YouTube (unlisted is fine) or Vimeo and paste the link. Only use the mp4 upload for short clips. GitHub rejects files over 100 MB, and video makes the repo slow.
- **Layout is automatic.** Tall photos pair up side by side. A tall photo without a partner is centred. Wide photos and videos run full width.
- Placeholder files start with `p0` (`assets/img/work`), `slide-0` (`assets/img/hero`) and `placeholder-` (`assets/video`). Delete them in the editor's Media section once they're no longer used.

Inviting someone: in Pages CMS open the repo's **Collaborators** page and invite them by email. They don't need a GitHub account. Saves are committed to the repo by the Pages CMS app on the company repo (commit message ends "(via Pages CMS)").

If you change `css/` or `js/` files by hand, bump the `?v=` number on their links in `index.html` so browsers load the new version.

**Full guide for editors: see `HOW-TO.txt`** (kept up to date with every change).

## Brand
Colours (Night `#0A0B0D`, Bone `#EEEDE7`), the Swept Turn logo and seal, and Pirata One all come from the NAOPAKI brand guide v1.0. The logo is always used as the supplied SVG, never retyped. Pirata One is under the SIL Open Font License (see `assets/brand/OFL.txt`).
