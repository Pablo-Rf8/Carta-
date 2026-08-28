/* =========================================================
   0. DETECCIÓN DE DISPOSITIVO: menos elementos animados en
      celulares y en modo "reducir movimiento", para que no se
      trabe la animación en equipos con menos potencia.
   ========================================================= */
const isMobileViewport = window.matchMedia('(max-width: 640px)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   1. RUTAS DE IMÁGENES LOCALES
   ========================================================= */
const flowerImages = [
  'img/flor1.png',
  'img/flor2.png',
  'img/flor3.png',
  'img/flor4.png'
];

/* Se decodifican las 4 imágenes apenas carga el script (no en el clic), así
   cuando el usuario toca el sobre el navegador ya las tiene listas en caché
   y decodificadas, en vez de tener que hacerlo de golpe justo cuando arranca
   la animación del corazón. */
flowerImages.forEach((src) => {
  const preloadImg = new Image();
  preloadImg.src = src;
  if (preloadImg.decode) preloadImg.decode().catch(() => {});
});

const letterMessage = `Hoy cumplimos nuestro primer mes juntos y quería hacerte algo especial que durara para siempre.

Si tuviera que describirte con una sola palabra, serías mi cielo: inmenso, hermoso y el lugar donde siempre encuentro calma cuando miro hacia arriba.

Gracias por este primer mes de sonrisas, por tus palabras y por hacerme sentir tan afortunado. Te amo con todo mi corazón.`;

/* =========================================================
   2. EVENTO PRINCIPAL: TOCAR EL SOBRE
   ========================================================= */
const sobreInteractuable = document.getElementById('sobreInteractuable');
const bgMusic = document.getElementById('bg-music');
const heroTitle = document.querySelector('.hero-title');

let sobreTocado = false;

sobreInteractuable.addEventListener('click', () => {
  if (sobreTocado) return;
  sobreTocado = true;

  // 1. Iniciar música
  if (bgMusic) bgMusic.play().catch(() => console.log("Audio bloqueado."));

  // 2. Ocultar el título principal
  heroTitle.classList.add('hide');

  // Ocultar el sobre para dejar visible el corazón de flores
  sobreInteractuable.classList.add('preparando-flores');

  // 3. Iniciar la explosión de flores en forma de corazón INMEDIATAMENTE
  triggerFlowerBloom();

  // 4. Esperar a que todas las flores terminen de formar el corazón
  setTimeout(() => {
    sobreInteractuable.classList.remove('preparando-flores');
    abrirCarta();
  }, 5600); // 3.2s de aparición + 2.2s de formación de cada flor
});

/* =========================================================
   3. ABRIR CARTA Y TIPIAR TEXTO
   ========================================================= */
const bloomStage = document.getElementById('bloom-stage');
const typedTextEl = document.getElementById('typed-text');
const cursorEl = document.getElementById('cursor');
const nextJourney = document.getElementById('nextJourney');
const journeyBtn = document.getElementById('journeyBtn');

function abrirCarta() {
  // Abre el CSS del sobre (despliega la carta en pantalla completa)
  sobreInteractuable.classList.add('abierto');
  
  // Aléja la cámara hacia las flores (Zoom-in empuje)
  bloomStage.classList.add('zoom-in');

  // Esperar a que la carta termine de abrirse antes de escribir
  setTimeout(() => {
    bloomStage.classList.add('fade-out');
    startTypewriter();
  }, 1900);
}

function startTypewriter() {
  let index = 0;
  const speed = 36; // Velocidad de escritura en milisegundos
  const letterBody = document.querySelector('.letter-body'); // se busca UNA sola vez

  function type() {
    if (index < letterMessage.length) {
      typedTextEl.textContent += letterMessage.charAt(index);
      index++;
      // Autoscroll mientras escribe si el texto es muy largo
      letterBody.scrollTop = letterBody.scrollHeight;

      setTimeout(type, speed);
    } else {
      cursorEl.style.display = 'none';
      // Termina de escribir -> Muestra el botón de la siguiente página
      setTimeout(() => {
        nextJourney.classList.add('show');
      }, 600);
    }
  }
  setTimeout(type, 400); // Pequeña pausa antes de empezar a escribir
}

/* =========================================================
   4. TRANSICIÓN A LA SEGUNDA PÁGINA (cielo.html)
   ========================================================= */
if (journeyBtn) {
  journeyBtn.addEventListener('click', (event) => {
    event.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => {
      window.location.href = journeyBtn.href;
    }, 700);
  });
}

