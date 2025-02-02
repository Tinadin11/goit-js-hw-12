import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import './js/pixabay-api';
import { getPictures } from './js/pixabay-api';
import './js/render-functions';
import { createMarkup } from './js/render-functions';

const form = document.querySelector('.form-search');
const images = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const input = document.querySelector('.input-search');
const buttonLoad = document.querySelector('.button-load');
const loadingMessage = document.querySelector('#loading-message');

loader.style.display = 'none';
buttonLoad.style.display = 'none';
let currentPage = 1;
const perPage = 15;
let searchQuery = '';
loadingMessage.style.display = 'none';

buttonLoad.addEventListener('click', loadMorePictures);

async function loadMorePictures() {
  try {
    currentPage += 1;
    loader.style.display = 'block';
    loadingMessage.style.display = 'block'; // Hide text
    
    await renderPictures(searchQuery, currentPage);

    // Плавне прокручування після завантаження нових картинок
    const getCard = () => document.querySelector('.gallery-item').getBoundingClientRect();
    
    window.scrollBy({
      top: getCard().height * 2,
      left: 0,
      behavior: 'smooth',
    });  
  } catch (error) {
    console.error('Error loading page:', error);
  } finally {
    loader.style.display = 'none';
    loadingMessage.style.display = 'none'; // Hide text
  }
}

form.addEventListener('submit', async (event) => {
  try {
    event.preventDefault();
    images.innerHTML = '';
    loader.style.display = 'block';
    buttonLoad.style.display = 'none'; // Hide button
    loadingMessage.style.display = 'none';
    searchQuery = input.value.trim();
    if (!searchQuery) {
      iziToast.warning({ title: 'Caution', message: 'Please complete the field!' });
      return;
    }
    currentPage = 1;
    await renderPictures(searchQuery, currentPage);
  } catch (error) {
    console.error('Error in searching:', error);
  } finally {
    loader.style.display = 'none';
    loadingMessage.style.display = 'none'; // Hide text
  }
});

async function renderPictures(inputValue, currentPage) {
  try {
    const data = await getPictures(inputValue, currentPage);
    const totalPages = Math.ceil(data.totalHits / perPage);
    loader.style.display = 'block';

    if (!data.hits.length) {
      iziToast.error({
        title: 'Error',
        message: `No results found for "${searchQuery}". Please try again with a different query.`,
      });
      buttonLoad.style.display = 'none'; // Hide button if there are no results
      return false;
    } else {
      buttonLoad.style.display = 'block';
    }
    
    images.insertAdjacentHTML("beforeend", createMarkup(data.hits));

    // Плавне прокручування після додавання картинок
    setTimeout(() => {
      const cardHeight = document.querySelector('.gallery').firstElementChild.getBoundingClientRect().height;
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }, 300); // Додаємо затримку після оновлення галереї

    const refreshPage = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionDelay: 250,
    });
    refreshPage.refresh();
    form.reset();

    if (currentPage >= totalPages) {
      buttonLoad.style.display = 'none';
      return false;
    } else if (!data.hits.length) {
      iziToast.error({
        title: 'Error',
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      return false;
    }
    return true;
  } catch (error) {
    loader.style.display = 'none';
    iziToast.error({
      title: 'Error',
      message: 'Sorry, something went wrong. This is an error!',
      position: 'bottomRight',
    });
  }
}
