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
  js/main.js            Menu, dropdown, scroll effects, photo lightbox, carousels
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

## Publishing

The site is live at https://randallpreston.github.io. GitHub Pages publishes the `main` branch, so anything
pushed or merged to `main` is live about a minute later.

The `og:image` line in each HTML file's `<head>` points to `https://randallpreston.github.io/assets/img/og-image.jpg`
(LinkedIn needs a full URL to show the preview image). If you switch to a custom domain, update that URL on every page.

## Common edits

- **Text:** edit the HTML directly. The header and footer are repeated on every page, so update all nine pages (index, about, the four project pages and the three updates pages) when you change a nav link.
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
