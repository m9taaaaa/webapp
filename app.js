'use strict';
const DEFAULT_COMPONENTS = [
    {
        id: 'cpu-ryzen-7800x3d',
        category: 'cpu',
        vendor: 'amd',
        name: 'AMD Ryzen 7 7800X3D',
        description: 'Игровой процессор с 3D-кэшем для сборок под игры.',
        image: 'images/cpu-ryzen.svg',
        price: 45000,
        specs: [
            { label: 'Тип', value: 'Процессор' },
            { label: 'Сокет', value: 'AM5' },
            { label: 'TDP', value: '120 Вт' },
        ],
    },
    {
        id: 'cpu-intel-i5-14600k',
        category: 'cpu',
        vendor: 'intel',
        name: 'Intel Core i5-14600K',
        description: 'Универсальный процессор для работы и игр.',
        image: 'images/cpu-intel.svg',
        price: 32000,
        specs: [
            { label: 'Тип', value: 'Процессор' },
            { label: 'Сокет', value: 'LGA1700' },
            { label: 'TDP', value: '125 Вт' },
        ],
    },
    {
        id: 'gpu-rtx-4070-super',
        category: 'gpu',
        vendor: 'nvidia',
        name: 'NVIDIA GeForce RTX 4070 Super',
        description: 'Видеокарта для 1440p-гейминга и работы с нейросетями.',
        image: 'images/gpu-nvidia.svg',
        price: 75000,
        specs: [
            { label: 'Тип', value: 'Видеокарта' },
            { label: 'Память', value: '12 ГБ GDDR6X' },
            { label: 'TDP', value: '220 Вт' },
        ],
    },
    {
        id: 'gpu-rx-7800-xt',
        category: 'gpu',
        vendor: 'amd',
        name: 'AMD Radeon RX 7800 XT',
        description: 'Сбалансированное решение для игр в 1440p.',
        image: 'images/gpu-amd.svg',
        price: 68000,
        specs: [
            { label: 'Тип', value: 'Видеокарта' },
            { label: 'Память', value: '16 ГБ GDDR6' },
            { label: 'TDP', value: '263 Вт' },
        ],
    },
    {
        id: 'mb-msi-b650',
        category: 'mb',
        vendor: 'msi',
        name: 'MSI MAG B650 Tomahawk',
        description: 'Надёжная плата под AM5 с хорошим питанием.',
        image: 'images/mb-b650.svg',
        price: 22000,
        specs: [
            { label: 'Тип', value: 'Материнская плата' },
            { label: 'Сокет', value: 'AM5' },
            { label: 'Формат', value: 'ATX' },
        ],
    },
    {
        id: 'ram-kingston-ddr5',
        category: 'ram',
        vendor: 'kingston',
        name: 'Kingston Fury Beast DDR5-6000',
        description: 'Комплект 2×16 ГБ с профилем EXPO.',
        image: 'images/ram-ddr5.svg',
        price: 14000,
        specs: [
            { label: 'Тип', value: 'Оперативная память' },
            { label: 'Объём', value: '32 ГБ (2×16)' },
            { label: 'Частота', value: '6000 МГц' },
        ],
    },
];


const state = {
    components: [],       
    filters: {
        search: '',
        category: '',
        vendor: '',
        maxPrice: '',
    },
    editingId: null,   
};


const STORAGE_KEY = 'pcparts.components.v1';

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.components));
    } catch (err) {
        console.warn('Не удалось сохранить данные:', err);
    }
}

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
    } catch (err) {
        console.warn('Не удалось загрузить данные:', err);
        return null;
    }
}


function getVisibleComponents() {
    const { search, category, vendor, maxPrice } = state.filters;
    const query = search.trim().toLowerCase();
    const maxP = maxPrice === '' ? Infinity : Number(maxPrice);

    return state.components.filter(c => {
        const matchesSearch =
            !query ||
            c.name.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query);

        const matchesCategory = !category || c.category === category;
        const matchesVendor = !vendor || c.vendor === vendor;
        const matchesPrice = c.price <= maxP;

        return matchesSearch && matchesCategory && matchesVendor && matchesPrice;
    });
}


