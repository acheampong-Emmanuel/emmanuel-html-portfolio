/* Narrative diagrams start when reached. Manual interaction always takes over. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  const pathParts = location.pathname.split('/').filter(Boolean);
  const page = pathParts[pathParts.indexOf('projects') + 1];
  const stories = {
    'aurum-hotel': [
      { target: '#logicControls', play: '#logicPlay', manual: '#logicControls button' },
      { target: '#formationSteps', play: '#formationPlay', manual: '#formationSteps button, #formationPrev, #formationNext' },
      { target: '#massingLevels', play: '#massingPlay', manual: '#massingLevels button' }
    ],
    'hannah-apartment': [
      { target: '#conceptStage', steps: '.concept .step[data-scene]', delay: 2100 },
      { target: '#massingStage', play: '#massingPlay', manual: '[data-massing-step]' }
    ],
    'tanoso-house': [
      { target: '#concept-graphic', play: '#concept-play', manual: '.concept-step, #concept-prev, #concept-next' },
      { target: '#systems', steps: '.system-button', manual: '#system-cycle', delay: 2200 }
    ],
    'villa-aperture': [
      { target: '#massingSvg', steps: '.move-button', delay: 2200 },
      { target: '#site', steps: '.site-step', manual: '.site-pin', delay: 2200 }
    ],
    'koforidua-events-park': [
      { target: '#formation-canvas', steps: '.formation-steps button', delay: 2500 },
      { target: '.diagram-viewport', steps: '.diagram-tabs button', manual: '.diagram-marker, .diagram-feature', delay: 3500 }
    ]
  }[page] || [];

  stories.forEach(({ target, play, steps, manual, delay = 2200 }) => {
    const stage = document.querySelector(target);
    const playButton = play && document.querySelector(play);
    const stepButtons = steps && [...document.querySelectorAll(steps)];
    if (!stage || (play && !playButton) || (steps && !stepButtons.length)) return;
    let userControlled = false;
    let autoStarted = false;
    let timer = null;
    let entered = false;
    const controls = [...new Set([...(playButton ? [playButton] : stepButtons), ...(manual ? document.querySelectorAll(manual) : [])])];
    const claim = event => { if (event.isTrusted) { userControlled = true; stop(false); } };
    controls.forEach(control => {
      control.addEventListener('pointerdown', claim, true);
      control.addEventListener('keydown', claim, true);
      control.addEventListener('click', claim, true);
    });
    function isPlaying() {
      return /pause/i.test(playButton.getAttribute('aria-label') || playButton.textContent);
    }
    function stop(pausePlayback = true) {
      clearTimeout(timer);
      timer = null;
      if (pausePlayback && autoStarted && playButton && isPlaying()) playButton.click();
      autoStarted = false;
    }
    function start() {
      if (userControlled || reduced.matches || document.hidden) return;
      if (playButton) {
        if (!isPlaying()) { playButton.click(); autoStarted = true; }
        return;
      }
      let index = 0;
      const advance = () => {
        if (!entered || userControlled || reduced.matches || document.hidden) return;
        stepButtons[index].click();
        index++;
        if (index < stepButtons.length) timer = setTimeout(advance, delay);
        else timer = null;
      };
      advance();
    }
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= .12;
      if (visible && !entered) { entered = true; start(); }
      else if (!visible && entered) { entered = false; stop(); }
    }, { threshold: [0, .12, .3], rootMargin: '0px 0px -8% 0px' });
    observer.observe(stage);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (entered) start();
    });
    reduced.addEventListener('change', () => { if (reduced.matches) stop(); });
  });
})();
