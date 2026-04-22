/* ============================================================
   MIST & MAPLE — main.js
   Stars · House float · Parallax · Cursor · Nav · Lightbox
   3D Tilt · Scroll Progress · Touch Swipe
   Three.js Fog Particles · GSAP Scroll Animations · Sound Toggle
   ============================================================ */

// ── Touch device detection ─────────────────────────────────
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// ── Scroll progress bar ────────────────────────────────────
const progressBar = document.createElement('div');
progressBar.id = 'scroll-progress';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  progressBar.style.width = (pct * 100) + '%';
}, { passive: true });

// ── Custom Cursor ──────────────────────────────────────────
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');

if (cursor && cursorRing && !isTouch) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });
  (function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a, button, .room-card, .experience-tile, .gallery-item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = cursor.style.height = '14px';
      cursorRing.style.width = cursorRing.style.height = '54px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = cursor.style.height = '8px';
      cursorRing.style.width = cursorRing.style.height = '34px';
    });
  });
} else if (cursor && cursorRing) {
  // Hide cursor elements on touch devices
  cursor.style.display = 'none';
  cursorRing.style.display = 'none';
}

// ── Star canvas (hero) ────────────────────────────────────
const starCanvas = document.getElementById('starCanvas');
if (starCanvas) {
  const ctx = starCanvas.getContext('2d');
  const stars = [];

  function resizeCanvas() {
    const hero = starCanvas.closest('.hero') || document.querySelector('.hero');
    starCanvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
    starCanvas.height = hero ? hero.offsetHeight : window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  for (let i = 0; i < 160; i++) {
    stars.push({
      x: Math.random(), y: Math.random() * 0.62,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * 0.7 + 0.15,
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2
    });
  }

  let t = 0;
  (function drawStars() {
    ctx.clearRect(0, 0, starCanvas.width, starCanvas.height);
    t += 0.012;
    stars.forEach(s => {
      const pulse = s.a + Math.sin(t * s.speed * 40 + s.phase) * 0.15;
      ctx.beginPath();
      ctx.arc(s.x * starCanvas.width, s.y * starCanvas.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,235,255,${Math.max(0, pulse)})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  })();
}

// ── Hero photo crossfade ───────────────────────────────────
const heroPhoto = document.getElementById('heroPhoto');
if (heroPhoto) {
  if (heroPhoto.complete) heroPhoto.classList.add('loaded');
  else heroPhoto.addEventListener('load', () => heroPhoto.classList.add('loaded'));
}

// ── Parallax mouse-move ───────────────────────────────────
const heroScene = document.getElementById('heroScene');
if (heroScene && !isTouch) {
  const layers = [
    { id: 'layerSky',    dx: 0.006, dy: 0.003 },
    { id: 'layerKanche', dx: 0.014, dy: 0.007 },
    { id: 'layerMid',    dx: 0.026, dy: 0.013 },
    { id: 'layerGround', dx: 0.04,  dy: 0.02  },
    { id: 'layerHouse',  dx: 0.05,  dy: 0.025 },
    { id: 'layerFront',  dx: 0.065, dy: 0.032 },
  ].map(l => ({ ...l, el: document.getElementById(l.id), tx: 0, ty: 0, cx: 0, cy: 0 }))
   .filter(l => l.el);

  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', e => {
      const r  = hero.getBoundingClientRect();
      const ox = e.clientX - r.left  - r.width  / 2;
      const oy = e.clientY - r.top   - r.height / 2;
      layers.forEach(l => { l.tx = -ox * l.dx; l.ty = -oy * l.dy; });
    });
  }

  (function animParallax() {
    layers.forEach(l => {
      l.cx += (l.tx - l.cx) * 0.07;
      l.cy += (l.ty - l.cy) * 0.07;
      // For the house, preserve the horizontal centering transform
      if (l.id === 'layerHouse') {
        l.el.style.transform = `translateX(calc(-50% + ${l.cx}px)) translateY(${l.cy}px)`;
      } else {
        l.el.style.transform = `translate(${l.cx}px, ${l.cy}px)`;
      }
    });
    requestAnimationFrame(animParallax);
  })();
}

// ── House gentle float (vertical bob) ─────────────────────
const layerHouse = document.getElementById('layerHouse');
if (layerHouse) {
  let houseT = 0;
  (function floatHouse() {
    houseT += 0.012;
    const bob = Math.sin(houseT) * 5;
    // We nudge via a CSS custom property so parallax can still work
    layerHouse.style.setProperty('--bob', bob + 'px');
    requestAnimationFrame(floatHouse);
  })();
}

