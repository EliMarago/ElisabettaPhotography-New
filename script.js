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
   FEATURED CAROUSEL – filmstrip infinite scroll
───────────────────────────────────────────── */
(function () {
  const track       = document.querySelector('.carousel-track');
  const viewport    = document.querySelector('.carousel-slides');
  const prevBtn     = document.querySelector('.carousel-control.prev');
  const nextBtn     = document.querySelector('.carousel-control.next');
  const progressBar = document.querySelector('.carousel-progress-bar');
  const dotsWrap    = document.querySelector('.carousel-dots');

  if (!track || !viewport) return;

  // Hide dots (not meaningful for filmstrip)
  if (dotsWrap) dotsWrap.hidden = true;

  const INTERVAL = 3500;
  let isPaused    = false;
  let autoTimer   = null;
  let offset      = 0;
  let touchStartX = 0;
  let originalW   = 0; // width of original cards (before clone)

  // ── Clone cards for seamless infinite loop
  function setupClones() {
    const originals = [...track.children];
    // Capture width before cloning
    originalW = track.scrollWidth;
    originals.forEach(c => track.appendChild(c.cloneNode(true)));
  }

  // ── How many px to scroll per step
  function step() {
    return Math.max(180, viewport.clientWidth * 0.5);
  }

  // ── Move track to given offset (px), with optional seamless loop reset
  function scrollTo(newOffset, resetTimer = true) {
    offset = newOffset;
    track.style.transform = `translateX(-${offset}px)`;
    if (resetTimer) restartAutoplay();
  }

  // After each CSS transition, snap back if we've gone past the clone boundary
  track.addEventListener('transitionend', () => {
    if (!originalW) return;
    if (offset >= originalW) {
      track.style.transition = 'none';
      offset -= originalW;
      track.style.transform = `translateX(-${offset}px)`;
      void track.offsetWidth; // force reflow
      track.style.transition = '';
    } else if (offset < 0) {
      track.style.transition = 'none';
      offset += originalW;
      track.style.transform = `translateX(-${offset}px)`;
      void track.offsetWidth;
      track.style.transition = '';
    }
  });

  // ── Progress bar
  function startBar() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${INTERVAL}ms linear`;
    progressBar.style.width = '100%';
  }

  function stopBar() {
    if (!progressBar) return;
    const w = getComputedStyle(progressBar).width;
    progressBar.style.transition = 'none';
    progressBar.style.width = w;
  }

  function restartAutoplay() {
    clearInterval(autoTimer);
    if (isPaused) return;
    startBar();
    autoTimer = setInterval(() => scrollTo(offset + step(), false), INTERVAL);
  }

  function pause()  { isPaused = true;  clearInterval(autoTimer); stopBar(); }
  function resume() { isPaused = false; restartAutoplay(); }

  // ── Buttons
  prevBtn && prevBtn.addEventListener('click', () => scrollTo(offset - step()));
  nextBtn && nextBtn.addEventListener('click', () => scrollTo(offset + step()));

  // ── Hover pause
  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resume);

  // ── Touch / swipe
  viewport.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    pause();
  }, { passive: true });

  viewport.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) scrollTo(offset + (diff > 0 ? step() : -step()));
    resume();
  }, { passive: true });

  // ── Resize: recalculate (offset keeps position, originalW recalculates)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Recalculate originalW based on half of total track width
      originalW = track.scrollWidth / 2;
      scrollTo(offset, false);
    }, 150);
  });

  // ── Init: wait for images so widths are accurate
  function init() {
    setupClones();
    scrollTo(0);
  }

  const imgs = track.querySelectorAll('img');
  let loaded = 0;
  if (imgs.length === 0) {
    init();
  } else {
    function checkDone() { if (++loaded >= imgs.length) init(); }
    imgs.forEach(img => img.complete ? checkDone() : img.addEventListener('load', checkDone));
    setTimeout(init, 800); // fallback
  }
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

form.addEventListener('submit', async (e) => {
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

  try {
    const formData = new FormData(form);
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    });

    if (res.ok) {
      form.reset();
      showToast('Messaggio inviato!', 'Ti risponderò al più presto.', 'success');
    } else {
      showToast('Errore nell\'invio', 'Riprova tra qualche istante.', 'error');
    }
  } catch {
    showToast('Errore di rete', 'Controlla la connessione e riprova.', 'error');
  } finally {
    btnSend.disabled = false;
    btnText.textContent = 'Invia messaggio';
  }
});
