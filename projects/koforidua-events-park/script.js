const $ = (id) => document.getElementById(id);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = window.matchMedia('(hover: none)').matches;
const CONTACT = { email: '', phone: '', whatsapp: '' };

// Contact links are populated only if verified details are added here.
if (CONTACT.email || CONTACT.phone || CONTACT.whatsapp) {
  const buttons = [];
  if (CONTACT.email) buttons.push(`<a class="btn btn-primary" href="mailto:${encodeURIComponent(CONTACT.email)}">Email us <span aria-hidden="true">↗</span></a>`);
  if (CONTACT.phone) buttons.push(`<a class="btn btn-secondary" href="tel:${CONTACT.phone.replace(/[^+\d]/g, '')}">Call us <span aria-hidden="true">↗</span></a>`);
  if (CONTACT.whatsapp) buttons.push(`<a class="btn btn-secondary" href="https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}">WhatsApp <span aria-hidden="true">↗</span></a>`);
  $('closing-actions').innerHTML = buttons.join('');
}

const nav = $('nav');
const menuToggle = $('menu-toggle');
const mobileMenu = $('mobile-menu');
function closeMenu() {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('menu-open');
  updateNav();
}
menuToggle.addEventListener('click', () => {
  const opening = mobileMenu.hidden;
  mobileMenu.hidden = !opening;
  menuToggle.setAttribute('aria-expanded', String(opening));
  menuToggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', opening);
  updateNav();
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
function updateNav() {
  const y = 45;
  const activeSection = [...document.querySelectorAll('main > section')].find(section => {
    const rect = section.getBoundingClientRect();
    return rect.top <= y && rect.bottom > y;
  });
  nav.classList.toggle('scrolled', window.scrollY > 40);
  nav.classList.toggle('on-light', !!activeSection?.classList.contains('light') && mobileMenu.hidden);
  nav.classList.toggle('over-tour', activeSection?.id === 'tour' && mobileMenu.hidden);
}
window.addEventListener('scroll', updateNav, { passive: true });
window.addEventListener('resize', updateNav);
updateNav();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .13 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Hero image sequence.
const hero = $('top');
const heroSlides = [...document.querySelectorAll('.hero-image')];
const heroCaptions = ['A new arrival for Koforidua', 'A place to stay close', 'Architecture with presence', 'A connected campus'];
const heroDots = document.querySelector('.hero-dots');
let heroIndex = 0;
let heroPaused = reducedMotion;
let heroVisible = true;
let heroTimer;
heroSlides.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `Show image ${index + 1}`);
  dot.addEventListener('click', () => showHero(index));
  heroDots.appendChild(dot);
});
function showHero(index) {
  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => {
    if (i === heroIndex && slide.dataset.src) {
      slide.src = slide.dataset.src;
      delete slide.dataset.src;
    }
    slide.classList.toggle('active', i === heroIndex);
  });
  heroDots.querySelectorAll('button').forEach((dot, i) => {
    dot.classList.toggle('active', i === heroIndex);
    dot.setAttribute('aria-current', i === heroIndex ? 'true' : 'false');
  });
  $('hero-caption').textContent = heroCaptions[heroIndex];
  resetHeroTimer();
}
function resetHeroTimer() {
  clearTimeout(heroTimer);
  if (!heroPaused && heroVisible) heroTimer = setTimeout(() => showHero(heroIndex + 1), 7000);
}
$('hero-pause').addEventListener('click', () => {
  heroPaused = !heroPaused;
  $('hero-pause').textContent = heroPaused ? 'Play' : 'Pause';
  $('hero-pause').setAttribute('aria-label', heroPaused ? 'Play image slideshow' : 'Pause image slideshow');
  resetHeroTimer();
});
new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  resetHeroTimer();
}, { threshold: .15 }).observe(hero);
showHero(0);

