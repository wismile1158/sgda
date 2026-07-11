// SGDC Display v1.0 RC2 — CSP-safe scaler and display behaviors
(function () {
  'use strict';

  const CANVAS_WIDTH = 3840;
  const CANVAS_HEIGHT = 2160;
  const MOBILE_MAX = 900;
  const canvas = document.getElementById('canvas');


  const LAYOUT_STORAGE_KEY = 'sgdc.layout.v0.1';

  function applySavedLayout() {
    let layout;
    try { layout = JSON.parse(window.localStorage.getItem(LAYOUT_STORAGE_KEY)); }
    catch (error) { layout = null; }
    if (!layout || !Array.isArray(layout.modules)) return;

    layout.modules.forEach(function (module) {
      const panel = document.querySelector(module.selector);
      if (!panel) return;

      panel.style.display = module.visible === false ? 'none' : '';
      panel.style.gridColumn = String(module.col || 1) + ' / span ' + String(module.colSpan || 1);
      panel.style.gridRow = String(module.row || 1) + ' / span ' + String(module.rowSpan || 1);
      panel.style.setProperty('--title-color', module.titleColor || '#d8b45c');
      panel.style.setProperty('--title-size', String(module.titleSize || 32) + 'px');

      const borders = module.borders || {};
      panel.style.borderTop = borders.top ? '2px solid rgba(255,255,255,.70)' : '0';
      panel.style.borderRight = borders.right ? '2px solid rgba(255,255,255,.70)' : '0';
      panel.style.borderBottom = borders.bottom ? '2px solid rgba(255,255,255,.70)' : '0';
      panel.style.borderLeft = borders.left ? '2px solid rgba(255,255,255,.70)' : '0';

      if (module.id === 'slideshow' && module.contentWidth) {
        const frame = panel.querySelector('.slide-frame');
        const caption = panel.querySelector('.slide-caption');
        if (frame) frame.style.width = String(module.contentWidth) + '%';
        if (caption) caption.style.width = String(module.contentWidth) + '%';
      }
    });
  }

  function scaleCanvas() {
    if (!canvas) return;
    const scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT);
    const renderedWidth = CANVAS_WIDTH * scale;
    const renderedHeight = CANVAS_HEIGHT * scale;
    const smallScreen = Math.min(window.innerWidth, window.innerHeight) <= MOBILE_MAX;

    canvas.style.transform = 'scale(' + scale + ')';
    canvas.style.left = smallScreen ? Math.max(0, (window.innerWidth - renderedWidth) / 2) + 'px' : '0px';
    canvas.style.top = smallScreen ? Math.max(0, (window.innerHeight - renderedHeight) / 2) + 'px' : '0px';
  }

  function updateClock() {
    const now = new Date();
    const dayText = document.getElementById('dayText');
    const dateText = document.getElementById('dateText');
    const timeText = document.getElementById('timeText');
    if (!dayText || !dateText || !timeText) return;

    dayText.textContent = now.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/New_York' });
    dateText.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' });
    const parts = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/New_York' }).formatToParts(now);
    const hour = parts.find(function (p) { return p.type === 'hour'; });
    const minute = parts.find(function (p) { return p.type === 'minute'; });
    const dayPeriod = parts.find(function (p) { return p.type === 'dayPeriod'; });
    timeText.innerHTML = (hour ? hour.value : '') + ':' + (minute ? minute.value : '') + '<span>' + (dayPeriod ? dayPeriod.value.toLowerCase() : '') + '</span>';
  }

  function duplicateForContinuousX() {
    document.querySelectorAll('[data-continuous-x="true"]').forEach(function (track) {
      if (track.dataset.ready === 'true') return;
      const group = track.querySelector('.crawl-group');
      if (!group) return;
      const clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
      track.dataset.ready = 'true';
    });
  }

  function makeSeamlessScrolls() {
    document.querySelectorAll('[data-seamless="true"]').forEach(function (track) {
      if (track.dataset.ready === 'true') return;
      Array.from(track.children).forEach(function (child) {
        const clone = child.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
      track.dataset.ready = 'true';
    });
  }

  const plaqueItems = [
    { name: 'The Arslanian Family', fund: 'Memorial Fund', memory: 'Aram, Mariam & Rose Arslanian' },
    { name: 'John & Mary Sarkisian', fund: 'Endowment Fund', memory: 'Hagop & Siranoush Sarkisian' },
    { name: 'Charles H. Tutunjian', fund: 'Trust Fund', memory: '' },
    { name: 'George & Alice Mardirosian', fund: 'Endowment Fund', memory: 'Their parents and grandparents' },
    { name: 'Hagop & Isabel Vartivarian', fund: 'Memorial Fund', memory: 'Vartivarian and Derderian Families' }
  ];

  function startPlaqueRotation() {
    const nameEl = document.getElementById('plaqueName');
    const fundEl = document.getElementById('plaqueFund');
    const labelEl = document.getElementById('plaqueMemoryLabel');
    const memoryEl = document.getElementById('plaqueMemory');
    if (!nameEl || !fundEl || !labelEl || !memoryEl) return;
    let index = 0;

    function render(item) {
      nameEl.textContent = item.name;
      fundEl.textContent = item.fund;
      labelEl.hidden = !item.memory;
      memoryEl.hidden = !item.memory;
      memoryEl.textContent = item.memory || '';
    }

    render(plaqueItems[index]);
    window.setInterval(function () {
      index = (index + 1) % plaqueItems.length;
      render(plaqueItems[index]);
    }, 5000);
  }

  function startFeaturedEvents() {
    const cards = Array.from(document.querySelectorAll('.event-card'));
    if (cards.length < 2) return;
    let index = 0;
    window.setInterval(function () {
      const current = cards[index];
      const nextIndex = (index + 1) % cards.length;
      const next = cards[nextIndex];
      current.classList.add('is-leaving');
      current.classList.remove('is-current');
      next.classList.remove('is-leaving');
      next.classList.add('is-current');
      window.setTimeout(function () { current.classList.remove('is-leaving'); }, 760);
      index = nextIndex;
    }, 6500);
  }

  window.addEventListener('resize', scaleCanvas);
  window.addEventListener('orientationchange', function () { window.setTimeout(scaleCanvas, 100); });
  window.addEventListener('storage', function (event) { if (event.key === LAYOUT_STORAGE_KEY) applySavedLayout(); });
  window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin && event.origin !== 'null') return;
    if (event.data && event.data.type === 'sgdc-layout-updated') applySavedLayout();
  });

  applySavedLayout();
  scaleCanvas();
  updateClock();
  duplicateForContinuousX();
  makeSeamlessScrolls();
  startPlaqueRotation();
  startFeaturedEvents();
  window.setInterval(updateClock, 30000);
})();
