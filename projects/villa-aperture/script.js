const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Navigation
const nav = $('#nav');
const menuToggle = $('#menuToggle');
const mobileMenu = $('#mobileMenu');
function closeMenu() {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('menu-open');
}
menuToggle.addEventListener('click', () => {
  const opening = mobileMenu.hidden;
  mobileMenu.hidden = !opening;
  menuToggle.setAttribute('aria-expanded', String(opening));
  menuToggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', opening);
  if (opening) $('a', mobileMenu).focus();
});
$$('a', mobileMenu).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileMenu.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
const updateNav = () => nav.classList.toggle('scrolled', scrollY > 70);
addEventListener('scroll', updateNav, { passive: true });
updateNav();

// Hero: four project renders, with an explicit pause control.
const slides = $$('#heroSlides img');
const slideDots = $$('#slideDots button');
const slideCounter = $('#slideCounter');
const slidePause = $('#slidePause');
let slideIndex = 0;
let slideTimer = null;
let slidePaused = reducedMotion;
let heroVisible = true;
function showSlide(index) {
  slideIndex = (index + slides.length) % slides.length;
  const target = slides[slideIndex];
  if (target.dataset.src) {
    target.src = target.dataset.src;
    delete target.dataset.src;
  }
  slides.forEach((slide, i) => slide.classList.toggle('active', i === slideIndex));
  slideDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === slideIndex);
    if (i === slideIndex) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  slideCounter.textContent = `${String(slideIndex + 1).padStart(2, '0')} / 04`;
}
function updateSlideTimer() {
  clearInterval(slideTimer);
  if (!slidePaused && heroVisible) slideTimer = setInterval(() => showSlide(slideIndex + 1), 7000);
}
slideDots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); updateSlideTimer(); }));
slidePause.addEventListener('click', () => {
  slidePaused = !slidePaused;
  slidePause.textContent = slidePaused ? '▶' : 'Ⅱ';
  slidePause.setAttribute('aria-label', slidePaused ? 'Play slideshow' : 'Pause slideshow');
  updateSlideTimer();
});
new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; updateSlideTimer(); }, { threshold: .1 }).observe($('.hero'));
updateSlideTimer();

// Massing evolution: each stage adds the volumes visible in the plans and renders.
const concept = $('#concept');
const moveCopy = [
  'The ground floor establishes the main volume and its relationship to the entrance side of the site.',
  'The bedroom volumes rise along the left and rear edges, leaving the central void and front balcony open.',
  'The tall entry frame and long roof edge complete the facade, with glazing set back behind the terrace and balcony.'
];
const massingLabels = ['01 / Grounded base', '02 / Open upper level', '03 / Framed facade'];
const massingAlt = [
  'Stage one: ground-floor footprint shown as an axonometric mass',
  'Stage two: upper bedroom masses added around the central void and front balcony',
  'Stage three: entry portal, roof band, recessed glazing and balcony edge added to the mass'
];
function selectMove(index) {
  concept.dataset.move = String(index);
  $$('.move-button').forEach((button, i) => {
    button.classList.toggle('active', i === index);
    button.setAttribute('aria-pressed', String(i === index));
  });
  $$('.massing-stage-key span').forEach((label, i) => label.classList.toggle('active', i === index));
  $('#diagramCount').textContent = `0${index + 1} / 03`;
  $('#diagramFloor').textContent = massingLabels[index];
  $('#diagramCaption').textContent = moveCopy[index];
  $('#massingSvg').setAttribute('aria-label', massingAlt[index]);
}
$$('.move-button').forEach(button => button.addEventListener('click', () => selectMove(Number(button.dataset.move))));
selectMove(0);

// Site relationship diagram.
const site = $('#site');
const siteCaptions = [
  '01 / The front steps lead up to the entrance terrace. The vehicle gate and parking court are to the right.',
  '02 / The guest room and gym occupy the left side; living and dining form the centre of the ground floor.',
  '03 / The exit terrace sits between the living area and pool, with planting beside the parking court.'
];
function selectSite(index) {
  site.dataset.site = String(index);
  $('#siteDiagramCaption').textContent = siteCaptions[index];
  $$('.site-step').forEach((step, i) => {
    step.classList.toggle('active', i === index);
    step.setAttribute('aria-pressed', String(i === index));
  });
  $$('.site-pin').forEach((pin, i) => {
    pin.classList.toggle('active', i === index);
    pin.setAttribute('aria-pressed', String(i === index));
  });
}
$$('.site-step').forEach((button, index) => button.addEventListener('click', () => selectSite(index)));
$$('.site-pin').forEach((button, index) => button.addEventListener('click', () => selectSite(index)));
selectSite(0);

