/* ===================================================
   MuteGuard — Main JavaScript
   =================================================== */

(function () {
  'use strict';

  /* ── Navbar scroll state ── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile nav toggle ── */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
  });
  // Close mobile nav on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
    });
  });

  /* ── Scroll reveal ── */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ── Active nav link on scroll ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach(s => sectionObserver.observe(s));

  /* ── Status strip duplication for infinite marquee ── */
  const stripInner = document.querySelector('.status-strip-inner');
  if (stripInner) {
    // Clone the items INSIDE the strip (not the strip itself) so one
    // animated element holds 2× items and translateX(-50%) loops cleanly.
    Array.from(stripInner.children).forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      stripInner.appendChild(clone);
    });
  }

  /* ── Copy download link / show toast ── */
  function showToast(msg, type = 'success') {
    const container = document.getElementById('toast');
    const toast = document.createElement('div');
    toast.style.cssText = `
      display:flex;align-items:center;gap:10px;
      padding:14px 20px;
      background:${type === 'success' ? '#238636' : '#7d2025'};
      color:#fff;
      border-radius:10px;
      font-size:0.875rem;
      font-weight:600;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
      pointer-events:auto;
      animation: fadeIn 0.3s ease;
    `;
    toast.innerHTML = `<span>${type === 'success' ? '✔' : '✖'}</span> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 350);
    }, 3000);
  }

  /* ── Download button click tracking ── */
  document.querySelectorAll('[data-download]').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Redirecting to GitHub Releases…');
    });
  });

  /* ── Smooth anchor scroll (offset for fixed nav) ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Feature card hover particle effect (lightweight) ── */
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', function (e) {
      this.style.setProperty('--mouse-x', e.offsetX + 'px');
      this.style.setProperty('--mouse-y', e.offsetY + 'px');
    });
    card.addEventListener('mousemove', function (e) {
      this.style.setProperty('--mouse-x', e.offsetX + 'px');
      this.style.setProperty('--mouse-y', e.offsetY + 'px');
    });
  });

  /* ── Keyboard shortcut demo interaction ── */
  const kbdKeys = document.querySelectorAll('kbd');
  document.addEventListener('keydown', (e) => {
    // Highlight Win+Alt+M
    if (e.altKey && e.key === 'm') {
      pulseShortcut('mic-shortcut');
    }
    // Highlight Win+Alt+S
    if (e.altKey && e.key === 's') {
      pulseShortcut('speaker-shortcut');
    }
  });
  function pulseShortcut(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 600);
  }

  /* ── Year in footer ── */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Hero version fetch from GitHub Releases (graceful fallback) ── */
  const versionEl = document.getElementById('version-tag');
  if (versionEl) {
    fetch('https://api.github.com/repos/xionraj/MuteGuard/releases/latest', {
      headers: { Accept: 'application/vnd.github.v3+json' }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.tag_name) {
          versionEl.textContent = data.tag_name;
          // Update download link
          const dlBtn = document.getElementById('btn-download-main');
          if (dlBtn && data.assets && data.assets.length > 0) {
            dlBtn.href = data.assets[0].browser_download_url;
          } else if (dlBtn) {
            dlBtn.href = data.html_url;
          }
        }
      })
      .catch(() => { /* keep static fallback */ });
  }

})();
