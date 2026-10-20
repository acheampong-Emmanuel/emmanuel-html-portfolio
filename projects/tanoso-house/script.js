const CONTACT = { email: '', phone: '', whatsapp: '' };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const imageLoads = new Map();
function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (!imageLoads.has(src)) {
    imageLoads.set(src, new Promise(resolve => {
      const image = new Image();
      let settled = false;
      const finish = loaded => {
        if (settled) return;
        settled = true;
        if (!loaded) imageLoads.delete(src);
        resolve(loaded ? image : null);
      };
      image.decoding = 'async';
      image.onload = () => {
        const ready = () => finish(image.naturalWidth > 0);
        if (image.decode) image.decode().then(ready, ready);
        else ready();
      };
      image.onerror = () => finish(false);
      image.src = src;
      if (image.complete && image.naturalWidth > 0) image.onload();
    }));
  }
  return imageLoads.get(src);
}
function animateImageIn(image) {
  if (reducedMotion || !image.animate) return;
  image.getAnimations?.().forEach(animation => animation.cancel());
  image.animate(
    [{ opacity: .25, transform: 'scale(1.025)' }, { opacity: 1, transform: 'scale(1)' }],
    { duration: 650, easing: 'cubic-bezier(.42,0,.58,1)' }
  );
}

// Header and mobile navigation
const header = $('.site-header');
const menuButton = $('.menu-toggle');
const mobileMenu = $('#mobile-menu');
function updateHeader() {
  header.classList.toggle('is-solid', window.scrollY > 30);
  const y = 34;
  const lightBelow = ['#idea', '#systems', '#gallery'].some(selector => {
    const rect = $(selector).getBoundingClientRect();
    return rect.top <= y && rect.bottom > y;
  });
  header.classList.toggle('on-light', lightBelow && !document.body.classList.contains('menu-open'));
}
window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateHeader);
updateHeader();
function closeMenu() {
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('menu-open');
  updateHeader();
}
menuButton.addEventListener('click', () => {
  const opening = mobileMenu.hidden;
  mobileMenu.hidden = !opening;
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  document.body.classList.toggle('menu-open', opening);
  if (opening) $('#mobile-menu a').focus();
  updateHeader();
});
$$('#mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));

// Hero crossfade. Off-screen slides do not rotate or load until needed.
const hero = $('.hero');
const slides = $$('.hero-slide');
const dots = $$('.hero-dot');
const slideCaptions = [
  'The planted frame at dusk.',
  'Rooms rising above the street.',
  'Light through the courtyard.',
  'The shops and entrance at street level.',
  'The planted front elevation.',
  'The corner shops beneath the stair.'
];
let slideIndex = 0;
let heroPaused = reducedMotion;
let heroInView = true;
let slideTimer;
let heroRequest = 0;
async function showSlide(index) {
  const requested = ++heroRequest;
  const targetIndex = (index + slides.length) % slides.length;
  const next = slides[targetIndex];
  const src = next.dataset.src || next.getAttribute('src');
  if (!await loadImage(src) || requested !== heroRequest) return;
  if (next.dataset.src) { next.src = src; delete next.dataset.src; }
  slideIndex = targetIndex;
  slides.forEach((s, i) => s.classList.toggle('is-active', i === slideIndex));
  dots.forEach((d, i) => {
    d.classList.toggle('is-active', i === slideIndex);
    if (i === slideIndex) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
  });
  $('#hero-caption').textContent = slideCaptions[slideIndex];
  $('.mini-label').textContent = `${String(slideIndex + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  const upcoming = slides[(slideIndex + 1) % slides.length];
  loadImage(upcoming.dataset.src || upcoming.getAttribute('src'));
}
function scheduleHero() {
  clearInterval(slideTimer);
  if (!heroPaused && heroInView) slideTimer = setInterval(() => showSlide(slideIndex + 1), 7000);
}
dots.forEach(dot => dot.addEventListener('click', () => { showSlide(Number(dot.dataset.slide)); scheduleHero(); }));
$('.hero-pause').addEventListener('click', event => {
  heroPaused = !heroPaused;
  event.currentTarget.setAttribute('aria-pressed', String(heroPaused));
  event.currentTarget.setAttribute('aria-label', heroPaused ? 'Resume image rotation' : 'Pause image rotation');
  event.currentTarget.querySelector('span').textContent = heroPaused ? '▶' : 'Ⅱ';
  scheduleHero();
});
new IntersectionObserver(entries => {
  heroInView = entries[0].isIntersecting;
  scheduleHero();
}, { threshold: .15 }).observe(hero);
scheduleHero();
loadImage(slides[0].getAttribute('src'));
loadImage(slides[1].dataset.src);

// Six-step massing sequence, redrawn from the project PDF's form-development page.
const conceptMoves = [
  { title: 'Begin with a compact mass.', text: 'A single volume establishes the building’s footprint and a clear edge to the street.' },
  { title: 'Carve a sheltered base.', text: 'Part of the basic mass is removed to make room for a covered car park and a more open ground level.' },
  { title: 'Lift the rooms above.', text: 'The hostel levels rise over the ground-floor uses, giving the building its nine-storey profile.' },
  { title: 'Open the centre and roof.', text: 'A central opening creates the courtyard seen in the plans, while the roof holds its own service zone.' },
  { title: 'Recess the edges for shade.', text: 'Balcony recesses break up the elevations and create shaded edges beside the rooms.' },
  { title: 'Frame the volume.', text: 'The outer frame and planted ledges bring the separate moves together. This model omits the exterior stair; the approved street renders show its form.' }
];
let conceptStep = 1;
let conceptTimer = null;
const conceptPlay = $('#concept-play');
function stopConceptPlayback() {
  clearInterval(conceptTimer);
  conceptTimer = null;
  conceptPlay.setAttribute('aria-pressed', 'false');
  conceptPlay.innerHTML = 'Play sequence <span aria-hidden="true">▶</span>';
}
function setConceptStep(step) {
  conceptStep = Math.max(1, Math.min(6, step));
  $('#concept-graphic').dataset.step = String(conceptStep);
  $$('.concept-graphic .diagram-layer').forEach(layer => layer.classList.toggle('is-shown', Number(layer.dataset.from) <= conceptStep));
  $$('.concept-step').forEach(button => {
    const active = Number(button.dataset.step) === conceptStep;
    button.classList.toggle('is-active', active);
    if (active) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
  });
  $('#concept-counter').textContent = `${String(conceptStep).padStart(2, '0')} / 06`;
  $('#concept-title').textContent = conceptMoves[conceptStep - 1].title;
  $('#concept-text').textContent = conceptMoves[conceptStep - 1].text;
  $('#concept-progress').style.width = `${conceptStep / 6 * 100}%`;
}
$$('.concept-step').forEach(button => button.addEventListener('click', () => {
  stopConceptPlayback();
  setConceptStep(Number(button.dataset.step));
}));
$('#concept-prev').addEventListener('click', () => { stopConceptPlayback(); setConceptStep(conceptStep === 1 ? 6 : conceptStep - 1); });
$('#concept-next').addEventListener('click', () => { stopConceptPlayback(); setConceptStep(conceptStep === 6 ? 1 : conceptStep + 1); });
conceptPlay.addEventListener('click', () => {
  if (conceptTimer) { stopConceptPlayback(); return; }
  if (conceptStep === 6) setConceptStep(1);
  conceptPlay.setAttribute('aria-pressed', 'true');
  conceptPlay.innerHTML = 'Pause sequence <span aria-hidden="true">Ⅱ</span>';
  conceptTimer = setInterval(() => {
    if (conceptStep >= 6) { stopConceptPlayback(); return; }
    setConceptStep(conceptStep + 1);
    if (conceptStep >= 6) stopConceptPlayback();
  }, 2200);
});
if (reducedMotion) conceptPlay.hidden = true;
new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stopConceptPlayback(); }, { threshold: .05 }).observe($('#concept'));
setConceptStep(1);

// Ground-floor explorer: translucent guides sit over the original plan.
const systemLayers = ['ground', 'shops', 'core', 'street'];
const systemCopy = {
  ground: { kicker: 'Parking court', title: 'Six, four, six.', text: 'The drawing numbers six bays at the rear, four beside the lift and internal stair, and six nearer the street. Open areas between them allow vehicles to circulate and turn.', fact: '16 numbered bays on the source plan' },
  shops: { kicker: 'Street-facing shops', title: 'Three doors to the street.', text: 'The three lettable spaces line the front edge of the ground floor. Each is drawn with its own washroom.', fact: 'Three lettable spaces on the source plan' },
  core: { kicker: 'Lift + internal stair', title: 'The internal core.', text: 'The lift, stair and lobby occupy the left side of the middle parking row in the ground-floor drawing.', fact: 'Lift and internal stair beside bays 07–10' },
  street: { kicker: 'Street lobby + stair', title: 'A separate entrance.', text: 'A second lobby and stair sit at the street-front right, apart from the three shops. The vehicle entry is to the right of this frontage.', fact: 'Street-front lobby and stair shown on the plan' }
};
let activeSystem = 'ground';
function setSystemLayer(key) {
  if (!systemCopy[key]) return;
  activeSystem = key;
  $$('.system-button').forEach(button => {
    const active = button.dataset.system === key;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $$('.system-layer').forEach(layer => layer.classList.toggle('is-active', layer.dataset.system === key));
  $('#system-kicker').textContent = systemCopy[key].kicker;
  $('#system-title').textContent = systemCopy[key].title;
  $('#system-text').textContent = systemCopy[key].text;
  $('#system-fact').textContent = systemCopy[key].fact;
}
$$('.system-button').forEach(button => button.addEventListener('click', () => setSystemLayer(button.dataset.system)));
$('#system-cycle').addEventListener('click', () => setSystemLayer(systemLayers[(systemLayers.indexOf(activeSystem) + 1) % systemLayers.length]));
setSystemLayer('ground');

// Building story tabs
const experience = [
  { src: 'assets/renders/6_1.jpg', alt: 'Sheltered shopfronts and entrance beside the exterior stair' },
  { src: 'assets/renders/3_1.jpg', alt: 'Street view with the blue exterior stair and planted building frame' },
  { src: 'assets/renders/14.jpg', alt: 'View looking up through the open planted courtyard' }
];
let experienceRequest = 0;
$$('.experience-tab').forEach(button => button.addEventListener('click', async () => {
  const index = Number(button.dataset.experience);
  const requested = ++experienceRequest;
  const loaded = await loadImage(experience[index].src);
  if (!loaded || requested !== experienceRequest) return;
  const image = $('#experience-image');
  image.src = experience[index].src;
  image.alt = experience[index].alt;
  animateImageIn(image);
  $$('.experience-tab').forEach((tab, i) => {
    tab.classList.toggle('is-active', i === index);
    tab.setAttribute('aria-selected', String(i === index));
  });
  $('#experience-index').textContent = `${String(index + 1).padStart(2, '0')} / 03`;
}));

// Floor plans: source drawings remain unchanged; labels and building stack improve navigation.
const planData = {
  ground: { index: 1, src: 'assets/plans/plan-gf-linework.svg', alt: 'Ground floor linework plan showing three lettable shops and 16 numbered parking bays', kicker: 'Ground / Arrival and commerce', title: 'A shared address at street level.', text: 'Three lettable shops face the street. The rest of the level accommodates a covered car park, with separate routes into the upper floors.', meta: ['03 shops', '16 numbered parking bays'], levels: [0], caption: 'Ground floor plan' },
  first: { index: 2, src: 'assets/plans/plan-1f-linework.svg', alt: 'First floor linework plan with 15 rooms and an open central courtyard', kicker: 'Level 01 / First floor', title: 'Rooms around shared space.', text: 'Fifteen rooms are arranged around the open courtyard. The first level shows planted social space on three courtyard edges.', meta: ['15 rooms', 'Open courtyard'], levels: [1], caption: 'First floor plan' },
  even: { index: 3, src: 'assets/plans/plan-even-linework.svg', alt: 'Typical even floor linework plan with 15 rooms around the courtyard', kicker: 'Levels 02, 04, 06, 08', title: 'The even-floor layout.', text: 'The room arrangement continues around the central opening, with planted edges and access from the lift and stairs.', meta: ['15 rooms per level', '4 levels'], levels: [2, 4, 6, 8], caption: 'Typical even-floor plan' },
  odd: { index: 4, src: 'assets/plans/plan-odd-linework.svg', alt: 'Typical odd floor linework plan with 15 rooms around the courtyard', kicker: 'Levels 03, 05, 07', title: 'The odd-floor layout.', text: 'The courtyard remains open through these levels. The planted edge shifts position in the alternating floor arrangement.', meta: ['15 rooms per level', '3 levels'], levels: [3, 5, 7], caption: 'Typical odd-floor plan' }
};
const stack = $('#stack-rows');
for (let level = 8; level >= 0; level--) {
  const row = document.createElement('div');
  row.className = 'stack-row';
  row.dataset.level = String(level);
  row.innerHTML = `<span>${String(level).padStart(2, '0')}</span><span>${level === 0 ? 'Shops + parking' : 'Rooms around courtyard'}</span>`;
  stack.append(row);
}
let activePlan = 'ground';
let planRequest = 0;
async function setPlan(key) {
  const data = planData[key];
  if (!data) return;
  const requested = ++planRequest;
  const status = $('#plan-load-status');
  status.hidden = false;
  status.textContent = 'Loading drawing…';
  const loaded = await loadImage(data.src);
  if (requested !== planRequest) return;
  if (!loaded) {
    status.textContent = 'Drawing could not load. Select it again to retry.';
    return;
  }
  status.hidden = true;
  activePlan = key;
  $$('.plan-tab').forEach(button => {
    const active = button.dataset.plan === key;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#plan-kicker').textContent = data.kicker;
  $('#plan-title').textContent = data.title;
  $('#plan-text').textContent = data.text;
  $('#plan-meta-a').textContent = data.meta[0];
  $('#plan-meta-b').textContent = data.meta[1];
  $('#plan-count').textContent = `Drawing ${String(data.index).padStart(2, '0')} / 04`;
  $('#plan-stage').setAttribute('aria-label', `Open ${data.caption} full size`);
  $$('.stack-row').forEach(row => row.classList.toggle('is-active', data.levels.includes(Number(row.dataset.level))));
  const image = $('#plan-image');
  image.src = data.src;
  image.alt = data.alt;
  animateImageIn(image);
}
$$('.plan-tab').forEach(button => button.addEventListener('click', () => setPlan(button.dataset.plan)));
setPlan('ground');

const allImages = [
  { src: 'assets/renders/3_1.jpg', title: 'The street corner', category: 'exterior', alt: 'Corner view of the building and its blue stair' },
  { src: 'assets/renders/1_1.jpg', title: 'The front elevation', category: 'exterior', alt: 'Front elevation with a pale frame and street shops' },
  { src: 'assets/renders/2_1.jpg', title: 'The long elevation', category: 'exterior', alt: 'Long side elevation with rooms above the street' },
  { src: 'assets/renders/6_1.jpg', title: 'The shopfronts', category: 'street', alt: 'Street level shops under the building canopy' },
  { src: 'assets/renders/7_1.jpg', title: 'Arrival at ground level', category: 'street', alt: 'Entrance and ground-level shopfronts' },
  { src: 'assets/renders/8_1.jpg', title: 'The framed façade', category: 'exterior', alt: 'Front of the building with planted terraces' },
  { src: 'assets/renders/9_1.jpg', title: 'The building at dusk', category: 'exterior', alt: 'Front of the building in the evening light' },
  { src: 'assets/renders/12_1.jpg', title: 'Site from above', category: 'exterior', alt: 'Aerial view of the building and street' },
  { src: 'assets/renders/13.jpg', title: 'Planted courtyard', category: 'courtyard', alt: 'Aerial view into the planted courtyard' },
  { src: 'assets/renders/14.jpg', title: 'The open centre', category: 'courtyard', alt: 'View up through the courtyard to the sky' }
];
let visibleImages = allImages;
function renderGallery(filter = 'all') {
  visibleImages = filter === 'all' ? allImages : allImages.filter(item => item.category === filter);
  const grid = $('#gallery-grid');
  grid.replaceChildren();
  visibleImages.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-tile is-loading';
    button.setAttribute('aria-label', `View ${item.title}`);
    button.innerHTML = `<img src="${item.src}" alt="${item.alt}" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async"><span>${item.title}</span><b aria-hidden="true">↗</b>`;
    const image = $('img', button);
    const ready = () => {
      const reveal = () => {
        button.classList.remove('is-loading');
        button.classList.add('is-loaded');
      };
      if (image.decode) image.decode().then(reveal, reveal);
      else reveal();
    };
    image.addEventListener('load', ready, { once: true });
    image.addEventListener('error', () => {
      button.classList.remove('is-loading');
      button.classList.add('has-error');
      button.setAttribute('aria-label', `Retry ${item.title}`);
      $('span', button).textContent = `${item.title} · tap to retry`;
    }, { once: true });
    button.addEventListener('click', () => openGallery(index, button));
    grid.append(button);
    if (image.complete && image.naturalWidth > 0) ready();
  });
  $('#gallery-count').textContent = `${visibleImages.length} ${visibleImages.length === 1 ? 'image' : 'images'}`;
}
$$('.filter').forEach(button => button.addEventListener('click', () => {
  $$('.filter').forEach(item => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderGallery(button.dataset.filter);
}));
renderGallery();

// Shared accessible viewer for renders and 2D plans.
const lightbox = $('#lightbox');
const stage = $('#lightbox-stage');
let lightboxItems = [];
let lightboxIndex = 0;
let lightboxIsPlan = false;
let returnFocus = null;
let viewerRequest = 0;
async function displayLightbox() {
  const requested = ++viewerRequest;
  const item = lightboxItems[lightboxIndex];
  lightbox.classList.toggle('is-plan', lightboxIsPlan);
  lightbox.classList.toggle('is-render', !lightboxIsPlan);
  const image = $('#lightbox-image');
  const status = $('#lightbox-status');
  const retry = $('#lightbox-retry');
  image.classList.remove('is-ready');
  image.removeAttribute('src');
  image.alt = '';
  stage.classList.remove('is-zoomed');
  stage.classList.add('is-loading');
  status.hidden = false;
  $('#lightbox-status-text').textContent = lightboxIsPlan ? 'Loading drawing…' : 'Loading image…';
  retry.hidden = true;
  $('#lightbox-caption').textContent = item.title || item.caption;
  $('#lightbox-label').textContent = lightboxIsPlan ? item.caption : `Image ${lightboxIndex + 1} of ${lightboxItems.length}`;
  $('#lightbox-prev').hidden = lightboxIsPlan;
  $('#lightbox-next').hidden = lightboxIsPlan;
  $('#lightbox-zoom').textContent = lightboxIsPlan ? 'Zoom drawing ＋' : 'Enlarge image ＋';
  const loaded = await loadImage(item.src);
  if (requested !== viewerRequest || lightbox.hidden) return;
  stage.classList.remove('is-loading');
  if (!loaded) {
    $('#lightbox-status-text').textContent = lightboxIsPlan ? 'Drawing could not load.' : 'Image could not load.';
    retry.hidden = false;
    return;
  }
  image.src = item.src;
  image.alt = item.alt;
  if (image.decode) { try { await image.decode(); } catch {} }
  if (requested !== viewerRequest || lightbox.hidden) return;
  requestAnimationFrame(() => {
    if (requested === viewerRequest && !lightbox.hidden) image.classList.add('is-ready');
  });
  status.hidden = true;
  const upcoming = lightboxItems[(lightboxIndex + 1) % lightboxItems.length];
  if (upcoming && !lightboxIsPlan) loadImage(upcoming.src);
}
function openViewer(items, index, isPlan, trigger) {
  lightboxItems = items;
  lightboxIndex = index;
  lightboxIsPlan = isPlan;
  returnFocus = trigger || document.activeElement;
  lightbox.hidden = false;
  document.body.classList.add('dialog-open');
  displayLightbox();
  $('#lightbox-close').focus();
}
function openGallery(index, trigger) { openViewer(visibleImages, index, false, trigger); }
function openPlan() {
  const item = planData[activePlan];
  openViewer([item], 0, true, document.activeElement);
}
$('#open-plan').addEventListener('click', openPlan);
$('#plan-stage').addEventListener('click', openPlan);
function closeViewer() {
  viewerRequest++;
  lightbox.hidden = true;
  document.body.classList.remove('dialog-open');
  $('#lightbox-image').classList.remove('is-ready');
  $('#lightbox-image').removeAttribute('src');
  $('#lightbox-status').hidden = true;
  stage.classList.remove('is-zoomed', 'is-loading');
  returnFocus?.focus();
}
$('#lightbox-close').addEventListener('click', closeViewer);
function moveViewer(step) {
  if (lightboxIsPlan) return;
  lightboxIndex = (lightboxIndex + step + lightboxItems.length) % lightboxItems.length;
  displayLightbox();
}
$('#lightbox-prev').addEventListener('click', () => moveViewer(-1));
$('#lightbox-next').addEventListener('click', () => moveViewer(1));
$('#lightbox-retry').addEventListener('click', displayLightbox);
function toggleViewerZoom() {
  if (!$('#lightbox-image').classList.contains('is-ready')) return;
  const zoomed = stage.classList.toggle('is-zoomed');
  $('#lightbox-zoom').textContent = lightboxIsPlan
    ? (zoomed ? 'Fit drawing −' : 'Zoom drawing ＋')
    : (zoomed ? 'Fit image −' : 'Enlarge image ＋');
}
$('#lightbox-zoom').addEventListener('click', toggleViewerZoom);
$('#lightbox-image').addEventListener('click', toggleViewerZoom);
lightbox.addEventListener('click', event => { if (event.target === lightbox) closeViewer(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (!lightbox.hidden) closeViewer();
    else if (!mobileMenu.hidden) { closeMenu(); menuButton.focus(); }
  }
  if (lightbox.hidden) return;
  if (event.key === 'ArrowRight') moveViewer(1);
  if (event.key === 'ArrowLeft') moveViewer(-1);
  if (event.key === 'Tab') {
    const focusable = $$('button:not([hidden])', lightbox).filter(button => button.offsetParent !== null);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
    else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
  }
});
let touchStartX = 0;
stage.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
stage.addEventListener('touchend', event => {
  const distance = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(distance) > 55 && !lightboxIsPlan) moveViewer(distance < 0 ? 1 : -1);
}, { passive: true });

// Modest entrance reveals; all content remains available without animation.
if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: .08 });
  $$('.reveal').forEach(element => revealObserver.observe(element));
} else $$('.reveal').forEach(element => element.classList.add('is-visible'));