// Floor plans: the source drawings are displayed directly, with useful interactive annotations.
const planData = {
  ground: {
    image: 'assets/ground-plan.webp',
    alt: 'Ground floor plan showing the guest bedroom, gym, living and dining, kitchen, pool, front entrance terrace and parking court',
    label: 'GROUND FLOOR',
    rooms: [
      { title: 'Living & dining.', text: 'A shared centre for everyday life, between the entrance terrace, kitchen and garden side of the house.', x: 52, y: 57 },
      { title: 'Kitchen & store.', text: 'The kitchen sits beside dining, with a store and direct access toward the outdoor terrace.', x: 42, y: 37 },
      { title: 'Guest suite.', text: 'A bedroom with its own washroom sits on the ground floor, away from the upper bedroom group.', x: 29, y: 37 },
      { title: 'Home gym.', text: 'The gym opens off the ground floor circulation, next to the social heart of the home.', x: 31, y: 57 },
      { title: 'Pool & terrace.', text: 'The pool occupies the garden edge beside an outdoor terrace and seating area.', x: 66, y: 24 }
    ]
  },
  first: {
    image: 'assets/first-plan.webp',
    alt: 'First floor plan showing four bedrooms, washrooms, a central void and balcony',
    label: 'FIRST FLOOR',
    rooms: [
      { title: 'Main suite.', text: 'The main bedroom occupies the more private side of the upper floor, with an adjacent washroom and closet.', x: 77, y: 22 },
      { title: 'Bedroom two.', text: 'Bedroom two sits at the upper left of the drawing, beside its closet and washroom.', x: 22, y: 25 },
      { title: 'Bedroom four.', text: 'Bedroom four sits between bedroom two and the main suite, opening from the upper passage.', x: 48, y: 25 },
      { title: 'Bedroom three.', text: 'Bedroom three is below bedroom two, beside the stair and upper lobby.', x: 22, y: 66 },
      { title: 'The open void.', text: 'This double-height opening links the two levels visually and gives the upper circulation a sense of openness.', x: 59, y: 60 },
      { title: 'The balcony.', text: 'The long balcony runs along the front edge of the first floor, above the entrance side.', x: 58, y: 88 }
    ]
  }
};
let floor = 'ground';
let roomIndex = 0;
let zoom = 1;
let panX = 0;
let panY = 0;
const planArt = $('#planArt');
const planStage = $('#planStage');
const zoomRange = $('#planZoom');
function renderPlanTransform() {
  const maxX = (planStage.clientWidth * (zoom - 1)) / 2;
  const maxY = (planStage.clientHeight * (zoom - 1)) / 2;
  panX = Math.max(-maxX, Math.min(maxX, panX));
  panY = Math.max(-maxY, Math.min(maxY, panY));
  planArt.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  zoomRange.value = String(Math.round(zoom * 100));
  planStage.classList.toggle('zoomed', zoom > 1);
}
function selectRoom(index) {
  roomIndex = index;
  const room = planData[floor].rooms[index];
  $('#planPinCount').textContent = `${String(index + 1).padStart(2, '0')} / ${String(planData[floor].rooms.length).padStart(2, '0')}`;
  $('#planMarker').textContent = String(index + 1).padStart(2, '0');
  $('#planRoom').textContent = room.title;
  $('#planDescription').textContent = room.text;
  $$('.plan-pin').forEach((pin, i) => {
    pin.classList.toggle('active', i === index);
    pin.setAttribute('aria-pressed', String(i === index));
  });
}
function selectFloor(nextFloor) {
  floor = nextFloor;
  const data = planData[floor];
  $('#planImage').src = data.image;
  $('#planImage').alt = data.alt;
  $('#planLevel').textContent = data.label;
  $('#planPins').replaceChildren(...data.rooms.map((room, index) => {
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'plan-pin';
    pin.style.setProperty('--x', `${room.x}%`);
    pin.style.setProperty('--y', `${room.y}%`);
    pin.textContent = String(index + 1).padStart(2, '0');
    pin.setAttribute('aria-label', `Show ${room.title.replace('.', '')}`);
    pin.addEventListener('click', () => selectRoom(index));
    return pin;
  }));
  $$('[data-floor]').forEach(button => {
    const active = button.dataset.floor === floor;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  zoom = 1; panX = 0; panY = 0; renderPlanTransform();
  selectRoom(0);
}
$$('[data-floor]').forEach(button => button.addEventListener('click', () => selectFloor(button.dataset.floor)));
zoomRange.addEventListener('input', () => { zoom = Number(zoomRange.value) / 100; renderPlanTransform(); });
$('#zoomIn').addEventListener('click', () => { zoom = Math.min(3, Math.round((zoom + .25) * 100) / 100); renderPlanTransform(); });
$('#zoomOut').addEventListener('click', () => { zoom = Math.max(1, Math.round((zoom - .25) * 100) / 100); renderPlanTransform(); });
$('#resetPlan').addEventListener('click', () => { zoom = 1; panX = 0; panY = 0; renderPlanTransform(); });
let drag = null;
planStage.addEventListener('pointerdown', event => {
  if (zoom <= 1 || event.target.closest('button')) return;
  drag = { x: event.clientX, y: event.clientY, startX: panX, startY: panY };
  planStage.setPointerCapture(event.pointerId);
  planArt.style.transition = 'none';
});
planStage.addEventListener('pointermove', event => {
  if (!drag) return;
  panX = drag.startX + event.clientX - drag.x;
  panY = drag.startY + event.clientY - drag.y;
  renderPlanTransform();
});
function endDrag() { drag = null; planArt.style.transition = ''; }
planStage.addEventListener('pointerup', endDrag);
planStage.addEventListener('pointercancel', endDrag);
selectFloor('ground');

// Reveal project images only after they enter view and their files are ready.
if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealItems = [
    ...$$('.gallery-tile').map(tile => [tile, $('img', tile)]),
    [$('.site-plan-wrap'), $('.site-plan-wrap img')],
    [$('.closing > img'), $('.closing > img')]
  ].filter(([element, image]) => element && image);
  const state = new Map();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const item = state.get(entry.target);
      item.inView = true;
      observer.unobserve(entry.target);
      if (item.loaded) item.reveal();
      else item.fallback = setTimeout(item.reveal, 12000);
    });
  }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });

  revealItems.forEach(([element, image]) => {
    let revealed = false;
    const item = {
      inView: false,
      loaded: false,
      fallback: null,
      reveal() {
        if (revealed) return;
        revealed = true;
        clearTimeout(item.fallback);
        element.classList.add('is-visible');
      }
    };
    const loaded = async () => {
      if (item.loaded) return;
      if (image.naturalWidth > 0 && image.decode) {
        try { await image.decode(); } catch { /* The image can still be displayed. */ }
      }
      item.loaded = true;
      if (item.inView) item.reveal();
    };
    state.set(element, item);
    element.classList.add('image-reveal');
    image.addEventListener('load', loaded, { once: true });
    image.addEventListener('error', loaded, { once: true });
    if (image.complete) loaded();
    observer.observe(element);
  });
  document.body.classList.add('motion-ready');
}

