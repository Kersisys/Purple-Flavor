import { getCategoryName } from "./recipe-categories.js";

/**
 * Единый компонент карточки рецепта — используется на главной странице
 * (лента), в "Моих рецептах" и в "Черновиках" в профиле. Логика получения
 * картинки общая, визуальный стиль и действия у каждого режима свои.
 *
 * @param {Object} recipe
 * @param {Object} [options]
 * @param {"feed"|"own"|"draft"} [options.mode] - "feed": лента на главной
 *        (фирменный "blob"-фон, кнопка избранного); "own": профиль,
 *        "мои рецепты" (кнопка редактирования); "draft": профиль,
 *        "черновики" (продолжить редактирование, кнопка удаления)
 * @param {boolean} [options.isFavorite] - для mode="feed", в избранном ли рецепт
 */
export function renderRecipeCard(recipe, options = {}){

    const {
        mode = "feed",
        isFavorite = false
    } = options;


    let image = recipe.image || "";

    if(!image && recipe.content){

        const match =
        recipe.content.match(
            /<img[^>]+src="([^">]+)"/
        );

        if(match){
            image = match[1];
        }

    }


    if(mode === "draft"){
        return renderDraftCard(recipe, image);
    }

    return mode === "own"
    ?
    renderOwnCard(recipe, image)
    :
    renderFeedCard(recipe, image, isFavorite);

}


// ===============================
// Лента — главная страница
// ===============================

function renderFeedCard(recipe, image, isFavorite){

    const imageBlock = image
    ?
    `
    <img
    src="${image}"
    class="w-full h-full object-cover"
    >
    `
    :
    `
    <span class="text-7xl">
    ${recipe.emoji || "🍽️"}
    </span>
    `;


    return `

    <div

    onclick="location.href='recipe.html?id=${recipe.id}'"

    class="
    card-hover
    cursor-pointer
    bg-white
    dark:bg-[#33294a]
    rounded-3xl
    overflow-hidden
    "

    >

        <div class="h-52 blob flex items-center justify-center">
            ${imageBlock}
        </div>


        <div class="p-4">

            <span class="text-xs text-[#FFAC54] uppercase">
            ${getCategoryName(recipe.category) || ""}
            </span>

            <h3 class="font-bold text-lg mt-2">
            ${recipe.title}
            </h3>

            <button
            onclick="
            event.stopPropagation();
            toggleFavorite('${recipe.id}')
            "
            class="text-2xl mt-3"
            >
            ${isFavorite ? "❤️" : "♡"}
            </button>

        </div>

    </div>

    `;

}


// ===============================
// Профиль — "черновики"
// ===============================

function renderDraftCard(recipe, image){

    const imageBlock = image
    ?
    `
    <img
    src="${image}"
    class="w-full h-56 object-cover"
    >
    `
    :
    `
    <div
    class="
    h-56
    flex
    items-center
    justify-center
    text-6xl
    bg-[#E7DFFF]
    "
    >
    ${recipe.emoji || "🍽️"}
    </div>
    `;


    return `

    <div

    onclick="location.href='create-recipe.html?draftId=${recipe.id}'"

    class="
    bg-white
    rounded-3xl
    overflow-hidden
    cursor-pointer
    shadow
    transition
    hover:-translate-y-2
    "

    >

        ${imageBlock}

        <div class="p-5">

            <span class="
            inline-block
            text-xs
            font-semibold
            uppercase
            text-[#9D91D9]
            mb-1
            ">
            Черновик
            </span>

            <h3 class="font-bold text-xl">
            ${recipe.title || "Без названия"}
            </h3>

            <p class="text-[#FFAC54] mt-2">
            ${getCategoryName(recipe.category) || ""}
            </p>

            <div class="flex gap-3 mt-4">

                <button

                onclick="
                event.stopPropagation();
                location.href='create-recipe.html?draftId=${recipe.id}'
                "

                class="
                px-4
                py-2
                bg-[#704E98]
                text-white
                rounded-xl
                "

                >
                Продолжить
                </button>

                <button

                onclick="
                event.stopPropagation();
                deleteDraft('${recipe.id}')
                "

                class="
                px-4
                py-2
                border
                border-red-300
                text-red-500
                rounded-xl
                "

                >
                Удалить
                </button>

            </div>

        </div>

    </div>

    `;

}

function renderOwnCard(recipe, image){

    const imageBlock = image
    ?
    `
    <img
    src="${image}"
    class="w-full h-56 object-cover"
    >
    `
    :
    `
    <div
    class="
    h-56
    flex
    items-center
    justify-center
    text-6xl
    bg-[#E7DFFF]
    "
    >
    ${recipe.emoji || "🍽️"}
    </div>
    `;


    return `

    <div

    onclick="location.href='recipe.html?id=${recipe.id}'"

    class="
    bg-white
    rounded-3xl
    overflow-hidden
    cursor-pointer
    shadow
    transition
    hover:-translate-y-2
    "

    >

        ${imageBlock}

        <div class="p-5">

            <h3 class="font-bold text-xl">
            ${recipe.title}
            </h3>

            <p class="text-[#FFAC54] mt-2">
            ${getCategoryName(recipe.category)}
            </p>

            <button

            onclick="
            event.stopPropagation();
            openRecipeEdit('${recipe.id}')
            "

            class="
            mt-4
            px-4
            py-2
            bg-[#704E98]
            text-white
            rounded-xl
            "

            >
            Редактировать
            </button>

        </div>

    </div>

    `;

}