'use strict';

// АДРЕС СЕРВЕРА
const API_URL = 'http://127.0.0.1:8000/api/components';

const SPECS_CONFIG = {
    cpu: [
        { id: 'spec-cpu-socket', label: 'Сокет', placeholder: 'AM5 или LGA1700' },
        { id: 'spec-cpu-tdp', label: 'TDP', placeholder: '120 Вт' }
    ],
    gpu: [
        { id: 'spec-gpu-memory', label: 'Объём памяти', placeholder: '12 ГБ' },
        { id: 'spec-gpu-tdp', label: 'TDP', placeholder: '220 Вт' }
    ],
    mb: [
        { id: 'spec-mb-socket', label: 'Сокет', placeholder: 'AM5 или LGA1700' },
        { id: 'spec-mb-form', label: 'Формат', placeholder: 'ATX или Micro-ATX' }
    ],
    ram: [
        { id: 'spec-ram-size', label: 'Объём', placeholder: '32 ГБ' },
        { id: 'spec-ram-speed', label: 'Частота', placeholder: '6000 МГц' }
    ]
};

const DEFAULT_IMAGE = 'photos/images.jpg';

const state = {
    items: [], // Данные теперь загружаются с сервера
    searchQuery: '',
    selectedCategory: 'all',
    selectedVendor: 'all',
    sortBy: 'name-asc',
};

const CATEGORY_LABELS = {
    cpu: 'Процессор',
    gpu: 'Видеокарта',
    mb: 'Материнская плата',
    ram: 'Оперативная память',
};

// DOM элементы
const cardsGrid = document.querySelector('.cards-grid');
const emptyMessage = document.getElementById('catalog-empty');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');
const vendorSelect = document.getElementById('vendor');
const sortSelect = document.getElementById('sort');

const modal = document.getElementById('modal');
const modalBackdrop = document.getElementById('modal-backdrop');
const modalCloseBtn = document.getElementById('modal-close');
const modalCancelBtn = document.getElementById('modal-cancel');
const openModalBtn = document.getElementById('open-modal');
const addForm = document.getElementById('add-form');
const dynamicSpecsContainer = document.getElementById('dynamic-specs');

const fields = {
    name: { input: document.getElementById('add-name'), error: document.getElementById('error-name') },
    category: { input: document.getElementById('add-category'), error: document.getElementById('error-category') },
    price: { input: document.getElementById('add-price'), error: document.getElementById('error-price') },
    description: { input: document.getElementById('add-description'), error: document.getElementById('error-description') },
    imageUrl: { input: document.getElementById('add-image-url'), error: document.getElementById('error-image-url') },
    imageFile: { input: document.getElementById('add-image-file'), error: document.getElementById('error-image-file') }
};

// ================= РАБОТА С СЕРВЕРОМ (API) =================

async function fetchComponents() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка загрузки');
        state.items = await response.json();
        render();
    } catch (err) {
        console.error(err);
        alert('Не удалось загрузить данные. Проверь, запущен ли сервер Python!');
    }
}

async function apiCreateComponent(data) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Ошибка создания');
    const newItem = await response.json();
    state.items.push(newItem);
    render();
}

async function apiDeleteComponent(id) {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Ошибка удаления');
    state.items = state.items.filter(i => i.id !== id);
    render();
}

// ================= ОТРИСОВКА =================

function updateDynamicSpecs() {
    dynamicSpecsContainer.innerHTML = '';
    const category = fields.category.input.value;
    if (SPECS_CONFIG[category]) {
        SPECS_CONFIG[category].forEach(spec => {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'field';
            const label = document.createElement('label');
            label.textContent = spec.label;
            const input = document.createElement('input');
            input.type = 'text';
            input.id = spec.id;
            input.placeholder = spec.placeholder;
            fieldDiv.appendChild(label);
            fieldDiv.appendChild(input);
            dynamicSpecsContainer.appendChild(fieldDiv);
        });
    }
}

function getVisibleItems() {
    const query = state.searchQuery.trim().toLowerCase();
    const filtered = state.items.filter(item => {
        const matchesSearch = query === '' || 
            item.name.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query);
        const matchesCategory = state.selectedCategory === 'all' || item.category === state.selectedCategory;
        const matchesVendor = state.selectedVendor === 'all' || item.vendor === state.selectedVendor;
        return matchesSearch && matchesCategory && matchesVendor;
    });

    const sorted = filtered.slice();
    switch (state.sortBy) {
        case 'name-asc': sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru')); break;
        case 'name-desc': sorted.sort((a, b) => b.name.localeCompare(a.name, 'ru')); break;
        case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
        case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
    }
    return sorted;
}

