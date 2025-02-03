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


// Обробник кнопки "Load more"
buttonLoad.addEventListener('click', loadMorePictures);

async function loadMorePictures() {
  try {
    currentPage += 1;
    loader.style.display = 'block';
    loadingMessage.style.display = 'block'; 
    
    await renderPictures(searchQuery, currentPage);


    setTimeout(() => {
  const galleryItem = document.querySelector('.gallery-item');
  
  if (galleryItem) {
    window.scrollBy({
      top: galleryItem.getBoundingClientRect().height * 2,
      left: 0,
      behavior: 'smooth',
    });
  } else {
    console.error('No gallery items found for scroll.');
  }
}, 500);

form.reset();

  } catch (error) {
    console.error('Error loading page:', error);
  } finally {
    loader.style.display = 'none';
    loadingMessage.style.display = 'none';
  }
}






form.addEventListener('submit', async (event) => {
    try {
      event.preventDefault();
      images.innerHTML = '';
      loader.style.display = 'block';
      buttonLoad.style.display = 'none';
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
      loadingMessage.style.display = 'none';
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
      buttonLoad.style.display = 'none'; 
      return false;
    } else {
      buttonLoad.style.display = 'block';
    }
    
   images.insertAdjacentHTML("beforeend", createMarkup(data.hits));
   
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

    

    