// The conceptual plan builds in four deliberate moves. Nothing advances on its own.
const formationMoves = [
  { title: 'Establish an address.', description: 'A clear street edge and one legible point of arrival orient the campus before the programme unfolds.' },
  { title: 'Separate the anchors.', description: 'The hotel and event centre take distinct positions, giving each a recognisable identity and room to operate.' },
  { title: 'Make a shared centre.', description: 'A sheltered link and open court turn the space between buildings into the heart of the destination.' },
  { title: 'Connect through landscape.', description: 'Planted edges and pedestrian routes make movement across the site comfortable, clear and memorable.' }
];
const formationButtons = [...document.querySelectorAll('.formation-steps button')];
function showFormation(index, focus = false) {
  const step = (index + formationMoves.length) % formationMoves.length;
  $('formation-canvas').dataset.step = String(step);
  formationButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === step)));
  $('formation-count').textContent = `Move 0${step + 1} / 04`;
  $('formation-step-title').textContent = formationMoves[step].title;
  $('formation-step-description').textContent = formationMoves[step].description;
  if (focus) formationButtons[step].focus();
}
formationButtons.forEach((button, index) => {
  button.addEventListener('click', () => showFormation(index));
  button.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      showFormation(index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1), true);
    }
  });
});
showFormation(0);

