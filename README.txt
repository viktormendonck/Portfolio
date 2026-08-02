PORTFOLIO 2.0 — FIRST VERSION

Pages
- index.html: new landing page with about information and favorite projects
- projects.html: full project archive with generated language/tool filters
- blog.html: placeholder for future blog posts
- project-pages/: supplied example detail pages with shared navigation

Data
- projects.json keeps the same structure as the original file.
- Set "favorite": true on a project to show it on the landing page.
- The landing page currently displays the first four favorites after sorting by "order".

Running locally
Because the project data is loaded with fetch(), launch a local server instead of double-clicking index.html.
For example, from this folder:

  python -m http.server 8000

Then visit http://localhost:8000

Assets
The uploaded files did not include the assets folder. Copy your existing assets folder into this directory so the current image paths continue to work.


PROJECT PAGES
All supplied project pages now use project-pages/template.css and the same navigation, colors, typography, cards and responsive spacing as Portfolio 2.0.

BOTANICAL ORNAMENT UPDATE
The individual SVG ornaments are stored in assets/decor. StraightHorizontal.svg is used as the main divider, while the leaf and accent SVGs are placed as subtle page decorations.

Botanical update:
- Project heading floral dividers are centered.
- The homepage receives a denser randomized mix of leaves and larger accents.
- Size, rotation, mirroring, opacity, side, and vertical placement vary on each load.
