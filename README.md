# nityamittal.github.io/portfolio

Personal portfolio of **Nitya Mittal** — software & AI engineer, MS CS at the
University of Michigan.

**Live site:** https://nityamittal.github.io/portfolio/

## Stack

Plain static HTML, CSS, and vanilla JavaScript. No framework, no build step,
no runtime CDN dependencies — everything the site needs is in this repo,
including self-hosted fonts.

```
index.html        Home: hero, résumé downloads, about, skills, experience,
                  education, featured projects, honors, contact
projects.html     All projects
coursework.html   Courses by degree (Michigan + DTU)
css/fonts.css     @font-face declarations for the self-hosted fonts
js/main.js        Home-page interactions: theme toggle (persisted in
                  localStorage), scroll-spy nav, reveal-on-scroll,
                  draggable auto-scroll carousels, copy-email toast
js/hover.js       Applies per-element hover styles declared via data-hover
assets/fonts/     JetBrains Mono, Playfair Display, Poppins (woff2 subsets)
assets/icons/     Skill-badge icons
assets/img/       Photo, hero badge, favicon
*.pdf             Résumé downloads (master CV + AI/ML and SDE versions)
```

Pages are usable without JavaScript: content is fully server-rendered static
HTML, a `<noscript>` rule disables the reveal animations, and every contact
link is a real `mailto:` / `tel:` href.

## Developing

No tooling required — edit the HTML/CSS/JS directly and serve the folder:

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploying

Any static host works. For GitHub Pages: Settings → Pages → deploy from the
`main` branch, root folder. If the site moves to a custom domain, update the
`og:url` / `og:image` tags in the three HTML files.
