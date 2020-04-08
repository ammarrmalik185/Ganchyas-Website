let currentUserId;

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
        if (user) {
            currentUserId = user.uid;
            goToForumFragment();
        } else {
            window.location.replace("index.html");
        }
    });
}

function logOut() {
    firebase.auth().signOut();
}

function goToMessagingFragment(){
    alert("function not implemented");
}
function goToLocationFragment(){
    alert("function not implemented");
}
function goToNotificationsFragment(){
    alert("function not implemented");
}


setup();