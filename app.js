 
const API_KEY = 'DENT6dhi6vGUH17jqUTR8wAOvTMXFGbe';
const API_CATEGORIES_URL = `https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${API_KEY}`;
const API_LIST_URL = (listName) => `https://api.nytimes.com/svc/books/v3/lists/current/${listName}.json?api-key=${API_KEY}`;


const loader = document.getElementById('loader'); // Cambiar a loader
const loadingMessage = document.getElementById('loading-message');
const categoriesContainer = document.getElementById('categories');
const booksContainer = document.getElementById('books-list');
const backButton = document.getElementById('back-button');
const header = document.getElementById('header');


const firebaseConfig = {
    apiKey: "AIzaSyCMyziRMxGneheZQiIlnbVWshf7EHlm4UQ",
    authDomain: "demoweb-90e75.firebaseapp.com",
    projectId: "demoweb-90e75",
    storageBucket: "demoweb-90e75.appspot.com",
    messagingSenderId: "104067804292",
    appId: "1:104067804292:web:ff546f9fe163711613a6d1"
  };

  
// Inicializar Firebase con la configuración adecuada
firebase.initializeApp(firebaseConfig);

// Inicializar Firestore
const formdb = firebase.firestore();

 

// Registro de usuario
const signUpUser = (email, password) => {
	firebase
		.auth()
		.createUserWithEmailAndPassword(email, password)
		.then((userCredential) => {
			let user = userCredential.user;
			console.log(`Usuario registrado: ${user.email} ID:${user.uid}`);
			alert(`Usuario registrado: ${user.email}`);

			mApp.email = email;

			alert(mApp.usuario + " y " + mApp.email)

			// Guardar el nombre y el email en Firestore, usando el UID del usuario
			createUser({
				id: user.uid,
				email: user.email
			});
		})
		.catch((error) => {
			console.error("Error en el registro:", error.message);
		});
};

// Guardar usuario en Firestore
const createUser = (user) => {
	formdb.collection("usuario").doc(user.id).set({
		email: user.email
	})
		.then(() => {
			console.log("Usuario guardado en Firestore");
		})
		.catch((error) => {
			console.error("Error al guardar el usuario en Firestore:", error);
		});
};

// Formulario de registro
document.getElementById('form').addEventListener('submit', (e) => {
	e.preventDefault();
	const email = document.getElementById('email').value;
	const password = document.getElementById('pass').value;
    const password2 = document.getElementById('pass2').value;

	signUpUser(email, password, password2);
});

// Función de inicio de sesión
const loginUser = (email, password) => {
	firebase
		.auth()
		.signInWithEmailAndPassword(email, password)
		.then((userCredential) => {
			let user = userCredential.user;
			console.log(`Usuario ha iniciado sesión: ${user.email} ID:${user.uid}`);
			alert(`Bienvenido ${user.email}`);

			// Puedes redirigir al usuario a otra página o mostrar algún mensaje adicional
		})
		.catch((error) => {
			console.error("Error en el inicio de sesión:", error.message);
			alert("Error en el inicio de sesión: " + error.message);
		});
};

// Formulario de login
document.getElementById('form2').addEventListener('submit', (e) => {
	e.preventDefault();
	const email = document.getElementById('email2').value;
	const password = document.getElementById('pass3').value;

	loginUser(email, password);
});

// Función de logout
const logoutUser = () => {
	firebase.auth().signOut().then(() => {
		console.log("Usuario ha cerrado sesión");
		alert("Has cerrado sesión correctamente");
		// Redirigir al usuario a la página de login o página de inicio
	}).catch((error) => {
		console.error("Error al cerrar sesión:", error.message);
		alert("Error al cerrar sesión: " + error.message);
	});
};

// Escuchar el clic en el botón de logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
	e.preventDefault();
	logoutUser();
});

const showRegisterFormButton = document.getElementById('showRegisterFormButton');
const registerForm = document.getElementById('selecForm');

showRegisterFormButton.addEventListener('click', () => {
    if (registerForm.style.display === 'none' || registerForm.style.display === '') {
        registerForm.style.display = 'block';
        setTimeout(() => {
            registerForm.style.opacity = '1';
        }, 10); // Pequeño retraso para activar la transición
    } else {
        registerForm.style.opacity = '0';
        setTimeout(() => {
            registerForm.style.display = 'none';
        }, 300); // Espera que termine la transición antes de ocultarlo
    }
});

const showLoginFormButton = document.getElementById('showLoginFormButton');
const authForm = document.getElementById('login');

showLoginFormButton.addEventListener('click', () => {
    if (authForm.style.display === 'none' || authForm.style.display === '') {
        authForm.style.display = 'block';
        setTimeout(() => {
            authForm.style.opacity = '1';
        }, 10); // Pequeño retraso para activar la transición
    } else {
        authForm.style.opacity = '0';
        setTimeout(() => {
            authForm.style.display = 'none';
        }, 300); // Espera que termine la transición antes de ocultarlo
    }
});

// Función para renderizar la imagen en el header
function renderHeaderImage() {
    // Limpiar cualquier contenido previo
    header.innerHTML = '';

    // Crear un elemento de imagen
    const headerImage = document.createElement('img');
    headerImage.src = 'assets/freepik_br_aca8fcae-e9ef-4a8f-8e87-9c240e155f69.png'; 
    headerImage.alt = 'New York Times Best Sellers'; 
    headerImage.style.width = '100%';
    headerImage.style.height = 'auto';  

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
    
    loader.style.display = 'block'; // Muestra el loader
    setTimeout(() => {
        loader.style.display = 'none'; // Oculta el loader después de 10 segundos
        renderCategories(); // Carga las categorías después de ocultar el loader
    }, 5000); 
});

