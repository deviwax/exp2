const API_BASE = 'https://furniture-store.b.goit.study/api';

const categoriesContainer = document.querySelector('.categories-filter');
const furnitureList = document.querySelector('.furniture-list');
const loadMoreBtn = document.querySelector('.load-more-btn');

let allProducts = [];
let visibleProducts = [];
let currentCategory = null;
let perPage = 8;

async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        renderCategories(data);
    } catch (error) {
        console.error('Помилка завантаження', error);
    }
}

function renderCategories(categories) {
    categoriesContainer.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.textContent = 'Всі товари';
    allBtn.classList.add('active');
    allBtn.addEventListener('click', () => handleCategoryClick(null));
    categoriesContainer.appendChild(allBtn);

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.textContent = category.name;
        btn.addEventListener('click', () => handleCategoryClick(category.name));
        categoriesContainer.appendChild(btn);
    });
}

function handleCategoryClick(category) {
    currentCategory = category; 
    visibleProducts = [];

    const buttons = categoriesContainer.querySelectorAll('button');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === (category || 'Всі товари')) {
            btn.classList.add('active');
        }
    });
    showFilteredProducts();
}

async function fetchProducts() {
    try {
        const res = await fetch (`${API_BASE}/products`);
        const data = await res.json();
        allProducts = data;
        showFilteredProducts();
    } catch (error) {
        console.error('Помилка завантаження товарів', error);
    }
}

function showFilteredProducts() {
    furnitureList.innerHTML = '';
    visibleProducts = [];

    const filtered = currentCategory ? allProducts.filter(p => p.category.name === currentCategory) : allProducts;

    if (filtered.length === 0) {
        furnitureList.innerHTML = 'Товарів не знайдено';
        loadMoreBtn.style.display = 'none';
        return;
    }

    loadMoreBtn.style.display = 'block';
    loadNextBatch(filtered);
}

function loadNextBatch(filteredList) {
    const nextProducts = filteredList.slice(visibleProducts.length, visibleProducts.length + perPage);
    visibleProducts = visibleProducts.concat(nextProducts);

    nextProducts.forEach(product => {
        const li = document.createElement('li');
        li.classList.add('furniture-card');
        li.innerHTML = `
            <img src="${product.image}" alt="${product.title}" />
            <div class="info">
                <h3 class="title">${product.title}</h3>
                <p class="price">${product.price} грн</p>
                <button class="details-btn" data-id="${product._id}">Детальніше</button>
            </div>
        `;
        furnitureList.appendChild(li);
    });

    if (visibleProducts.length >= filteredList.length) {
        loadMoreBtn.style.display = 'none';
    }
}

loadMoreBtn.addEventListener('click', () => {
    const filtered = currentCategory ? allProducts.filter(p => p.category.name === currentCategory) : allProducts;
    loadNextBatch(filtered);
});

furnitureList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('details-btn')) {
        const id = e.target.dataset.id;
        try {
            const res = await fetch(`${API_BASE}/products/${id}`);
            const product = await res.json();
            showModal(product);
        } catch (error) {
            console.error('Помилка завантаження деталей товару', error);
        }
    }
});

fetchCategories();
fetchProducts();