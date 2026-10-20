# Koforidua Events Park presentation

Open `index.html` in a browser. The presentation is a portable folder with local image assets; it does not need a build step or internet connection. Archivo loads when Google Fonts is available and falls back to system fonts offline.

The site includes a four-image hero, a concept narrative, an interactive four-move campus diagram, two annotated project diagrams with selectable focus points, a still-image visual tour, campus pins, scroll-linked space specifications, a swipeable gallery, a lightbox and schematic floor-plan tabs. The source folder contains no video, so the tour uses architectural renders.

All architecture images and plans are web-sized copies of files in the parent project folder. Their source mapping and regeneration script are in `build_assets.py`. The campus aerial was upscaled from `AI Renders/d30f2a60-a3cb-46b7-95d3-d5f5bd3f278c.png` with the local FLUX 3 Image Klein + RealESRGAN Ultimate SD Upscale workflow. Its 3840 × 2160 master is `AI Renders/Koforidua-Campus-FLUX3-4K.png`; the edited workflow is in `workflows/campus-flux3-upscale.json`. The site serves 900, 1920 and 3840 pixel WebP variants of that master.

The Astrix studio logo at `assets/astrix-logo.png` is copied from the Santor website asset `Zagey Santor/Website/site/assets/img/astrix-logo.png`. It is kept separate from `build_assets.py`, which regenerates the project renders and favicon.

The concept narrative follows slide 3 of `JBD_Conference_Events_Park.pptx` ("A campus, not a single building"). `assets/concept-campus-diagram.webp` is a web copy of `Diagrams/341c9d1f-d1de-45a6-b96b-198a19752efa.png`; `assets/concept-arrival-diagram.webp` comes from `Diagrams/1d1f0205-6e14-474d-8aa8-6bf0c1620e38.png`. The diagram titled "Inclusive Financial Canopy" belongs to another project and is not used.

The client deck conflicts on total parking capacity and hotel rating. These figures are excluded from the main presentation and documented in the expandable source note in the footer. Contact links use the empty `CONTACT` object in `script.js`; add verified details there before enabling them. Concept renders contain illustrative signs embedded in the supplied images.

Run `python check_site.py` and `node --check script.js` after editing. No external packages are required.
