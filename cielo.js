gsap.registerPlugin(ScrollTrigger);

const scrollWrapper = document.getElementById('scrollWrapper');
const sections = document.querySelectorAll('.sky-section');
const sideDots = document.querySelectorAll('.side-dot');
const backTopBtn = document.getElementById('backTopBtn');
const bgMusic = document.getElementById('bg-music');
const shootingStarsEl = document.getElementById('shootingStars');
const skyEl = document.getElementById('sky');
const starsEl = document.getElementById('stars');
const moonEl = document.getElementById('moon');
const sunEl = document.getElementById('sun');
const sunHaloEl = document.getElementById('sunHalo');
const sunGlowEl = document.getElementById('sunGlow');
const flockEl = document.getElementById('flock');
const birdEls = flockEl.querySelectorAll('.bird');
const mountainBack = document.getElementById('mountainBack');
const mountainMid = document.getElementById('mountainMid');
const mountainFront = document.getElementById('mountainFront');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function startSectionTypewriter(section) {
  if (section.dataset.textTyped === 'true') return;

  section.dataset.textTyped = 'true';
  const textElements = [...section.querySelectorAll('.typewriter-text')].map((element) => {
    const message = element.textContent.trim();
    element.textContent = '';
    return { element, message };
  });
  const speed = prefersReducedMotion ? 0 : 36;
  let elementIndex = 0;

  function typeNextParagraph() {
    const currentText = textElements[elementIndex];
    if (!currentText) {
      const timer = section.querySelector('.reveal-timer');
      const signature = section.querySelector('.reveal-signature');

      timer?.classList.add('is-visible');
      if (signature) {
        setTimeout(() => signature.classList.add('is-visible'), 1000);
      }
      return;
    }

    const { element, message } = currentText;

    if (speed === 0) {
      element.textContent = message;
      elementIndex++;
      typeNextParagraph();
      return;
    }

    let index = 0;
    function typeNextCharacter() {
      if (index < message.length) {
        element.textContent += message.charAt(index);
        index++;
        setTimeout(typeNextCharacter, speed);
      } else {
        elementIndex++;
        setTimeout(typeNextParagraph, 350);
      }
    }

    typeNextCharacter();
  }

  typeNextParagraph();
}

/* =========================================================
   1. NAVEGACIÓN LATERAL: puntos sincronizados con la sección activa
   ========================================================= */
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      startSectionTypewriter(entry.target);
      sideDots.forEach((dot) => {
        dot.classList.toggle('active', dot.getAttribute('data-target') === entry.target.id);
      });
    }
  });
}, { root: scrollWrapper, threshold: 0.55 });

sections.forEach((section) => sectionObserver.observe(section));

sideDots.forEach((dot) => {
  dot.addEventListener('click', () => {
    const targetSection = document.getElementById(dot.getAttribute('data-target'));
    if (targetSection) targetSection.scrollIntoView({ behavior: 'smooth' });
  });
});

if (backTopBtn) {
  backTopBtn.addEventListener('click', () => {
    sections[0].scrollIntoView({ behavior: 'smooth' });
  });
}

/* =========================================================
   2. AUDIO: se asegura el arranque en el primer toque (requerido en móviles)
   ========================================================= */
function startMusic() {
  if (bgMusic && bgMusic.paused) {
    bgMusic.play().catch(() => {});
  }
}
window.addEventListener('pointerdown', startMusic, { once: true });

/* =========================================================
   3. CONTADOR EN TIEMPO REAL DESDE EL 29 DE JULIO 2026
   ========================================================= */
const startDate = new Date('2026-07-29T00:00:00');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

function updateLoveCounter() {
  const diff = Date.now() - startDate.getTime();
  if (diff < 0 || !daysEl) return;

  daysEl.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
  hoursEl.textContent = String(Math.floor((diff / 3600000) % 24)).padStart(2, '0');
  minutesEl.textContent = String(Math.floor((diff / 60000) % 60)).padStart(2, '0');
  secondsEl.textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
}
setInterval(updateLoveCounter, 1000);
updateLoveCounter();

