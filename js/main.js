/*
  main.js — handles hero modal (lazy YouTube), focus trap, smooth scrolling,
  quick lead & booking form (AJAX to form-handler.php), date min, toast messages.
*/

/* Utility functions */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const isJsonRequest = (headers) => (headers && headers['content-type'] && headers['content-type'].includes('application/json'));

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  t.setAttribute('aria-hidden', 'false');
  setTimeout(() => { t.style.display = 'none'; t.setAttribute('aria-hidden', 'true'); }, 3500);
}

/* Focusable helpers for trap */
function getFocusable(container) {
  return Array.from(container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
}

/* Smooth scroll for anchor links */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // focus first input in the form if present
          const fi = target.querySelector('input, textarea, select, button');
          if (fi) setTimeout(() => fi.focus(), 600);
        }
      }
    });
  });
}

/* Watch video modal (lazy-loaded YouTube iframe) */
function initVideoModal() {
  const watchButtons = Array.from(document.querySelectorAll('#watchVideoBtn, #calloutWatch, #videoThumbPlay'));
  const modal = document.getElementById('videoModal');
  const container = document.getElementById('modalVideoContainer');
  let lastFocus = null;

  function openModal(youtubeId, triggerEl) {
    if (!youtubeId || youtubeId === 'YOUTUBE_VIDEO_ID') {
      alert('Please set the YouTube video ID in the button data attribute.');
      return;
    }
    lastFocus = triggerEl || document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
    container.innerHTML = `<iframe width="100%" height="100%" src="${src}" title="Soulful Kitchen video" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    const closeBtn = modal.querySelector('[data-close]');
    if (closeBtn) closeBtn.focus();
    document.addEventListener('keydown', onKey);
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    container.innerHTML = '';
    if (lastFocus) lastFocus.focus();
    document.removeEventListener('keydown', onKey);
  }

  function onKey(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      const focusable = getFocusable(modal);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  watchButtons.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.youtubeId || btn.getAttribute('data-youtube-id') || btn.dataset.youtubeId;
      openModal(id, btn);
    });
  });

  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  modal.querySelector('.modal__backdrop').addEventListener('click', closeModal);
}

/* Quick lead & booking forms */
function initForms() {
  // helpers
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function postJson(url, payload) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json().catch(() => ({ ok: true }));
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // Quick lead
  const quickForm = document.getElementById('quickLeadForm');
  const quickSubmit = document.getElementById('leadSubmit');

  if (quickForm) {
    quickForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      quickSubmit.disabled = true;
      quickSubmit.textContent = 'Sending...';

      const payload = {
        name: document.getElementById('leadName').value.trim(),
        phone: document.getElementById('leadPhone').value.trim(),
        email: document.getElementById('leadEmail').value.trim(),
        date: document.getElementById('leadDate').value,
        guests: document.getElementById('leadGuests').value,
        source: 'Hero Quick Lead'
      };

      if (!payload.name || !payload.phone || !payload.email) {
        alert('Please fill name, phone, and email.');
        quickSubmit.disabled = false;
        quickSubmit.textContent = 'Get a proposal';
        return;
      }
      if (!validateEmail(payload.email)) {
        alert('Please enter a valid email.');
        quickSubmit.disabled = false;
        quickSubmit.textContent = 'Get a proposal';
        return;
      }

      const res = await postJson('form-handler.php', payload);
      if (res && res.ok) {
        showToast('Thanks! We’ll reach out shortly.');
        quickForm.reset();
      } else {
        alert('Error sending: ' + (res.error || 'Try again'));
      }

      quickSubmit.disabled = false;
      quickSubmit.textContent = 'Get a proposal';
    });
  }

  // Booking form
  const bookForm = document.getElementById('bookForm');
  const submitBtn = document.getElementById('submitBtn');
  if (bookForm) {
    bookForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      const fd = new FormData(bookForm);
      const payload = {};
      fd.forEach((v, k) => payload[k] = v);
      payload.source = 'Website Booking Form';

      if (!payload.name || !payload.email || !payload.phone) {
        alert('Please fill name, email and phone.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send request';
        return;
      }
      if (!validateEmail(payload.email)) {
        alert('Please enter a valid email.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send request';
        return;
      }

      const res = await postJson('form-handler.php', payload);
      if (res && res.ok) {
        showToast('Request sent — we’ll be in touch.');
        bookForm.reset();
      } else {
        alert('Error sending request: ' + (res.error || 'Try again'));
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Send request';
    });
  }
}

/* Date min for date inputs */
function initDateMin() {
  const today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(i => i.setAttribute('min', today));
}

/* Hero text animation (simple) */
function initHeroAnim() {
  const title = document.querySelector('.hero__title');
  if (!title) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  title.style.opacity = 0;
  title.style.transform = 'translateY(12px)';
  setTimeout(() => {
    title.style.transition = 'opacity 700ms ease, transform 700ms ease';
    title.style.opacity = 1;
    title.style.transform = 'translateY(0)';
  }, 200);
}

/* Video mobile behavior */
function initVideoMobile() {
  const vid = document.getElementById('heroVideo');
  if (!vid) return;
  function check() {
    if (window.innerWidth <= 640) {
      try { vid.pause(); } catch (e) {}
      vid.style.display = 'none';
    } else {
      vid.style.display = '';
      // try to play (autoplay policies should allow muted autoplay)
      vid.play().catch(()=>{});
    }
  }
  check();
  window.addEventListener('resize', check);
}

/* Init everything */
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initVideoModal();
  initForms();
  initDateMin();
  initHeroAnim();
  initVideoMobile();
});