// Explore supplied studies and clearly labelled conceptual diagrams through focus points.
const conceptDiagrams = {
  campus: {
    image: 'assets/concept-campus-diagram.webp',
    alt: 'Annotated axonometric showing rooftop amenity, hotel wing, shared lobby, paddle court and event centre',
    label: 'Campus organisation',
    features: [
      { x: 31, y: 23, name: 'Rooftop amenity', title: 'A hospitality layer above.', description: 'The upper terrace gives the guestroom wing its own leisure space and outlook.' },
      { x: 64, y: 54, name: 'Shared lobby', title: 'A common threshold.', description: 'The lobby and circulation zone bind the two major volumes into one walkable destination.' },
      { x: 55, y: 64, name: 'Paddle court', title: 'Recreation between destinations.', description: 'An outdoor recreation court occupies the space between the hotel and event centre.' },
      { x: 79, y: 47, name: 'Event centre', title: 'A distinct gathering anchor.', description: 'The larger hall volume keeps a clear public identity beside the guestroom wing.' }
    ]
  },
  arrival: {
    image: 'assets/concept-arrival-diagram.webp',
    alt: 'Annotated frontage study showing road approach, sheltered arrival canopy, landscape buffer, water feature and event entrance',
    label: 'Arrival sequence',
    features: [
      { x: 82, y: 83, name: 'Road approach', title: 'A legible approach.', description: 'Vehicular movement is directed from the main road toward the arrival and drop-off.' },
      { x: 46, y: 66, name: 'Arrival canopy', title: 'A sheltered transition.', description: 'The long canopy gives the frontage a protected arrival edge.' },
      { x: 55, y: 79, name: 'Signage & water', title: 'A memorable threshold.', description: 'The sign wall and water feature mark the point of arrival.' },
      { x: 76, y: 47, name: 'Event frontage', title: 'A visible public face.', description: 'Glazing and sculpted V-columns frame the entrance to the event centre.' }
    ]
  },
  programme: {
    image: 'assets/concept-programme.svg',
    alt: 'Conceptual programme diagram showing hotel and event spaces as separate anchors around a shared lobby and open court',
    label: 'Programme and shared space',
    features: [
      { x: 24, y: 47, name: 'Hotel & suites', title: 'A quieter place to stay.', description: 'The guestroom wing has a distinct identity while remaining connected to the event programme.' },
      { x: 76, y: 46, name: 'Event centre', title: 'A public gathering anchor.', description: 'The convention and meeting spaces form the campus\' larger public destination.' },
      { x: 44, y: 43, name: 'Shared threshold', title: 'A common threshold.', description: 'The linked lobby makes movement between hospitality and events clear and sheltered.' },
      { x: 50, y: 69, name: 'Open court', title: 'Breathing room between buildings.', description: 'A landscaped court gives the two anchors a shared outdoor centre.' }
    ]
  },
  movement: {
    image: 'assets/concept-movement.svg',
    alt: 'Conceptual movement diagram tracing the road approach, sheltered arrival, connections between buildings and landscape route',
    label: 'Movement and landscape',
    features: [
      { x: 50, y: 83, name: 'Road edge', title: 'Begin with a clear address.', description: 'The main road and entry point establish a legible first move into the campus.' },
      { x: 43, y: 64, name: 'Sheltered arrival', title: 'Arrive under cover.', description: 'The drop-off and canopy make the transition from vehicle to venue comfortable.' },
      { x: 44, y: 43, name: 'Walkable link', title: 'Connect the destinations.', description: 'A pedestrian route joins the hotel, shared lobby and event centre.' },
      { x: 71, y: 65, name: 'Landscape loop', title: 'Make the journey part of the place.', description: 'Planting and outdoor space soften the edges of the route between buildings.' }
    ]
  }
};
const diagramTabs = [...document.querySelectorAll('.diagram-tabs button')];
const diagramImage = $('diagram-image');
const diagramViewItem = { el: $('diagram-expand'), src: conceptDiagrams.campus.image, title: conceptDiagrams.campus.label, alt: conceptDiagrams.campus.alt };
let activeDiagram = 'campus';
let diagramImageRequest = 0;
function showDiagramFeature(index, focus = false, pan = false) {
  const data = conceptDiagrams[activeDiagram];
  const feature = data.features[index];
  $('diagram-counter').textContent = `0${index + 1} / 0${data.features.length}`;
  $('diagram-feature-title').textContent = feature.title;
  $('diagram-feature-description').textContent = feature.description;
  document.querySelectorAll('.diagram-marker,.diagram-feature-list button').forEach(button => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.feature) === index));
  });
  if (pan) {
    const viewport = document.querySelector('.diagram-viewport');
    const stage = viewport.querySelector('.diagram-stage');
    if (stage.offsetWidth > viewport.clientWidth) {
      viewport.scrollTo({ left: stage.offsetWidth * feature.x / 100 - viewport.clientWidth / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }
  if (focus) $('diagram-feature-list').querySelectorAll('button')[index].focus();
}
function showConceptDiagram(name, focus = false) {
  activeDiagram = name;
  const data = conceptDiagrams[name];
  document.querySelector('.diagram-stage').classList.toggle('is-study', name === 'campus' || name === 'arrival');
  const request = ++diagramImageRequest;
  diagramImage.classList.add('changing');
  const next = new Image();
  next.onload = () => {
    if (request !== diagramImageRequest) return;
    diagramImage.src = data.image;
    diagramImage.alt = data.alt;
    diagramImage.classList.remove('changing');
  };
  next.onerror = () => { if (request === diagramImageRequest) diagramImage.classList.remove('changing'); };
  next.src = data.image;
  diagramViewItem.src = data.image;
  diagramViewItem.title = data.label;
  diagramViewItem.alt = data.alt;
  $('diagram-expand').setAttribute('aria-label', `Expand ${data.label.toLowerCase()} diagram`);
  diagramTabs.forEach(tab => {
    const selected = tab.dataset.diagram === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  $('diagram-panel').setAttribute('aria-labelledby', `diagram-tab-${name}`);
  const markers = $('diagram-markers');
  const list = $('diagram-feature-list');
  document.querySelector('.diagram-viewport').scrollLeft = 0;
  markers.replaceChildren();
  list.replaceChildren();
  data.features.forEach((feature, index) => {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'diagram-marker';
    marker.dataset.feature = String(index);
    marker.style.setProperty('--x', `${feature.x}%`);
    marker.style.setProperty('--y', `${feature.y}%`);
    marker.setAttribute('aria-label', `Show ${feature.name}`);
    marker.textContent = String(index + 1);
    marker.addEventListener('click', () => showDiagramFeature(index, false, true));
    markers.appendChild(marker);
    const control = document.createElement('button');
    control.type = 'button';
    control.dataset.feature = String(index);
    control.textContent = feature.name;
    control.addEventListener('click', () => showDiagramFeature(index, false, true));
    control.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        showDiagramFeature((index + (event.key === 'ArrowRight' ? 1 : -1) + data.features.length) % data.features.length, true, true);
      }
    });
    list.appendChild(control);
  });
  showDiagramFeature(0);
  if (focus) diagramTabs.find(tab => tab.dataset.diagram === name).focus();
}
diagramTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showConceptDiagram(tab.dataset.diagram));
  tab.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + diagramTabs.length) % diagramTabs.length;
      showConceptDiagram(diagramTabs[next].dataset.diagram, true);
    }
  });
});
showConceptDiagram('campus');

