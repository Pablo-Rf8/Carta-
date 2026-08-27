const pages = [...document.querySelectorAll('.book-page')];
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const pageIndicator = document.getElementById('pageIndicator');
const book = document.getElementById('book');
const memoryMessage = document.getElementById('memoryMessage');
let currentPage = 0;
let messageStarted = false;

const memoryText = 'No solamente yo te amo. También mi yo de pequeño te ama, porque incluso él sabe que contigo encontré algo muy bonito.';

function typeMemoryMessage() {
  if (messageStarted || !memoryMessage) return;
  messageStarted = true;
  let index = 0;
  const typeNextCharacter = () => {
    if (index < memoryText.length) {
      memoryMessage.textContent += memoryText.charAt(index);
      index += 1;
      setTimeout(typeNextCharacter, 38);
    }
  };
  typeNextCharacter();
}

function showPage(pageIndex) {
  currentPage = (pageIndex + pages.length) % pages.length;
  pages.forEach((page, index) => {
    page.classList.toggle('page-active', index === currentPage);
  });
  pageIndicator.textContent = `${currentPage + 1} / ${pages.length}`;
  previousButton.disabled = currentPage === 0;
  nextButton.disabled = currentPage === pages.length - 1;
  if (currentPage === 1) typeMemoryMessage();
}

document.querySelectorAll('[data-direction="next"]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.id === 'openBookButton') {
      book.classList.add('book-open');
      button.disabled = true;
      setTimeout(() => showPage(currentPage + 1), 650);
      return;
    }
    showPage(currentPage + 1);
  });
});

document.querySelector('[data-direction="restart"]').addEventListener('click', () => showPage(0));
previousButton.addEventListener('click', () => showPage(currentPage - 1));
nextButton.addEventListener('click', () => showPage(currentPage + 1));

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPage(currentPage - 1);
  if (event.key === 'ArrowRight') showPage(currentPage + 1);
});

showPage(0);
