/* =========================================================
   RAMO ANIMADO — movimiento orgánico (viento) + paralaje 3D
   Sin @keyframes de CSS: todo el transform de cada flor, hoja y
   tallo se calcula frame a frame con seno/coseno, para que nada
   se sienta repetitivo ni mecánico.
   ========================================================= */

const container = document.getElementById('ramoContainer');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileViewport = window.matchMedia('(max-width: 560px)').matches;

/* ---------------------------------------------------------
   1. PERFIL DE MOVIMIENTO POR CAPA
   Cada capa (fondo / medio / frente) tiene un "carácter" propio:
   - las hojas del fondo son lo más liviano: se mueven más rápido
     y con más ángulo (revolotean con cualquier corriente de aire),
     pero como están más "lejos" el paralaje las mueve poco.
   - las peonías del frente son las más pesadas: oscilan más lento
     (más inercia), pero con más recorrido vertical (más presencia),
     y como están más "cerca" el paralaje las mueve mucho más.
   - los girasoles quedan en un punto intermedio entre ambas.
   Los rangos se resuelven con un poco de azar en cada carga, así
   el ramo nunca se mece exactamente igual dos veces.
   --------------------------------------------------------- */
const LAYER_PROFILES = {
  back:  { rotAmp: [3, 5.5],   rotFreq: [0.22, 0.34], yAmp: [4, 7],   yFreq: [0.28, 0.4],  xAmp: [3, 5],   xFreq: [0.18, 0.3],  parallax: 7  },
  mid:   { rotAmp: [2.5, 4],   rotFreq: [0.2, 0.3],   yAmp: [3, 5.5], yFreq: [0.22, 0.32], xAmp: [2.5, 4], xFreq: [0.16, 0.26], parallax: 14 },
  front: { rotAmp: [1.4, 2.6], rotFreq: [0.13, 0.2],  yAmp: [5, 8.5], yFreq: [0.16, 0.24], xAmp: [3, 5.5], xFreq: [0.12, 0.2],  parallax: 23 },
  stem:  { rotAmp: [2, 4],     rotFreq: [0.18, 0.3],  yAmp: [0, 0],   yFreq: [0, 0],       xAmp: [0, 0],   xFreq: [0, 0],       parallax: 0  },
  // El pasto es lo más liviano de toda la escena: es lo primero que se
  // mueve con cualquier corriente de aire, así que tiene el mayor ángulo
  // y la mayor frecuencia de todos los elementos.
  grass: { rotAmp: [4, 7.5],   rotFreq: [0.3, 0.48],  yAmp: [0, 0],   yFreq: [0, 0],       xAmp: [0, 0],   xFreq: [0, 0],       parallax: 0  }
};

const rand = (min, max) => min + Math.random() * (max - min);
const lerp = (a, b, t) => a + (b - a) * t;

function buildState(el, profile, extra = {}) {
  return {
    el,
    rotAmp: rand(...profile.rotAmp),
    rotFreq: rand(...profile.rotFreq),
    rotPhase: rand(0, Math.PI * 2),
    yAmp: rand(...profile.yAmp),
    yFreq: rand(...profile.yFreq),
    yPhase: rand(0, Math.PI * 2),
    xAmp: rand(...profile.xAmp),
    xFreq: rand(...profile.xFreq),
    xPhase: rand(0, Math.PI * 2),
    parallax: profile.parallax,
    baseAngle: 0,
    mirror: 1,
    ...extra
  };
}

/* ---------------------------------------------------------
   2. REGISTRAR TODAS LAS FLORES/HOJAS
   --------------------------------------------------------- */
const floralState = [...document.querySelectorAll('.flor-mover')].map((el) => {
  const layer = el.dataset.layer || 'mid';
  const mirror = el.dataset.mirror === '1' ? -1 : 1;
  return buildState(el, LAYER_PROFILES[layer], { mirror });
});

/* ---------------------------------------------------------
   3. REGISTRAR LOS 7 TALLOS
   El ángulo base de cada uno viene del HTML (data-base-angle) y
   define hacia qué flor "apunta"; el JS solo le suma el mecido.
   --------------------------------------------------------- */
const stemState = [...document.querySelectorAll('.stem')].map((el) => {
  const baseAngle = parseFloat(el.dataset.baseAngle || '0');
  const len = el.dataset.len || '50';
  el.style.setProperty('--len', `${len}%`);
  el.style.setProperty('--base-angle', `${baseAngle}deg`);
  return buildState(el, LAYER_PROFILES.stem, { baseAngle });
});

