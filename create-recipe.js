// create-recipe.js


import {
    uploadImage,
    createRecipe,
    updateRecipe,
    getRecipeById,
    getCurrentUserProfile
} from "./firebase.js";

import {
    populateCategorySelect
} from "./recipe-categories.js";

import {
    showToast
} from "./toast.js";

import {
    showConfirm
} from "./confirm.js";




const editor =
document.getElementById("editor");


const placeholder =
document.getElementById("placeholder");


populateCategorySelect(
    document.getElementById("category")
);



let currentRange = null;


// ===============================
// ЧЕРНОВИК
// ===============================

const urlParams = new URLSearchParams(window.location.search);

let currentDraftId = urlParams.get("draftId") || null;

let lastSavedSnapshot = "";

let userProfile = null;

const draftStatusEl = document.getElementById("draftStatus");


function getSnapshot(){

    return JSON.stringify({
        title: document.getElementById("title").value.trim(),
        category: document.getElementById("category").value,
        content: editor.innerHTML
    });

}


async function loadDraft(id){

    const recipe = await getRecipeById(id);

    if(!recipe || recipe.status !== "draft"){

        currentDraftId = null;
        return;

    }

    document.getElementById("title").value = recipe.title || "";

    populateCategorySelect(
        document.getElementById("category"),
        recipe.category || ""
    );

    editor.innerHTML = recipe.content || "";

    updatePlaceholder();

    lastSavedSnapshot = getSnapshot();

}


async function autosaveDraft(){

    const title =
    document.getElementById("title").value.trim();

    const content =
    editor.innerHTML.trim();


    if(!title && !content) return;


    const snapshot = getSnapshot();

    if(snapshot === lastSavedSnapshot) return;


    if(!userProfile){

        userProfile = await getCurrentUserProfile();

        if(!userProfile) return;

    }


    if(draftStatusEl){
        draftStatusEl.textContent = "Сохранение черновика...";
    }


    const draftData = {
        title,
        category: document.getElementById("category").value,
        content: editor.innerHTML,
        authorId: userProfile.uid,
        author: userProfile.name,
        status: "draft"
    };


    try{

        if(currentDraftId){

            await updateRecipe(currentDraftId, draftData);

        }else{

            currentDraftId = await createRecipe(draftData);

            const newUrl =
            `${window.location.pathname}?draftId=${currentDraftId}`;

            history.replaceState(null, "", newUrl);

        }

        lastSavedSnapshot = snapshot;

        if(draftStatusEl){

            const time =
            new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });

            draftStatusEl.textContent =
            `Черновик сохранён · ${time}`;

        }

    }catch(error){

        console.error(error);

        if(draftStatusEl){
            draftStatusEl.textContent = "Не удалось сохранить черновик";
        }

    }

}


if(currentDraftId){

    loadDraft(currentDraftId);

}


setInterval(autosaveDraft, 10000);





// ===============================
// PLACEHOLDER
// ===============================


function updatePlaceholder(){


    if(editor.innerText.trim().length === 0){

        placeholder.style.display = "block";

    }else{

        placeholder.style.display = "none";

    }

}



editor.addEventListener(
"input",
updatePlaceholder
);



updatePlaceholder();







// ===============================
// СОХРАНЕНИЕ КУРСОРА
// ===============================


function saveCursor(){


    const selection =
    window.getSelection();



    if(selection.rangeCount){

        currentRange =
        selection.getRangeAt(0);

    }

}



editor.addEventListener(
"keyup",
saveCursor
);


editor.addEventListener(
"mouseup",
saveCursor
);


editor.addEventListener(
"input",
saveCursor
);







// ===============================
// ДОБАВЛЕНИЕ ФОТО
// ===============================


window.addPhoto = function(){


    saveCursor();



    const input =
    document.createElement("input");


    input.type="file";

    input.accept="image/*";



    input.onchange = async function(e){



        const file =
        e.target.files[0];



        if(!file)
        return;





        try{


            const url =
            await uploadImage(file);



            insertImage(url);



        }catch(error){


            console.error(error);


            showToast(
            "Ошибка загрузки фото",
            "error"
            );


        }



    };



    input.click();


};







// ===============================
// ВСТАВКА КАРТИНКИ
// ===============================


function insertImage(url){



    editor.focus();



    const img =
    document.createElement("img");



    img.src=url;



    img.onclick=async function(){


        const ok =
        await showConfirm("Удалить фото?");


        if(ok){

            img.remove();

            updatePlaceholder();

        }


    };





    if(currentRange){


        currentRange.deleteContents();


        currentRange.insertNode(img);



    }else{


        editor.appendChild(img);


    }






    const space =
    document.createElement("br");



    img.after(space);







    const range =
    document.createRange();


    range.setStartAfter(space);


    range.collapse(true);



    const selection =
    window.getSelection();



    selection.removeAllRanges();


    selection.addRange(range);



    currentRange =
    range;




}







// ===============================
// ОТПРАВКА
// ===============================


window.sendRecipe = async function(){



    const title =
    document
    .getElementById("title")
    .value
    .trim();



    const category =
    document
    .getElementById("category")
    .value;





    if(!title){


        showToast(
        "Введите название рецепта",
        "error"
        );


        return;

    }





    if(
    editor.innerHTML.trim()===""
    ){


        showToast(
        "Напишите рецепт",
        "error"
        );


        return;

    }



    const profile =
    userProfile ||
    await getCurrentUserProfile();

    const recipe = {

        title,
    
        category,
    
        content:
        editor.innerHTML,
    
        authorId:
        profile.uid,
    
        author:
        profile.name,
    
        status:
        "pending"
    
    };




    try{


        if(currentDraftId){

            await updateRecipe(currentDraftId, recipe);

        }else{

            await createRecipe(recipe);

        }



        showToast(
        "Рецепт отправлен на модерацию"
        );



        setTimeout(() => {

            location.href=
            "index.html";

        }, 900);



    }catch(error){



        console.error(error);



        showToast(
        "Ошибка отправки",
        "error"
        );


    }




};