// SGDS v1.0 RC1 — CSP-safe fixed 4K scaler and display behaviors
(function () {
  const canvas = document.getElementById('canvas');

  function scaleCanvas() {
    const scale = Math.min(window.innerWidth / 3840, window.innerHeight / 2160);
    canvas.style.transform = 'scale(' + scale + ')';
  }

  function updateClock() {
    const now = new Date();
    const dayText = document.getElementById('dayText');
    const dateText = document.getElementById('dateText');
    const timeText = document.getElementById('timeText');
    if (!dayText || !dateText || !timeText) return;

    dayText.textContent = now.toLocaleDateString('en-US', { weekday: 'long' });
    dateText.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const suffix = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    timeText.innerHTML = hours + ':' + minutes + '<span>' + suffix + '</span>';
  }

  function makeSeamlessScrolls() {
    document.querySelectorAll('[data-seamless="true"]').forEach(function (track) {
      if (track.dataset.ready === 'true') return;
      const children = Array.from(track.children);
      children.forEach(function (child) {
        const clone = child.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
      track.dataset.ready = 'true';
    });
  }

  const plaqueItems = [
    {
      name: 'John & Mary Sarkisian',
      fund: 'Endowment Fund',
      memory: 'Hagop & Siranoush Sarkisian'
    },
    {
      name: 'The Arslanian Family',
      fund: 'Memorial Fund',
      memory: 'Aram, Mariam & Rose Arslanian'
    },
    {
      name: 'Charles H. Tutunjian',
      fund: 'Trust Fund',
      memory: ''
    },
    {
      name: 'George & Alice Mardirosian',
      fund: 'Endowment Fund',
      memory: 'Their parents and grandparents'
    },
    {
      name: 'Hagop & Isabel Vartivarian',
      fund: 'Memorial Fund',
      memory: 'Vartivarian and Derderian Families'
    }
  ];

  function startPlaqueRotation() {
    const plaque = document.querySelector('.plaque');
    const nameEl = document.getElementById('plaqueName');
    const fundEl = document.getElementById('plaqueFund');
    const labelEl = document.getElementById('plaqueMemoryLabel');
    const memoryEl = document.getElementById('plaqueMemory');
    if (!plaque || !nameEl || !fundEl || !labelEl || !memoryEl) return;

    let index = 0;

    function render(item) {
      nameEl.textContent = item.name;
      fundEl.textContent = item.fund;
      if (item.memory) {
        labelEl.style.display = '';
        memoryEl.style.display = '';
        memoryEl.textContent = item.memory;
      } else {
        labelEl.style.display = 'none';
        memoryEl.style.display = 'none';
        memoryEl.textContent = '';
      }
    }

    render(plaqueItems[index]);

    window.setInterval(function () {
      plaque.classList.add('is-fading');
      window.setTimeout(function () {
        index = (index + 1) % plaqueItems.length;
        render(plaqueItems[index]);
        plaque.classList.remove('is-fading');
      }, 750);
    }, 5000);
  }

  window.addEventListener('resize', scaleCanvas);
  window.addEventListener('orientationchange', scaleCanvas);

  scaleCanvas();
  updateClock();
  makeSeamlessScrolls();
  startPlaqueRotation();
  window.setInterval(updateClock, 30000);
})();
