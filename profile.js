import {
    populateCategorySelect
} from "./recipe-categories.js";

import {
    showToast
} from "./toast.js";

import {
    showConfirm
} from "./confirm.js";

import {
    renderRecipeCard
} from "./recipe-card.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import {

    authListener,
    logout,
    getCurrentUserProfile,
    getUserRecipes,
    updateUserProfile,
    uploadImage,
    updateRecipeForModeration,
    getRecipeById,
    deleteRecipe

} from "./firebase.js";

const avatar =
document.getElementById("avatar");

const username =
document.getElementById("username");

const login =
document.getElementById("login");

const bio =
document.getElementById("bio");

const recipesBox =
document.getElementById("recipes");

const editModal =
document.getElementById("editModal");

const editName =
document.getElementById("editName");

const editBio =
document.getElementById("editBio");

const avatarFile =
document.getElementById("avatarFile");


const editRecipeBlock =
document.getElementById("editRecipeBlock");

const editRecipeTitle =
document.getElementById("editRecipeTitle");

const editRecipeCategory =
document.getElementById("editRecipeCategory");

const editRecipeContent =
document.getElementById("editRecipeContent");

const saveRecipeEdit =
document.getElementById("saveRecipeEdit");

const cancelRecipeEdit =
document.getElementById("cancelRecipeEdit");


let editingRecipeId = null;

let profile = null;

let allUserRecipes = [];

let activeTab = "own";

authListener(async(user)=>{

    if(!user){

        location.href="index.html";

        return;

    }

    await loadProfile();

});

async function loadProfile(){

    profile =
    await getCurrentUserProfile();

    username.textContent =
    profile.name || profile.username;

    login.textContent =
    "@" + profile.username;

    bio.textContent =
    profile.bio || "Описание отсутствует";

    avatar.src =
    profile.avatar ||
    "https://placehold.co/180x180";

    await loadRecipes();

}

async function loadRecipes(){

    allUserRecipes =
    await getUserRecipes();

    renderActiveTab();

}

function renderActiveTab(){

    const list =
    activeTab === "draft"
    ?
    allUserRecipes.filter(r => r.status === "draft")
    :
    allUserRecipes.filter(r => r.status !== "draft");


    updateTabButtons();


    if(list.length===0){

        recipesBox.innerHTML=`

        <p class="text-gray-500">

        ${
            activeTab === "draft"
            ?
            "Черновиков пока нет."
            :
            "Вы ещё не создали ни одного рецепта."
        }

        </p>

        `;

        return;

    }

    renderRecipes(list);

}

function updateTabButtons(){

    const ownTab = document.getElementById("tabOwnRecipes");
    const draftTab = document.getElementById("tabDraftRecipes");

    if(!ownTab || !draftTab) return;

    const activeClasses = ["bg-[#704E98]", "text-white"];
    const inactiveClasses = ["bg-white", "text-[#3A2E52]"];

    ownTab.classList.remove(...activeClasses, ...inactiveClasses);
    draftTab.classList.remove(...activeClasses, ...inactiveClasses);

    ownTab.classList.add(
        ...(activeTab === "own" ? activeClasses : inactiveClasses)
    );

    draftTab.classList.add(
        ...(activeTab === "draft" ? activeClasses : inactiveClasses)
    );

}

window.switchProfileTab = function(tab){

    activeTab = tab;

    renderActiveTab();

};

window.performLogout = async function(){

    const ok = await showConfirm("Выйти из аккаунта?");

    if(!ok) return;

    try{

        await logout();

        showToast("Вы вышли из аккаунта", "success");

        location.href = "index.html";

    }

    catch(error){

        showToast("Ошибка при выходе", "error");

    }

};

window.deleteDraft = async function(id){

    const ok = await showConfirm("Удалить черновик?");

    if(!ok) return;

    try{

        await deleteRecipe(id);

        showToast("Черновик удалён");

        await loadRecipes();

    }catch(error){

        console.error(error);

        showToast("Не удалось удалить черновик", "error");

    }

};

function renderRecipes(recipes){

    recipesBox.innerHTML =

    recipes.map(recipe => {

        return renderRecipeCard(recipe, {
            mode: activeTab === "draft" ? "draft" : "own"
        });

    }).join("");

}

document

.getElementById("editProfile")

.onclick = openEditModal;

function openEditModal(){

    editName.value =
    profile.name || profile.username;

    editBio.value =
    bio.textContent === "Описание отсутствует"
    ? ""
    : bio.textContent;

    editModal.classList.remove("hidden");

}

window.closeEditModal=function(){

    editModal.classList.add("hidden");

}

window.saveProfile = async function(){

    try{

        let avatar = profile.avatar || "";

        if(avatarFile.files.length){

            avatar = await uploadImage(

                avatarFile.files[0]

            );

        }

        await updateUserProfile({

            name:
            editName.value.trim(),

            bio:
            editBio.value.trim(),

            avatar

        });

        profile = await getCurrentUserProfile();

        username.textContent =
        profile.name || profile.username;

        bio.textContent =
        profile.bio || "Описание отсутствует";

        const avatarImg = document.getElementById("profileAvatar");

            if (avatarImg) {
                avatarImg.src =
             profile.avatar ||
            "https://placehold.co/180x180";
}

        editModal.classList.add("hidden");

        showToast("Профиль успешно сохранён");

    }catch(error){

        console.error("SAVE PROFILE ERROR:", error);
    
        showToast(error.message, "error");
    
    }

};


window.openRecipeEdit = async function(id){

    try{

        const recipe =
        await getRecipeById(id);


        if(!recipe){

            showToast("Рецепт не найден", "error");
            return;

        }


        editingRecipeId = id;


        editRecipeTitle.value =
        recipe.title || "";


        populateCategorySelect(
            editRecipeCategory,
            recipe.category || ""
        );


        editRecipeContent.value =
        recipe.content || "";


        editRecipeBlock.classList.remove("hidden");


        window.scrollTo({

            top:
            editRecipeBlock.offsetTop,

            behavior:
            "smooth"

        });


    }catch(error){

        console.error(
            "OPEN RECIPE EDIT ERROR:",
            error
        );

    }

};

saveRecipeEdit.onclick = async function(){

    try{

        await updateRecipeForModeration(

            editingRecipeId,

            {

                title:
                editRecipeTitle.value.trim(),


                category:
                editRecipeCategory.value,


                content:
                editRecipeContent.value

            }

        );


        showToast(
            "Рецепт отправлен на проверку"
        );


        editRecipeBlock.classList.add(
            "hidden"
        );


        await loadRecipes();


    }catch(error){

        console.error(
            "UPDATE RECIPE ERROR:",
            error
        );

        showToast(error.message, "error");

    }

};

cancelRecipeEdit.onclick = function(){

    editRecipeBlock.classList.add(
        "hidden"
    );

    editingRecipeId = null;

};