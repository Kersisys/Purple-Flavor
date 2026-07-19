import {
    authListener,
    isAdmin,
    getRecipeById,
    updateRecipe
} from "./firebase.js";

import {
    populateCategorySelect
} from "./recipe-categories.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const title = document.getElementById("title");
const category = document.getElementById("category");
const editor = document.getElementById("editor");

async function loadRecipe() {

    const recipe = await getRecipeById(id);

    if (!recipe) {
        alert("Рецепт не найден");
        return;
    }

    title.value = recipe.title;

    populateCategorySelect(category, recipe.category || "");

    editor.innerHTML = recipe.content;

}

window.saveEdit = async function () {

    await updateRecipe(id, {
        title: title.value,
        category: category.value,
        content: editor.innerHTML
    });

    alert("✅ Сохранено");

    window.location.href = "admin.html";

};

authListener(async (user) => {

    if (!user) {
        location.replace("index.html");
        return;
    }

    if (!(await isAdmin())) {
        location.replace("index.html");
        return;
    }

    document.body.classList.remove("hidden");

    loadRecipe();

});