/* ---------------------------------------------------------
   3.5 GENERAR EL PASTO/HIERBA
   Muchas briznas de CSS puro repartidas a lo ancho del ramo, más
   altas hacia los costados (como en un ramo silvestre que se
   "desborda" de verde), con distintos tonos para dar profundidad.
   Menos cantidad en celular por rendimiento.
   --------------------------------------------------------- */
const GRASS_COLORS = [
  { light: '#7fbf66', dark: '#1f3d1a' },
  { light: '#5f9c4a', dark: '#173015' },
  { light: '#93cf78', dark: '#2a4d22' }
];
const GRASS_COUNT = isMobileViewport ? 16 : 26;

function createGrass() {
  const grassField = document.getElementById('grassField');
  const blades = [];
  for (let i = 0; i < GRASS_COUNT; i++) {
    const t = i / (GRASS_COUNT - 1);
    const edgeBoost = Math.abs(t - 0.5) * 2; // 0 en el centro, 1 en los bordes
    const left = lerp(-12, 112, t) + rand(-3, 3);
    const lenPct = rand(30, 46) + edgeBoost * rand(14, 30); // más altas hacia los costados
    const angle = lerp(-28, 28, t) + rand(-7, 7);
    const color = GRASS_COLORS[Math.floor(Math.random() * GRASS_COLORS.length)];

    const blade = document.createElement('div');
    blade.className = 'grass';
    blade.style.left = `${left}%`;
    blade.dataset.lenPct = lenPct; // % respecto al ANCHO del contenedor (ver applyGrassSizing)
    blade.style.setProperty('--g-angle', `${angle}deg`);
    blade.style.setProperty('--g-light', color.light);
    blade.style.setProperty('--g-dark', color.dark);
    grassField.appendChild(blade);
    blades.push({ el: blade, baseAngle: angle });
  }
  return blades;
}

const grassState = createGrass().map((g) => buildState(g.el, LAYER_PROFILES.grass, { baseAngle: g.baseAngle }));

/* Alto de cada brizna en base al ANCHO del contenedor, no a su alto.
   Si se calculara sobre el alto (contenedor angosto y muy vertical en
   celular), con los ángulos inclinados las puntas terminaban "volando"
   muy lejos hacia los costados y se salían de la pantalla. Al basarlo en
   el ancho, la inclinación siempre queda proporcional a cuánto espacio
   horizontal hay disponible, en cualquier tamaño de pantalla. */
function applyGrassSizing() {
  const w = container.clientWidth;
  grassState.forEach((g) => {
    const lenPct = parseFloat(g.el.dataset.lenPct);
    g.el.style.height = `${(lenPct / 100) * w}px`;
  });
}
applyGrassSizing();
window.addEventListener('resize', applyGrassSizing);

/* ---------------------------------------------------------
   4. ESCALAR LAS AMPLITUDES SEGÚN EL TAMAÑO REAL DEL RAMO
   Así el mecido se ve proporcional tanto en un celular chico
   como en un monitor grande, en vez de usar los mismos píxeles
   fijos para cualquier tamaño de pantalla.
   --------------------------------------------------------- */
let scaleFactor = 1;
function recomputeScale() {
  const baseWidth = 900; // ancho de referencia con el que se afinaron los valores de arriba
  scaleFactor = clamp(container.clientWidth / baseWidth, 0.55, 1.35);
}
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
recomputeScale();
window.addEventListener('resize', recomputeScale);

/* ---------------------------------------------------------
   5. PARALAJE POR MOUSE / TOUCH
   Se guarda un valor "objetivo" (-1..1 en x e y, según la posición
   del puntero relativa al centro de la pantalla) y se interpola
   suavemente hacia él cada frame, para que no se sienta brusco.
   --------------------------------------------------------- */
let targetParX = 0;
let targetParY = 0;
let parX = 0;
let parY = 0;

function setPointerTarget(clientX, clientY) {
  targetParX = (clientX / window.innerWidth - 0.5) * 2;
  targetParY = (clientY / window.innerHeight - 0.5) * 2;
}

window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return; // el touch se maneja aparte, con "drag" en vez de "hover"
  setPointerTarget(e.clientX, e.clientY);
});
window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (!t) return;
  setPointerTarget(t.clientX, t.clientY);
}, { passive: true });

