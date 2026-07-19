// ===============================
// Purple Flavor App
// ===============================
console.log("APP JS ЗАПУЩЕН");

import {
    populateCategorySelect,
    normalizeCategoryId
} from "./recipe-categories.js";
import { showToast } from "./toast.js";
import { renderRecipeCard } from "./recipe-card.js";

import {
    register,
    login,
    logout,
    authListener,
    getRecipes,
    getFavorites,
    addFavorite,
    removeFavorite
} from "./firebase.js";


// ===============================
// Variables
// ===============================

let recipes = [];
let favorites = new Set();
let currentUser = null;
let isFavoritesView = false;

let searchQuery = "";
let categoryFilter = "";
let sortMode = "date-desc";


// ===============================
// Start
// ===============================

authListener(async (user)=>{

    currentUser = user;

    updateAuthButton();

    favorites = new Set(
        user ? await getFavorites() : []
    );

    updateFavCount();

    await loadRecipes();

});

initRecipeControls();



async function loadRecipes(){

    try{

        recipes = await getRecipes();

        renderCurrentPage();

    }

    catch(error){

        console.error(error);

    }

}


// ===============================
// Search / filter / sort
// ===============================

function initRecipeControls(){

    const categorySelect =
    document.getElementById("categoryFilter");

    populateCategorySelect(
        categorySelect,
        "",
        "Все категории"
    );


    const searchInput =
    document.getElementById("searchInput");

    const sortSelect =
    document.getElementById("sortSelect");


    let searchDebounce;

    searchInput?.addEventListener("input", (event)=>{

        clearTimeout(searchDebounce);

        searchDebounce = setTimeout(()=>{

            searchQuery = event.target.value.trim();

            renderCurrentPage();

        }, 250);

    });


    categorySelect?.addEventListener("change", (event)=>{

        categoryFilter = event.target.value;

        renderCurrentPage();

    });


    sortSelect?.addEventListener("change", (event)=>{

        sortMode = event.target.value;

        renderCurrentPage();

    });

}


function applyFiltersAndSort(list){

    let result = list;


    if(searchQuery){

        const query = searchQuery.toLowerCase();

        result = result.filter(recipe=>

            (recipe.title || "")
            .toLowerCase()
            .includes(query)

        );

    }


    if(categoryFilter){

        result = result.filter(recipe=>

            normalizeCategoryId(recipe.category) === categoryFilter

        );

    }


    const getTime = recipe=>

        recipe.createdAt?.toMillis
        ?
        recipe.createdAt.toMillis()
        :
        0;


    result = [...result].sort((a, b)=>{

        if(sortMode === "alpha"){

            return (a.title || "")
            .localeCompare(b.title || "", "ru");

        }


        return sortMode === "date-asc"
        ?
        getTime(a) - getTime(b)
        :
        getTime(b) - getTime(a);

    });


    return result;

}




// ===============================
// User button
// ===============================

function updateAuthButton(){

    const btn =
    document.getElementById("authBtnText");


    if(!btn) return;


    btn.textContent =
    currentUser
    ?
    "Профиль"
    :
    "Войти";

}



// ===============================
// Theme
// ===============================

window.toggleTheme=function(){

    document.documentElement.classList.toggle("dark");


    localStorage.setItem(

        "theme",

        document.documentElement.classList.contains("dark")
        ?
        "dark"
        :
        "light"

    );

};




// ===============================
// Favorites
// ===============================

window.toggleFavoritesView=function(){

    isFavoritesView=!isFavoritesView;

    renderCurrentPage();

};



window.toggleFavorite=async function(id){


    if(!currentUser){

        showToast("Для добавления в избранное войдите в аккаунт.", "info");

        return;

    }


    const isFavorite = favorites.has(id);


    isFavorite
    ?
    favorites.delete(id)
    :
    favorites.add(id);


    updateFavCount();

    renderCurrentPage();


    try{

        if(isFavorite){

            await removeFavorite(id);

        }else{

            await addFavorite(id);

        }

    }catch(error){

        console.error(error);


        isFavorite
        ?
        favorites.add(id)
        :
        favorites.delete(id);

        updateFavCount();

        renderCurrentPage();

        showToast("Не удалось обновить избранное", "error");

    }

};



function updateFavCount(){

    const el = document.getElementById("favCount");

    if(el){

        el.textContent = favorites.size;

    }

}




// ===============================
// Render recipes
// ===============================

function renderCurrentPage(){


    const container =
    document.getElementById("mainContent");


    const title =
    document.getElementById("pageTitle");



    if(!container) return;



    let list =
    isFavoritesView
    ?
    recipes.filter(r=>favorites.has(r.id))
    :
    recipes;


    list = applyFiltersAndSort(list);


    title.textContent =
    isFavoritesView
    ?
    `❤️ Избранное (${list.length})`
    :
    "Все рецепты";



    if(list.length===0){

        const hasActiveFilters =
        Boolean(searchQuery) || Boolean(categoryFilter);


        container.innerHTML=`

        <div class="col-span-full text-center py-20">

        <p class="text-6xl mb-4">
        🍽️
        </p>

        <p>
        ${
            hasActiveFilters
            ?
            "По вашему запросу ничего не найдено"
            :
            "Рецептов пока нет"
        }
        </p>

        </div>

        `;

        return;

    }




    container.innerHTML = list.map(recipe=>

        renderRecipeCard(recipe, {
            mode: "feed",
            isFavorite: favorites.has(recipe.id)
        })

    ).join("");

}




// ===============================
// CREATE RECIPE PAGE
// ===============================

window.openCreatePage = function(){

    if(!currentUser){

        const modal =
        document.getElementById("authModal");

        if(modal){

            modal.classList.remove("hidden");

        }

        return;

    }


    window.location.href =
    "create-recipe.html";

};


// ===============================
// Auth
// ===============================

window.handleAuthClick=function(){


    if(currentUser){

        window.location.href = "profile.html";

    }
    else{

        document
        .getElementById("authModal")
        .classList.remove("hidden");

    }

};




window.loginUser=async function(){


    const username =
    document.getElementById("usernameInput")
    .value.trim();


    const password =
    document.getElementById("passwordInput")
    .value;



    try{

        await login(username,password);

        closeAuthModal();

    }

    catch(error){

        showToast("Ошибка входа", "error");

    }

};




window.registerUser=async function(){


    const username =
    document.getElementById("usernameInput")
    .value.trim();


    const password =
    document.getElementById("passwordInput")
    .value;



    try{

        await register(username,password);

        closeAuthModal();

    }

    catch(error){

        showToast("Ошибка регистрации", "error");

    }

};




// ===============================
// Modals
// ===============================

window.closeAuthModal=function(){

    document
    .getElementById("authModal")
    .classList.add("hidden");

};



window.closeLogoutModal=function(){

    document
    .getElementById("logoutModal")
    .classList.add("hidden");

};



window.performLogout = async function(){

    await logout();

    closeLogoutModal();

};




// ===============================
// Home
// ===============================

window.goHome=function(){

    isFavoritesView=false;

    renderCurrentPage();

};



// Theme load

if(localStorage.getItem("theme")==="dark"){

    document.documentElement.classList.add("dark");

}