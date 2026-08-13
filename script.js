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

// Hero background slideshow
const heroSlides = document.querySelectorAll('#heroSlideshow .hero-slide');

if (heroSlides.length > 0) {
  let activeSlide = 0;
  heroSlides[0].classList.add('is-active');

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      heroSlides[activeSlide].classList.remove('is-active');
      activeSlide = (activeSlide + 1) % heroSlides.length;
      heroSlides[activeSlide].classList.add('is-active');
    }, 5000);
  }
}

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

// Waving hand next to the About greeting — fades in/out with scroll
// position (unlike .reveal, this toggles back off if scrolled back past),
// re-triggering the wave + motion-lines animation each time it appears.
const waveIcon = document.querySelector('.wave-icon');
if (waveIcon) {
  const waveObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        waveIcon.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    { threshold: 0.3 }
  );
  waveObserver.observe(waveIcon);
}

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

// Contact form
const quoteForm = document.getElementById('quoteForm');
const formStatus = document.getElementById('formStatus');

// Ideal start/finish date pickers: don't allow picking a date in the past.
const todayISO = new Date().toISOString().split('T')[0];
document.getElementById('startDate').min = todayISO;
document.getElementById('finishDate').min = todayISO;

function setFormStatus(message, kind) {
  formStatus.textContent = message;
  formStatus.className = `form-status ${kind ? `form-status-${kind}` : ''}`;
}

quoteForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (quoteForm.action.includes('YOUR_FORM_ID')) {
    setFormStatus('This form isn’t connected yet — please call or email us directly for now.', 'error');
    return;
  }

  const emailValue = document.getElementById('email').value;
  document.getElementById('formReplyTo').value = emailValue;
  document.getElementById('formCc').value = document.getElementById('sendCopy').checked ? emailValue : '';

  const referenceId = `SHB-${Date.now().toString(36).toUpperCase()}`;
  document.getElementById('formReferenceId').value = referenceId;
  document.getElementById('formSubject').value = `[WEB QUOTE REQUEST] ${document.getElementById('name').value} — ${referenceId}`;

  const submitBtn = quoteForm.querySelector('.form-submit');
  submitBtn.disabled = true;
  setFormStatus('Sending…', null);

  fetch(quoteForm.action, {
    method: 'POST',
    body: new FormData(quoteForm),
    headers: { Accept: 'application/json' },
  })
    .then((response) => {
      if (response.ok) {
        quoteForm.reset();
        setFormStatus('Thanks — your request has been sent. We’ll be in touch soon.', 'success');
      } else {
        setFormStatus('Something went wrong sending your request — please call or email us directly.', 'error');
      }
    })
    .catch(() => {
      setFormStatus('Something went wrong sending your request — please call or email us directly.', 'error');
    })
    .finally(() => {
      submitBtn.disabled = false;
    });
});

// Project gallery + modal
const CATEGORY_LABEL = { home: 'Home', apartment: 'Apartment', commercial: 'Commercial' };
const CATEGORY_CLASS = { home: 'residential', apartment: 'residential', commercial: 'commercial' };
const SCOPE_LABEL = { renovation: 'Renovation', build: 'New Build' };

const galleryGrid = document.getElementById('galleryGrid');
const galleryScroll = document.getElementById('galleryScroll');
const galleryFilters = document.getElementById('galleryFilters');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');

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

function buildCard(project) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'project-card';
  card.setAttribute('aria-label', `View photos and details for ${project.title}`);
  card.innerHTML = `
    <img class="project-card-img" src="${coverImagePath(project)}" alt="" loading="lazy">
    <span class="project-badge project-card-badge project-badge-${CATEGORY_CLASS[project.type]}">${CATEGORY_LABEL[project.type]}</span>
    <span class="project-card-overlay">
      <span class="project-card-title">${project.title}</span>
      <span class="project-card-meta">
        <span class="project-card-year">${project.year}</span>
        <span class="project-card-scope">${SCOPE_LABEL[project.scope]}</span>
      </span>
    </span>
  `;
  card.addEventListener('click', () => {
    if (galleryMarquee.suppressNextClick) {
      galleryMarquee.suppressNextClick = false;
      return;
    }
    openProjectModal(project);
  });
  return card;
}

// Below this width, mobile touch-momentum scrolling kept fighting the
// autoplay's own programmatic scrollLeft writes for control and jittering
// no matter how carefully the handoff was timed. Simpler and steadier:
// skip the autoplay/looping entirely on small screens and let visitors
// page through with plain native swipe or the </> buttons instead.
const GALLERY_MOBILE_BREAKPOINT = 780;
function isMobileGallery() {
  return window.matchMedia(`(max-width: ${GALLERY_MOBILE_BREAKPOINT}px)`).matches;
}

