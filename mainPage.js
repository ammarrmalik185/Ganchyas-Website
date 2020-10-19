let currentUserId;
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
        if (user) {
            let currentUserElement = document.getElementById("currentUser");
            if (user) {
                let profilePicture = document.createElement("img");
                let userName = document.createElement("p");
                firebase.database().ref().once("value").then((snapshot) => {
                    let currentUserSnap = snapshot.child("userdata").child(user.uid);
                    if (currentUserSnap.exists()) {
                        userName.innerText = currentUserSnap.val()["name"];
                        if ("profile picture" in currentUserSnap.val()) {
                            profilePicture.src = currentUserSnap.val()["profile picture"];
                        } else {
                            profilePicture.src = snapshot.val()["defaults"]["profile picture"];
                        }
                    } else {
                        addUserDataDialogOpen();
                    }
                    currentUserElement.addEventListener("click", userDataDialogOpen);
                    currentUserElement.innerText = "";
                    currentUserElement.appendChild(userName);
                    currentUserElement.appendChild(profilePicture);
                });
                currentUser = user;
                currentUserId = user.uid;
                goToForumFragment();
            }
        } else {
            currentUser = undefined;
            window.location.replace("index.html");
        }
    });

    window.onscroll = function() {
        scrollFunction()
    };
}

function addUserDataDialogOpen() {
    let dialog = document.getElementById("addDataDialog");
    dialog.style["display"] = "block";
}

function addUserData() {

    let nameField = document.getElementById("nameField");
    let phoneNoField = document.getElementById("phoneNoField");
    let dobField = document.getElementById("dobField");
    let sectionField = document.getElementById("sectionField");

    if (nameField.value !== ""){
        let currentUserData = {
            "name":nameField.value,
            "birth date" : dobField.value,
            "phone no" : phoneNoField.value,
            "section" : sectionField.value
        };
        firebase.database().ref().child("userdata").child(currentUserId).set(currentUserData);
        let dialog = document.getElementById("addDataDialog");
        dialog.style["display"] = "none";
    }
}

function logOut() {
    firebase.auth().signOut();
}

function scrollFunction() {
    let scrollToTopButton = document.getElementById("scrollToTopButton");
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopButton.style.display = "block";
    } else {
        scrollToTopButton.style.display = "none";
    }
}

function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function goToLocationFragment(){
    showSnackbarAlert("function not implemented");
}

function goToNotificationsFragment(){
    showSnackbarAlert("function not implemented");
    // sendNotification("Test", "testlol");
}

function userDataDialogOpen() {
    if (currentUser) {

        firebase.database().ref().child("userdata").child(currentUser.uid).once('value').then((snapshot) => {
            let dialog = document.getElementById("profileViewDialog");
            let profilePictureNode = document.getElementById("profileViewPicture");
            let nameNode = document.getElementById("profileViewName");
            let phoneNoNode = document.getElementById("profileViewPhoneNo");
            let DobNode = document.getElementById("profileViewDob");
            let sectionNode = document.getElementById("profileViewSection");
            if (snapshot.exists()){
                let userSnapData = snapshot.val();
                nameNode.innerText = userSnapData["name"];
                phoneNoNode.innerText = userSnapData["phone no"];
                DobNode.innerText = userSnapData["birth date"];
                sectionNode.innerText = userSnapData["section"];
                if ("profile picture" in userSnapData){
                    profilePictureNode.src = userSnapData["profile picture"]
                }
                else{
                    profilePictureNode.src = "images/default%20pp-01.svg";
                }
            }
            else {
                nameNode.innerText = "Not available";
                phoneNoNode.innerText = "Not available";
                DobNode.innerText = "Not available";
                sectionNode.innerText = "Not available";
                profilePictureNode.src = "images/default%20pp-01.svg";
            }
            dialog.style["display"] = "block";
        });
    }


}

function userDataDialogClose() {
    let dialog = document.getElementById("profileViewDialog");
    dialog.style["display"] = "none";
}

function changeDataDialogOpen(){

    if (currentUser) {

        firebase.database().ref().child("userdata").child(currentUser.uid).once('value').then((snapshot) => {
            let dialog = document.getElementById("editDataDialog");
            let nameNode = document.getElementById("nameFieldEdit");
            let phoneNoNode = document.getElementById("phoneNoFieldEdit");
            let DobNode = document.getElementById("dobFieldEdit");
            let sectionNode = document.getElementById("sectionFieldEdit");
            if (snapshot.exists()) {
                let userSnapData = snapshot.val();
                nameNode.placeholder = userSnapData["name"];
                phoneNoNode.placeholder = userSnapData["phone no"];
                DobNode.placeholder = userSnapData["birth date"];
                sectionNode.placeholder = userSnapData["section"];
            } else {
                nameNode.placeholder = "Not available";
                phoneNoNode.placeholder = "Not available";
                DobNode.placeholder = "Not available";
                sectionNode.placeholder = "Not available";
            }
            dialog.style["display"] = "block";
        });
    }
}

