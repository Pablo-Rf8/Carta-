const pages = [...document.querySelectorAll('.book-page')];
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const pageIndicator = document.getElementById('pageIndicator');
const book = document.getElementById('book');
const mobileQuery = window.matchMedia('(max-width: 480px)');
let currentPage = 0;

function isSpread() {
  return book.classList.contains('book-open') && !mobileQuery.matches;
}

function showPage(pageIndex, direction = 1) {
  const targetPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
  const previousActivePage = pages.find((page) => page.classList.contains('page-active'));
  const isPageChanging = !previousActivePage || pages.indexOf(previousActivePage) !== targetPage;
  currentPage = targetPage;
  
  if (currentPage === 0 && book.classList.contains('book-open')) {
    book.classList.remove('book-open', 'book-single-end');
  }
  
  pages.forEach((page, index) => {
    page.classList.remove('page-active', 'page-companion', 'page-enter-next', 'page-enter-prev', 'page-exit-next', 'page-exit-prev');
    
    if (index === currentPage) {
      page.classList.add('page-active');
      if (isPageChanging) {
        page.classList.add(direction >= 0 ? 'page-enter-next' : 'page-enter-prev');
      }
    } else if (isSpread() && index === currentPage + 1) {
      page.classList.add('page-companion');
    }
  });

  if (isPageChanging && previousActivePage && previousActivePage !== pages[currentPage]) {
    const exitClass = direction >= 0 ? 'page-exit-next' : 'page-exit-prev';
    previousActivePage.classList.add(exitClass);
    previousActivePage.addEventListener('animationend', () => {
      previousActivePage.classList.remove(exitClass);
    }, { once: true });
  }
  
  book.classList.toggle('book-single-end', isSpread() && currentPage === pages.length - 1);
  pageIndicator.textContent = currentPage === 0 ? 'Portada' : `${currentPage} / ${pages.length - 1}`;
  previousButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === pages.length - 1;
}

function goToPreviousPage() {
  if (currentPage === 0) return;
  if (currentPage === 1 && book.classList.contains('book-open')) {
    book.classList.remove('book-open', 'book-single-end');
    showPage(0, -1);
  } else if (isSpread() && book.classList.contains('book-single-end')) {
    showPage(currentPage - 2, -1);
  } else if (isSpread()) {
    showPage(currentPage - 2, -1);
  } else {
    showPage(currentPage - 1, -1);
  }
}

function goToNextPage() {
  if (currentPage === pages.length - 1) return;
  if (currentPage === 0 && !book.classList.contains('book-open')) {
    book.classList.add('book-open');
    showPage(1, 1);
  } else if (isSpread()) {
    showPage(currentPage + 2, 1);
  } else {
    showPage(currentPage + 1, 1);
  }
}

mobileQuery.addEventListener('change', () => showPage(currentPage));
previousButton.addEventListener('click', goToPreviousPage);
nextButton.addEventListener('click', goToNextPage);

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') goToPreviousPage();
  if (event.key === 'ArrowRight') goToNextPage();
});

book.addEventListener('click', (e) => {
  if (e.target.closest('button') || e.target.closest('a')) return;
  const rect = book.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  if (clickX < rect.width / 2) {
    goToPreviousPage();
  } else {
    goToNextPage();
  }
});

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
  const swipeThreshold = 40; 
  if (touchEndX < touchStartX - swipeThreshold) {
    goToNextPage(); 
  }
  if (touchEndX > touchStartX + swipeThreshold) {
    goToPreviousPage(); 
  }
}

showPage(0);

// ==========================================
// LÓGICA DE MÚSICA Y NAVEGACIÓN DE REGRESO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Pausar la música principal (A_Love_Like_Her) del index.html
  if (window.parent && window.parent.document.getElementById('bg-music')) {
    window.parent.document.getElementById('bg-music').pause();
  }

  // 2. Darle play a la música exclusiva del libro (Cupid_sQuiver)
  const musicaLibro = document.getElementById('musica-libro');
  if (musicaLibro) {
    musicaLibro.play().catch(() => {
      // Si el navegador la bloquea por permisos, le damos play al primer clic en el libro
      document.body.addEventListener('click', function playOnFirstClick() {
        musicaLibro.play();
        document.body.removeEventListener('click', playOnFirstClick);
      }, { once: true });
    });
  }

  // 3. Función para regresar al ramo y restaurar la música principal
  function regresarAlRamo(e) {
    e.preventDefault();
    
    // Apagamos la música del libro
    if (musicaLibro) musicaLibro.pause();

    // Despertamos la del index.html para que suene desde donde se quedó
    if (window.parent && window.parent.document.getElementById('bg-music')) {
      window.parent.document.getElementById('bg-music').play().catch(() => {});
    }

    // Cambiamos la página dentro del iframe
    window.location.href = 'home.html';
  }

  // Asignar la función al botón del final del libro
  const btnRegresarFinal = document.getElementById('btn-regresar-home');
  if (btnRegresarFinal) btnRegresarFinal.addEventListener('click', regresarAlRamo);

  // Asignar la función a la flecha de la esquina superior izquierda
  const btnBackLink = document.getElementById('btn-back-link');
  if (btnBackLink) btnBackLink.addEventListener('click', regresarAlRamo);
});

// ==========================================
// CONTROL DE MÚSICA AL ENTRAR AL LIBRO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Pausar la música principal (A Love Like Her) que viene del index.html
  if (window.parent && window.parent.document.getElementById('bg-music')) {
    window.parent.document.getElementById('bg-music').pause();
  }

  // 2. Darle play a la música exclusiva del libro (Cupid_sQuiver)
  const musicaLibro = document.getElementById('musica-libro');
  if (musicaLibro) {
    musicaLibro.play().catch(() => {
      // Si el navegador la bloquea, sonará al primer clic que ella haga
      document.body.addEventListener('click', () => musicaLibro.play(), { once: true });
    });
  }
});