(function () {
  'use strict';

  const STORAGE_KEY = 'sgdc.layout.v0.1';
  const MODULES = [
    { id: 'announcements', label: 'Announcements', selector: '.area-announcements', col: 1, row: 1, colSpan: 2, rowSpan: 1, visible: true, titleColor: '#d8b45c', titleSize: 32, borders: { top: false, right: false, bottom: true, left: false } },
    { id: 'stewardship', label: 'Stewardship', selector: '.area-stewardship', col: 3, row: 1, colSpan: 1, rowSpan: 2, visible: true, titleColor: '#d8b45c', titleSize: 32, borders: { top: false, right: false, bottom: false, left: false } },
    { id: 'slideshow', label: 'Parish Life', selector: '.area-slideshow', col: 4, row: 1, colSpan: 2, rowSpan: 1, visible: true, titleColor: '#d8b45c', titleSize: 32, borders: { top: false, right: false, bottom: false, left: false }, contentWidth: 75 },
    { id: 'hokehankist', label: 'Today’s Service / Hokehankist', selector: '.area-hokehankist', col: 1, row: 2, colSpan: 2, rowSpan: 1, visible: true, titleColor: '#d8b45c', titleSize: 32, borders: { top: false, right: false, bottom: true, left: false } },
    { id: 'volunteer', label: 'Volunteers Needed', selector: '.area-volunteer', col: 4, row: 2, colSpan: 1, rowSpan: 1, visible: true, titleColor: '#d8b45c', titleSize: 32, borders: { top: false, right: false, bottom: false, left: false } },
    { id: 'featured', label: 'Featured Events', selector: '.area-featured', col: 5, row: 2, colSpan: 1, rowSpan: 1, visible: true, titleColor: '#d8b45c', titleSize: 32, borders: { top: false, right: false, bottom: false, left: false } }
  ];

  let state = loadState();
  let selectedId = state.modules[0].id;
  let draggedId = null;

  const board = document.getElementById('layoutBoard');
  const list = document.getElementById('moduleList');
  const editor = document.getElementById('propertyEditor');
  const preview = document.getElementById('previewFrame');
  const saveStatus = document.getElementById('saveStatus');

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function defaultState() { return { version: '0.1', modules: clone(MODULES) }; }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed && Array.isArray(parsed.modules)) {
        const defaults = defaultState();
        defaults.modules = defaults.modules.map(function (base) {
          const saved = parsed.modules.find(function (item) { return item.id === base.id; });
          return saved ? Object.assign({}, base, saved, { borders: Object.assign({}, base.borders, saved.borders || {}) }) : base;
        });
        return defaults;
      }
    } catch (error) { console.warn('Could not read saved layout.', error); }
    return defaultState();
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveStatus.textContent = 'Saved locally';
    saveStatus.style.color = '#b8d8aa';
    notifyPreview();
  }

  function notifyPreview() {
    if (preview && preview.contentWindow) preview.contentWindow.postMessage({ type: 'sgdc-layout-updated' }, window.location.origin);
  }

  function getModule(id) { return state.modules.find(function (item) { return item.id === id; }); }

  function render() {
    renderBoard();
    renderList();
    renderEditor();
  }

  function renderBoard() {
    board.innerHTML = '';
    state.modules.forEach(function (module) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'layout-card' + (module.id === selectedId ? ' selected' : '') + (!module.visible ? ' is-hidden' : '');
      card.draggable = true;
      card.dataset.id = module.id;
      card.style.gridColumn = module.col + ' / span ' + module.colSpan;
      card.style.gridRow = module.row + ' / span ' + module.rowSpan;
      card.innerHTML = '<span class="card-title">' + escapeHtml(module.label) + '</span><span class="card-meta">' + module.colSpan + ' col × ' + module.rowSpan + ' row' + (!module.visible ? ' · hidden' : '') + '</span>';
      card.addEventListener('click', function () { selectedId = module.id; render(); });
      card.addEventListener('dragstart', function (event) {
        draggedId = module.id;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', module.id);
        card.classList.add('dragging');
        board.classList.add('drag-active');
      });
      card.addEventListener('dragend', function () {
        draggedId = null;
        card.classList.remove('dragging');
        board.classList.remove('drag-active');
      });
      board.appendChild(card);
    });

    for (let row = 1; row <= 2; row += 1) {
      for (let col = 1; col <= 5; col += 1) {
        const cell = document.createElement('div');
        cell.className = 'drop-cell';
        cell.style.gridColumn = String(col);
        cell.style.gridRow = String(row);
        cell.addEventListener('dragover', function (event) { event.preventDefault(); });
        cell.addEventListener('drop', function (event) {
          event.preventDefault();
          const id = draggedId || event.dataTransfer.getData('text/plain');
          moveModule(id, col, row);
        });
        board.appendChild(cell);
      }
    }
  }

  function renderList() {
    list.innerHTML = '';
    state.modules.forEach(function (module) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = module.id === selectedId ? 'active' : '';
      button.textContent = module.label + (module.visible ? '' : ' (hidden)');
      button.addEventListener('click', function () { selectedId = module.id; render(); });
      list.appendChild(button);
    });
  }

  function renderEditor() {
    const module = getModule(selectedId);
    if (!module) return;
    const isSlide = module.id === 'slideshow';
    editor.innerHTML = `
      <h3>${escapeHtml(module.label)}</h3>
      <div class="control-grid">
        <div class="control full">
          <div class="toggle-row">
            <label class="toggle"><input id="visibleControl" type="checkbox" ${module.visible ? 'checked' : ''}> Show panel</label>
          </div>
        </div>
        <div class="control">
          <label for="colSpanControl">Panel width</label>
          <select id="colSpanControl">
            <option value="1" ${module.colSpan === 1 ? 'selected' : ''}>1 column</option>
            <option value="2" ${module.colSpan === 2 ? 'selected' : ''}>2 columns</option>
          </select>
        </div>
        <div class="control">
          <label for="rowSpanControl">Panel height</label>
          <select id="rowSpanControl">
            <option value="1" ${module.rowSpan === 1 ? 'selected' : ''}>1 row</option>
            <option value="2" ${module.rowSpan === 2 ? 'selected' : ''}>2 rows</option>
          </select>
        </div>
        <div class="control">
          <label for="titleColorControl">Title color</label>
          <input id="titleColorControl" type="color" value="${module.titleColor}">
        </div>
        <div class="control">
          <label for="titleSizeControl">Title size</label>
          <div class="range-row"><input id="titleSizeControl" type="range" min="22" max="56" step="1" value="${module.titleSize}"><output id="titleSizeOutput">${module.titleSize}px</output></div>
        </div>
        <div class="control full">
          <span class="fieldset-title">2px panel borders</span>
          <div class="border-row">
            ${['top','right','bottom','left'].map(function (side) { return `<label class="border-toggle"><input type="checkbox" data-border="${side}" ${module.borders[side] ? 'checked' : ''}> ${capitalize(side)}</label>`; }).join('')}
          </div>
        </div>
        ${isSlide ? `<div class="control full"><label for="contentWidthControl">Slideshow width</label><div class="range-row"><input id="contentWidthControl" type="range" min="50" max="100" step="1" value="${module.contentWidth || 75}"><output id="contentWidthOutput">${module.contentWidth || 75}%</output></div></div>` : ''}
      </div>
      <div class="help">Drag this panel on the canvas to change its position. The manager prevents overlaps; widen or shrink a panel before moving it into a tighter opening.</div>
    `;

    bindEditor(module);
  }

  function bindEditor(module) {
    bindChange('visibleControl', function (el) { module.visible = el.checked; });
    bindChange('colSpanControl', function (el) {
      const old = module.colSpan;
      module.colSpan = Number(el.value);
      if (!placementIsValid(module)) { module.colSpan = old; el.value = String(old); alert('That width overlaps another panel or extends beyond the five-column canvas.'); return false; }
    });
    bindChange('rowSpanControl', function (el) {
      const old = module.rowSpan;
      module.rowSpan = Number(el.value);
      if (!placementIsValid(module)) { module.rowSpan = old; el.value = String(old); alert('That height overlaps another panel or extends beyond the two-row canvas.'); return false; }
    });
    bindInput('titleColorControl', function (el) { module.titleColor = el.value; });
    bindInput('titleSizeControl', function (el) {
      module.titleSize = Number(el.value);
      document.getElementById('titleSizeOutput').textContent = module.titleSize + 'px';
    });
    editor.querySelectorAll('[data-border]').forEach(function (input) {
      input.addEventListener('change', function () { module.borders[input.dataset.border] = input.checked; commit(); });
    });
    if (module.id === 'slideshow') {
      bindInput('contentWidthControl', function (el) {
        module.contentWidth = Number(el.value);
        document.getElementById('contentWidthOutput').textContent = module.contentWidth + '%';
      });
    }
  }

  function bindChange(id, callback) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', function () { const result = callback(el); if (result !== false) commit(); render(); });
  }

  function bindInput(id, callback) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function () { callback(el); commit(false); });
    el.addEventListener('change', function () { commit(); });
  }

  function commit(shouldRender) {
    saveStatus.textContent = 'Saving…';
    saveStatus.style.color = '#f0d88b';
    saveState();
    if (shouldRender !== false) render();
  }

  function moveModule(id, col, row) {
    const module = getModule(id);
    if (!module) return;
    const oldCol = module.col;
    const oldRow = module.row;
    module.col = col;
    module.row = row;
    if (!placementIsValid(module)) {
      module.col = oldCol;
      module.row = oldRow;
      alert('That position is occupied or does not have enough room for this panel.');
      render();
      return;
    }
    selectedId = id;
    commit();
  }

  function placementIsValid(candidate) {
    if (candidate.col < 1 || candidate.row < 1 || candidate.col + candidate.colSpan - 1 > 5 || candidate.row + candidate.rowSpan - 1 > 2) return false;
    return !state.modules.some(function (other) {
      if (other.id === candidate.id || !other.visible || !candidate.visible) return false;
      return rectanglesOverlap(candidate, other);
    });
  }

  function rectanglesOverlap(a, b) {
    const aRight = a.col + a.colSpan - 1;
    const aBottom = a.row + a.rowSpan - 1;
    const bRight = b.col + b.colSpan - 1;
    const bBottom = b.row + b.rowSpan - 1;
    return !(aRight < b.col || bRight < a.col || aBottom < b.row || bBottom < a.row);
  }

  function exportState() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sgdc-layout-v0.1.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function importState(file) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.modules)) throw new Error('Invalid layout file.');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        state = loadState();
        selectedId = state.modules[0].id;
        saveState();
        render();
      } catch (error) { alert('Could not import this layout file.'); }
    };
    reader.readAsText(file);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]; });
  }
  function capitalize(value) { return value.charAt(0).toUpperCase() + value.slice(1); }

  document.getElementById('resetBtn').addEventListener('click', function () {
    if (!confirm('Reset every panel to the RC2 layout?')) return;
    state = defaultState();
    selectedId = state.modules[0].id;
    saveState();
    render();
  });
  document.getElementById('exportBtn').addEventListener('click', exportState);
  document.getElementById('importInput').addEventListener('change', function (event) {
    const file = event.target.files && event.target.files[0];
    if (file) importState(file);
    event.target.value = '';
  });
  document.getElementById('refreshPreviewBtn').addEventListener('click', function () { preview.src = 'index.html?layoutPreview=' + Date.now(); });

  render();
})();