function changeDataDialogClose() {
    let dialog = document.getElementById("editDataDialog");
    dialog.style["display"] = "none";
}

function editUserData(){
    if (currentUser){
        let dialog = document.getElementById("editDataDialog");
        let nameNode = document.getElementById("nameFieldEdit");
        let phoneNoNode = document.getElementById("phoneNoFieldEdit");
        let dobNode = document.getElementById("dobFieldEdit");
        let sectionNode = document.getElementById("sectionFieldEdit");
        let userDataRef = firebase.database().ref().child("userdata").child(currentUser.uid);
        userDataRef.once('value').then((snapshot) => {
            if (snapshot.exists()){
                if(nameNode.value !== "") {
                    userDataRef.child("name").set(nameNode.value)
                }
                if(phoneNoNode.value !== "") {
                    userDataRef.child("phone no").set(phoneNoNode.value)
                }
                if(dobNode.value !== "") {
                    userDataRef.child("birth date").set(dobNode.value)
                }
                if(sectionNode.value !== "") {
                    userDataRef.child("section").set(sectionNode.value)
                }
                userDataDialogClose();
                dialog.style["display"] = "none";
                userDataDialogOpen();
            }else{
                if(nameNode.value !== ""){
                    let data = {
                        "name":nameNode.value,
                        "phone no" : phoneNoNode.value,
                        "birth date" : dobNode.value,
                        "section" : sectionNode.value
                    };
                    userDataRef.set(data);
                    userDataDialogClose();
                    dialog.style["display"] = "none";
                    userDataDialogOpen();
                }
                else{
                    showSnackbarAlert("Since this is your first time adding data, Name is required");
                }
            }
        });

    }
}

function changePasswordDialogOpen() {
    let dialog = document.getElementById("changePasswordDialog");
    dialog.style["display"] = "block";
}

function changePasswordDialogClose() {
    let dialog = document.getElementById("changePasswordDialog");
    dialog.style["display"] = "none";
}

function changePassword() {
    if (currentUser){

        let oldPassField = document.getElementById("oldPasswordField");
        let newPassField1 = document.getElementById("newPasswordField1");
        let newPassField2 = document.getElementById("newPasswordField2");
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            oldPassField.value
        );
        currentUser.reauthenticateWithCredential(credential).then(function() {
            if (newPassField1.value === newPassField2.value && newPassField1.value.length >= 6) {
                currentUser.updatePassword(newPassField1.value).then(function () {
                    showSnackbarAlert("Password Updated");
                    changePasswordDialogClose();
                }).catch(function (error) {
                    console.log(error);
                    showSnackbarAlert("Failed to update Password");
                });
            }
        }).catch(function(error) {
            console.log(error);
            showSnackbarAlert("Authentication Failed, check password and try again");
        });

    }
}

function cancelChangeProfilePicture(){
    newProfilePicture = undefined;
    let changeConfirmationDialog = document.getElementById("profilePictureChangeConfirmation");
    changeConfirmationDialog.style["display"] = "none";
    userDataDialogClose();
    userDataDialogOpen();
}

function confirmChangeProfilePicture() {

    let dialog = document.getElementById("progressBarDialog");
    let progressBar = document.getElementById("progressBar");
    let progressValue = document.getElementById("progressValue");

    let fileUploadPath = firebase.storage().ref().child("user profile images").child(
        currentUser.uid + "." + newProfilePicture.name.split('.').pop()
    );

    let fileUploadTask = fileUploadPath.put(newProfilePicture);
    dialog.style["display"] = "block";
    fileUploadTask.on('state_changed', function(snapshot){
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progress = Math.round(progress);
        let progressStyleString = progress.toString() + "%";
        progressBar.style["width"] = progressStyleString;
        progressValue.innerText = progressStyleString;
    }, function(error) {
        console.log(error);
        showSnackbarAlert(error);
        dialog.style["display"] = "none";
    }, function() {
        fileUploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
            dialog.style["display"] = "none";
            firebase.database().ref().child("userdata").child(currentUser.uid).child("profile picture").set(downloadURL);
            showSnackbarAlert("Profile Picture Changed");
            cancelChangeProfilePicture();
        });
    });
}

function changeProfilePicture() {
    let dudInput = document.createElement("input");
    dudInput.type = "file";
    dudInput.accept = "image/*";
    dudInput.click();
    dudInput.addEventListener("change", imageSelected);
    function imageSelected(fileFakePath) {
        let profilePicture = document.getElementById("profileViewPicture");
        let file = fileFakePath.target.files[0];
        console.log(file);
        newProfilePicture = file;
        profilePicture.src = URL.createObjectURL(file);
        profilePicture.onload = function() {
            URL.revokeObjectURL(profilePicture.src) // free memory
        };
        let changeConfirmationDialog = document.getElementById("profilePictureChangeConfirmation");
        changeConfirmationDialog.style["display"] = "block"
    }
}

setup();