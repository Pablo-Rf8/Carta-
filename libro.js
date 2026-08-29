const pages = [...document.querySelectorAll('.book-page')];
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const pageIndicator = document.getElementById('pageIndicator');
const book = document.getElementById('book');
// En celular no hay espacio para mostrar 2 páginas lado a lado,
// así que ahí el libro siempre se navega de a 1 página a pantalla completa.
const mobileQuery = window.matchMedia('(max-width: 480px)');
let currentPage = 0;

function isSpread() {
  return book.classList.contains('book-open') && !mobileQuery.matches;
}

function showPage(pageIndex, direction = 1) {
  const targetPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
  // Guardamos cuál era la página activa para poder animar su salida.
  const previousActivePage = pages.find((page) => page.classList.contains('page-active'));
  const isPageChanging = !previousActivePage || pages.indexOf(previousActivePage) !== targetPage;
  currentPage = targetPage;
  
  // Cerrar el libro si estamos en la portada
  if (currentPage === 0 && book.classList.contains('book-open')) {
    book.classList.remove('book-open', 'book-single-end');
  }
  
 // Actualizar clases de las páginas
  pages.forEach((page, index) => {
    page.classList.remove('page-active', 'page-companion', 'page-enter-next', 'page-enter-prev', 'page-exit-next', 'page-exit-prev');
    
    if (index === currentPage) {
      page.classList.add('page-active');
      // Solo aplicar la animación de entrada si hay un cambio de página real
      if (isPageChanging) {
        page.classList.add(direction >= 0 ? 'page-enter-next' : 'page-enter-prev');
      }
    } else if (isSpread() && index === currentPage + 1) {
      page.classList.add('page-companion');
    }
  });

  // Animar la salida de la página anterior (efecto de "voltear" la hoja),
  // en vez de que desaparezca de golpe.
  if (isPageChanging && previousActivePage && previousActivePage !== pages[currentPage]) {
    const exitClass = direction >= 0 ? 'page-exit-next' : 'page-exit-prev';
    previousActivePage.classList.add(exitClass);
    previousActivePage.addEventListener('animationend', () => {
      previousActivePage.classList.remove(exitClass);
    }, { once: true });
  }
  
  // Aplicar estilos especiales para última página (solo aplica en modo "spread")
  book.classList.toggle('book-single-end', isSpread() && currentPage === pages.length - 1);
  
  // Actualizar indicador de página
  pageIndicator.textContent = currentPage === 0 ? 'Portada' : `${currentPage} / ${pages.length - 1}`;
  
  // Actualizar estado de botones
  previousButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === pages.length - 1;
}

function goToPreviousPage() {
  if (currentPage === 0) return;
  
  if (currentPage === 1 && book.classList.contains('book-open')) {
    // Si estamos en página 1 con el libro abierto, cerrar y volver a portada
    book.classList.remove('book-open', 'book-single-end');
    showPage(0, -1);
  } else if (isSpread() && book.classList.contains('book-single-end')) {
    // Veníamos de la última página mostrada sola: volver de a 2
    showPage(currentPage - 2, -1);
  } else if (isSpread()) {
    // Modo de 2 páginas (escritorio): retroceder de a 2
    showPage(currentPage - 2, -1);
  } else {
    // Modo de 1 página (celular, o libro cerrado): retroceder de a 1
    showPage(currentPage - 1, -1);
  }
}

function goToNextPage() {
  if (currentPage === pages.length - 1) return;
  
  if (currentPage === 0 && !book.classList.contains('book-open')) {
    // Abrir el libro desde la portada
    book.classList.add('book-open');
    showPage(1, 1);
  } else if (isSpread()) {
    // Modo de 2 páginas (escritorio): avanzar de a 2
    showPage(currentPage + 2, 1);
  } else {
    // Modo de 1 página (celular, o libro cerrado): avanzar de a 1
    showPage(currentPage + 1, 1);
  }
}

// Si el usuario rota el celular o cambia de tamaño de ventana cruzando el
// límite móvil/escritorio, volvemos a calcular cómo debe verse la página actual.
mobileQuery.addEventListener('change', () => showPage(currentPage));

previousButton.addEventListener('click', goToPreviousPage);
nextButton.addEventListener('click', () => {
  goToNextPage();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') goToPreviousPage();
  if (event.key === 'ArrowRight') goToNextPage();
});

// ==========================================
// NUEVAS FUNCIONES: SWIPE Y CLIC EN BORDES
// ==========================================

// 1. Clic en los lados del libro para cambiar de página
book.addEventListener('click', (e) => {
  // Ignorar si se hace clic en un botón o en el enlace de "volver"
  if (e.target.closest('button') || e.target.closest('a')) return;

  const rect = book.getBoundingClientRect();
  const clickX = e.clientX - rect.left;

  // Si hace clic en la mitad izquierda
  if (clickX < rect.width / 2) {
    goToPreviousPage();
  } else {
    // Si hace clic en la mitad derecha
    goToNextPage();
  }
});

// 2. Soporte para deslizar (Swipe) en pantallas táctiles
let touchStartX = 0;
let touchEndX = 0;

book.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

book.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}, { passive: true });

function handleSwipe() {
  const swipeThreshold = 40; // Distancia mínima para considerarlo un deslizamiento
  
  if (touchEndX < touchStartX - swipeThreshold) {
    goToNextPage(); // Deslizó hacia la izquierda
  }
  
  if (touchEndX > touchStartX + swipeThreshold) {
    goToPreviousPage(); // Deslizó hacia la derecha
  }
}

showPage(0);