/* =========================================================
   4. GENERAR ESTRELLAS (titileo CSS en loop constante)
   ========================================================= */
const STAR_COUNT = 80;
for (let i = 0; i < STAR_COUNT; i++) {
  const star = document.createElement('span');
  star.className = 'star';
  const size = (Math.random() * 1.6 + 0.6).toFixed(2);
  star.style.left = `${(Math.random() * 100).toFixed(2)}%`;
  star.style.top = `${(Math.random() * 68).toFixed(2)}%`;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  star.style.setProperty('--dur', `${(Math.random() * 2.5 + 2).toFixed(2)}s`);
  star.style.setProperty('--delay', `${(Math.random() * 3).toFixed(2)}s`);
  star.style.setProperty('--min-alpha', `${(Math.random() * 0.3 + 0.15).toFixed(2)}`);
  starsEl.appendChild(star);
}

/* =========================================================
   4.5 GENERAR ESTRELLAS FUGACES ALEATORIAS
   ========================================================= */
const SHOOTING_STAR_COUNT = 8;
for (let i = 0; i < SHOOTING_STAR_COUNT; i++) {
  const sStar = document.createElement('span');
  sStar.className = 'shooting-star';
  sStar.style.left = `${(Math.random() * 90).toFixed(2)}%`;
  sStar.style.top = `${(Math.random() * 80).toFixed(2)}%`;
  sStar.style.setProperty('--dur', `${(Math.random() * 2 + 2.5).toFixed(2)}s`);
  sStar.style.setProperty('--delay', `${(Math.random() * 6).toFixed(2)}s`);
  shootingStarsEl.appendChild(sStar);
}

/* =========================================================
   5. UTILIDADES DE INTERPOLACIÓN
   ========================================================= */
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
function easeInCubic(x) { return x * x * x; }

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return `rgb(${Math.round(lerp(a.r, b.r, t))}, ${Math.round(lerp(a.g, b.g, t))}, ${Math.round(lerp(a.b, b.b, t))})`;
}

/* Interpola 3 paradas clave en los puntos exactos del brief: 0% dawn, 35–70% sunset (plateau), 100% night */
function threeStopLerp(hexA, hexB, hexC, t) {
  if (t <= 0.35) return lerpColor(hexA, hexB, t / 0.35);
  if (t <= 0.7) return hexB;
  return lerpColor(hexB, hexC, (t - 0.7) / 0.3);
}

/* Factor de "altura de sol" (0→1→0) con meseta dorada entre 35–70% */
function sunHeightFactor(t) {
  if (t <= 0.35) return easeOutCubic(t / 0.35);
  if (t <= 0.7) return 1;
  return 1 - easeInCubic((t - 0.7) / 0.3);
}

/* =========================================================
   6. PALETAS
   ========================================================= */
const SKY = {
  top:     { dawn: '#33204a', sunset: '#3a0f1f', night: '#05081a' },
  mid:     { dawn: '#7a3a58', sunset: '#8a2e2c', night: '#0c1442' },
  horizon: { dawn: '#ffb385', sunset: '#ff7b3d', night: '#141c3f' }
};

const MOUNTAIN = {
  back:  { dawn: '#4a3163', sunset: '#7a3d3a', night: '#0d1230' },
  mid:   { dawn: '#3a2350', sunset: '#5c2a2f', night: '#080b20' },
  front: { dawn: '#2a1840', sunset: '#3c1a24', night: '#040613' }
};

/* =========================================================
   7. PINTAR LA ESCENA EN CADA TICK DEL SCRUB
   ========================================================= */