// ── Particles (fireflies / pollen) ────────────────────────
const particleContainer = document.getElementById('heroParticles');
if (particleContainer) {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle';
    const size   = Math.random() * 2.5 + 1.2;
    const isAmber = Math.random() > 0.45;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${Math.random() * 50 + 5}%;
      width: ${size}px; height: ${size}px;
      background: ${isAmber ? 'rgba(232,148,58,0.7)' : 'rgba(42,171,181,0.5)'};
      filter: blur(${isAmber ? 0.5 : 1}px);
      animation-duration: ${6 + Math.random() * 13}s;
      animation-delay: ${Math.random() * 15}s;
    `;
    particleContainer.appendChild(p);
  }
}

// ── 3D Tilt on mousemove ──────────────────────────────────
if (!isTouch) {
  function applyTilt(selector, maxDeg) {
    document.querySelectorAll(selector).forEach(card => {
      let rafId = null;
      let targetRX = 0, targetRY = 0, currentRX = 0, currentRY = 0;

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width  / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        targetRY =  dx * maxDeg;
        targetRX = -dy * maxDeg;
      });

      card.addEventListener('mouseleave', () => {
        targetRX = 0;
        targetRY = 0;
      });

      (function animTilt() {
        currentRX += (targetRX - currentRX) * 0.1;
        currentRY += (targetRY - currentRY) * 0.1;
        if (Math.abs(currentRX) > 0.01 || Math.abs(currentRY) > 0.01 ||
            Math.abs(targetRX) > 0.01  || Math.abs(targetRY) > 0.01) {
          card.style.transform = `rotateX(${currentRX}deg) rotateY(${currentRY}deg)`;
        }
        requestAnimationFrame(animTilt);
      })();
    });
  }

  applyTilt('.room-card', 8);
  applyTilt('.experience-tile', 5);
}

// ── Nav state ─────────────────────────────────────────────
const siteNav   = document.querySelector('.site-nav');
const navToggle = document.querySelector('.nav-toggle');
const navMenu   = document.querySelector('.nav-menu');

function handleNavState() {
  if (!siteNav) return;
  const isHome = document.body.classList.contains('home-page');
  if (!isHome) { siteNav.classList.add('solid'); return; }
  siteNav.classList.toggle('scrolled', window.scrollY > 50);
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', e => {
    e.stopPropagation();
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
  // Close menu on outside click
  document.addEventListener('click', e => {
    if (navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}
window.addEventListener('scroll', handleNavState, { passive: true });
window.addEventListener('load', handleNavState);

// ── Scroll-reveal (fallback if GSAP/ScrollTrigger not available) ─────
// GSAP ScrollTrigger handles these animations when available
const revealEls = document.querySelectorAll(
  '.room-card, .experience-tile, .testimonial-card, .about-content, .gallery-item'
);
if ('IntersectionObserver' in window && revealEls.length && (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined')) {
  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = 'opacity .65s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform .65s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Use modulo 6 to stagger up to 6 visible cards per batch (6 × 120ms = 720ms max)
        const idx = Array.from(revealEls).indexOf(entry.target) % 6;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 120);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
}

// ── Booking form ──────────────────────────────────────────
const bookingForm = document.querySelector('#booking-form');
const formMessage = document.querySelector('#form-message');
if (bookingForm && formMessage) {
  bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    formMessage.textContent = 'Thank you! Your enquiry has been received. We will be in touch shortly.';
    bookingForm.reset();
  });
}

// ── Lightbox ──────────────────────────────────────────────
const lightbox      = document.querySelector('#lightbox');
const lightboxImg   = document.querySelector('#lightbox-image');
const galleryImages = Array.from(document.querySelectorAll('.gallery-item img'));
const prevBtn       = document.querySelector('.lightbox-prev');
const nextBtn       = document.querySelector('.lightbox-next');
const closeBtn      = document.querySelector('.lightbox-close');
let currentIdx = 0;

function openLightbox(i) {
  if (!lightbox || !lightboxImg || !galleryImages.length) return;
  currentIdx = i;
  lightboxImg.src = galleryImages[i].src;
  lightboxImg.alt = galleryImages[i].alt;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function navigate(dir) {
  if (!galleryImages.length) return;
  openLightbox((currentIdx + dir + galleryImages.length) % galleryImages.length);
}

if (lightbox && galleryImages.length) {
  galleryImages.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));
  prevBtn  && prevBtn.addEventListener('click',  () => navigate(-1));
  nextBtn  && nextBtn.addEventListener('click',  () => navigate(1));
  closeBtn && closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Touch swipe support for lightbox
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
  }, { passive: true });
}

// ── Experience tiles: always-visible descriptions on touch ─
if (isTouch) {
  document.querySelectorAll('.experience-tile').forEach(tile => {
    tile.classList.add('touch-visible');
  });
}

// ── Three.js fog / mist particle scene ────────────────────
(function initThreeScene() {
  const threeCanvas = document.getElementById('threeCanvas');
  if (!threeCanvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 8);

  // Build a soft fog-sprite texture via an offscreen canvas
  const fogTex = (function buildFogTexture() {
    const fc = document.createElement('canvas');
    fc.width = fc.height = 128;
    const fctx = fc.getContext('2d');
    const grad = fctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0,   'rgba(217,224,230,0.55)');
    grad.addColorStop(0.4, 'rgba(217,224,230,0.18)');
    grad.addColorStop(1,   'rgba(217,224,230,0)');
    fctx.fillStyle = grad;
    fctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(fc);
  }());

  // Create fog sprite cloud
  const CLOUD_COUNT = 60;
  const sprites = [];
  for (let i = 0; i < CLOUD_COUNT; i++) {
    const mat = new THREE.SpriteMaterial({
      map: fogTex,
      transparent: true,
      opacity: Math.random() * 0.18 + 0.04,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(mat);
    const scale = Math.random() * 5 + 2;
    sprite.scale.set(scale, scale * 0.55, 1);
    sprite.position.set(
      (Math.random() - 0.5) * 22,
      (Math.random() - 0.5) * 5 - 0.5,
      (Math.random() - 0.5) * 6
    );
    // Drift speed
    sprite.userData.vx = (Math.random() - 0.5) * 0.003;
    sprite.userData.vy = (Math.random() - 0.5) * 0.0008;
    scene.add(sprite);
    sprites.push(sprite);
  }

  // Mouse parallax influence
  let tMx = 0, tMy = 0;
  if (!isTouch) {
    document.addEventListener('mousemove', e => {
      tMx = (e.clientX / window.innerWidth  - 0.5) * 0.6;
      tMy = (e.clientY / window.innerHeight - 0.5) * 0.3;
    }, { passive: true });
  }

  // Scroll depth effect on camera
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  let camX = 0, camY = 0;
  function animateThree() {
    requestAnimationFrame(animateThree);
    // Smooth camera follow mouse
    camX += (tMx - camX) * 0.04;
    camY += (-tMy - camY) * 0.04;
    camera.position.x = camX;
    camera.position.y = camY;

    // Drift sprites
    sprites.forEach(sp => {
      sp.position.x += sp.userData.vx;
      sp.position.y += sp.userData.vy;
      if (sp.position.x >  12) sp.position.x = -12;
      if (sp.position.x < -12) sp.position.x =  12;
      if (sp.position.y >   4) sp.position.y = -4;
      if (sp.position.y <  -4) sp.position.y =  4;
    });

    // Hide Three.js canvas when scrolled past hero
    const heroHeight = window.innerHeight;
    threeCanvas.style.opacity = scrollY > heroHeight ? '0' : '0.6';

    renderer.render(scene, camera);
  }
  animateThree();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}());

// ── GSAP scroll-triggered animations ──────────────────────
(function initGSAP() {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  } else {
    return;
  }

  // Section headings fade-in from below
  gsap.utils.toArray('.section-heading').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      opacity: 0, y: 40, duration: 1.1,
      ease: 'power3.out'
    });
  });

  // "Experience the Stay" highlights stagger in
  gsap.from('.stay-highlight', {
    scrollTrigger: { trigger: '.stay-highlights', start: 'top 80%', once: true },
    opacity: 0, x: -30, duration: 0.75,
    stagger: 0.18, ease: 'power2.out'
  });

  // Experience stay image parallax
  const expImg = document.querySelector('.experience-stay-image img');
  if (expImg) {
    gsap.to(expImg, {
      scrollTrigger: {
        trigger: '.experience-stay-section',
        start: 'top bottom', end: 'bottom top',
        scrub: 1.5
      },
      y: -40, ease: 'none'
    });
  }

  // Room cards stagger
  gsap.from('.room-card', {
    scrollTrigger: { trigger: '.rooms-grid', start: 'top 80%', once: true },
    opacity: 0, y: 50, duration: 0.9,
    stagger: 0.18, ease: 'power3.out'
  });

  // Experience tiles slide in
  gsap.from('.experience-tile', {
    scrollTrigger: { trigger: '.experiences-row', start: 'top 80%', once: true },
    opacity: 0, scale: 0.94, duration: 0.8,
    stagger: 0.15, ease: 'power2.out'
  });

  // Contact section fade
  gsap.from('.contact-grid > *', {
    scrollTrigger: { trigger: '.contact-section', start: 'top 80%', once: true },
    opacity: 0, y: 35, duration: 0.9,
    stagger: 0.2, ease: 'power3.out'
  });

  // Testimonial cards
  gsap.from('.testimonial-card', {
    scrollTrigger: { trigger: '.testimonials-grid', start: 'top 80%', once: true },
    opacity: 0, y: 30, duration: 0.8,
    stagger: 0.15, ease: 'power2.out'
  });
}());

// ── Ambient Nature Sound Toggle ────────────────────────────
(function initSoundToggle() {
  const btn   = document.getElementById('soundToggle');
  const audio = document.getElementById('natureAudio');
  if (!btn || !audio) return;

  let isPlaying = false;
  btn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      audio.volume = 0.22;
      audio.play().catch(err => {
        console.warn('Audio playback failed:', err.message);
        isPlaying = false;
        btn.textContent = '🔇';
        btn.classList.remove('playing');
      });
      btn.textContent = '🔊';
      btn.classList.add('playing');
      btn.setAttribute('aria-label', 'Turn off nature sounds');
    } else {
      audio.pause();
      btn.textContent = '🔇';
      btn.classList.remove('playing');
      btn.setAttribute('aria-label', 'Turn on nature sounds');
    }
  });
}());