/* =========================================================
   5. MOTOR DE FLORES EN FORMA DE CORAZÓN
   ========================================================= */
const bloomContainer = document.getElementById('bloom-container');

function generateHeartPoints(count) {
  const points = [];
  const gridSize = 18;
  const cellSize = 2.6 / gridSize;

  for (let row = 0; row < gridSize; row++) {
    for (let column = 0; column < gridSize; column++) {
      const x = -1.3 + (column + 0.5) * cellSize + (Math.random() - 0.5) * cellSize * 0.45;
      const y = -1.3 + (row + 0.5) * cellSize + (Math.random() - 0.5) * cellSize * 0.45;
      const val = Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y;

      if (val <= 0) {
        points.push({ x, y, r: Math.sqrt(x * x + y * y) });
      }
    }
  }

  points.sort(() => Math.random() - 0.5);
  points.splice(count);
  points.sort((a, b) => a.r - b.r);
  return points;
}

function triggerFlowerBloom() {
  // Menos flores en celular (y todavía menos si el usuario prefiere menos
  // movimiento en pantalla): son muchos elementos DOM animados a la vez,
  // y en equipos de gama baja eso es lo que hace que la explosión se sienta
  // trabada. En escritorio se mantienen las 120 originales.
  const totalFlowers = prefersReducedMotion ? 30 : (isMobileViewport ? 55 : 120);
  const heartPoints = generateHeartPoints(totalFlowers);
  const baseSize = Math.min(window.innerWidth, window.innerHeight);
  const heartScale = baseSize * 0.42;
  const bloomWindow = 3200; // Aparición escalonada de todo el corazón

  heartPoints.forEach((pt, i) => {
    const img = document.createElement('img');
    img.className = 'blooming-flower';

    const tx = pt.x * heartScale;
    const ty = -pt.y * heartScale; // Invertido para que el corazón no salga de cabeza
    const rot = Math.random() * 360;
    const scale = (Math.random() * 0.35 + 0.85).toFixed(2);
    const size = Math.floor(Math.random() * 30 + 85);

    img.src = flowerImages[i % flowerImages.length];
    img.loading = 'eager';
    img.decoding = 'async';
    // Una sola escritura de estilo en vez de 4 (menos recálculos de layout)
    img.style.cssText = `--tx:${tx}px; --ty:${ty}px; --rot:${rot}deg; --scale:${scale}; --size:${size}px;`;

    // Libera la capa de composición apenas termina de animarse esta flor;
    // así no quedan 120 capas GPU promovidas para siempre una vez formado el corazón.
    img.addEventListener('transitionend', () => {
      img.style.willChange = 'auto';
    }, { once: true });

    bloomContainer.appendChild(img);

    const delay = (i / heartPoints.length) * bloomWindow;
    setTimeout(() => {
      img.classList.add('bloomed');
    }, delay);
  });
}

/* =========================================================
   6. PÉTALOS DE FONDO (CANVAS)
   ========================================================= */
const canvas = document.getElementById('petals-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let petals = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class FallingPetal {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.size = Math.random() * 8 + 6;
      this.speedY = Math.random() * 1.2 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.rotation = Math.random() * 360;
      this.rotSpeed = (Math.random() - 0.5) * 2;
      const colors = ['#ffb7c5', '#ff9ebb', '#fcd5ce', '#ffd166'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;
      if (this.y > canvas.height + 20) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size, this.size / 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < (isMobileViewport ? 12 : 25); i++) {
    const p = new FallingPetal();
    p.y = Math.random() * canvas.height;
    petals.push(p);
  }

  let petalsAnimationId = null;
  function animatePetals() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    petals.forEach(p => {
      p.update();
      p.draw();
    });
    petalsAnimationId = requestAnimationFrame(animatePetals);
  }

  // Pausar el canvas cuando la pestaña/app no está visible (al cambiar de
  // app en el celular o minimizar), así no se sigue gastando batería/CPU
  // de fondo sin que nadie lo esté viendo.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (petalsAnimationId) cancelAnimationFrame(petalsAnimationId);
      petalsAnimationId = null;
    } else if (!petalsAnimationId) {
      animatePetals();
    }
  });

  if (!prefersReducedMotion) {
    animatePetals();
  } else {
    // Con "reducir movimiento" activado, se dibuja un solo cuadro estático
    // en vez de animar sin parar.
    petals.forEach(p => p.draw());
  }
}