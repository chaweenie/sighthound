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

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

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

// Project gallery + modal
const CATEGORY_LABEL = { home: 'Home', apartment: 'Apartment', commercial: 'Commercial' };
const CATEGORY_CLASS = { home: 'residential', apartment: 'residential', commercial: 'commercial' };
const SCOPE_LABEL = { renovation: 'Renovation', build: 'New Build' };

const galleryGrid = document.getElementById('galleryGrid');
const galleryFilters = document.getElementById('galleryFilters');

// Images with "before"/"after" in the filename are paired into one before/after
// slide instead of appearing as separate carousel photos.
function buildSlides(images) {
  const used = new Array(images.length).fill(false);
  const slides = [];

  images.forEach((image, i) => {
    if (used[i]) return;
    const name = image.toLowerCase();

    if (name.includes('before')) {
      const afterIndex = images.findIndex((img, j) => !used[j] && img.toLowerCase().includes('after'));
      if (afterIndex !== -1) {
        slides.push({ type: 'before-after', before: image, after: images[afterIndex] });
        used[i] = true;
        used[afterIndex] = true;
        return;
      }
    }

    slides.push({ type: 'single', src: image });
    used[i] = true;
  });

  return slides;
}

function getSlides(project) {
  if (!project.slides) project.slides = buildSlides(project.images);
  return project.slides;
}

function imagePath(project, filename) {
  return `${project.folder}/${filename}`;
}

function coverImagePath(project) {
  const firstSlide = getSlides(project)[0];
  return imagePath(project, firstSlide.type === 'before-after' ? firstSlide.after : firstSlide.src);
}

function renderGallery(filter) {
  galleryGrid.innerHTML = '';

  const filtered = (typeof PROJECTS !== 'undefined' ? PROJECTS : []).filter((project) => {
    if (filter === 'all') return true;
    return CATEGORY_CLASS[project.type] === filter;
  });

  if (filtered.length === 0) {
    galleryGrid.innerHTML = '<p class="gallery-empty">No projects in this category yet.</p>';
    return;
  }

  filtered.forEach((project) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'project-card reveal';
    card.setAttribute('aria-label', `View photos and details for ${project.title}`);
    card.innerHTML = `
      <img class="project-card-img" src="${coverImagePath(project)}" alt="" loading="lazy">
      <span class="project-card-overlay">
        <span class="project-card-title">${project.title}</span>
        <span class="project-card-meta">
          <span class="project-card-year">${project.year}</span>
          <span class="project-card-scope">${SCOPE_LABEL[project.scope]}</span>
          <span class="project-badge project-badge-${CATEGORY_CLASS[project.type]}">${CATEGORY_LABEL[project.type]}</span>
        </span>
      </span>
    `;
    card.addEventListener('click', () => openProjectModal(project));
    galleryGrid.appendChild(card);
  });

  galleryGrid.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
}

if (galleryFilters) {
  galleryFilters.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    galleryFilters.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderGallery(btn.dataset.filter);
  });
}

if (galleryGrid) {
  renderGallery('all');
}

// Project modal (image carousel + details)
const projectModal = document.getElementById('projectModal');
const projectModalSlide = document.getElementById('projectModalSlide');
const projectModalTitle = document.getElementById('projectModalTitle');
const projectModalYear = document.getElementById('projectModalYear');
const projectModalScope = document.getElementById('projectModalScope');
const projectModalBadge = document.getElementById('projectModalBadge');
const projectModalDesc = document.getElementById('projectModalDesc');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselCounter = document.getElementById('carouselCounter');

let activeProject = null;
let activeSlideIndex = 0;
let lastFocusedEl = null;

function renderModalSlide() {
  const slides = getSlides(activeProject);
  const slide = slides[activeSlideIndex];

  if (slide.type === 'before-after') {
    projectModalSlide.innerHTML = `
      <div class="before-after-slide">
        <figure>
          <img src="${imagePath(activeProject, slide.before)}" alt="Before">
          <figcaption>Before</figcaption>
        </figure>
        <figure>
          <img src="${imagePath(activeProject, slide.after)}" alt="After">
          <figcaption>After</figcaption>
        </figure>
      </div>
    `;
  } else {
    projectModalSlide.innerHTML = `<img class="project-modal-image" src="${imagePath(activeProject, slide.src)}" alt="Project photo">`;
  }

  const hasMultiple = slides.length > 1;
  carouselPrev.hidden = !hasMultiple;
  carouselNext.hidden = !hasMultiple;
  carouselCounter.hidden = !hasMultiple;
  carouselCounter.textContent = `${activeSlideIndex + 1} / ${slides.length}`;
}

function renderModalDescription(text) {
  projectModalDesc.innerHTML = text
    .split(/\n\s*\n/)
    .map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function openProjectModal(project) {
  activeProject = project;
  activeSlideIndex = 0;
  lastFocusedEl = document.activeElement;

  projectModalTitle.textContent = project.title;
  projectModalYear.textContent = project.year;
  projectModalScope.textContent = SCOPE_LABEL[project.scope];
  projectModalBadge.textContent = CATEGORY_LABEL[project.type];
  projectModalBadge.className = `project-badge project-badge-${CATEGORY_CLASS[project.type]}`;
  renderModalDescription(project.description);
  renderModalSlide();

  projectModal.classList.add('is-open');
  projectModal.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('modal-open');
  document.getElementById('projectModalClose').focus();
}

function closeProjectModal() {
  projectModal.classList.remove('is-open');
  projectModal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('modal-open');
  activeProject = null;
  if (lastFocusedEl) lastFocusedEl.focus();
}

function showPrevImage() {
  if (!activeProject) return;
  const slides = getSlides(activeProject);
  activeSlideIndex = (activeSlideIndex - 1 + slides.length) % slides.length;
  renderModalSlide();
}

function showNextImage() {
  if (!activeProject) return;
  const slides = getSlides(activeProject);
  activeSlideIndex = (activeSlideIndex + 1) % slides.length;
  renderModalSlide();
}

document.getElementById('projectModalClose').addEventListener('click', closeProjectModal);
document.getElementById('projectModalOverlay').addEventListener('click', closeProjectModal);
carouselPrev.addEventListener('click', showPrevImage);
carouselNext.addEventListener('click', showNextImage);

document.addEventListener('keydown', (e) => {
  if (!projectModal.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeProjectModal();
  if (e.key === 'ArrowLeft') showPrevImage();
  if (e.key === 'ArrowRight') showNextImage();
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();
