// Page loader (running greyhound)
const pageLoader = document.getElementById('pageLoader');
document.documentElement.classList.add('is-loading');

function hidePageLoader() {
  pageLoader.classList.add('is-hidden');
  document.documentElement.classList.remove('is-loading');
}

const loaderMinTime = new Promise((resolve) => setTimeout(resolve, 700));
const pageLoaded = new Promise((resolve) => {
  if (document.readyState === 'complete') {
    resolve();
  } else {
    window.addEventListener('load', resolve, { once: true });
  }
});

Promise.all([loaderMinTime, pageLoaded]).then(hidePageLoader);

// Sticky header shrink + scroll progress bar
const header = document.getElementById('siteHeader');
const progressBar = document.getElementById('progressBar');
const backToTop = document.getElementById('backToTop');

function onScroll() {
  const scrollY = window.scrollY;
  header.classList.toggle('scrolled', scrollY > 40);
  backToTop.classList.toggle('visible', scrollY > 600);

  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
  progressBar.style.width = progress + '%';
}

document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll-reveal animations
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0, rootMargin: '0px 0px -10% 0px' }
);

revealEls.forEach((el) => revealObserver.observe(el));

// Animated stat counters
const statEls = document.querySelectorAll('.stat-number');

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

statEls.forEach((el) => statObserver.observe(el));

// Contact form (placeholder submit handler — wire up to a real backend/service before launch)
const quoteForm = document.getElementById('quoteForm');

quoteForm.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('This form is a placeholder. Connect it to email, Formspree, or your CRM to start receiving real requests.');
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
