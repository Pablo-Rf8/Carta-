/* =========================================================
   RAMO ANIMADO — movimiento orgánico (viento) + paralaje 3D
   ========================================================= */

const container = document.getElementById('ramoContainer');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LAYER_PROFILES = {
  back:  { rotAmp: [3, 5.5],   rotFreq: [0.22, 0.34], yAmp: [4, 7],   yFreq: [0.28, 0.4],  xAmp: [3, 5],   xFreq: [0.18, 0.3],  parallax: 7  },
  mid:   { rotAmp: [2.5, 4],   rotFreq: [0.2, 0.3],   yAmp: [3, 5.5], yFreq: [0.22, 0.32], xAmp: [2.5, 4], xFreq: [0.16, 0.26], parallax: 14 },
  front: { rotAmp: [1.4, 2.6], rotFreq: [0.13, 0.2],  yAmp: [5, 8.5], yFreq: [0.16, 0.24], xAmp: [3, 5.5], xFreq: [0.12, 0.2],  parallax: 23 },
  stem:  { rotAmp: [2, 4],     rotFreq: [0.18, 0.3],  yAmp: [0, 0],   yFreq: [0, 0],       xAmp: [0, 0],   xFreq: [0, 0],       parallax: 0  }
};

const rand = (min, max) => min + Math.random() * (max - min);

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

const floralState = [...document.querySelectorAll('.flor-mover')].map((el) => {
  const layer = el.dataset.layer || 'mid';
  const mirror = el.dataset.mirror === '1' ? -1 : 1;
  return buildState(el, LAYER_PROFILES[layer], { mirror });
});

const stemState = [...document.querySelectorAll('.stem')].map((el) => {
  const baseAngle = parseFloat(el.dataset.baseAngle || '0');
  const len = el.dataset.len || '50';
  el.style.setProperty('--len', `${len}%`);
  el.style.setProperty('--base-angle', `${baseAngle}deg`);
  return buildState(el, LAYER_PROFILES.stem, { baseAngle });
});

let scaleFactor = 1;
function recomputeScale() {
  const baseWidth = 900; 
  scaleFactor = clamp(container.clientWidth / baseWidth, 0.55, 1.35);
}
function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
recomputeScale();
window.addEventListener('resize', recomputeScale);

let targetParX = 0;
let targetParY = 0;
let parX = 0;
let parY = 0;

function setPointerTarget(clientX, clientY) {
  targetParX = (clientX / window.innerWidth - 0.5) * 2;
  targetParY = (clientY / window.innerHeight - 0.5) * 2;
}

window.addEventListener('pointermove', (e) => {
  if (e.pointerType === 'touch') return; 
  setPointerTarget(e.clientX, e.clientY);
});
window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (!t) return;
  setPointerTarget(t.clientX, t.clientY);
}, { passive: true });

window.addEventListener('pointerleave', () => { targetParX = 0; targetParY = 0; });
document.addEventListener('touchend', () => { targetParX = 0; targetParY = 0; }, { passive: true });

let rafId = null;

function tick(now) {
  const t = now / 1000;

  parX += (targetParX - parX) * 0.055;
  parY += (targetParY - parY) * 0.055;

  stemState.forEach((s) => {
    const sway = Math.sin(t * s.rotFreq * Math.PI * 2 + s.rotPhase) * s.rotAmp * scaleFactor;
    s.el.style.transform = `translateX(-50%) rotate(${s.baseAngle + sway}deg)`;
  });

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

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopLoop();
  else startLoop();
});

if (prefersReducedMotion) {
  stemState.forEach((s) => {
    s.el.style.transform = `translateX(-50%) rotate(${s.baseAngle}deg)`;
  });
} else {
  startLoop();
}

/* ==========================================
   LÓGICA PARA ARRASTRAR WIDGETS (Drag & Drop)
   ========================================== */
let highestZ = 1001;

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
    
    const topStr = widget.style.top || '0';
    const leftStr = widget.style.left || '0';
    
    initialTop = percentToPixels(topStr, window.innerHeight);
    initialLeft = percentToPixels(leftStr, window.innerWidth);
    
    widget.style.animation = 'none';
  };

  const drag = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    widget.style.left = `${initialLeft + dx}px`;
    widget.style.top = `${initialTop + dy}px`;
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
   FUNCIONES DE LOS BOTONES Y MÚSICA
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {

  // Botón Guardar Foto del Ramo
  const btnDownload = document.getElementById('btn-download-widget');
  if (btnDownload) {
    btnDownload.addEventListener('click', async () => {
      try {
        const originalText = btnDownload.textContent;
        btnDownload.textContent = '⏳ Guardando...';

        if (typeof html2canvas !== 'undefined') {
          // 1. Seleccionar los widgets y el botón de volver
          const uiElements = document.querySelectorAll('.widget, .back-link');
          
          // 2. BORRARLOS COMPLETAMENTE DE LA PANTALLA TEMPORALMENTE
          uiElements.forEach(el => {
            el.style.display = 'none';
          });

          // 3. Esperar un momento a que el navegador limpie la pantalla real
          await new Promise(resolve => setTimeout(resolve, 150));
          window.scrollTo(0, 0);

          // 4. Capturar toda la pantalla (ahora sí, 100% limpia)
          const canvas = await html2canvas(document.body, {
            backgroundColor: '#160c18', 
            scale: 2, 
            useCORS: true
          });

          // 5. Restaurar la visibilidad de los widgets
          uiElements.forEach(el => {
            el.style.display = ''; 
          });

          // 6. Descargar la imagen
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = 'Mi_Ramo_Eterno.png';
          link.click();
          
          btnDownload.textContent = '✅ Guardado';
          setTimeout(() => { btnDownload.textContent = originalText; }, 3000);
        } else {
          alert('Intenta hacer una captura con tu celular.');
          btnDownload.textContent = originalText;
        }
      } catch (error) {
        console.error('Error al capturar pantalla:', error);
        document.querySelectorAll('.widget, .back-link').forEach(el => {
          el.style.display = '';
        });
        btnDownload.textContent = '❌ Error';
      }
    });
  }

  // DESPERTAR LA MÚSICA SI REGRESA DEL LIBRO
  if (window.parent && window.parent.document.getElementById('bg-music')) {
    const musicaPrincipal = window.parent.document.getElementById('bg-music');
    if (musicaPrincipal.paused) {
      musicaPrincipal.play().catch(() => {});
    }
  }

});