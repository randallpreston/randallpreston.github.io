# Randall Preston — Engineering Portfolio

Static site (HTML + CSS + a little JavaScript). No build step, no frameworks. It is hosted free on GitHub Pages.

```
index.html              Home: hero, about, projects, skills, résumé, contact
about.html              More About Me: social-style feed of photos and posts (linked from the About section)
projects/
  vu17.html             VU17 Design & Manufacturing (aero + drivetrain)
  vu18.html             VU18 Drivetrain Design
  beetlebot.html        BeetleBot (write-up template inside, in an HTML comment)
  me3-lab.html          ME³ Lab research
  vu18-updates.html     Update feeds for the ongoing projects, opened by the "Project Updates"
  beetlebot-updates.html  button on each overview page. Posts use the same templates as
  me3-lab-updates.html  about.html (single photo, multi-photo carousel, text).
404.html                "Page not found" page
assets/
  css/styles.css        All styling. Colors, fonts and spacing are tokens at the top.
  js/main.js            Menu, dropdown, scroll effects, photo lightbox
  img/                  Web-optimized photos + blueprint SVG placeholders
  Randall-Preston-Resume.pdf
tools/optimize-images.ps1   Resizes new photos for the site
Media/                  Your original photos (not uploaded; see .gitignore)
```

## Preview on your computer

From this folder, run:

```
python -m http.server 8080
```

Then open http://localhost:8080. You can also double-click `index.html`, but a few things, like the 404 page, only behave correctly through a server.

## Publish on GitHub Pages

Git isn't installed on this PC yet. The easiest route is **GitHub Desktop** (desktop.github.com).

1. On github.com, create a new **public** repository named exactly `YOUR-USERNAME.github.io`.
   With that name, the site lives at `https://YOUR-USERNAME.github.io`, the cleanest URL for a résumé.
2. In GitHub Desktop: **File → Add local repository →** choose `C:\Portfolio` → "create a repository" if asked → **Publish repository**.
   Uncheck "Keep this code private" unless your GitHub Pro / Student Pack plan allows private Pages.
3. On github.com, open the repository's **Settings → Pages**. Under "Build and deployment", pick **Deploy from a branch**, branch **main**, folder **/ (root)**, then save.
4. After about a minute the site is live. Put that URL on your résumé and LinkedIn.

The `og:image` line in each HTML file's `<head>` already points to `https://randallpreston.github.io/assets/img/og-image.jpg`
(LinkedIn needs a full URL to show the preview image). If you switch to a custom domain, update that URL on every page.

If you use a different repository name (e.g. `portfolio`), the site will be at `https://YOUR-USERNAME.github.io/portfolio/`.
Everything still works except the 404 page's "Back to home" link; change its `href="/"` to `href="/portfolio/"`.

## Common edits

- **Text:** edit the HTML directly. The header and footer are repeated on every page, so update all six pages (index, about and the four project pages) when you change a nav link.
- **Colors / fonts:** the `:root` block at the top of `assets/css/styles.css`.
- **Résumé:** replace `assets/Randall-Preston-Resume.pdf` with a file of the same name.
- **New photos:** drop the original in `Media/`, then run
  ```
  powershell -ExecutionPolicy Bypass -File tools\optimize-images.ps1 -Source Media\my-photo.jpg -Name vu18-diff-mount
  ```
  This creates `assets/img/vu18-diff-mount-640.jpg` and `-1280.jpg`, with location metadata stripped. Copy an existing
  `<figure data-zoom>` block from `projects/vu17.html` and point it at the new files. Set `--ar` to width ÷ height
  so gallery rows line up.
- **Replace a blueprint placeholder** (VU18, BeetleBot, ME³): swap the `.svg` `src` for your photo or CAD render,
  on both the home-page card and the project page.