function createCardElement(item) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = item.id;

    const img = document.createElement('img');
    img.src = item.image || DEFAULT_IMAGE;
    img.alt = item.name;
    img.onerror = function () { this.onerror = null; this.src = DEFAULT_IMAGE; };
    card.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';
    card.appendChild(body);

    const h3 = document.createElement('h3');
    h3.textContent = item.name;
    body.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = item.description;
    body.appendChild(p);

    const ul = document.createElement('ul');
    ul.className = 'card-meta';

    const catLi = document.createElement('li');
    const catSpan = document.createElement('span');
    catSpan.textContent = 'Тип:';
    catLi.appendChild(catSpan);
    catLi.appendChild(document.createTextNode(' ' + (CATEGORY_LABELS[item.category] || item.category)));
    ul.appendChild(catLi);

    if (item.specs) {
        item.specs.forEach(spec => {
            const li = document.createElement('li');
            const span = document.createElement('span');
            span.textContent = spec.label + ':';
            li.appendChild(span);
            li.appendChild(document.createTextNode(' ' + spec.value));
            ul.appendChild(li);
        });
    }

    const priceLi = document.createElement('li');
    const priceSpan = document.createElement('span');
    priceSpan.textContent = 'Цена:';
    priceLi.appendChild(priceSpan);
    priceLi.appendChild(document.createTextNode(' ' + item.price.toLocaleString('ru-RU') + ' ₽'));
    ul.appendChild(priceLi);

    body.appendChild(ul);

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-danger';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.textContent = 'Удалить';
    actions.appendChild(deleteBtn);
    body.appendChild(actions);

    return card;
}

function render() {
    cardsGrid.innerHTML = '';
    const visible = getVisibleItems();
    if (visible.length === 0) {
        emptyMessage.hidden = false;
        return;
    }
    emptyMessage.hidden = true;
    const fragment = document.createDocumentFragment();
    visible.forEach(item => fragment.appendChild(createCardElement(item)));
    cardsGrid.appendChild(fragment);
}

// ================= ОБРАБОТЧИКИ =================

function handleSearchInput(event) { state.searchQuery = event.target.value; render(); }
function handleCategoryChange(event) { state.selectedCategory = event.target.value; render(); }
function handleVendorChange(event) { state.selectedVendor = event.target.value; render(); }
function handleSortChange(event) { state.sortBy = event.target.value; render(); }

function handleGridClick(event) {
    const button = event.target.closest('button[data-action="delete"]');
    if (!button) return;
    const card = button.closest('.card');
    if (!card) return;
    
    const id = Number(card.dataset.id);
    if (confirm('Удалить этот товар?')) {
        apiDeleteComponent(id);
    }
}

function openModal() {
    modal.hidden = false;
    document.body.classList.add('modal-open');
    clearFormErrors();
    addForm.reset();
    updateDynamicSpecs(); 
    fields.name.input.focus();
}

function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    clearFormErrors();
}

function handleModalBackdropClick(e) { if (e.target === modalBackdrop) closeModal(); }
function handleEscape(e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); }

function clearFormErrors() {
    Object.values(fields).forEach(field => {
        if (field.error) field.error.textContent = '';
        field.input.classList.remove('is-invalid');
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    clearFormErrors();

    // Простая валидация
    if (!fields.name.input.value || !fields.price.input.value) {
        alert('Заполните обязательные поля!');
        return;
    }

    const category = fields.category.input.value;
    const specs = [];
    const dynamicInputs = dynamicSpecsContainer.querySelectorAll('input');
    
    dynamicInputs.forEach(input => {
        const val = input.value.trim();
        if (val !== '') {
            const labelText = input.closest('.field').querySelector('label').textContent;
            specs.push({ label: labelText, value: val });
        }
    });

    const data = {
        name: fields.name.input.value.trim(),
        category: category,
        vendor: 'other',
        price: Number(fields.price.input.value),
        description: fields.description.input.value.trim(),
        image: fields.imageUrl.input.value.trim() || null,
        specs: specs
    };

    apiCreateComponent(data)
        .then(() => closeModal())
        .catch(() => alert('Ошибка сохранения на сервере'));
}

function init() {
    fetchComponents(); // Загружаем данные с сервера при старте!

    searchInput.addEventListener('input', handleSearchInput);
    categorySelect.addEventListener('change', handleCategoryChange);
    vendorSelect.addEventListener('change', handleVendorChange);
    sortSelect.addEventListener('change', handleSortChange);
    cardsGrid.addEventListener('click', handleGridClick);

    openModalBtn.addEventListener('click', openModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modalCancelBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', handleModalBackdropClick);
    document.addEventListener('keydown', handleEscape);

    fields.category.input.addEventListener('change', updateDynamicSpecs);
    addForm.addEventListener('submit', handleFormSubmit);
}

document.addEventListener('DOMContentLoaded', init);
