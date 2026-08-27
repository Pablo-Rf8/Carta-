const pages = [...document.querySelectorAll('.book-page')];
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const pageIndicator = document.getElementById('pageIndicator');
const book = document.getElementById('book');
let currentPage = 0;

function showPage(pageIndex, direction = 1) {
  const targetPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
  currentPage = targetPage;
  
  // Cerrar el libro si estamos en la portada
  if (currentPage === 0 && book.classList.contains('book-open')) {
    book.classList.remove('book-open', 'book-single-end');
  }
  
  // Actualizar clases de las páginas
  pages.forEach((page, index) => {
    page.classList.remove('page-active', 'page-companion', 'page-enter-next', 'page-enter-prev');
    
    if (index === currentPage) {
      page.classList.add('page-active');
      page.classList.add(direction >= 0 ? 'page-enter-next' : 'page-enter-prev');
    } else if (book.classList.contains('book-open') && index === currentPage + 1) {
      page.classList.add('page-companion');
    }
  });
  
  // Aplicar estilos especiales para última página
  book.classList.toggle('book-single-end', currentPage === pages.length - 1 && book.classList.contains('book-open'));
  
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
  } else if (book.classList.contains('book-open')) {
    // Si el libro está abierto, retroceder 2 páginas
    showPage(currentPage - 2, -1);
  } else {
    // Si el libro está cerrado, retroceder 1 página
    showPage(currentPage - 1, -1);
  }
}

function goToNextPage() {
  if (currentPage === pages.length - 1) return;
  
  if (currentPage === 0 && !book.classList.contains('book-open')) {
    // Abrir el libro desde la portada
    book.classList.add('book-open');
    showPage(1, 1);
  } else if (book.classList.contains('book-open')) {
    // Si el libro está abierto, avanzar 2 páginas
    showPage(currentPage + 2, 1);
  } else {
    // Si el libro está cerrado, avanzar 1 página
    showPage(currentPage + 1, 1);
  }
}

previousButton.addEventListener('click', goToPreviousPage);
nextButton.addEventListener('click', () => {
  goToNextPage();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') goToPreviousPage();
  if (event.key === 'ArrowRight') goToNextPage();
});

showPage(0);
