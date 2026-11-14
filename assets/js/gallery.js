/* VU18 Design Gallery: filters, search, section jump and a lightbox with previous / next.
   Loaded on projects/vu18-gallery.html only, after main.js. Works without it: every card is
   visible, details open natively, and each picture links to its full-size file. */
(() => {
  const root = document.querySelector('[data-gallery]');
  if (!root) return;

  const entries = [...root.querySelectorAll('.gal-entry')];
  const sections = [...root.querySelectorAll('.gal-section')];
  const toolbar = document.querySelector('.gal-toolbar');
  const countEl = toolbar?.querySelector('.gal-count');
  const search = toolbar?.querySelector('.gal-search');
  const jump = toolbar?.querySelector('.gal-jump');
  const toggle = toolbar?.querySelector('.gal-toolbar-toggle');
  const state = { status: 'all', verdict: 'all', q: '' };

  // Status chips match each card's group: "now" is the current version, the leads and live candidates;
  // "old" is superseded and dropped versions and alternatives that were passed over
  const STATUS = {
    all: () => true,
    now: (g) => g === 'now',
    old: (g) => g === 'old',
  };

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Search text: the card's own words (title, date, badges, numbers, caption, details) plus its part name
  entries.forEach((el) => {
    const part = el.closest('.gal-section')?.querySelector('.section-title')?.textContent || '';
    el.dataset.search = norm(`${el.textContent} ${part}`).replace(/\s+/g, ' ');
  });

  function apply() {
    const words = norm(state.q).split(/\s+/).filter(Boolean);
    let shown = 0;
    entries.forEach((el) => {
      const ok = STATUS[state.status](el.dataset.group)
        && (state.verdict === 'all' || el.dataset.verdict === state.verdict)
        && words.every((w) => el.dataset.search.includes(w));
      el.hidden = !ok;
      if (ok) shown += 1;
    });
    sections.forEach((sec) => {
      const visible = sec.querySelectorAll('.gal-entry:not([hidden])').length;
      const total = sec.querySelectorAll('.gal-entry').length;
      const empty = sec.querySelector('.gal-empty');
      const filtered = state.status !== 'all' || state.verdict !== 'all' || words.length;
      if (empty) empty.hidden = visible > 0;
      sec.classList.toggle('is-empty', visible === 0 && filtered);
      const c = sec.querySelector('[data-section-count]');
      if (c) c.textContent = visible === total ? `${total} iteration${total === 1 ? '' : 's'}` : `Showing ${visible} of ${total}`;
    });
    if (countEl) countEl.textContent = shown === entries.length ? `${entries.length} iterations` : `${shown} of ${entries.length} shown`;
  }

  toolbar?.querySelectorAll('[data-filter]').forEach((group) => {
    const key = group.dataset.filter;
    group.querySelectorAll('.gal-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        group.querySelectorAll('.gal-chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        state[key] = chip.dataset.value;
        apply();
      });
    });
  });

  let t;
  search?.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = search.value; apply(); }, 120);
  });

  jump?.addEventListener('change', () => {
    const target = document.getElementById(jump.value);
    if (target) target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    jump.selectedIndex = 0;
  });

  toggle?.addEventListener('click', () => {
    const open = toolbar.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Keep the scroll offset right under the sticky header + filter bar
  const setBarHeight = () => {
    if (toolbar) document.documentElement.style.setProperty('--gal-toolbar-h', `${toolbar.offsetHeight}px`);
  };
  setBarHeight();
  window.addEventListener('resize', setBarHeight);
  if (toolbar && 'ResizeObserver' in window) new ResizeObserver(setBarHeight).observe(toolbar);

  apply();

  /* ---------- Lightbox: steps through every picture of the cards now shown ---------- */
  if (typeof HTMLDialogElement !== 'function') return;
  const icon = (d) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox gal-lightbox';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML = `
    <span class="gal-lb-count" aria-live="polite"></span>
    <button type="button" class="lightbox-close" aria-label="Close image viewer">${icon('M18 6 6 18M6 6l12 12')}</button>
    <button type="button" class="gal-lb-btn gal-lb-prev" aria-label="Previous picture">${icon('m15 6-6 6 6 6')}</button>
    <button type="button" class="gal-lb-btn gal-lb-next" aria-label="Next picture">${icon('m9 6 6 6-6 6')}</button>
    <figure class="lightbox-figure"><img alt=""><figcaption><strong></strong><span></span></figcaption></figure>`;
  document.body.appendChild(dialog);

  const dImg = dialog.querySelector('img');
  const dTitle = dialog.querySelector('figcaption strong');
  const dCap = dialog.querySelector('figcaption span');
  const dCount = dialog.querySelector('.gal-lb-count');
  let list = [];
  let idx = 0;
  let opener = null;

  const visibleLinks = () => [...root.querySelectorAll('.gal-entry:not([hidden]) [data-full]')];

  function show(i) {
    idx = (i + list.length) % list.length;
    const a = list[idx];
    const img = a.querySelector('img');
    dImg.src = a.getAttribute('href');
    dImg.alt = img ? img.alt : '';
    dTitle.textContent = a.dataset.title || '';
    dCap.textContent = a.dataset.caption || '';
    dCount.textContent = `${idx + 1} / ${list.length}`;
    const n = list[(idx + 1) % list.length];
    if (n) { const pre = new Image(); pre.src = n.getAttribute('href'); }
  }

  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-full]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    opener = a;
    list = visibleLinks();
    show(Math.max(0, list.indexOf(a)));
    dialog.showModal();
  });

  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.gal-lb-prev').addEventListener('click', () => show(idx - 1));
  dialog.querySelector('.gal-lb-next').addEventListener('click', () => show(idx + 1));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1); }
  });
  dialog.addEventListener('close', () => { dImg.removeAttribute('src'); opener?.focus(); });

  // Swipe left / right on touch screens
  let x0 = null;
  dialog.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
  dialog.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
  });
})();
