// admin.js

console.log("ADMIN JS ЗАПУЩЕН");

import {
    getCategoryName
} from "./recipe-categories.js";

import {
    showToast
} from "./toast.js";

import {
    showConfirm
} from "./confirm.js";

import {

    authListener,
    isAdmin,

    getPendingRecipes,
    approveRecipe,
    deleteRecipe,
    updateRecipe,
    getRecipes

} from "./firebase.js";




const pendingContainer =
document.getElementById("pendingContainer");


const publishedContainer =
document.getElementById("publishedContainer");


const publishedCount =
document.getElementById("publishedCount");







// ===============================
// MODERATION
// ===============================


async function loadPending(){


console.log("Загружаю pending...");



const recipes =
await getPendingRecipes();



console.log(
"Получено:",
recipes
);





if(recipes.length===0){


pendingContainer.innerHTML=
`
<p class="text-gray-400">
Нет рецептов на модерации
</p>
`;

return;


}






pendingContainer.innerHTML =


recipes.map(recipe=>`



<div class="card rounded-3xl p-6">



<h3 class="text-2xl font-bold mb-3">

${recipe.title}

</h3>



<p class="text-[#FFAC54] mb-5">

${getCategoryName(recipe.category)}

</p>




<div class="bg-white/10 rounded-2xl p-5 mb-5">


${recipe.content}


</div>





<div class="flex gap-4">


<button

onclick="approve('${recipe.id}')"

class="
px-6
py-3
bg-green-600
text-white
rounded-2xl
">

✅ Одобрить

</button>





<button

onclick="removeRecipe('${recipe.id}')"

class="
px-6
py-3
bg-red-600
text-white
rounded-2xl
">

❌ Удалить

</button>



</div>




</div>



`).join("");



}








// ===============================
// PUBLISHED
// ===============================


async function loadPublished(){



const recipes =
await getRecipes();




publishedCount.textContent =
recipes.length;





if(recipes.length===0){


publishedContainer.innerHTML=
`
<p>
Нет опубликованных рецептов
</p>
`;

return;


}





publishedContainer.innerHTML =



recipes.map(recipe=>`



<div class="card rounded-3xl p-6">



<h3 class="text-xl font-bold">

${recipe.title}

</h3>



<p class="text-[#FFAC54] mt-2">

${getCategoryName(recipe.category)}

</p>




<div class="flex gap-3 mt-5">



<button

onclick="openRecipe('${recipe.id}')"

class="
px-4
py-3
bg-[#704E98]
text-white
rounded-2xl
">

👁 Просмотр

</button>





<button

onclick="editRecipe('${recipe.id}')"

class="
px-4
py-3
bg-yellow-500
text-white
rounded-2xl
">

✏️ Изменить

</button>





<button

onclick="removeRecipe('${recipe.id}')"

class="
px-4
py-3
bg-red-600
text-white
rounded-2xl
">

🗑 Удалить

</button>



</div>



</div>



`).join("");



}







// ===============================
// ACTIONS
// ===============================



window.approve =
async function(id){


await approveRecipe(id);


loadPending();


loadPublished();


};






window.removeRecipe =
async function(id){


const ok = await showConfirm("Удалить рецепт?");

if(ok){


await deleteRecipe(id);


loadPending();


loadPublished();


}



};







window.openRecipe =
function(id){


    window.location.href =
    "recipe.html?id=" + id;


};






window.editRecipe =
function(id){


location.href=
"admin-edit.html?id="+id;


};








authListener(async(user)=>{

    if(!user){

        location.href = "index.html";

        return;

    }

    const admin = await isAdmin();

    if(!admin){

        showToast("Нет доступа", "error");

        setTimeout(() => {
            location.href = "index.html";
        }, 900);

        return;

    }

    await loadPending();

    await loadPublished();

});