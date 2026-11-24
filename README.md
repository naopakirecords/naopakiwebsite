# NAOPAKI — website

A one-page portfolio site with a project view that opens when you click a project. It's plain HTML, CSS and JavaScript: no build step and nothing to install.

```
index.html            the page
css/style.css         all styling (brand colours are at the top)
js/projects.js        ← YOUR CONTENT: the list of projects
js/main.js            behaviour (list/grid, filter, project view)
assets/brand/         logo, seal, favicon, Pirata One font + licence
assets/img/work/      project photos (currently placeholders)
assets/video/         small video files (currently a placeholder loop)
```

## Preview it on your computer
Double-click `index.html` and it opens in your browser. Everything works offline except YouTube and Vimeo embeds.

## Where it lives
- **Repository:** https://github.com/naopakirecords/naopakiwebsite (company account, branch `main`)
- **Live site:** https://naopakirecords.github.io/naopakiwebsite/
- Hosted free on GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**. The repo must stay **public** for free Pages.

To update the site later, upload the changed files again in the repo (**Add file → Upload files**). The site refreshes within a minute or two.

## Swapping placeholders for real work
Everything is in **`js/projects.js`**. Each project looks like this:

```js
{
  slug: "sleepwalk", title: "Sleepwalk", type: "PHOTO", year: "2026",
  line: "One short line.",
  cover: "assets/img/work/sleepwalk-cover.jpg",
  media: [
    { type: "image",   src: "assets/img/work/sleepwalk-1.jpg", alt: "Sleepwalk" },
    { type: "youtube", id: "VIDEO_ID" },
    { type: "vimeo",   id: "123456789" }
  ]
},
```

- **Photos:** export JPGs at about **2000 px on the long side**, quality 75–80, ideally under 500 KB each. Put them in `assets/img/work/`.
- **Videos:** upload them to YouTube (unlisted is fine) or Vimeo and paste the ID.
  - YouTube ID: in `youtube.com/watch?v=AbC123xyz` it's `AbC123xyz`.
  - Vimeo ID: in `vimeo.com/123456789` it's `123456789`.
  - Don't upload big video files to GitHub. It rejects anything over 100 MB, and video makes the repo slow.
- **Layout is automatic.** Tall photos pair up side by side. A tall photo without a partner is centred. Wide photos and videos run full width.
- **Order:** the list order on the site matches the order in the file.
- **Type:** use `"PHOTO"` or `"VIDEO"` so the filter works.
- **Delete placeholders:** remove the files starting with `p0` from `assets/img/work/`. Delete `assets/video/placeholder-*` too, but only after replacing the hero background video in `index.html` (search for `placeholder-loop`).

## Other placeholders to change in `index.html`
- Email: search `hello@naopaki.com`
- Socials: search `instagram.com/`, `tiktok.com/` and `youtube.com/`, then put in the full profile links and @handles
- About text: the `about__statement` paragraph and the three columns under it
- Hero background video: `assets/video/placeholder-loop.mp4`. Use a short, muted, compressed loop (under about 5 MB) or delete the `<video class="hero__bg" …>` line.

## Brand
Colours (Night `#0A0B0D`, Bone `#EEEDE7`), the Swept Turn logo and seal, and Pirata One all come from the NAOPAKI brand guide v1.0. The logo is always used as the supplied SVG, never retyped. Pirata One is under the SIL Open Font License (see `assets/brand/OFL.txt`).
