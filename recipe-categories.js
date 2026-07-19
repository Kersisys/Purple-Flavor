export const recipeCategories = [

    {
        id: "salads and snacks",
        name: "Салаты и Закуски"
    },

    {
        id: "desserts",
        name: "Десерты"
    },

    {
        id: "garnish",
        name: "Гарнир"
    },

    {
        id: "soup",
        name: "Супы"
    },

    {
        id: "bakery",
        name: "Выпечка"
    },

    {
        id: "drinks",
        name: "Напитки"
    }

];

/**
 * Старые/битые значения категории, которые могли сохраниться в базе
 * из-за прошлой версии формы редактирования (там select содержал
 * value="Soup"/"Dessert"/"Baking"/"Drink" вместо настоящих id,
 * причём регистр мог быть любым — "baking", "Baking" и т.д.).
 * Пока такие рецепты не пересохранены через актуальную форму,
 * эта карта позволяет всё равно показывать их по-русски.
 */
const legacyCategoryAliases = {
    "soup": "soup",
    "dessert": "desserts",
    "baking": "bakery",
    "drink": "drinks"
};

export function normalizeCategoryId(id) {

    if (!id) return id;

    const key = id.toLowerCase();

    return legacyCategoryAliases[key] || id;

}

export function getCategoryName(id) {

    const normalizedId = normalizeCategoryId(id);

    const category = recipeCategories.find(c => c.id === normalizedId);

    return category ? category.name : id;

}

export function getCategories() {

    return recipeCategories;

}

/**
 * Заполняет <select> категориями из recipeCategories.
 * Единая точка создания category-select для всех форм проекта
 * (создание рецепта, редактирование в профиле, редактирование в админке,
 * фильтр категорий на главной странице).
 *
 * @param {HTMLSelectElement} selectEl - select-элемент для заполнения
 * @param {string} [selectedId] - id категории, которую нужно выбрать по умолчанию
 * @param {string|null} [allLabel] - если передан, добавляет в начало опцию
 *                                   со значением "" и этим текстом (например
 *                                   "Все категории" для фильтра на главной)
 */
export function populateCategorySelect(selectEl, selectedId = "", allLabel = null) {

    if (!selectEl) return;

    const options = recipeCategories
        .map(category => `<option value="${category.id}">${category.name}</option>`)
        .join("");

    selectEl.innerHTML = allLabel !== null
        ? `<option value="">${allLabel}</option>${options}`
        : options;

    selectEl.value = selectedId ? normalizeCategoryId(selectedId) : "";

}