import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";



// ===============================
// Firebase Config
// ===============================


const firebaseConfig = {

    apiKey: "AIzaSyAB6Suz-0IcAagyikXdgqvnYBPJA2yV58g",

    authDomain: "purple-flavor.firebaseapp.com",

    projectId: "purple-flavor",

    storageBucket: "purple-flavor.firebasestorage.app",

    messagingSenderId: "704246248990",

    appId: "1:704246248990:web:cf2db03f7249bf9c5ae00f",

    measurementId: "G-62S9ZDZWLY"

};



const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);

export const auth = getAuth(app);




// ===============================
// Cloudinary
// ===============================


export const CLOUD_NAME = "i9rbcpra";

export const UPLOAD_PRESET = "Purple_flavor";




// ===============================
// AUTH
// ===============================


export async function register(username,password){


    const email =
    username + "@purpleflavor.app";



    const user =
    await createUserWithEmailAndPassword(

        auth,

        email,

        password

    );



    await setDoc(

        doc(db,"users",user.user.uid),
    
        {
    
            username: username,
    
            name: username,
    
            bio: "",
    
            avatar: "",
    
            role: "user",
    
            createdAt: serverTimestamp()
    
        }
    
    );



    return user;


}


export async function login(username,password){

    const email = username + "@purpleflavor.app";


    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

}



export async function logout(){

    await signOut(auth);

}



export function authListener(callback){

    onAuthStateChanged(
        auth,
        callback
    );

}






// ===============================
// IMAGE UPLOAD
// ===============================


export async function uploadImage(file){


    const form = new FormData();


    form.append(
        "file",
        file
    );


    form.append(
        "upload_preset",
        UPLOAD_PRESET
    );



    const response = await fetch(

        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

        {
            method:"POST",
            body:form
        }

    );



    const data = await response.json();



    return data.secure_url.replace(

        "/upload/",

        "/upload/w_900,q_auto,f_auto/"

    );


}






// ===============================
// RECIPES
// ===============================



export async function createRecipe(recipe){


    recipe.createdAt =
    serverTimestamp();


    await addDoc(

        collection(
            db,
            "recipes"
        ),

        recipe

    );

}

// Совместимость с app.js
export async function addRecipe(recipe){

    return await createRecipe(recipe);

}





// ===============================
// APPROVED RECIPES
// ===============================


export async function getRecipes(){


    const q = query(

        collection(
            db,
            "recipes"
        ),


        where(

            "status",

            "==",

            "approved"

        ),


        orderBy(

            "createdAt",

            "desc"

        ),


        limit(20)

    );




    const snap =
    await getDocs(q);



    return snap.docs.map(doc=>({

        id:doc.id,

        ...doc.data()

    }));

}







// ===============================
// ONE RECIPE
// ===============================


export async function getRecipeById(id){


    const snap =
    await getDoc(

        doc(
            db,
            "recipes",
            id
        )

    );



    if(!snap.exists()){

        return null;

    }



    return {

        id:snap.id,

        ...snap.data()

    };


}







// ===============================
// PENDING
// ===============================


export async function getPendingRecipes(){


    const q = query(

        collection(
            db,
            "recipes"
        ),


        where(

            "status",

            "==",

            "pending"

        )

    );



    const snap =
    await getDocs(q);



    return snap.docs.map(doc=>({

        id:doc.id,

        ...doc.data()

    }));

}








// ===============================
// APPROVE
// ===============================


export async function approveRecipe(id){


    await updateDoc(

        doc(
            db,
            "recipes",
            id
        ),

        {

            status:"approved"

        }

    );

}








// ===============================
// DELETE
// ===============================


export async function deleteRecipe(id){


    await deleteDoc(

        doc(
            db,
            "recipes",
            id
        )

    );

}








// ===============================
// UPDATE
// ===============================


export async function updateRecipe(id,data){


    await updateDoc(

        doc(
            db,
            "recipes",
            id
        ),

        data

    );

}

export async function isAdmin(){

    console.log("Current user:", auth.currentUser);

    if(!auth.currentUser){
        return false;
    }

    const ref = doc(db, "users", auth.currentUser.uid);

    console.log("UID:", auth.currentUser.uid);

    const snap = await getDoc(ref);

    console.log("Документ найден:", snap.exists());

    if(!snap.exists()){
        return false;
    }

    console.log("Данные:", snap.data());

    return snap.data().role === "admin";
}

// ===============================
// FAVORITES
// ===============================

export async function getFavorites(){

    if(!auth.currentUser){
        return [];
    }

    const snap = await getDoc(
        doc(db,"users",auth.currentUser.uid)
    );

    if(!snap.exists()){
        return [];
    }

    return snap.data().favorites || [];
}

export async function addFavorite(recipeId){

    await updateDoc(

        doc(
            db,
            "users",
            auth.currentUser.uid
        ),

        {

            favorites: arrayUnion(recipeId)

        }

    );

}

export async function removeFavorite(recipeId){

    await updateDoc(

        doc(
            db,
            "users",
            auth.currentUser.uid
        ),

        {

            favorites: arrayRemove(recipeId)

        }

    );

}


// ===============================
// PROFILE
// ===============================

export async function getCurrentUserProfile(){

    if(!auth.currentUser){

        return null;

    }

    const snap = await getDoc(

        doc(
            db,
            "users",
            auth.currentUser.uid
        )

    );

    if(!snap.exists()){

        return null;

    }

    return {

        uid: auth.currentUser.uid,

        ...snap.data()

    };

}

export async function updateUserProfile(data){

    if(!auth.currentUser){

        throw new Error("Пользователь не авторизован");

    }

    await updateDoc(

        doc(
            db,
            "users",
            auth.currentUser.uid
        ),

        data

    );

}

export async function getUserRecipes(){

    if(!auth.currentUser){

        return [];

    }

    const q = query(

        collection(
            db,
            "recipes"
        ),

        where(
            "authorId",
            "==",
            auth.currentUser.uid
        )

    );

    const snap = await getDocs(q);

    return snap.docs.map(doc=>({

        id:doc.id,

        ...doc.data()

    }));

}

export async function updateRecipeForModeration(recipeId, recipeData) {

    if (!auth.currentUser) {

        throw new Error(
            "Пользователь не авторизован"
        );

    }


    const recipeRef = doc(
        db,
        "recipes",
        recipeId
    );


    await updateDoc(recipeRef, {

        title:
        recipeData.title || "",


        category:
        recipeData.category || "",


        content:
        recipeData.content || "",


        status:
        "pending",


        updatedAt:
        serverTimestamp()

    });


    return true;

}