// A tour of still renders because no video files were supplied.
const tourScenes = [
  { title: 'The arrival.', desc: 'A composed approach, set between landscape, water and architecture.', caption: 'Arrival · Main entrance', image: 'assets/main-gate.webp', alt: 'Main entrance and arrival forecourt' },
  { title: 'The gathering.', desc: 'A landmark event centre with a clear, welcoming public face.', caption: 'Gathering · Event centre', image: 'assets/frontage-dusk.webp', alt: 'Event centre frontage at dusk' },
  { title: 'The stay.', desc: 'Guest rooms bring the occasion and the overnight experience together.', caption: 'Stay · Hotel wing', image: 'assets/hotel-corner.webp', alt: 'Hotel wing beside the event centre' },
  { title: 'The whole campus.', desc: 'Distinct buildings, courts and outdoor spaces form a single destination.', caption: 'Campus · Aerial view', image: 'assets/site-aerial-render-4k.webp', alt: 'Aerial view of the campus' }
];
const tourImage = $('tour-image');
const tourRail = $('tour-rail');
let tourIndex = 0;
let tourRequest = 0;
let tourPaused = reducedMotion;
let tourVisible = false;
let tourElapsed = 0;
let tourLast = 0;
const tourDuration = 6800;
tourScenes.forEach((scene, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('role', 'tab');
  button.innerHTML = `<span>0${index + 1}</span>${scene.title}`;
  button.addEventListener('click', () => showTour(index));
  tourRail.appendChild(button);
});
function showTour(index) {
  tourIndex = (index + tourScenes.length) % tourScenes.length;
  const scene = tourScenes[tourIndex];
  if (tourImage.getAttribute('src') !== scene.image) {
    const request = ++tourRequest;
    tourImage.classList.add('changing');
    const next = new Image();
    next.src = scene.image;
    next.onload = () => {
      if (request !== tourRequest) return;
      tourImage.src = scene.image;
      tourImage.classList.remove('changing');
    };
  }
  $('tour-count').textContent = `Scene 0${tourIndex + 1} / 0${tourScenes.length}`;
  $('tour-title').textContent = scene.title;
  $('tour-description').textContent = scene.desc;
  $('tour-caption').textContent = scene.caption;
  tourRail.querySelectorAll('button').forEach((button, i) => {
    button.classList.toggle('active', i === tourIndex);
    button.setAttribute('aria-selected', String(i === tourIndex));
  });
  tourElapsed = 0;
  $('tour-progress').style.width = '0%';
  const nextScene = tourScenes[(tourIndex + 1) % tourScenes.length];
  new Image().src = nextScene.image;
}
function animateTour(now) {
  if (!tourLast) tourLast = now;
  const delta = Math.min(now - tourLast, 100);
  tourLast = now;
  if (tourVisible && !tourPaused) {
    tourElapsed += delta;
    if (tourElapsed >= tourDuration) showTour(tourIndex + 1);
    else $('tour-progress').style.width = `${tourElapsed / tourDuration * 100}%`;
  }
  requestAnimationFrame(animateTour);
}
$('tour-prev').addEventListener('click', () => showTour(tourIndex - 1));
$('tour-next').addEventListener('click', () => showTour(tourIndex + 1));
$('tour-pause').addEventListener('click', () => {
  tourPaused = !tourPaused;
  $('tour-pause').textContent = tourPaused ? 'Play' : 'Pause';
  $('tour-pause').setAttribute('aria-label', tourPaused ? 'Play visual tour' : 'Pause visual tour');
});
new IntersectionObserver(([entry]) => { tourVisible = entry.isIntersecting; }, { threshold: .2 }).observe($('tour'));
showTour(0);
requestAnimationFrame(animateTour);

// The active specification swaps the pinned architectural image.
const spaceSpecs = [...document.querySelectorAll('.spec-item')];
const spaceImages = [...document.querySelectorAll('.space-image')];
function activateSpace(index) {
  spaceSpecs.forEach((item, i) => item.classList.toggle('active', i === index));
  spaceImages.forEach((item, i) => item.classList.toggle('active', i === index));
}
const specObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) activateSpace(Number(entry.target.dataset.space));
  });
}, { rootMargin: '-45% 0px -45% 0px' });
spaceSpecs.forEach(item => specObserver.observe(item));

// Plans use real tab semantics and arrow-key navigation.
const planTabs = [...document.querySelectorAll('.plan-tabs button')];
function showPlan(index, focus = false) {
  planTabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(tab.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) planTabs[index].focus();
}
planTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showPlan(index));
  tab.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showPlan((index + (event.key === 'ArrowRight' ? 1 : -1) + planTabs.length) % planTabs.length, true);
    }
  });
});
showPlan(0);

