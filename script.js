/* ─────────────────────────────────────────────
   NAVBAR – scroll glass + hamburger
───────────────────────────────────────────── */
const navbar   = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMobile = document.getElementById('nav-mobile');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
  const open = navToggle.classList.toggle('open');
  navMobile.classList.toggle('open', open);
});

// Close mobile menu on link click
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMobile.classList.remove('open');
  });
});

/* ─────────────────────────────────────────────
   HERO SLIDESHOW
───────────────────────────────────────────── */
const slides = document.querySelectorAll('.hero-slide');
const dots   = document.querySelectorAll('.hero-dot');
let current  = 0;
let timer;

function goTo(index) {
  slides[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = (index + slides.length) % slides.length;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => goTo(current + 1), 5000);
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => { goTo(i); startTimer(); });
});

// Init
slides[0].classList.add('active');
dots[0].classList.add('active');
startTimer();

/* ─────────────────────────────────────────────
   FEATURED CAROUSEL
───────────────────────────────────────────── */
(function () {
  const track       = document.querySelector('.carousel-track');
  const cards       = document.querySelectorAll('.carousel-card');
  const prevBtn     = document.querySelector('.carousel-control.prev');
  const nextBtn     = document.querySelector('.carousel-control.next');
  const viewport    = document.querySelector('.carousel-slides');
  const dotsWrap    = document.querySelector('.carousel-dots');
  const progressBar = document.querySelector('.carousel-progress-bar');

  if (!track || cards.length === 0) return;

  const AUTOPLAY_INTERVAL = 4000; // ms
  let currentIndex = 0;
  let autoplayTimer = null;
  let progressTimer = null;
  let touchStartX = 0;
  let isPaused = false;

  // ── Build dots ──────────────────────────────
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(dot);
    });
  }

  function getDots() {
    return dotsWrap ? dotsWrap.querySelectorAll('.carousel-dot') : [];
  }

  // ── Core: move to slide i ──────────────────
  function goTo(i, resetTimer = true) {
    currentIndex = (i + cards.length) % cards.length;

    // Precise offset: use actual card width (no gap artefacts)
    const cardWidth = cards[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

    // Update dots
    const dots = getDots();
    dots.forEach((d, idx) => d.classList.toggle('active', idx === currentIndex));

    if (resetTimer) restartAutoplay();
  }

  // ── Autoplay + progress bar ────────────────
  function startProgressBar() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    // Force reflow
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${AUTOPLAY_INTERVAL}ms linear`;
    progressBar.style.width = '100%';
  }

  function stopProgressBar() {
    if (!progressBar) return;
    const computed = getComputedStyle(progressBar).width;
    progressBar.style.transition = 'none';
    progressBar.style.width = computed;
  }

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    if (isPaused) return;
    startProgressBar();
    autoplayTimer = setInterval(() => goTo(currentIndex + 1, false), AUTOPLAY_INTERVAL);
  }

  function pauseAutoplay() {
    isPaused = true;
    clearInterval(autoplayTimer);
    stopProgressBar();
  }

  function resumeAutoplay() {
    isPaused = false;
    restartAutoplay();
  }

  // ── Controls ───────────────────────────────
  prevBtn && prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // Pause on hover
  if (viewport) {
    viewport.addEventListener('mouseenter', pauseAutoplay);
    viewport.addEventListener('mouseleave', resumeAutoplay);
  }

  // ── Touch / swipe ──────────────────────────
  if (viewport) {
    viewport.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      pauseAutoplay();
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? currentIndex + 1 : currentIndex - 1);
      }
      resumeAutoplay();
    }, { passive: true });
  }

  // ── Recalculate on resize (debounced) ───────
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => goTo(currentIndex, false), 150);
  });

  // ── Init ───────────────────────────────────
  goTo(0);
})();

/* ─────────────────────────────────────────────
   SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────────── */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings inside same parent
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const delay = siblings.indexOf(entry.target) * 100;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

/* ─────────────────────────────────────────────
   TOAST NOTIFICATIONS
───────────────────────────────────────────── */
function showToast(title, desc = '', type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-title">${title}</div>${desc ? `<div class="toast-desc">${desc}</div>` : ''}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

/* ─────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────── */
const form    = document.getElementById('contact-form');
const btnText = document.getElementById('btn-text');
const btnSend = document.getElementById('btn-send');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    showToast('Compila tutti i campi', '', 'error');
    return;
  }

  btnSend.disabled = true;
  btnText.textContent = 'Invio in corso…';

  setTimeout(() => {
    btnSend.disabled = false;
    btnText.textContent = 'Invia messaggio';
    form.reset();
    showToast('Messaggio inviato!', 'Ti risponderò al più presto.', 'success');
  }, 1200);
});
