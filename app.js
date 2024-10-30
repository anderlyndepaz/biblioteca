const API_KEY = 'DENT6dhi6vGUH17jqUTR8wAOvTMXFGbe';
const API_CATEGORIES_URL = `https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${API_KEY}`;
const API_LIST_URL = (listName) => `https://api.nytimes.com/svc/books/v3/lists/current/${listName}.json?api-key=${API_KEY}`;

const loader = document.getElementById('loader'); // Cambiar a loader
const loadingMessage = document.getElementById('loading-message');
const categoriesContainer = document.getElementById('categories');
const booksContainer = document.getElementById('books-list');
const backButton = document.getElementById('back-button');
const header = document.getElementById('header');

// Función para renderizar la imagen en el header
function renderHeaderImage() {
    // Limpiar cualquier contenido previo
    header.innerHTML = '';

    // Crear un elemento de imagen
    const headerImage = document.createElement('img');
    headerImage.src = 'assets/defaultPromoCrop.png'; 
    headerImage.alt = 'New York Times Best Sellers'; 
    headerImage.style.width = '100%'; 

    // Agregar la imagen al header
    header.appendChild(headerImage);
}

// Función para obtener las categorías
async function fetchCategories() {
    try {
        const response = await fetch(API_CATEGORIES_URL);
        if (!response.ok) {
            throw new Error(`Error al obtener los datos: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Función para obtener los libros de una lista específica
async function fetchBooks(listName) {
    try {
        const response = await fetch(API_LIST_URL(listName));
        if (!response.ok) {
            throw new Error(`Error al obtener los datos: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results.books;
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Función para mostrar las categorías en el DOM
async function renderCategories() {
    loadingMessage.style.display = 'block';
    categoriesContainer.style.display = 'grid';
    booksContainer.style.display = 'none';
    backButton.style.display = 'none'; // Ocultar botón de "Volver" en la vista de categorías
    categoriesContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevas categorías

    const categories = await fetchCategories();
    loadingMessage.style.display = 'none';

    if (categories.length === 0) {
        categoriesContainer.innerHTML = '<p>No se pudieron cargar las categorías.</p>';
        return;
    }

    categories.forEach(category => {
        const card = document.createElement('div');
        card.classList.add('category-card');

        card.innerHTML = `
            <h2>${category.display_name}</h2>
            <p>Oldest: ${category.oldest_published_date}</p>
            <p>Newest: ${category.newest_published_date}</p>
            <p>Updated: ${category.updated}</p>
            <a href="#" class="button-read-more" data-list="${category.list_name}">READ MORE ></a>
        `;

        categoriesContainer.appendChild(card);
    });

    // Asignar el evento de clic a cada enlace de "READ MORE!"
    document.querySelectorAll('.category-card a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const listName = e.target.getAttribute('data-list');
            renderBooks(listName);
        });
    });
}

// Función para mostrar los libros de una lista específica
async function renderBooks(listName) {
    loader.style.display = 'block'; // Mostrar el loader
    categoriesContainer.style.display = 'none';
    booksContainer.style.display = 'grid';
    backButton.style.display = 'inline-block'; // Mostrar botón de "Volver" en la vista de libros
    booksContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos libros

    const books = await fetchBooks(listName);
    loader.style.display = 'none'; // Ocultar el loader después de obtener los libros

    if (books.length === 0) {
        booksContainer.innerHTML = '<p>No se pudieron cargar los libros.</p>';
        return;
    }

    books.forEach((book, index) => {
        const card = document.createElement('div');
        card.classList.add('book-card');

        card.innerHTML = `
            <h2>#${index + 1} ${book.title}</h2>
            <img src="${book.book_image}" alt="${book.title}">
            <p><strong>Semanas en lista:</strong> ${book.weeks_on_list}</p>
            <p>${book.description}</p>
            <a href="${book.amazon_product_url}" target="_blank" class="button-buy-amazon">Comprar en Amazon</a>
        `;

        booksContainer.appendChild(card);
    });
}

// Volver a la vista de categorías
backButton.addEventListener('click', () => {
    renderCategories(); // Llamar a la función para recargar las categorías
});

// Llamada inicial para cargar las categorías
document.addEventListener('DOMContentLoaded', () => {
    renderHeaderImage();
    
    // Mostrar el loader por 10 segundos
    loader.style.display = 'block'; // Muestra el loader
    setTimeout(() => {
        loader.style.display = 'none'; // Oculta el loader después de 10 segundos
        renderCategories(); // Carga las categorías después de ocultar el loader
    }, 1000); 
});

