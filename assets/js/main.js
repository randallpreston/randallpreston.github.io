/* Randall Preston — portfolio interactions
   Everything here is progressive enhancement: the site works without JS. */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1024px)');

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuToggle.focus();
    }
  });

  desktop.addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Projects dropdown (click, keyboard and hover) ---------- */
  document.querySelectorAll('[data-dropdown]').forEach((dd) => {
    const btn = dd.querySelector('.dropdown-toggle');
    let closeTimer;

    const setOpen = (open) => {
      clearTimeout(closeTimer);
      btn.setAttribute('aria-expanded', String(open));
      dd.classList.toggle('is-open', open);
    };

    btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));

    dd.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setOpen(true); });
    dd.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') closeTimer = setTimeout(() => setOpen(false), 180);
    });

    dd.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dd.classList.contains('is-open')) {
        e.stopPropagation();
        setOpen(false);
        btn.focus();
      }
    });

    dd.addEventListener('focusout', (e) => {
      if (!dd.contains(e.relatedTarget)) setOpen(false);
    });

    document.addEventListener('click', (e) => {
      if (!dd.contains(e.target)) setOpen(false);
    });
  });

  /* ---------- Highlight the nav item for the section in view (home page) ---------- */
  const navLinks = [...document.querySelectorAll('.nav-list a[href^="#"]')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    root.classList.add('reveal-ready');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Lightbox for project photos ---------- */
  const zoomImages = document.querySelectorAll('[data-zoom] img');
  if (zoomImages.length && typeof HTMLDialogElement === 'function') {
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Image viewer');
    dialog.innerHTML = `
      <button type="button" class="lightbox-close" aria-label="Close image viewer">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
      <figure class="lightbox-figure"><img alt=""><figcaption></figcaption></figure>`;
    document.body.appendChild(dialog);

    const dImg = dialog.querySelector('img');
    const dCap = dialog.querySelector('figcaption');
    let opener = null;

    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      dImg.removeAttribute('src');
      opener?.focus();
    });

    zoomImages.forEach((img) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'zoom-btn';
      btn.setAttribute('aria-label', `Enlarge image: ${img.alt}`);
      img.replaceWith(btn);
      btn.appendChild(img);
      btn.insertAdjacentHTML('beforeend',
        '<span class="zoom-icon" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>');

      btn.addEventListener('click', () => {
        opener = btn;
        dImg.src = img.dataset.full || img.currentSrc || img.src;
        dImg.alt = img.alt;
        const caption = img.closest('figure')?.querySelector('figcaption');
        dCap.textContent = caption ? caption.textContent.trim() : '';
        dCap.hidden = !caption;
        dialog.showModal();
      });
    });
  }

  /* ---------- Multi-photo posts: swipe on touch, arrows + dots everywhere ---------- */
  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const slides = [...track.children];
    if (slides.length < 2) return;

    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    });

    const chevron = (d) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
    carousel.insertAdjacentHTML('beforeend', `
      <button type="button" class="carousel-btn carousel-prev" aria-label="Previous photo">${chevron('m15 6-6 6 6 6')}</button>
      <button type="button" class="carousel-btn carousel-next" aria-label="Next photo">${chevron('m9 6 6 6-6 6')}</button>
      <span class="carousel-count" aria-hidden="true"></span>
      <div class="carousel-dots" aria-hidden="true">${slides.map(() => '<span></span>').join('')}</div>`);

    const prev = carousel.querySelector('.carousel-prev');
    const next = carousel.querySelector('.carousel-next');
    const count = carousel.querySelector('.carousel-count');
    const dots = [...carousel.querySelectorAll('.carousel-dots span')];
    let index = 0;

    const update = () => {
      index = Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));
      count.textContent = `${index + 1}/${slides.length}`;
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
      prev.disabled = index === 0;
      next.disabled = index === slides.length - 1;
    };

    const go = (i) => track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => go(index - 1));
    next.addEventListener('click', () => go(index + 1));

    let frame;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', () => track.scrollTo({ left: index * track.clientWidth }));
    update();
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
})();
