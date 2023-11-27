const { default: axios } = require('axios');
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const refs = {
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  button: document.querySelector('button[type=submit]'),
  div: document.querySelector('div'),
  buttonMore: document.querySelector('button[type=button]'),
};

let wordForSearch;
let number = 1;
let page;

refs.form.addEventListener('submit', handleSubmit);
refs.buttonMore.addEventListener('click', handleClick);

var lightbox = new SimpleLightbox('.photo-card a');
lightbox.open();
refs.buttonMore.style.display = 'none';

async function handleSubmit(event) {
  event.preventDefault();
  if (refs.input.value.trim() === '') {
    Notiflix.Notify.failure("We're sorry, try to enter something another.");
    return;
  }
  try {
    const result = await serviceSearch(refs.input.value);

    Notiflix.Notify.success(`Hooray! We found ${result.totalHits} images.`);
    wordForSearch = refs.input.value;
    refs.div.innerHTML = createMarkup(result.hits);
    number = 1;

    lightbox.refresh();
    refs.buttonMore.style.display = 'flex';
    if (result.totalHits < 40) {
      refs.buttonMore.style.display = 'none';
      setTimeout(() => {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }, 500);
    }
  } catch (err) {
    console.log(err);
  } finally {
    this.reset();
  }
}
async function handleClick() {
  try {
    refs.buttonMore.style.display = 'none';
    number += 1;
    const result = await serviceSearch(wordForSearch, number);
    refs.div.insertAdjacentHTML('beforeend', createMarkup(result.hits));
    lightbox.refresh();
    refs.buttonMore.style.display = 'flex';

    if (result.totalHits < 40 * number) {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      refs.buttonMore.style.display = 'none';
    }
  } catch (err) {
    console.log(err);
  } finally {
  }
}
async function serviceSearch(value, number) {
  const URL = 'https://pixabay.com/api';
  const API_KEY = '20424265-7f45fa22d4ab466f5f1dddb3b';
  const per_page = 'per_page=40';
  page = number;
  if (number === undefined) {
    page = 1;
  }
  const params = new URLSearchParams({
    key: API_KEY,
    q: value,
    image_type: 'image_type = photo',
    orientation: 'orientation = horizontal',
    safesearch: 'safesearch = true',
  });

  try {
    const users = await axios.get(`${URL}/?${params}&${per_page}&page=${page}`);

    if (users.data.total === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      refs.div.innerHTML = '';
      refs.buttonMore.style.display = 'none';
      return;
    }
    return users.data;
  } catch (error) {
    console.log(error.message);
  }
}
function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <div class="photo-card">
          <a class="card"  href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  
  <div class="info">
  <p class="info-item">
    <i class="fas fa-thumbs-up"></i> Likes: ${likes}
  </p>
  <p class="info-item">
    <i class="fas fa-eye"></i> Views: ${views}
  </p>
  <p class="info-item">
    <i class="fas fa-comments"></i> Comments: ${comments}
  </p>
  <p class="info-item">
    <i class="fas fa-download"></i> Downloads: ${downloads}
  </p>
</div>

</div>
        `
    )
    .join('');
}
