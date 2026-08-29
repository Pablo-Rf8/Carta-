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
const sunRaysEl = document.getElementById('sunRays');
const flockEl = document.getElementById('flock');
const birdEls = flockEl.querySelectorAll('.bird');
const mountainBack = document.getElementById('mountainBack');
const mountainMid = document.getElementById('mountainMid');
const mountainFront = document.getElementById('mountainFront');
const skySunsetLayer = document.getElementById('skySunsetLayer');
const skyNightLayer = document.getElementById('skyNightLayer');
const mtnBackSunset = document.getElementById('mtnBackSunset');
const mtnBackNight = document.getElementById('mtnBackNight');
const mtnMidSunset = document.getElementById('mtnMidSunset');
const mtnMidNight = document.getElementById('mtnMidNight');
const mtnFrontSunset = document.getElementById('mtnFrontSunset');
const mtnFrontNight = document.getElementById('mtnFrontNight');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Menos elementos animados en celular: son muchos nodos con su propia
// animación CSS corriendo a la vez, y en equipos de gama baja eso es lo
// que hace que el scroll se sienta trabado.
const isMobileViewport = window.matchMedia('(max-width: 640px)').matches;

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
const STAR_COUNT = isMobileViewport ? 40 : 80;
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
const SHOOTING_STAR_COUNT = isMobileViewport ? 10 : 22;
for (let i = 0; i < SHOOTING_STAR_COUNT; i++) {
  const sStar = document.createElement('span');
  sStar.className = 'shooting-star';
  sStar.style.left = `${(Math.random() * 90).toFixed(2)}%`;
  sStar.style.top = `${(Math.random() * 80).toFixed(2)}%`;
  sStar.style.setProperty('--dur', `${(Math.random() * 1.8 + 1.8).toFixed(2)}s`);
  /* delay repartido a lo largo de todo el ciclo (no aleatorio puro) para que
     siempre haya varias estrellas cruzando y no se agrupen todas de golpe */
  const spreadDelay = (i / SHOOTING_STAR_COUNT) * 8 + Math.random() * 0.6;
  sStar.style.setProperty('--delay', `${spreadDelay.toFixed(2)}s`);
  sStar.style.setProperty('--len', `${Math.round(Math.random() * 90 + 70)}px`);
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

/* Interpola solo lo que de verdad necesita mezclarse por JS (nada de color ya:
   el cielo y las montañas ahora son capas CSS pre-pintadas que se funden con
   opacity, así el navegador no repinta un gradiente completo en cada frame). */

/* Factor de "altura de sol" (0→1→0) con meseta dorada entre 35–70% */
function sunHeightFactor(t) {
  if (t <= 0.35) return easeOutCubic(t / 0.35);
  if (t <= 0.7) return 1;
  return 1 - easeInCubic((t - 0.7) / 0.3);
}

/* Opacidad de las capas "atardecer" y "noche": crossfade puro por opacity,
   la manera más barata posible de animar color en el navegador (GPU, sin repintado). */
function phaseOpacities(t) {
  return {
    sunsetOn: smoothstep(0, 0.35, t),
    nightOn: smoothstep(0.7, 1, t)
  };
}

/* Valores base recalculados en cada tick de scroll; el loop ambiental (más abajo)
   les suma pequeñas oscilaciones continuas para que la escena respire aunque
   el usuario no esté scrolleando. */
const sceneBase = {
  sunY: 0,
  sunOpacity: 1,
  heightFactor: 0,
  moonY: 30,
  moonOpacity: 0,
  flightProgress: 0
};

/* =========================================================
   7. PINTAR LA ESCENA EN CADA TICK DEL SCRUB
   ========================================================= */
function updateScene(t) {
  /* --- cielo: crossfade de 3 capas ya pintadas, solo se anima opacity (GPU) --- */
  const { sunsetOn, nightOn } = phaseOpacities(t);
  gsap.set(skySunsetLayer, { opacity: sunsetOn });
  gsap.set(skyNightLayer, { opacity: nightOn });

  /* --- montañas: mismo crossfade + ligero paralaje de profundidad --- */
  gsap.set([mtnBackSunset, mtnMidSunset, mtnFrontSunset], { opacity: sunsetOn });
  gsap.set([mtnBackNight, mtnMidNight, mtnFrontNight], { opacity: nightOn });
  gsap.set(mountainBack, { y: t * -6 });
  gsap.set(mountainMid, { y: t * -13 });
  gsap.set(mountainFront, { y: t * -22 });

  /* --- sol: asciende 0–35%, brilla al máximo 35–70%, se oculta tras las montañas 70–100% --- */
  const heightFactor = sunHeightFactor(t);
  const viewH = window.innerHeight;
  const groundOffset = viewH * 0.34;
  const riseAmplitude = viewH * 0.5;
  const sunY = groundOffset - heightFactor * riseAmplitude;
  const sunOpacity = t < 0.92 ? 1 : 1 - (t - 0.92) / 0.08;

  sceneBase.sunY = sunY;
  sceneBase.sunOpacity = sunOpacity;
  sceneBase.heightFactor = heightFactor;

  gsap.set(sunEl, { y: sunY, opacity: sunOpacity, filter: `brightness(${1 + heightFactor * 0.18})` });
  gsap.set(sunHaloEl, { y: sunY, opacity: sunOpacity * (0.35 + heightFactor * 0.65), scale: 0.85 + heightFactor * 0.3 });
  gsap.set(sunGlowEl, { y: sunY, opacity: sunOpacity * (0.3 + heightFactor * 0.6), scale: 0.8 + heightFactor * 0.35 });
  gsap.set(sunRaysEl, { y: sunY, opacity: sunOpacity * heightFactor * 0.85, scale: 0.75 + heightFactor * 0.4 });

  /* --- luna: emerge al llegar la noche --- */
  const moonOpacity = smoothstep(0.75, 0.97, t);
  sceneBase.moonOpacity = moonOpacity;
  sceneBase.moonY = (1 - moonOpacity) * 30;
  gsap.set(moonEl, { opacity: moonOpacity });

  /* --- estrellas --- */
  gsap.set(starsEl, { opacity: smoothstep(0.68, 0.95, t) });
  gsap.set(shootingStarsEl, { opacity: smoothstep(0.72, 0.96, t) });

  /* --- bandada de pájaros cruzando en el atardecer (35–70%), en formación --- */
  const flockWindow = smoothstep(0.3, 0.4, t) * (1 - smoothstep(0.66, 0.76, t));
  const flightProgress = clamp((t - 0.32) / 0.4, 0, 1);
  sceneBase.flightProgress = flightProgress;
  const flockX = lerp(118, -32, flightProgress);
  sceneBase.flockX = flockX;
  const flockDrop = flightProgress * 6; // leve descenso al cruzar, como planeando
  gsap.set(birdEls, { opacity: 1 });
  gsap.set(flockEl, { opacity: flockWindow, x: `${flockX}vw`, y: flockDrop });
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

/* =========================================================
   9. LOOP AMBIENTAL: respiración del sol, flotación de la luna y
      vuelo de los pájaros — corre siempre, no solo mientras se scrollea.
   Se cuelga del propio ticker de GSAP (el mismo que usa ScrollTrigger)
   en lugar de abrir un requestAnimationFrame paralelo, para que todo
   se actualice en el mismo frame y no haya "tirones" entre relojes.
   ========================================================= */
function ambientTick(seconds) {
  if (prefersReducedMotion) return;

  /* el sol "respira": un pulso de escala muy sutil, más notorio cuando ya está alto */
  const sunPulse = 1 + Math.sin(seconds * 0.6) * 0.012 * (0.3 + sceneBase.heightFactor);
  gsap.set(sunEl, { scale: sunPulse });
  gsap.set(sunHaloEl, { scale: (0.85 + sceneBase.heightFactor * 0.3) * (1 + Math.sin(seconds * 0.6) * 0.02) });

  /* la luna flota despacio sobre su posición base */
  if (sceneBase.moonOpacity > 0.01) {
    gsap.set(moonEl, { y: sceneBase.moonY + Math.sin(seconds * 0.35) * 7 });
  }

  /* los pájaros ondulan en su trayectoria y se inclinan según su velocidad vertical */
  const flockTravel = 150;
  const flockX = -32 + ((sceneBase.flockX - 32 - seconds * 8) % flockTravel + flockTravel) % flockTravel;
  gsap.set(flockEl, { x: `${flockX}vw` });

  birdEls.forEach((bird, i) => {
    const bob = Math.sin(seconds * 2.4 + i * 1.1) * 9;
    const tilt = Math.cos(seconds * 2.4 + i * 1.1) * 10;
    gsap.set(bird, { y: bob, rotation: tilt });
  });
}
gsap.ticker.add(ambientTick);

/* Pausar el ticker de GSAP (el loop ambiental de sol/luna/pájaros) cuando
   la pestaña o la app no está visible, para no seguir gastando batería/CPU
   de fondo sin que nadie lo esté viendo. Como ambientTick usa el tiempo
   acumulado del propio ticker (no el reloj real), al volver no hay ningún
   salto brusco en la animación. */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    gsap.ticker.sleep();
  } else {
    gsap.ticker.wake();
  }
});

requestAnimationFrame(() => {
  document.body.classList.add('page-ready');
});

window.addEventListener('load', () => ScrollTrigger.refresh());
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
  updateScene(sceneState.progress);
});

// Asegurarnos de que la música principal vuelva a sonar si regresó desde el libro
  if (window.parent && window.parent.document.getElementById('bg-music')) {
    const musicaPrincipal = window.parent.document.getElementById('bg-music');
    // Si la música principal estaba pausada (porque vino del libro), le damos play de nuevo
    if (musicaPrincipal.paused) {
      musicaPrincipal.play().catch(() => {});
    }
  }