function createCardElement(component) {
    const { id, name, description, image, price, specs } = component;

    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = id;
    const img = document.createElement('img');
    img.src = image;
    img.alt = name;
    img.loading = 'lazy';
    card.appendChild(img);


    const body = document.createElement('div');
    body.className = 'card-body';
    card.appendChild(body);


    const h3 = document.createElement('h3');
    h3.textContent = name;
    body.appendChild(h3);

    const p = document.createElement('p');
    p.textContent = description;
    body.appendChild(p);

    const ul = document.createElement('ul');
    ul.className = 'card-meta';
    specs.forEach(spec => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = spec.label + ':';
        li.appendChild(span);
        li.appendChild(document.createTextNode(' ' + spec.value));
        ul.appendChild(li);
    });
    const priceLi = document.createElement('li');
    const priceSpan = document.createElement('span');
    priceSpan.textContent = 'Цена:';
    priceLi.appendChild(priceSpan);
    priceLi.appendChild(
        document.createTextNode(' ' + price.toLocaleString('ru-RU') + ' ₽')
    );
    ul.appendChild(priceLi);
    body.appendChild(ul);

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-secondary';
    editBtn.dataset.action = 'edit';
    editBtn.textContent = 'Редактировать';
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-danger';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.textContent = 'Удалить';
    actions.appendChild(deleteBtn);

    body.appendChild(actions);

    return card;
}


const cardsGrid = document.querySelector('.cards-grid');
const emptyMessage = document.getElementById('catalog-empty');

function renderCatalog() {
    cardsGrid.innerHTML = '';

    const visible = getVisibleComponents();

    if (visible.length === 0) {
        emptyMessage.hidden = false;
        return;
    }
    emptyMessage.hidden = true;

    const fragment = document.createDocumentFragment();
    visible.forEach(c => fragment.appendChild(createCardElement(c)));
    cardsGrid.appendChild(fragment);
}


const filterForm = document.querySelector('.filter-form');
const searchInput = document.getElementById('search');
const categorySelect = document.getElementById('category');
const vendorSelect = document.getElementById('vendor');
const maxPriceInput = document.getElementById('max-price');

function readFiltersFromForm() {
    state.filters.search = searchInput.value;
    state.filters.category = categorySelect.value;
    state.filters.vendor = vendorSelect.value;
    state.filters.maxPrice = maxPriceInput.value;
}


const addForm = document.getElementById('add-form');
const addName = document.getElementById('add-name');
const addCategory = document.getElementById('add-category');
const addVendor = document.getElementById('add-vendor');
const addPrice = document.getElementById('add-price');
const addDescription = document.getElementById('add-description');
const addImage = document.getElementById('add-image');

function resetAddForm() {
    addForm.reset();
    state.editingId = null;
    const submitBtn = addForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Добавить';
    document.getElementById('form-title').textContent = 'Добавить комплектующее';
}

function fillFormForEdit(component) {
    addName.value = component.name;
    addCategory.value = component.category;
    addVendor.value = component.vendor;
    addPrice.value = component.price;
    addDescription.value = component.description;
    addImage.value = component.image || '';

    state.editingId = component.id;
    const submitBtn = addForm.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Сохранить';
    document.getElementById('form-title').textContent = 'Редактировать комплектующее';

    addForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleSubmit(event) {
    event.preventDefault();

    if (!addForm.checkValidity()) {
        addForm.reportValidity();
        return;
    }

    const data = {
        name: addName.value.trim(),
        category: addCategory.value,
        vendor: addVendor.value,
        price: Number(addPrice.value),
        description: addDescription.value.trim(),
        image: addImage.value.trim() || 'images/placeholder.svg',
        specs: [],
    };

    if (state.editingId) {
        const index = state.components.findIndex(c => c.id === state.editingId);
        if (index !== -1) {
            state.components[index] = { ...state.components[index], ...data };
        }
    } else {
        state.components.push({
            ...data,
            id: 'custom-' + Date.now(),
        });
    }

    saveToStorage();
    resetAddForm();
    renderCatalog();
}


function handleCardClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const card = button.closest('.card');
    if (!card) return;

    const id = card.dataset.id;
    const action = button.dataset.action;

    if (action === 'delete') {
        handleDelete(id);
    } else if (action === 'edit') {
        const component = state.components.find(c => c.id === id);
        if (component) fillFormForEdit(component);
    }
}

function handleDelete(id) {
    const component = state.components.find(c => c.id === id);
    if (!component) return;

    const ok = confirm(`Удалить «${component.name}»?`);
    if (!ok) return;

    state.components = state.components.filter(c => c.id !== id);
    saveToStorage();
    renderCatalog();
}


function handleFilterInput() {
    readFiltersFromForm();
    renderCatalog();
}

function handleFilterReset() {
    filterForm.reset();
    readFiltersFromForm();
    renderCatalog();
}


function init() {
    const stored = loadFromStorage();
    state.components = stored || DEFAULT_COMPONENTS.slice();
    if (!stored) saveToStorage();
    cardsGrid.addEventListener('click', handleCardClick);
    addForm.addEventListener('submit', handleSubmit);

    filterForm.addEventListener('input', handleFilterInput);
    filterForm.addEventListener('reset', handleFilterReset);

    renderCatalog();
}

document.addEventListener('DOMContentLoaded', init);