// Fullscreen image viewer for gallery renders and the source plans.
const lightbox = $('#lightbox');
const lightboxImage = $('#lightboxImage');
const lightboxStatus = $('#lightboxStatus');
const lightboxStatusText = $('#lightboxStatusText');
const lightboxRetry = $('#lightboxRetry');
let viewerItems = [];
let imageIndex = 0;
let viewerRequest = 0;
let viewerOpen = false;
let returnFocus = null;
let closeTimer = null;
let touchStart = null;

function galleryItems() {
  return $$('.gallery-tile').map(tile => {
    const thumbnail = $('img', tile);
    return {
      src: tile.dataset.full || thumbnail.currentSrc || thumbnail.src,
      alt: thumbnail.alt,
      caption: tile.dataset.caption || thumbnail.alt
    };
  });
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const probe = new Image();
    const timer = setTimeout(() => reject(new Error('Image load timed out')), 20000);
    probe.onload = () => { clearTimeout(timer); resolve(probe); };
    probe.onerror = () => { clearTimeout(timer); reject(new Error('Image unavailable')); };
    probe.src = src;
    if (probe.complete && probe.naturalWidth > 0) { clearTimeout(timer); resolve(probe); }
  });
}

async function renderLightbox() {
  const item = viewerItems[imageIndex];
  if (!item) return;
  const request = ++viewerRequest;
  lightbox.classList.remove('is-ready', 'is-error');
  lightboxStatus.hidden = false;
  lightboxStatusText.textContent = 'Loading image…';
  lightboxRetry.hidden = true;
  $('#lightboxCount').textContent = viewerItems.length > 1
    ? `${String(imageIndex + 1).padStart(2, '0')} / ${String(viewerItems.length).padStart(2, '0')}`
    : '';
  $('#lightboxText').textContent = item.caption;
  $('#lightboxPrev').hidden = viewerItems.length < 2;
  $('#lightboxNext').hidden = viewerItems.length < 2;

  try {
    await preloadImage(item.src);
    if (request !== viewerRequest || lightbox.hidden) return;
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    if (lightboxImage.decode) {
      try { await lightboxImage.decode(); }
      catch {
        if (!lightboxImage.complete || lightboxImage.naturalWidth === 0) throw new Error('Image could not decode');
      }
    }
    if (request !== viewerRequest || lightbox.hidden) return;
    requestAnimationFrame(() => {
      if (request !== viewerRequest || lightbox.hidden) return;
      lightboxStatus.hidden = true;
      lightbox.classList.add('is-ready');
    });
    if (viewerItems.length > 1) {
      const next = new Image();
      next.src = viewerItems[(imageIndex + 1) % viewerItems.length].src;
    }
  } catch {
    if (request !== viewerRequest || lightbox.hidden) return;
    lightboxStatusText.textContent = 'Image could not load.';
    lightboxRetry.hidden = false;
    lightbox.classList.add('is-error');
  }
}

