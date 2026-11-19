/**
 * Interactive UI detail demos for the Space Planning case (cases/case2.html).
 * Each <figure data-demo="..."> gets a small working replica of a product pattern.
 * The product UI stays in English (as in the real product); captions are translated via data-i18n.
 * Visitor changes are kept only in this browser (localStorage) and can be reset.
 */
(function () {
  'use strict';

  const STORE_KEY = 'sp-demo-v1';

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  let state = loadState();

  function save(part, value) {
    state[part] = value;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) { /* storage unavailable: demo still works for this visit */ }
  }

  /* Short UI sounds (unused site sounds, compressed). Played only after a user action. */
  const SOUND_SRC = { save: '../sound/demo-save.m4a', toggle: '../sound/demo-toggle.m4a' };
  const soundCache = {};
  function playSound(name) {
    try {
      if (!soundCache[name]) {
        soundCache[name] = new Audio(SOUND_SRC[name]);
        soundCache[name].volume = 0.3;
      }
      const a = soundCache[name];
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* sound is optional */ }
  }

  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
        else if (k === 'style') el.setAttribute('style', v);
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    (children || []).forEach((c) => {
      if (c === null || c === undefined || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const ICON = {
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    search: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    caretRight: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M3 1.5L7.5 5 3 8.5z" fill="currentColor"/></svg>',
    caretLeft: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M7 1.5L2.5 5 7 8.5z" fill="currentColor"/></svg>',
    up: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 7L5 3l3.5 4z" fill="currentColor"/></svg>',
    down: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3L5 7l3.5-4z" fill="currentColor"/></svg>',
    file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l5 5v15H6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 2v5h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  /* ---------- 1. Product info on a mini shelf ---------- */
  const PRODUCTS = [
    { name: 'Squashes', id: '1024325', seg: 'Squashes', block: 'Brookes Oros', pr: '1.0', h: 78, c: '#c9e88f' },
    { name: 'Cordial', id: '1024331', seg: 'Cordials', block: 'Robinsons', pr: '0.8', h: 64, c: '#f7c6c0' },
    { name: 'Juice', id: '1024348', seg: 'Juices', block: 'Tropicana', pr: '1.2', h: 88, c: '#ffe08a' },
    { name: 'Water', id: '1024356', seg: 'Still water', block: 'Evian', pr: '0.6', h: 96, c: '#c8dcf7' },
    { name: 'Iced tea', id: '1024362', seg: 'Ready to drink', block: 'Lipton', pr: '0.9', h: 70, c: '#e2d2fb' },
  ];

  function demoItem(stage) {
    let current = -1;
    let hideTimer = null;
    const tip = h('div', { class: 'sp-tooltip sp-tooltip--info', role: 'status', 'aria-live': 'polite' });
    const shelf = h('div', { class: 'sp-shelf' });
    const show = (i) => {
      clearTimeout(hideTimer);
      if (i === current && tip.classList.contains('is-visible')) return;
      current = i;
      render();
      tip.classList.remove('is-visible');
      void tip.offsetWidth; // restart the entrance animation
      tip.classList.add('is-visible');
    };
    const hide = () => {
      hideTimer = setTimeout(() => {
        current = -1;
        buttons.forEach((b) => b.classList.remove('is-active'));
        render();
      }, 150);
    };
    const buttons = PRODUCTS.map((p, i) => {
      const b = h('button', {
        type: 'button',
        class: 'sp-shelf__item',
        style: `height:${p.h}px;background:${p.c}`,
        'aria-label': `${p.name}, show product info`,
        onmouseenter: () => show(i),
        onfocus: () => show(i),
        onclick: () => show(i),
        onblur: hide,
      }, [h('span', { text: p.name })]);
      shelf.appendChild(b);
      return b;
    });
    shelf.addEventListener('mouseleave', hide);
    shelf.appendChild(h('div', { class: 'sp-shelf__board' }));

    function render() {
      if (current < 0) {
        tip.innerHTML = '<p class="sp-tooltip__empty">Hover a product to see its details</p>';
        tip.classList.add('is-visible', 'is-empty');
        return;
      }
      tip.classList.remove('is-empty');
      const p = PRODUCTS[current];
      buttons.forEach((b, i) => b.classList.toggle('is-active', i === current));
      tip.innerHTML =
        `<span class="sp-saved">${ICON.check} SAVED</span>` +
        `<dl class="sp-kv"><dt>Item ID:</dt><dd>${p.id}</dd><dt>Segment:</dt><dd>${p.seg}</dd>` +
        `<dt>Block:</dt><dd>${p.block}</dd><dt>Segment Priority:</dt><dd>${p.pr}</dd></dl>`;
      const btn = buttons[current];
      tip.style.setProperty('--arrow', `${btn.offsetLeft + btn.offsetWidth / 2}px`);
    }

    stage.append(h('div', { class: 'sp-item' }, [tip, shelf]));
    render();
    window.addEventListener('resize', render);
  }

  /* ---------- 2. Quick Tips tour ---------- */
  const TOUR = [
    { target: 'store', title: 'Quick Tip', text: 'To create planograms <b>Select Store</b>. You will need to follow several steps.' },
    { target: 'mudmap', title: 'Open the MudMap', text: 'The <b>MudMap</b> shows the whole store layout. Pick a section to plan.' },
    { target: 'pog', title: 'Switch to POG', text: '<b>POG</b> is the shelf view. Drag products and change facings here.' },
    { target: 'report', title: 'Check the money', text: '<b>Report</b> shows sales, profit and displaced SKUs for this version.' },
    { target: 'rebuild', title: 'Rebuild the planogram', text: 'After edits, <b>Rebuild POG</b> re-checks every shelf for errors.' },
    { target: 'export', title: 'Ready for the store', text: '<b>Export PDF</b> sends a print-ready planogram to the store team.' },
  ];

  function demoTip(stage) {
    let step = state.tourStep || 0;
    let finished = !!state.tourDone;

    const targets = {};
    const bar = h('div', { class: 'sp-app__bar' }, [
      targets.store = h('span', { class: 'sp-select sp-select--sm', text: 'ID 104590' }),
      h('span', { class: 'sp-app__meta', html: '<small>CATEGORY</small>Body &amp; Care' }),
    ]);
    const tabs = h('div', { class: 'sp-app__tabs' }, [
      targets.mudmap = h('span', { class: 'sp-tab', text: 'MUDMAP' }),
      targets.pog = h('span', { class: 'sp-tab', text: 'POG' }),
      targets.report = h('span', { class: 'sp-tab', text: 'REPORT' }),
      h('span', { class: 'sp-tab', text: 'PM' }),
      h('span', { class: 'sp-app__spacer' }),
      targets.rebuild = h('span', { class: 'sp-btn sp-btn--dark', text: 'Rebuild POG' }),
      targets.export = h('span', { class: 'sp-btn sp-btn--outline', text: 'Export PDF' }),
    ]);
    const SECTIONS = [
      { name: 'SECTION 1', size: 'H1000 - W120', rows: [[['Shampoo', 'pink', 62], ['Shampoo', 'pink', 62], ['Shampoo', 'pink', 62], ['Gel', 'yellow', 48]], [['Cream', 'green', 40], ['Cream', 'green', 40], ['Cream', 'green', 40]]] },
      { name: 'SECTION 2', size: 'H1000 - W120', rows: [[['Cream', 'grey', 34], ['Cream', 'grey', 34], ['Cream', 'grey', 34], ['Cream', 'grey', 34]], [['Shampoo', 'blue', 58], ['Shampoo', 'blue', 58], ['Shampoo', 'blue', 58], ['Shampoo', 'blue', 58]]] },
      { name: 'SECTION 3', size: 'H1000 - W780', rows: [[['Cream', 'green', 56], ['Cream', 'green', 60], ['Cream', 'green', 52], ['Cream', 'green', 58], ['Cream', 'green', 54]], [['Skin', 'yellow', 50], ['Skin', 'yellow', 54], ['Skin', 'yellow', 50], ['Skin', 'yellow', 52], ['Skin', 'yellow', 48]]] },
    ];
    const canvas = h('div', { class: 'sp-app__canvas' }, SECTIONS.map((s) => h('div', { class: 'sp-section' }, [
      h('div', { class: 'sp-section__head', html: `<b>${s.name}</b><small>${s.size}</small>` }),
      ...s.rows.map((row) => h('div', { class: 'sp-section__shelf' }, row.map(([n, c, ht]) => h('span', { class: `sp-product sp-product--${c}`, style: `height:${ht}px`, text: n })))),
    ])));
    const app = h('div', { class: 'sp-app' }, [bar, tabs, canvas]);
    const tip = h('div', { class: 'sp-tooltip sp-tour', role: 'dialog', 'aria-live': 'polite' });
    const restart = h('button', {
      type: 'button', class: 'sp-pill', text: '↻ Restart tour',
      onclick: () => { step = 0; finished = false; persist(); render(); },
    });
    const wrap = h('div', { class: 'sp-tourwrap' }, [app, tip, restart]);
    stage.append(wrap);

    function persist() { save('tourStep', step); save('tourDone', finished); }

    function render() {
      Object.values(targets).forEach((t) => t.classList.remove('is-highlight'));
      tip.hidden = finished;
      restart.hidden = !finished;
      if (finished) return;
      const s = TOUR[step];
      const t = targets[s.target];
      t.classList.add('is-highlight');
      tip.innerHTML = '';
      tip.append(
        h('strong', { class: 'sp-tour__title', text: s.title }),
        h('p', { class: 'sp-tour__text', html: s.text }),
        h('div', { class: 'sp-tour__foot' }, [
          h('small', { text: `Step ${step + 1}/${TOUR.length}` }),
          h('button', { type: 'button', class: 'sp-link', text: 'Skip', onclick: () => { finished = true; persist(); render(); } }),
          h('button', {
            type: 'button', class: 'sp-btn sp-btn--lime',
            html: step === TOUR.length - 1 ? 'DONE' : 'NEXT ›',
            onclick: () => {
              if (step === TOUR.length - 1) finished = true; else step += 1;
              persist(); render();
            },
          }),
        ]),
      );
      // position under the highlighted target, kept inside the stage
      const wr = wrap.getBoundingClientRect();
      const tr = t.getBoundingClientRect();
      const tipW = Math.min(300, wr.width - 16);
      let left = tr.left - wr.left + tr.width / 2 - tipW / 2;
      left = Math.max(8, Math.min(left, wr.width - tipW - 8));
      tip.style.width = `${tipW}px`;
      tip.style.left = `${left}px`;
      tip.style.top = `${tr.bottom - wr.top + 12}px`;
      tip.style.setProperty('--arrow', `${tr.left - wr.left + tr.width / 2 - left}px`);
    }

    render();
    window.addEventListener('resize', render);
  }

  /* ---------- 3. Nested filter with counters ---------- */
  const CATS = [
    { name: 'Body & Care', subs: [['Shampoo', 9], ['Shower gel', 6], ['Deodorant', 4], ['Toothpaste', 3]] },
    { name: 'Snacks', subs: [['Crisps', 5], ['Nuts', 4], ['Popcorn', 3]] },
    { name: 'Beverages', subs: [['Still water', 120], ['Juices', 86], ['Squashes', 64], ['Iced tea', 50]] },
  ];

  function demoFilter(stage) {
    let open = 0;
    const checked = state.filter || { 'Body & Care|Shampoo': true, 'Body & Care|Shower gel': true };
    const left = h('div', { class: 'sp-panel sp-filter__cats' });
    const right = h('div', { class: 'sp-panel sp-filter__subs' });
    stage.append(h('div', { class: 'sp-filter' }, [
      h('div', { class: 'sp-filter__col' }, [h('div', { class: 'sp-panel__title', text: 'Choose Filter' }), left]),
      h('div', { class: 'sp-filter__col sp-filter__col--subs' }, [right]),
    ]));

    function render() {
      left.innerHTML = '';
      CATS.forEach((c, i) => {
        const sum = c.subs.reduce((a, [, k]) => a + k, 0);
        left.append(h('button', {
          type: 'button', class: `sp-row${i === open ? ' is-active' : ''}`,
          'aria-pressed': String(i === open),
          onclick: () => { open = i; render(); },
          html: `<span>${escapeHtml(c.name)}</span><span class="sp-count">${sum}</span><span class="sp-caret">${ICON.caretRight}</span>`,
        }));
      });
      right.innerHTML = '';
      CATS[open].subs.forEach(([s, k]) => {
        const key = `${CATS[open].name}|${s}`;
        const id = `sp-f-${key.replace(/[^a-z0-9]/gi, '')}`;
        const input = h('input', {
          type: 'checkbox', id, class: 'sp-check__input', checked: !!checked[key],
          onchange: (e) => { checked[key] = e.target.checked; save('filter', checked); render(); },
        });
        right.append(h('label', { class: 'sp-row sp-check', for: id }, [
          input,
          h('span', { class: 'sp-check__box', html: ICON.check }),
          h('span', { text: s }),
          h('span', { class: 'sp-count', text: String(k) }),
        ]));
      });
    }
    render();
  }

  /* ---------- 4. Grouped errors ---------- */
  const ERRORS = [
    { type: 'LOW WIDTH VALUE', skus: ['2342', '1212', '4343'] },
    { type: 'ITEM TOO TALL', skus: ['5667', '1456'] },
    { type: 'OVERFLOWING SHELF', skus: ['2323', '1234', '8810'] },
  ];

  function demoErrors(stage) {
    let expanded = false;
    const fixed = state.fixed || {};
    const panel = h('div', { class: 'sp-dark sp-errors' });
    stage.append(panel);

    function render() {
      const all = ERRORS.reduce((a, g) => a + g.skus.length, 0);
      const left = ERRORS.reduce((a, g) => a + g.skus.filter((s) => !fixed[s]).length, 0);
      panel.innerHTML = '';
      panel.append(h('div', { class: 'sp-errors__head' }, [
        h('strong', { text: left ? `${left} errors on this shelf` : 'All clear' }),
        left ? null : h('span', { class: 'sp-saved', html: `${ICON.check} OK` }),
      ]));
      const list = h('div', { class: 'sp-errors__list' });
      ERRORS.slice(0, expanded ? ERRORS.length : 2).forEach((g) => {
        list.append(h('div', { class: 'sp-errors__type', text: g.type }));
        g.skus.forEach((s) => {
          list.append(h('button', {
            type: 'button', class: `sp-errors__sku${fixed[s] ? ' is-fixed' : ''}`,
            'aria-pressed': String(!!fixed[s]),
            title: fixed[s] ? 'Mark as not fixed' : 'Mark as fixed',
            onclick: () => { fixed[s] = !fixed[s]; save('fixed', fixed); render(); },
            html: `<span>‘SKU ${s}’</span><span class="sp-errors__fix">${fixed[s] ? ICON.check + ' fixed' : 'fix'}</span>`,
          }));
        });
      });
      panel.append(list);
      panel.append(h('button', {
        type: 'button', class: 'sp-errors__more', text: expanded ? 'Show less' : 'Show more',
        'aria-expanded': String(expanded),
        onclick: () => {
          const from = panel.offsetHeight;
          expanded = !expanded;
          render();
          playSound('toggle');
          const to = panel.offsetHeight;
          if (panel.animate && !reduceMotion()) {
            panel.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
          }
        },
      }));
      panel.dataset.total = all;
    }
    render();
  }

  function reduceMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- 5. Inline editing ---------- */
  function demoInline(stage) {
    const saved = state.inline || { width: 11.0, height: 26.0 };
    let draft = { ...saved };
    let flash = false;
    const panel = h('div', { class: 'sp-dark sp-inline' });
    stage.append(panel);

    function field(key, label) {
      const input = h('input', {
        type: 'number', step: '0.5', min: '1', max: '200', value: draft[key].toFixed(1),
        'aria-label': label, class: 'sp-num__input',
        oninput: (e) => { const v = parseFloat(e.target.value); if (!Number.isNaN(v)) { draft[key] = v; markDirty(); } },
        onkeydown: (e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); },
      });
      const step = (d) => { draft[key] = Math.max(1, Math.round((draft[key] + d) * 10) / 10); input.value = draft[key].toFixed(1); markDirty(); };
      return h('div', { class: 'sp-kvrow' }, [
        h('span', { class: 'sp-kvrow__k', text: `${label}:` }),
        h('div', { class: 'sp-num' }, [
          input,
          h('span', { class: 'sp-num__steps' }, [
            h('button', { type: 'button', 'aria-label': `Increase ${label}`, html: ICON.up, onclick: () => step(0.5) }),
            h('button', { type: 'button', 'aria-label': `Decrease ${label}`, html: ICON.down, onclick: () => step(-0.5) }),
          ]),
        ]),
      ]);
    }

    const status = h('span', { class: 'sp-saved', 'aria-live': 'polite' });
    function markDirty() {
      const dirty = draft.width !== saved.width || draft.height !== saved.height;
      status.innerHTML = dirty ? 'UNSAVED' : `${ICON.check} SAVED`;
      status.classList.toggle('is-dirty', dirty);
    }
    function commit() {
      saved.width = draft.width; saved.height = draft.height;
      save('inline', saved); flash = true; render();
      playSound('save');
    }
    function cancel() { draft = { ...saved }; render(); }

    function render() {
      panel.innerHTML = '';
      panel.append(
        h('div', { class: 'sp-inline__top' }, [status]),
        h('div', { class: 'sp-kvrow' }, [h('span', { class: 'sp-kvrow__k', text: 'Segment:' }), h('b', { text: 'Squashes' })]),
        h('div', { class: 'sp-kvrow' }, [h('span', { class: 'sp-kvrow__k', text: 'Block:' }), h('b', { text: 'Brookes Oros' })]),
        field('width', 'Width'),
        field('height', 'Height'),
        h('div', { class: 'sp-inline__actions' }, [
          h('button', { type: 'button', class: 'sp-btn sp-btn--lime sp-btn--icon', 'aria-label': 'Save', html: ICON.check, onclick: commit }),
          h('button', { type: 'button', class: 'sp-btn sp-btn--red sp-btn--icon', 'aria-label': 'Cancel', html: ICON.close, onclick: cancel }),
        ]),
      );
      markDirty();
      if (flash) {
        panel.classList.add('is-flash');
        status.classList.add('is-pop');
        setTimeout(() => { panel.classList.remove('is-flash'); status.classList.remove('is-pop'); }, 900);
        flash = false;
      }
    }
    render();
  }

  /* ---------- 6. Search inside a select ---------- */
  const OPTIONS = ['Sparkling water', 'Still water', 'Squash orange', 'Squash lemon', 'Iced tea peach', 'Cola', 'Cola zero',
    'Energy drink', 'Apple juice', 'Orange juice', 'Lemonade', 'Tonic water'];

  function demoSearch(stage) {
    let query = '';
    let value = '';
    const input = h('input', {
      type: 'text', class: 'sp-field__input', placeholder: 'Search product…', autocomplete: 'off', 'aria-label': 'Search product',
      oninput: (e) => { query = e.target.value; renderList(); },
    });
    const clear = h('button', { type: 'button', class: 'sp-field__clear', 'aria-label': 'Clear', html: ICON.close, onclick: () => { query = ''; value = ''; input.value = ''; renderList(); input.focus(); } });
    const list = h('div', { class: 'sp-options', role: 'listbox', 'aria-label': 'Products' });
    const result = h('div', { class: 'sp-field__value' });
    stage.append(h('div', { class: 'sp-searchdemo' }, [
      h('div', { class: 'sp-field' }, [
        h('span', { class: 'sp-field__label', text: 'Product:' }),
        h('span', { class: 'sp-field__icon', html: ICON.search }),
        input, clear,
      ]),
      list, result,
    ]));

    function renderList() {
      clear.hidden = !query && !value;
      const q = query.trim().toLowerCase();
      const items = OPTIONS.filter((o) => o.toLowerCase().includes(q));
      list.innerHTML = '';
      if (!items.length) {
        list.append(h('div', { class: 'sp-options__empty', text: 'No products found' }));
      }
      items.forEach((o) => {
        let label = escapeHtml(o);
        if (q) {
          const i = o.toLowerCase().indexOf(q);
          label = `<mark>${escapeHtml(o.slice(0, i + q.length))}</mark>${escapeHtml(o.slice(i + q.length))}`;
          if (i > 0) label = `${escapeHtml(o.slice(0, i))}<mark>${escapeHtml(o.slice(i, i + q.length))}</mark>${escapeHtml(o.slice(i + q.length))}`;
        }
        list.append(h('button', {
          type: 'button', role: 'option', class: `sp-options__item${o === value ? ' is-selected' : ''}`,
          'aria-selected': String(o === value), html: label,
          onclick: () => { value = o; query = ''; input.value = o; renderList(); clear.hidden = false; },
        }));
      });
      result.innerHTML = value ? `Selected: <b>${escapeHtml(value)}</b>` : `${OPTIONS.length} products`;
    }
    renderList();
  }

  /* ---------- 7. Color-coded tags ---------- */
  const TAGS = [
    { name: 'Quantity', c: 'green' }, { name: 'Value', c: 'yellow' }, { name: 'A-Z', c: 'red' },
    { name: 'Dimensions', c: 'purple' }, { name: 'Merch Style', c: 'lime' }, { name: 'Item Attribute', c: 'coral' },
  ];
  const TAG_MAX = 4;

  function demoTags(stage) {
    let tags = state.tags || ['Quantity', 'Value', 'A-Z', 'Dimensions'];
    let open = false;
    let warn = false;
    const box = h('div', { class: 'sp-panel sp-tags' });
    stage.append(box);

    function toggle(name) {
      if (tags.includes(name)) tags = tags.filter((t) => t !== name);
      else if (tags.length >= TAG_MAX) { warn = true; render(); setTimeout(() => { warn = false; render(); }, 1600); return; }
      else tags = tags.concat(name);
      save('tags', tags); render();
    }

    function render() {
      box.innerHTML = '';
      const chips = h('div', { class: 'sp-tags__chips' });
      tags.forEach((t) => {
        const def = TAGS.find((x) => x.name === t) || TAGS[0];
        chips.append(h('span', { class: `sp-chip sp-chip--${def.c}` }, [
          t,
          h('button', { type: 'button', 'aria-label': `Remove ${t}`, html: ICON.close, onclick: () => toggle(t) }),
        ]));
      });
      chips.append(h('button', {
        type: 'button', class: 'sp-btn sp-btn--dark sp-btn--icon sp-btn--sq', 'aria-label': 'Add tag', 'aria-expanded': String(open),
        html: ICON.plus, onclick: () => { open = !open; render(); },
      }));
      box.append(
        h('div', { class: 'sp-tags__label', html: `<b>Tags:</b> <span class="${warn ? 'is-warn' : ''}">(max. ${TAG_MAX}${warn ? ' — remove one first' : ''})</span>` }),
        chips,
      );
      if (open) {
        const menu = h('div', { class: 'sp-menu', role: 'listbox', 'aria-label': 'Tags' });
        TAGS.forEach((t) => {
          const on = tags.includes(t.name);
          menu.append(h('button', {
            type: 'button', role: 'option', 'aria-selected': String(on), class: 'sp-menu__item',
            html: `<i class="sp-dot sp-dot--${t.c}"></i><span>${t.name}</span>${on ? ICON.check : ''}`,
            onclick: () => toggle(t.name),
          }));
        });
        box.append(menu);
      }
    }
    render();
  }

  /* ---------- 8. Table with status chips and pagination ---------- */
  const CLASSES = ['SPRAY', 'MOUTHWASH', 'DENTURE CARE', 'TOOTHPASTE', 'FLOSS'];
  const ROWS = Array.from({ length: 40 }, (_, i) => ({
    ranged: (i * 7) % 3 !== 0,
    cls: CLASSES[(i * 3) % CLASSES.length],
    units: 120 + ((i * 97) % 880),
    product: 8 + ((i * 13) % 40),
    store: 104335 + (i % 4) * 11,
  }));
  const PER_PAGE = 5;

  function demoTable(stage) {
    let page = 1;
    const pages = Math.ceil(ROWS.length / PER_PAGE);
    const body = h('tbody');
    const pageInput = h('input', {
      type: 'number', min: '1', max: String(pages), class: 'sp-pager__input', 'aria-label': 'Page number',
      onchange: (e) => go(parseInt(e.target.value, 10)),
      onkeydown: (e) => { if (e.key === 'Enter') go(parseInt(e.target.value, 10)); },
    });
    const nums = h('span', { class: 'sp-pager__nums' });
    const prev = h('button', { type: 'button', class: 'sp-pager__arrow', 'aria-label': 'Previous page', html: ICON.caretLeft, onclick: () => go(page - 1) });
    const next = h('button', { type: 'button', class: 'sp-pager__arrow', 'aria-label': 'Next page', html: ICON.caretRight, onclick: () => go(page + 1) });

    stage.append(h('div', { class: 'sp-panel sp-table' }, [
      h('div', { class: 'sp-table__scroll' }, [
        h('table', null, [
          h('thead', null, [h('tr', null, ['Status', 'Class', 'Units', 'Product', 'Store ID'].map((t) => h('th', { text: t })))]),
          body,
        ]),
      ]),
      h('div', { class: 'sp-pager' }, [
        h('span', { class: 'sp-pager__label', text: 'Page:' }), pageInput, h('span', { text: `/ ${pages}` }),
        h('span', { class: 'sp-pager__sep' }), prev, nums, next,
      ]),
    ]));

    function go(p) {
      if (Number.isNaN(p)) return;
      page = Math.max(1, Math.min(pages, p));
      render();
    }

    function render() {
      body.innerHTML = '';
      ROWS.slice((page - 1) * PER_PAGE, page * PER_PAGE).forEach((r) => {
        body.append(h('tr', null, [
          h('td', null, [h('span', { class: `sp-status${r.ranged ? ' is-ok' : ''}`, text: r.ranged ? 'Ranged' : 'Unranged' })]),
          h('td', null, [h('span', { class: `sp-class sp-class--${CLASSES.indexOf(r.cls)}`, text: r.cls })]),
          h('td', { text: String(r.units) }),
          h('td', { text: String(r.product) }),
          h('td', { text: String(r.store) }),
        ]));
      });
      pageInput.value = String(page);
      prev.disabled = page === 1;
      next.disabled = page === pages;
      nums.innerHTML = '';
      const show = [1, 2, page - 1, page, page + 1, pages].filter((n, i, a) => n >= 1 && n <= pages && a.indexOf(n) === i).sort((a, b) => a - b);
      show.forEach((n, i) => {
        if (i && n - show[i - 1] > 1) nums.append(h('span', { class: 'sp-pager__gap', text: '…' }));
        nums.append(h('button', {
          type: 'button', class: `sp-pager__num${n === page ? ' is-active' : ''}`, text: String(n),
          'aria-current': n === page ? 'page' : null, onclick: () => go(n),
        }));
      });
    }
    render();
  }

  /* ---------- 9. Finalization progress ---------- */
  function demoProgress(stage) {
    let pct = 0;
    let timer = null;
    const bar = h('span', { class: 'sp-progress__fill' });
    const pctEl = h('span', { class: 'sp-progress__pct', text: '0%' });
    const label = h('span', { class: 'sp-progress__status', text: 'POG 1234 · ready to finalize' });
    const openAll = h('button', { type: 'button', class: 'sp-link sp-link--green', text: 'Open All ↗', disabled: true });
    const run = h('button', { type: 'button', class: 'sp-btn sp-btn--dark', text: 'Finalize', onclick: start });
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    stage.append(h('div', { class: 'sp-panel sp-progress' }, [
      h('div', { class: 'sp-progress__head' }, [h('strong', { text: 'Finalization Progress' }), openAll]),
      label,
      h('div', { class: 'sp-progress__row' }, [h('span', { class: 'sp-progress__track', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100' }, [bar]), pctEl]),
      run,
    ]));

    const STAGES = ['Checking dimensions…', 'Validating shelf heights…', 'Calculating facings…', 'Generating PDF…'];

    function paint() {
      bar.style.width = `${pct}%`;
      pctEl.textContent = `${Math.round(pct)}%`;
      bar.parentElement.setAttribute('aria-valuenow', String(Math.round(pct)));
    }

    function start() {
      if (timer) return;
      pct = 0; openAll.disabled = true; run.disabled = true; run.textContent = 'Finalizing…';
      if (reduce) { pct = 100; finish(); return; }
      timer = setInterval(() => {
        pct = Math.min(100, pct + 2 + Math.random() * 4);
        label.textContent = STAGES[Math.min(STAGES.length - 1, Math.floor(pct / 25))];
        paint();
        if (pct >= 100) finish();
      }, 70);
    }

    function finish() {
      clearInterval(timer); timer = null; pct = 100; paint();
      label.innerHTML = `${ICON.check} 12 planograms finalized`;
      label.classList.add('is-done');
      openAll.disabled = false;
      run.disabled = false; run.textContent = 'Run again';
    }
    paint();
  }

  /* ---------- 10. Drag & drop CSV import ---------- */
  function demoUpload(stage) {
    const input = h('input', { type: 'file', accept: '.csv,text/csv', class: 'visually-hidden', 'aria-label': 'Choose a CSV file' });
    const zone = h('label', { class: 'sp-drop', tabindex: '0' });
    zone.append(input);
    const body = h('div', { class: 'sp-drop__body' });
    zone.append(body);
    stage.append(zone);

    function idle() {
      zone.className = 'sp-drop';
      body.innerHTML = `<span class="sp-drop__icon">${ICON.file}</span><b>Drag your Product Master file here to load it</b><small>or click to choose · CSV file</small>`;
    }

    function handle(file) {
      if (!file) return;
      const ok = /\.csv$/i.test(file.name);
      const kb = Math.max(1, Math.round(file.size / 1024));
      zone.className = `sp-drop ${ok ? 'is-ok' : 'is-error'}`;
      body.innerHTML = '';
      body.append(
        h('span', { class: 'sp-drop__icon', html: ICON.file }),
        h('b', { text: file.name }),
        h('small', { text: ok ? `${kb} KB · ready to import` : 'You are trying to use an invalid file format. Please upload a .csv file.' }),
        h('button', {
          type: 'button', class: 'sp-link', text: ok ? 'Remove' : 'Try again',
          onclick: (e) => { e.preventDefault(); input.value = ''; idle(); },
        }),
      );
    }

    input.addEventListener('change', () => handle(input.files && input.files[0]));
    zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    ['dragenter', 'dragover'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.remove('is-over'); }));
    zone.addEventListener('drop', (e) => handle(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]));
    idle();
  }

  const DEMOS = {
    item: demoItem, tip: demoTip, filter: demoFilter, errors: demoErrors, inline: demoInline,
    search: demoSearch, tags: demoTags, table: demoTable, progress: demoProgress, upload: demoUpload,
  };

  function mountAll() {
    document.querySelectorAll('[data-demo]').forEach((fig) => {
      const stage = fig.querySelector('.sp-stage');
      const fn = DEMOS[fig.getAttribute('data-demo')];
      if (!stage || !fn) return;
      stage.innerHTML = '';
      try { fn(stage); } catch (e) { console.error('demo failed', e); }
    });
  }

  function init() {
    mountAll();
    const reset = document.querySelector('[data-demo-reset]');
    if (reset) {
      reset.addEventListener('click', () => {
        state = {};
        try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
        mountAll();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