function updateScene(t) {
  /* --- cielo --- */
  const top = threeStopLerp(SKY.top.dawn, SKY.top.sunset, SKY.top.night, t);
  const mid = threeStopLerp(SKY.mid.dawn, SKY.mid.sunset, SKY.mid.night, t);
  const horizon = threeStopLerp(SKY.horizon.dawn, SKY.horizon.sunset, SKY.horizon.night, t);
  skyEl.style.background = `linear-gradient(to bottom, ${top} 0%, ${mid} 55%, ${horizon} 100%)`;

  /* --- montañas --- */
  mountainBack.style.backgroundColor = threeStopLerp(MOUNTAIN.back.dawn, MOUNTAIN.back.sunset, MOUNTAIN.back.night, t);
  mountainMid.style.backgroundColor = threeStopLerp(MOUNTAIN.mid.dawn, MOUNTAIN.mid.sunset, MOUNTAIN.mid.night, t);
  mountainFront.style.backgroundColor = threeStopLerp(MOUNTAIN.front.dawn, MOUNTAIN.front.sunset, MOUNTAIN.front.night, t);

  /* --- sol: asciende 0–35%, brilla al máximo 35–70%, se oculta tras las montañas 70–100% --- */
  const heightFactor = sunHeightFactor(t);
  const viewH = window.innerHeight;
  const groundOffset = viewH * 0.34;
  const riseAmplitude = viewH * 0.5;
  const sunY = groundOffset - heightFactor * riseAmplitude;
  const sunOpacity = t < 0.92 ? 1 : 1 - (t - 0.92) / 0.08;

  gsap.set(sunEl, { y: sunY, opacity: sunOpacity, filter: `brightness(${1 + heightFactor * 0.18})` });
  gsap.set(sunHaloEl, { y: sunY, opacity: sunOpacity * (0.35 + heightFactor * 0.65), scale: 0.85 + heightFactor * 0.3 });
  gsap.set(sunGlowEl, { y: sunY, opacity: sunOpacity * (0.3 + heightFactor * 0.6), scale: 0.8 + heightFactor * 0.35 });

  /* --- luna: emerge al llegar la noche --- */
  const moonOpacity = smoothstep(0.75, 0.97, t);
  gsap.set(moonEl, { opacity: moonOpacity, y: (1 - moonOpacity) * 30 });

  /* --- estrellas --- */
  gsap.set(starsEl, { opacity: smoothstep(0.68, 0.95, t) });
  gsap.set(shootingStarsEl, { opacity: smoothstep(0.72, 0.96, t) });

  /* --- bandada de pájaros cruzando en el atardecer (35–70%) --- */
  const flockWindow = smoothstep(0.3, 0.4, t) * (1 - smoothstep(0.66, 0.76, t));
  const flightProgress = clamp((t - 0.32) / 0.4, 0, 1);
  const flockX = lerp(-15, 115, flightProgress);
  gsap.set(flockEl, { opacity: flockWindow, xPercent: 0, x: `${flockX}vw` });

  birdEls.forEach((bird, i) => {
    gsap.set(bird, { y: Math.sin(flightProgress * 6 + i) * 10 });
  });
}

/* =========================================================
   8. SCROLLTRIGGER: contenedor propio como scroller, con scrub cinemático
   ========================================================= */
const sceneState = { progress: 0 };

gsap.timeline({
  scrollTrigger: {
    trigger: scrollWrapper,
    scroller: scrollWrapper,
    start: 'top top',
    end: () => `+=${scrollWrapper.scrollHeight - scrollWrapper.clientHeight}`,
    scrub: prefersReducedMotion ? true : 1.5,
    invalidateOnRefresh: true
  }
}).to(sceneState, {
  progress: 1,
  ease: 'none',
  onUpdate: () => updateScene(sceneState.progress)
});

updateScene(0);

requestAnimationFrame(() => {
  document.body.classList.add('page-ready');
});

window.addEventListener('load', () => ScrollTrigger.refresh());
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
  updateScene(sceneState.progress);
});