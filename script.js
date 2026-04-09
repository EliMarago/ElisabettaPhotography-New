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

const carouselTrack = document.querySelector('.carousel-track');
const carouselCards = document.querySelectorAll('.carousel-card');
const prevCarouselBtn = document.querySelector('.carousel-control.prev');
const nextCarouselBtn = document.querySelector('.carousel-control.next');
const carouselSlides = document.querySelector('.carousel-slides');
let carouselIndex = 0;
let carouselTimer;
let touchStartX = 0;
let touchEndX = 0;

function updateCarousel() {
  if (!carouselTrack) return;
  carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
}

function nextCarousel() {
  carouselIndex = (carouselIndex + 1) % carouselCards.length;
  updateCarousel();
}

function prevCarousel() {
  carouselIndex = (carouselIndex - 1 + carouselCards.length) % carouselCards.length;
  updateCarousel();
}

function startCarouselTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(nextCarousel, 5000);
}

function stopCarouselTimer() {
  clearInterval(carouselTimer);
}

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
  stopCarouselTimer();
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
  startCarouselTimer();
}

function handleSwipe() {
  const swipeThreshold = 50; // minimum distance for swipe
  const swipeDistance = touchStartX - touchEndX;

  if (Math.abs(swipeDistance) > swipeThreshold) {
    if (swipeDistance > 0) {
      nextCarousel(); // swipe left -> next
    } else {
      prevCarousel(); // swipe right -> prev
    }
  }
}

if (prevCarouselBtn && nextCarouselBtn && carouselCards.length > 0) {
  prevCarouselBtn.addEventListener('click', () => { prevCarousel(); startCarouselTimer(); });
  nextCarouselBtn.addEventListener('click', () => { nextCarousel(); startCarouselTimer(); });
  startCarouselTimer();
}

// Add touch support for mobile
if (carouselSlides) {
  carouselSlides.addEventListener('touchstart', handleTouchStart, { passive: true });
  carouselSlides.addEventListener('touchend', handleTouchEnd, { passive: true });
}

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
