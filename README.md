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
(LinkedIn needs a full URL to show the preview image). If you switch to a custom domain, update that URL on every page,
along with each page's `<link rel="canonical">` and `og:url` lines, which hold that page's own full address.

## Common edits

- **Text:** edit the HTML directly. The header and footer are repeated on every page, so update all nine pages (index, about, the four project pages and the three updates pages) when you change a nav link.
- **Colors / fonts:** the `:root` block at the top of `assets/css/styles.css`. The palette is Villanova navy
  (`#00205b`) and Villanova blue (`#13b5ea`) on a light aluminum gray; the typefaces are Big Shoulders (headings)
  and Libre Franklin (text), loaded from Google Fonts in each page's `<head>`. `404.html` has its own copy of these
  styles because it can't rely on relative paths.
- **After changing the CSS or JavaScript:** bump the `?v=` date on the `styles.css` and `main.js` links in all nine
  pages (for example `styles.css?v=20261023` to `?v=20261105`). Browsers and GitHub Pages cache those files for a
  while, and a new `?v=` makes them fetch the new version right away.
- **Résumé:** replace `assets/Randall-Preston-Resume.pdf` with a file of the same name.
- **New photos:** drop the original in `Media/`, then run
  ```
  powershell -ExecutionPolicy Bypass -File tools\optimize-images.ps1 -Source Media\my-photo.jpg -Name vu18-diff-mount
  ```
  This creates `assets/img/vu18-diff-mount-640.jpg` and `-1280.jpg`, with location metadata stripped (if the original is
  narrower than 1280 px, the second file is named with its real width; the script prints the names). Copy an existing
  `<figure data-zoom>` block from `projects/vu17.html` and point it at the new files. Set `--ar` to width ÷ height
  so gallery rows line up.
- **Replace a blueprint placeholder** (BeetleBot, ME³; VU18 now uses a render of the sprocket-side center mount, and its old `vu18-blueprint.svg` is kept unused): swap the `.svg` `src` for your photo or CAD render,
  on both the home-page card and the project page.