function updateGalleryNavButtons() {
  if (!galleryPrev || !galleryNext) return;
  const canScroll = galleryGrid.scrollWidth > galleryScroll.clientWidth + 1;
  galleryPrev.hidden = !canScroll;
  galleryNext.hidden = !canScroll;
  if (!canScroll) return;
  galleryPrev.disabled = galleryScroll.scrollLeft <= 1;
  galleryNext.disabled = galleryScroll.scrollLeft >= galleryGrid.scrollWidth - galleryScroll.clientWidth - 1;
}

function renderGallery(filter) {
  galleryGrid.innerHTML = '';
  galleryMarquee.stop();

  const filtered = (typeof PROJECTS !== 'undefined' ? PROJECTS : []).filter((project) => {
    if (filter === 'all') return true;
    return CATEGORY_CLASS[project.type] === filter;
  });

  if (filtered.length === 0) {
    galleryGrid.innerHTML = '<p class="gallery-empty">No projects in this category yet.</p>';
    galleryScroll.classList.add('is-static');
    updateGalleryNavButtons();
    return;
  }

  // Render one copy first to measure whether it already fills the viewport.
  filtered.forEach((project) => galleryGrid.appendChild(buildCard(project)));

  const fitsWithoutScrolling = galleryGrid.scrollWidth <= galleryScroll.clientWidth + 1;

  if (fitsWithoutScrolling) {
    galleryScroll.classList.add('is-static');
    updateGalleryNavButtons();
    return;
  }

  galleryScroll.classList.remove('is-static');

  if (isMobileGallery()) {
    // Single copy, no autoplay — native swipe or the </> buttons only.
    galleryScroll.scrollLeft = 0;
    updateGalleryNavButtons();
    return;
  }

  const singleSetWidth = galleryGrid.scrollWidth;
  const firstCardWidth = galleryGrid.querySelector('.project-card').getBoundingClientRect().width;

  // Triple the set so there's a full copy of slack on either side of the
  // visible one — auto-scroll and manual dragging can wrap seamlessly
  // between identical copies without ever visibly running out of track.
  filtered.forEach((project) => galleryGrid.appendChild(buildCard(project)));
  filtered.forEach((project) => galleryGrid.appendChild(buildCard(project)));

  // Start with the filter's first card centered in the viewport, rather
  // than flush against the left edge.
  const centerOffset = Math.max(0, (galleryScroll.clientWidth - firstCardWidth) / 2);
  galleryScroll.scrollLeft = singleSetWidth - centerOffset;
  galleryMarquee.start(singleSetWidth);
  updateGalleryNavButtons();
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

function galleryStep() {
  const firstCard = galleryGrid.querySelector('.project-card');
  if (!firstCard) return galleryScroll.clientWidth;
  const gap = parseFloat(getComputedStyle(galleryGrid).columnGap) || 0;
  return firstCard.getBoundingClientRect().width + gap;
}

if (galleryPrev && galleryNext) {
  galleryPrev.addEventListener('click', () => {
    galleryScroll.scrollBy({ left: -galleryStep(), behavior: 'smooth' });
  });
  galleryNext.addEventListener('click', () => {
    galleryScroll.scrollBy({ left: galleryStep(), behavior: 'smooth' });
  });
  galleryScroll.addEventListener('scroll', () => {
    if (isMobileGallery()) updateGalleryNavButtons();
  });
}

// Slow linear auto-scroll that yields to the visitor: grabbing the strip
// (mouse drag, touch, or wheel) hands over full control, and releasing a
// mouse drag carries on at the velocity it was moving — then that speed
// eases back down (or up) to the gentle cruise speed, same direction the
// whole time, rather than stopping dead and restarting from zero.
const galleryMarquee = (() => {
  const MAX_SPEED = 0.35; // px per frame — the steady autoplay cruise speed
  const MAX_FLING = 6; // px per frame — hard cap on release-velocity momentum
  const EASE_FACTOR = 0.025; // how fast currentSpeed eases toward MAX_SPEED
  const CLICK_THRESHOLD = 6; // px of movement before a mousedown counts as a drag
  const VELOCITY_WINDOW_MS = 120; // how recent a mousemove has to be to count toward release velocity

  let singleSetWidth = 0;
  let isLooping = false;
  let isInteracting = false;
  let currentSpeed = 0;
  // scrollLeft rounds to the nearest pixel on read/write in most browsers, so
  // accumulating a sub-pixel speed by reading it back each frame would just
  // discard the fractional part forever. Track our own float position instead
  // and only use it to drive scrollLeft while auto-scrolling.
  let scrollPosition = 0;
  let rafId = null;
  let lastFrameTime = 0;
  let wheelIdleTimer = null;

  let isDragging = false;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let dragMoved = 0;
  let moveSamples = [];

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tick(now) {
    const frameMs = lastFrameTime ? Math.min(now - lastFrameTime, 100) : 16.67;
    lastFrameTime = now;

    if (isLooping) {
      if (isInteracting) {
        // Fully manual — the drag/touch/wheel handler owns scrollLeft.
      } else if (prefersReducedMotion) {
        currentSpeed = 0;
      } else {
        const frameScale = frameMs / 16.67;
        currentSpeed += (MAX_SPEED - currentSpeed) * EASE_FACTOR * frameScale;
        scrollPosition += currentSpeed * frameScale;
        galleryScroll.scrollLeft = scrollPosition;
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function handleScroll() {
    if (!isLooping) return;
    if (galleryScroll.scrollLeft <= singleSetWidth * 0.4) {
      galleryScroll.scrollLeft += singleSetWidth;
      scrollPosition += singleSetWidth;
      if (isDragging) dragStartScrollLeft += singleSetWidth;
    } else if (galleryScroll.scrollLeft >= singleSetWidth * 1.6) {
      galleryScroll.scrollLeft -= singleSetWidth;
      scrollPosition -= singleSetWidth;
      if (isDragging) dragStartScrollLeft -= singleSetWidth;
    }
  }

  function interactionStart() {
    isInteracting = true;
  }

  function interactionEnd(releaseSpeed) {
    isInteracting = false;
    // Pick auto-scroll back up from wherever the visitor left it, carrying
    // over any release velocity (0 for touch/wheel — the browser already
    // handles their own momentum natively).
    scrollPosition = galleryScroll.scrollLeft;
    currentSpeed = releaseSpeed || 0;
  }

  function onMouseDown(e) {
    if (e.button !== 0) return;
    isDragging = true;
    dragMoved = 0;
    dragStartX = e.pageX;
    dragStartScrollLeft = galleryScroll.scrollLeft;
    moveSamples = [{ t: performance.now(), x: e.pageX }];
    interactionStart();
    galleryScroll.classList.add('is-dragging');
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const delta = e.pageX - dragStartX;
    galleryScroll.scrollLeft = dragStartScrollLeft - delta;
    dragMoved = Math.max(dragMoved, Math.abs(delta));

    const now = performance.now();
    moveSamples.push({ t: now, x: e.pageX });
    while (moveSamples.length > 2 && now - moveSamples[0].t > VELOCITY_WINDOW_MS) {
      moveSamples.shift();
    }
  }

  function onMouseUp() {
    isDragging = false;
    galleryScroll.classList.remove('is-dragging');
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    if (dragMoved > CLICK_THRESHOLD) galleryMarquee.suppressNextClick = true;

    let releaseSpeed = 0;
    const first = moveSamples[0];
    const last = moveSamples[moveSamples.length - 1];
    const dt = last ? last.t - first.t : 0;
    if (dt > 0) {
      const mousePxPerMs = (last.x - first.x) / dt;
      releaseSpeed = Math.max(-MAX_FLING, Math.min(MAX_FLING, -mousePxPerMs * 16.67));
    }
    interactionEnd(releaseSpeed);
  }

  function onWheel() {
    interactionStart();
    clearTimeout(wheelIdleTimer);
    wheelIdleTimer = setTimeout(() => interactionEnd(0), 150);
  }

  // On touch devices the browser drives its own momentum scroll after the
  // finger lifts, which can keep moving scrollLeft for a while. If our rAF
  // loop resumed writing to scrollLeft immediately on touchend, the two
  // would fight every frame and visibly jitter. Instead, stay "interacting"
  // through touchend and watch for scroll events to go quiet before handing
  // control back to the autoplay.
  let touchSettleTimer = null;
  let awaitingTouchSettle = false;

  function scheduleTouchSettle() {
    clearTimeout(touchSettleTimer);
    touchSettleTimer = setTimeout(() => {
      awaitingTouchSettle = false;
      interactionEnd(0);
    }, 120);
  }

  function onTouchStart() {
    awaitingTouchSettle = false;
    clearTimeout(touchSettleTimer);
    interactionStart();
  }

  function onTouchEnd() {
    awaitingTouchSettle = true;
    scheduleTouchSettle();
  }

  galleryScroll.addEventListener('mousedown', onMouseDown);
  galleryScroll.addEventListener('touchstart', onTouchStart, { passive: true });
  galleryScroll.addEventListener('touchend', onTouchEnd);
  galleryScroll.addEventListener('touchcancel', onTouchEnd);
  galleryScroll.addEventListener('wheel', onWheel, { passive: true });
  galleryScroll.addEventListener('scroll', () => {
    handleScroll();
    if (awaitingTouchSettle) scheduleTouchSettle();
  });
  rafId = requestAnimationFrame(tick);

  return {
    suppressNextClick: false,
    start(width) {
      singleSetWidth = width;
      isLooping = true;
      currentSpeed = 0;
      scrollPosition = galleryScroll.scrollLeft;
    },
    stop() {
      isLooping = false;
      currentSpeed = 0;
    },
  };
})();

if (galleryGrid) {
  renderGallery('all');

  let galleryResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(galleryResizeTimer);
    galleryResizeTimer = setTimeout(() => {
      const activeFilter = galleryFilters.querySelector('.filter-btn.active');
      renderGallery(activeFilter ? activeFilter.dataset.filter : 'all');
    }, 300);
  });
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