function openImageSet(items, index, origin, isPlan = false) {
  clearTimeout(closeTimer);
  viewerItems = items;
  imageIndex = index;
  returnFocus = origin || document.activeElement;
  viewerOpen = true;
  lightbox.classList.toggle('is-plan', isPlan);
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  requestAnimationFrame(() => {
    if (viewerOpen && !lightbox.hidden) {
      lightbox.classList.add('is-open');
      $('#lightboxClose').focus();
    }
  });
  renderLightbox();
}

function finishClose() {
  if (lightbox.classList.contains('is-open')) return;
  lightbox.hidden = true;
  lightboxImage.removeAttribute('src');
  lightbox.classList.remove('is-ready', 'is-error', 'is-plan');
  returnFocus?.focus();
}

function closeLightbox() {
  if (lightbox.hidden) return;
  viewerOpen = false;
  viewerRequest++;
  lightbox.classList.remove('is-open', 'is-ready');
  document.body.classList.remove('lightbox-open');
  clearTimeout(closeTimer);
  if (reducedMotion) finishClose();
  else closeTimer = setTimeout(finishClose, 580);
}

function changeImage(delta) {
  if (viewerItems.length < 2) return;
  imageIndex = (imageIndex + delta + viewerItems.length) % viewerItems.length;
  renderLightbox();
}

document.addEventListener('click', event => {
  const tile = event.target.closest('.gallery-tile');
  if (!tile) return;
  const tiles = $$('.gallery-tile');
  openImageSet(galleryItems(), tiles.indexOf(tile), tile);
});
$('#enlargeSite').addEventListener('click', event => {
  const drawing = $('.site-plan-wrap img');
  openImageSet([{ src: drawing.currentSrc || drawing.src, alt: drawing.alt, caption: 'Ground floor and site drawing' }], 0, event.currentTarget, true);
});
$('#enlargePlan').addEventListener('click', event => {
  const data = planData[floor];
  openImageSet([{ src: data.image, alt: data.alt, caption: floor === 'ground' ? 'Ground floor plan' : 'First floor plan' }], 0, event.currentTarget, true);
});
$('#lightboxClose').addEventListener('click', closeLightbox);
$('#lightboxPrev').addEventListener('click', () => changeImage(-1));
$('#lightboxNext').addEventListener('click', () => changeImage(1));
lightboxRetry.addEventListener('click', renderLightbox);
lightbox.addEventListener('click', event => {
  if (event.target === lightbox || event.target === $('.lightbox-media')) closeLightbox();
});
lightbox.addEventListener('touchstart', event => {
  if (viewerItems.length > 1) touchStart = event.changedTouches[0].clientX;
}, { passive: true });
lightbox.addEventListener('touchend', event => {
  if (touchStart === null) return;
  const delta = event.changedTouches[0].clientX - touchStart;
  if (Math.abs(delta) > 55) changeImage(delta < 0 ? 1 : -1);
  touchStart = null;
}, { passive: true });
document.addEventListener('keydown', event => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') { closeLightbox(); return; }
  if (event.key === 'ArrowRight') changeImage(1);
  if (event.key === 'ArrowLeft') changeImage(-1);
  if (event.key === 'Tab') {
    const focusables = [$('#lightboxClose'), $('#lightboxPrev'), $('#lightboxNext'), lightboxRetry]
      .filter(button => !button.hidden && getComputedStyle(button).display !== 'none');
    const at = focusables.indexOf(document.activeElement);
    if (event.shiftKey && at === 0) { focusables.at(-1).focus(); event.preventDefault(); }
    else if (!event.shiftKey && at === focusables.length - 1) { focusables[0].focus(); event.preventDefault(); }
  }
});
