const pages = [...document.querySelectorAll('.book-page')];
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const pageIndicator = document.getElementById('pageIndicator');
const book = document.getElementById('book');
let currentPage = 0;

function showPage(pageIndex, direction = 1) {
  const targetPage = Math.max(0, Math.min(pageIndex, pages.length - 1));
  currentPage = targetPage;
  if (currentPage === 0 && book.classList.contains('book-open')) {
    book.classList.remove('book-open', 'book-single-end');
  }
  pages.forEach((page, index) => {
    page.classList.toggle('page-active', index === currentPage);
    page.classList.toggle('page-companion', book.classList.contains('book-open') && index === currentPage + 1);
    page.classList.remove('page-enter-next', 'page-enter-prev');
  });
  const activePage = pages[currentPage];
  book.classList.toggle('book-single-end', currentPage === pages.length - 1 && book.classList.contains('book-open'));
  if (currentPage !== 0 || pageIndex !== 0) {
    activePage.classList.add(direction >= 0 ? 'page-enter-next' : 'page-enter-prev');
  }
  pageIndicator.textContent = `${currentPage + 1} / ${pages.length}`;
  previousButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === pages.length - 1;
}

previousButton.addEventListener('click', () => showPage(currentPage - 1, -1));
nextButton.addEventListener('click', () => {
  if (currentPage === 0 && !book.classList.contains('book-open')) {
    book.classList.add('book-open');
    setTimeout(() => showPage(1, 1), 650);
    return;
  }
  showPage(currentPage + 1, 1);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPage(currentPage - 1, -1);
  if (event.key === 'ArrowRight') showPage(currentPage + 1, 1);
});

showPage(0);