// Si el puntero se va de la ventana, el ramo vuelve suavemente al centro.
window.addEventListener('pointerleave', () => { targetParX = 0; targetParY = 0; });
document.addEventListener('touchend', () => { targetParX = 0; targetParY = 0; }, { passive: true });

/* ---------------------------------------------------------
   6. LOOP PRINCIPAL — requestAnimationFrame
   --------------------------------------------------------- */
let rafId = null;

function tick(now) {
  const t = now / 1000;

  // Interpolación suave del paralaje (evita saltos bruscos de un frame a otro)
  parX += (targetParX - parX) * 0.055;
  parY += (targetParY - parY) * 0.055;

  // Tallos y pasto: solo rotan alrededor de su base (ya anclada por CSS)
  stemState.forEach((s) => {
    const sway = Math.sin(t * s.rotFreq * Math.PI * 2 + s.rotPhase) * s.rotAmp * scaleFactor;
    s.el.style.transform = `translateX(-50%) rotate(${s.baseAngle + sway}deg)`;
  });
  grassState.forEach((s) => {
    const sway = Math.sin(t * s.rotFreq * Math.PI * 2 + s.rotPhase) * s.rotAmp * scaleFactor;
    s.el.style.transform = `translateX(-50%) rotate(${s.baseAngle + sway}deg)`;
  });

  // Flores y hojas: mecido orgánico (rotar + traslación en x/y) + paralaje por capa
  floralState.forEach((s) => {
    const sway = Math.sin(t * s.rotFreq * Math.PI * 2 + s.rotPhase) * s.rotAmp;
    const bobY = Math.sin(t * s.yFreq * Math.PI * 2 + s.yPhase) * s.yAmp * scaleFactor;
    const bobX = Math.cos(t * s.xFreq * Math.PI * 2 + s.xPhase) * s.xAmp * scaleFactor;
    const parOffsetX = parX * s.parallax * scaleFactor;
    const parOffsetY = parY * s.parallax * 0.5 * scaleFactor;

    s.el.style.transform =
      `translate3d(${bobX + parOffsetX}px, ${bobY + parOffsetY}px, 0) ` +
      `rotate(${sway}deg) scaleX(${s.mirror})`;
  });

  rafId = requestAnimationFrame(tick);
}

function startLoop() {
  if (rafId === null) rafId = requestAnimationFrame(tick);
}
function stopLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

// Pausar todo si la pestaña/app no está visible (ahorra batería/CPU de fondo).
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopLoop();
  else startLoop();
});

if (prefersReducedMotion) {
  // Con "reducir movimiento" activado: se aplican solo los ángulos base de
  // los tallos y el pasto (el ramo queda quieto, sin mecido ni paralaje)
  // para respetar la preferencia de accesibilidad del usuario.
  stemState.forEach((s) => {
    s.el.style.transform = `translateX(-50%) rotate(${s.baseAngle}deg)`;
  });
  grassState.forEach((s) => {
    s.el.style.transform = `translateX(-50%) rotate(${s.baseAngle}deg)`;
  });
} else {
  startLoop();
}

/* ==========================================
   LÓGICA PARA ARRASTRAR WIDGETS (Drag & Drop)
   ========================================== */

let highestZ = 1001;

// Función para convertir % a píxeles
function percentToPixels(percent, dimension) {
  const value = parseFloat(percent);
  if (percent.includes('%')) {
    return (value / 100) * dimension;
  }
  return value;
}

const widgetElements = document.querySelectorAll('.widget');
widgetElements.forEach(widget => {
  let isDragging = false;
  let startX, startY, initialLeft, initialTop;

 const dragStart = (e) => {
    // Evitar arrastrar si hizo clic en un botón, enlace o iframe
    if(e.target.tagName.toLowerCase() === 'button' || 
       e.target.tagName.toLowerCase() === 'a' ||
       e.target.tagName.toLowerCase() === 'iframe' ||
       e.target.closest('iframe')) {
      return;
    }

    isDragging = true;
    highestZ++;
    widget.style.zIndex = highestZ;
    widget.style.transition = 'none';
    
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    startX = clientX;
    startY = clientY;
    
    // Convertir estilos actuales (que pueden ser % o px) a píxeles
    const topStr = widget.style.top || '0';
    const leftStr = widget.style.left || '0';
    
    initialTop = percentToPixels(topStr, window.innerHeight);
    initialLeft = percentToPixels(leftStr, window.innerWidth);
    
    // FIJAR VISIBILIDAD ANTES DE ELIMINAR LA ANIMACIÓN
    widget.style.opacity = '1';
    widget.style.transform = 'scale(1) rotate(0deg)';
    widget.style.animation = 'none';
  };

  const drag = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    const newLeft = initialLeft + dx;
    const newTop = initialTop + dy;

    widget.style.left = `${newLeft}px`;
    widget.style.top = `${newTop}px`;
  };

  const dragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    widget.style.transition = 'all 0.3s ease';
  };

  widget.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  widget.addEventListener('touchstart', dragStart, { passive: false });
  document.addEventListener('touchmove', drag, { passive: false });
  document.addEventListener('touchend', dragEnd);
});