// Project images become full-colour when centred on a touch screen.
if (touch) {
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('lit', entry.isIntersecting));
  }, { rootMargin: '-38% 0px -38% 0px' });
  document.querySelectorAll('.bw').forEach(tile => imageObserver.observe(tile));
} else {
  const viewCursor = document.createElement('div');
  viewCursor.className = 'view-cursor';
  viewCursor.textContent = 'View';
  document.body.appendChild(viewCursor);
  document.addEventListener('pointermove', event => {
    const tile = event.target.closest('.bw');
    document.querySelectorAll('.bw.hot').forEach(el => { if (el !== tile) el.classList.remove('hot'); });
    if (tile) {
      const rect = tile.getBoundingClientRect();
      tile.style.setProperty('--x', `${event.clientX - rect.left}px`);
      tile.style.setProperty('--y', `${event.clientY - rect.top}px`);
      tile.classList.add('hot');
      viewCursor.style.transform = `translate(${event.clientX}px,${event.clientY}px) translate(-50%,-50%) scale(1)`;
      viewCursor.classList.add('visible');
    } else viewCursor.classList.remove('visible');
  }, { passive: true });
}

// Shared gallery, plan and specification viewer.
const lightbox = $('lightbox');
const viewItems = [
  diagramViewItem,
  ...[...document.querySelectorAll('.gallery-tile')].map(el => ({ el, src: el.dataset.large, title: el.dataset.title, alt: el.querySelector('.g').alt })),
  ...[...document.querySelectorAll('.plan-viewer')].map(el => ({ el, src: el.dataset.large, title: el.dataset.title, alt: el.querySelector('img').alt })),
  ...spaceImages.map((el, index) => ({ el, src: el.querySelector('img').src, title: ['Grand Convention Hall exterior', 'Conference centre exterior', 'Hotel wing exterior'][index], alt: el.querySelector('img').alt }))
];
let viewIndex = 0;
let returnFocus = null;
function showViewer(index) {
  viewIndex = (index + viewItems.length) % viewItems.length;
  const item = viewItems[viewIndex];
  $('lightbox-image').src = item.src;
  $('lightbox-image').alt = item.alt;
  $('lightbox-caption').textContent = `${item.title} · ${viewIndex + 1} of ${viewItems.length}`;
  $('lightbox-thumbs').innerHTML = viewItems.map((entry, i) => `<button type="button" class="${i === viewIndex ? 'active' : ''}" aria-label="View image ${i + 1}: ${entry.title}" data-index="${i}"><img src="${entry.src}" alt=""></button>`).join('');
  $('lightbox-thumbs').querySelector('.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  new Image().src = viewItems[(viewIndex + 1) % viewItems.length].src;
}
function openViewer(index) {
  returnFocus = document.activeElement;
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  showViewer(index);
  $('lightbox-close').focus();
}
function closeViewer() {
  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  $('lightbox-image').removeAttribute('src');
  returnFocus?.focus();
}
viewItems.forEach((item, index) => item.el.addEventListener('click', () => openViewer(index)));
$('lightbox-close').addEventListener('click', closeViewer);
$('lightbox-prev').addEventListener('click', () => showViewer(viewIndex - 1));
$('lightbox-next').addEventListener('click', () => showViewer(viewIndex + 1));
$('lightbox-thumbs').addEventListener('click', event => {
  const button = event.target.closest('button[data-index]');
  if (button) showViewer(Number(button.dataset.index));
});
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeViewer(); });
let swipeStart = 0;
lightbox.addEventListener('touchstart', event => { swipeStart = event.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].clientX - swipeStart;
  if (Math.abs(distance) > 45) showViewer(viewIndex + (distance < 0 ? 1 : -1));
}, { passive: true });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!lightbox.hidden) closeViewer();
    else if (!mobileMenu.hidden) closeMenu();
  }
  if (lightbox.hidden) return;
  if (event.key === 'ArrowRight') showViewer(viewIndex + 1);
  if (event.key === 'ArrowLeft') showViewer(viewIndex - 1);
  if (event.key === 'Tab') {
    const controls = [...lightbox.querySelectorAll('button:not([hidden])')];
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
