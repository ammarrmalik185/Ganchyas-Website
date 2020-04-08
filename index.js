let currentUser;

function setup(){
     let firebaseConfig = {
        apiKey: "AIzaSyCeBY2YoshKpughHxr-LIRKCWubGkB-ahI",
        authDomain: "ganchyas.firebaseapp.com",
        databaseURL: "https://ganchyas.firebaseio.com",
        projectId: "ganchyas",
        storageBucket: "ganchyas.appspot.com",
        messagingSenderId: "835207895014",
        appId: "1:835207895014:web:e066f2a31ddae0ff2be827",
        measurementId: "G-VJM31EEZ10"
    };
    firebase.initializeApp(firebaseConfig);
    firebase.auth().onAuthStateChanged(function(user) {
        currentUser = user;
        if (user) {
            let button = document.getElementById("loginButton");
            button.innerText = "logout";
            button.removeEventListener("click", openLoginDialog);
            button.addEventListener("click", logOut);
            closeLoginDialog();
            let navigateToCommunity = document.getElementById("navigateToCommunity");
            navigateToCommunity.innerText = "Go to Community";
            navigateToCommunity.addEventListener("click", navigateToCommunityFunction);
        }
        else{
            let button = document.getElementById("loginButton");
            button.innerText = "login";
            button.removeEventListener("click", logOut);
            button.addEventListener("click", openLoginDialog);
            let navigateToCommunity = document.getElementById("navigateToCommunity");
            navigateToCommunity.innerText = "Log in first";
            navigateToCommunity.removeEventListener("click", navigateToCommunityFunction);
        }
    });
}

function login(){
    firebase.auth().signInWithEmailAndPassword(
        document.getElementById("emailField").value,
        document.getElementById("passwordField").value)
        .catch(function(error) {
            let errorCode = error.code;
            let errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                alert(errorMessage);
            }
    });
}

function logOut() {
    firebase.auth().signOut();
}

function closeLoginDialog(){
    let dialog = document.getElementById("dialog");
    dialog.style["display"] = "none";
}

function navigateToCommunityFunction() {
    if (currentUser){
        window.location.href = "mainPage.html";
    }
}

function openLoginDialog(){
    let dialog = document.getElementById("dialog");
    dialog.style["display"] = "block";
}

setup();