import { getCategoryName } from "./recipe-categories.js";
import { showToast } from "./toast.js";

import {
    getRecipeById,
    authListener,
    getFavorites,
    addFavorite,
    removeFavorite
} from "./firebase.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const title = document.getElementById("title");
const category = document.getElementById("category");
const content = document.getElementById("content");
const author = document.getElementById("author");
const favoriteBtn = document.getElementById("favoriteBtn");

let recipe = null;
let currentUser = null;
let favorites = new Set();

function updateFavoriteButton(){

    if(!recipe) return;

    favoriteBtn.textContent =
        favorites.has(recipe.id)
        ? "❤️"
        : "🤍";

}

window.toggleFavorite = async function(){

    if(!currentUser){

        showToast("Для добавления в избранное войдите в аккаунт.", "info");

        return;

    }

    if(favorites.has(recipe.id)){

        await removeFavorite(recipe.id);

        favorites.delete(recipe.id);

    }else{

        await addFavorite(recipe.id);

        favorites.add(recipe.id);

    }

    updateFavoriteButton();

};

async function loadRecipe(){

    recipe = await getRecipeById(id);

    if(!recipe){

        content.innerHTML = "<h2>Рецепт не найден</h2>";

        return;

    }

    title.textContent = recipe.title;
    category.textContent = getCategoryName(recipe.category);
    content.innerHTML = recipe.content;

    author.textContent =
        recipe.author
        ? "Автор: " + recipe.author
        : "Purple Flavor";

    updateFavoriteButton();

}

authListener(async(user)=>{

    currentUser = user;

    if(user){

        favorites = new Set(
            await getFavorites()
        );

    }else{

        favorites.clear();

    }

    updateFavoriteButton();

});

loadRecipe();