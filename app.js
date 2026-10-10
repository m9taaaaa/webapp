'use strict';

const DEFAULT_ITEMS = [
    {
        id: 'cpu-ryzen-7800x3d',
        category: 'cpu',
        vendor: 'amd',
        name: 'AMD Ryzen 7 7800X3D',
        description: 'Игровой процессор с 3D-кэшем, отличный выбор для сборки под игры.',
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
        description: 'Универсальный процессор для работы и игр, хорошо разгоняется.',
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
        description: 'Сбалансированное решение для игр в 1440p с большим объёмом памяти.',
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
        description: 'Надёжная плата под AM5 с хорошим питанием и VRM-охлаждением.',
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
        description: 'Комплект 2×16 ГБ с профилем EXPO для быстрой загрузки и работы.',
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
    items: [],
    searchQuery: '',
    selectedCategory: 'all',
    selectedVendor: 'all',
    sortBy: 'name-asc',
};

const STORAGE_KEY = 'pcparts.items.v1';

const CATEGORY_LABELS = {
    cpu: 'Процессор',
    gpu: 'Видеокарта',
    mb: 'Материнская плата',
    ram: 'Оперативная память',
};

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

const fields = {
    name: {
        input: document.getElementById('add-name'),
        error: document.getElementById('error-name'),
    },
    category: {
        input: document.getElementById('add-category'),
        error: document.getElementById('error-category'),
    },
    price: {
        input: document.getElementById('add-price'),
        error: document.getElementById('error-price'),
    },
    description: {
        input: document.getElementById('add-description'),
        error: document.getElementById('error-description'),
    },
};

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch (err) {
        console.warn('Storage error:', err);
    }
}

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : null;
    } catch (err) {
        console.warn('Storage error:', err);
        return null;
    }
}

function getVisibleItems() {
    const query = state.searchQuery.trim().toLowerCase();

    const filtered = state.items.filter(item => {
        const matchesSearch =
            query === '' ||
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query);

        const matchesCategory =
            state.selectedCategory === 'all' ||
            item.category === state.selectedCategory;

        const matchesVendor =
            state.selectedVendor === 'all' ||
            item.vendor === state.selectedVendor;

        return matchesSearch && matchesCategory && matchesVendor;
    });

    const sorted = filtered.slice();

    switch (state.sortBy) {
        case 'name-asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
            break;
        case 'price-asc':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            sorted.sort((a, b) => b.price - a.price);
            break;
        default:
            break;
    }

    return sorted;
}

function createCardElement(item) {
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.id = item.id;

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.loading = 'lazy';
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

    const categoryLi = document.createElement('li');
    const categorySpan = document.createElement('span');
    categorySpan.textContent = 'Тип:';
    categoryLi.appendChild(categorySpan);
    categoryLi.appendChild(
        document.createTextNode(
            ' ' + (CATEGORY_LABELS[item.category] || item.category)
        )
    );
    ul.appendChild(categoryLi);

    item.specs.forEach(spec => {
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
        document.createTextNode(' ' + item.price.toLocaleString('ru-RU') + ' ₽')
    );
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

function handleSearchInput(event) {
    state.searchQuery = event.target.value;
    render();
}

function handleCategoryChange(event) {
    state.selectedCategory = event.target.value;
    render();
}

function handleVendorChange(event) {
    state.selectedVendor = event.target.value;
    render();
}

function handleSortChange(event) {
    state.sortBy = event.target.value;
    render();
}

function handleGridClick(event) {
    const button = event.target.closest('button[data-action="delete"]');
    if (button === null) return;

    const card = button.closest('.card');
    if (card === null) return;

    const id = card.dataset.id;
    deleteItem(id);
}

function deleteItem(id) {
    const item = state.items.find(i => i.id === id);
    if (item === undefined) return;

    const confirmed = window.confirm('Удалить «' + item.name + '»?');
    if (confirmed === false) return;

    state.items = state.items.filter(i => i.id !== id);
    saveToStorage();
    render();
}

function openModal() {
    modal.hidden = false;
    document.body.classList.add('modal-open');
    clearFormErrors();
    addForm.reset();
    fields.name.input.focus();
}

function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    clearFormErrors();
}

function handleModalBackdropClick(event) {
    if (event.target === modalBackdrop) {
        closeModal();
    }
}

function handleEscape(event) {
    if (event.key === 'Escape' && modal.hidden === false) {
        closeModal();
    }
}

function clearFormErrors() {
    Object.values(fields).forEach(field => {
        field.error.textContent = '';
        field.input.classList.remove('is-invalid');
    });
}

function showFieldError(fieldName, message) {
    const field = fields[fieldName];
    field.error.textContent = message;
    field.input.classList.add('is-invalid');
}

function validateField(fieldName) {
    const field = fields[fieldName];
    const input = field.input;

    if (input.validity.valueMissing) {
        showFieldError(fieldName, 'Это поле обязательно для заполнения.');
        return false;
    }

    if (input.validity.tooShort) {
        showFieldError(
            fieldName,
            'Минимум ' + input.minLength + ' символов.'
        );
        return false;
    }

    if (input.validity.tooLong) {
        showFieldError(
            fieldName,
            'Максимум ' + input.maxLength + ' символов.'
        );
        return false;
    }

    if (input.validity.rangeUnderflow) {
        showFieldError(
            fieldName,
            'Значение не может быть меньше ' + input.min + '.'
        );
        return false;
    }

    if (input.validity.rangeOverflow) {
        showFieldError(
            fieldName,
            'Значение не может быть больше ' + input.max + '.'
        );
        return false;
    }

    if (input.validity.typeMismatch || input.validity.badInput) {
        showFieldError(fieldName, 'Введите корректное значение.');
        return false;
    }

    field.error.textContent = '';
    input.classList.remove('is-invalid');
    return true;
}

function validateForm() {
    let isValid = true;

    Object.keys(fields).forEach(fieldName => {
        const fieldValid = validateField(fieldName);
        if (fieldValid === false) {
            isValid = false;
        }
    });

    return isValid;
}

function handleFormSubmit(event) {
    event.preventDefault();
    clearFormErrors();

    if (validateForm() === false) {
        const firstInvalid = addForm.querySelector('.is-invalid');
        if (firstInvalid !== null) firstInvalid.focus();
        return;
    }

    const data = {
        id: 'custom-' + Date.now(),
        name: fields.name.input.value.trim(),
        category: fields.category.input.value,
        vendor: 'other',
        price: Number(fields.price.input.value),
        description: fields.description.input.value.trim(),
        image: 'images/placeholder.svg',
        specs: [],
    };

    state.items.push(data);
    saveToStorage();
    closeModal();
    render();
}

function init() {
    const stored = loadFromStorage();
    state.items = stored === null ? DEFAULT_ITEMS.slice() : stored;
    if (stored === null) saveToStorage();

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

    addForm.addEventListener('submit', handleFormSubmit);

    render();
}

document.addEventListener('DOMContentLoaded', init);