/* ==========================================
   FUNCIONES DE LOS BOTONES
   ========================================== */

// Estado de la música
let isPlaying = false;
const bgMusic = document.getElementById('bg-music');

// Botón Play Canción
const btnPlay = document.getElementById('btn-play-widget');
if (btnPlay) {
  btnPlay.addEventListener('click', () => {
    if (bgMusic) {
      if (isPlaying) {
        bgMusic.pause();
        btnPlay.textContent = '🎵 Play Fondo';
        btnPlay.style.opacity = '0.7';
      } else {
        bgMusic.play();
        btnPlay.textContent = '⏸ Pausar';
        btnPlay.style.opacity = '1';
      }
      isPlaying = !isPlaying;
    }
  });
}

// Botón Guardar Foto del Ramo
const btnDownload = document.getElementById('btn-download-widget');
if (btnDownload) {
  btnDownload.addEventListener('click', async () => {
    try {
      if (typeof html2canvas !== 'undefined') {
        // 1. Seleccionar los elementos de la interfaz a ocultar
        const uiElements = document.querySelectorAll('.widget, .back-link');
        
        // 2. Ocultarlos temporalmente desactivando transiciones para que sea instantáneo
        uiElements.forEach(el => {
          el.style.transition = 'none';
          el.style.opacity = '0';
        });

        // Pausa ultracorta para asegurar que el navegador aplique la invisibilidad
        await new Promise(resolve => setTimeout(resolve, 50));

        // Evitar cortes en la imagen subiendo el scroll
        window.scrollTo(0, 0);

        // 3. Capturar el body completo para incluir el fondo
        const canvas = await html2canvas(document.body, {
          backgroundColor: '#160c18', 
          scale: 2, // Alta resolución
          useCORS: true
        });

        // 4. Restaurar la visibilidad de la interfaz
        uiElements.forEach(el => {
          el.style.transition = ''; 
          el.style.opacity = '1';
        });

        // 5. Descargar la imagen
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'Mi_Ramo_Eterno.png';
        link.click();
        
        btnDownload.textContent = '✅ Guardado';
        setTimeout(() => { btnDownload.textContent = '📸 Guardar Foto'; }, 2000);
      } else {
        if (navigator.screenshot) {
          const canvas = await navigator.screenshot.captureScreen();
          const link = document.createElement('a');
          link.href = canvas.toDataURL();
          link.download = 'mi-ramo-hermoso.png';
          link.click();
        } else {
          alert('Intenta hacer una captura con tu teclado o usa la opción del sistema.');
        }
      }
    } catch (error) {
      console.error('Error al capturar pantalla:', error);
      // Asegurar que la interfaz reaparezca si ocurre un error
      document.querySelectorAll('.widget, .back-link, .ramo-caption').forEach(el => {
        el.style.opacity = '1';
      });
    }
  });
}

// Botón para ir al Cielo
  const btnCielo = document.getElementById('btn-cielo');
  if(btnCielo) {
    btnCielo.addEventListener('click', () => {
      window.location.href = 'cielo.html';
    });
  }

  // Botón para ir al Libro
  const btnLibro = document.getElementById('btn-libro');
  if(btnLibro) {
    btnLibro.addEventListener('click', () => {
      window.location.href = 'libro.html';
    });

    // Asegurarnos de que la música principal vuelva a sonar si regresó desde el libro
  if (window.parent && window.parent.document.getElementById('bg-music')) {
    const musicaPrincipal = window.parent.document.getElementById('bg-music');
    // Si la música principal estaba pausada (porque vino del libro), le damos play de nuevo
    if (musicaPrincipal.paused) {
      musicaPrincipal.play().catch(() => {});
    }
  }
  }
