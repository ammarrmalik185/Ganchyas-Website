
function goToMessagingFragment(){
    let fragmentContainer = document.getElementById("fragmentContainer");
    let contactNavigationContainer = document.createElement("div");
    contactNavigationContainer.id = "contactNavigationContainer";
    inflateContactNavigationList(contactNavigationContainer);

    let messageViewContainer = document.createElement("div");
    messageViewContainer.id = "messageViewContainer";
    messageViewContainer.innerText = "ok";

    fragmentContainer.innerText = "";
    fragmentContainer.appendChild(contactNavigationContainer);
    fragmentContainer.appendChild(messageViewContainer);
}

function inflateContactNavigationList(container) {
    let contactNavigationList = document.createElement("UL");
    container.appendChild(contactNavigationList);
    contactNavigationList.appendChild(inflateStartNewConversation());
    firebase.database().ref().once("value").then((snapshot) => {
        let messagesSnap = snapshot.child("messageData");
        let usersSnap = snapshot.child("userdata").val();
        let defaultValuesSnap = snapshot.child("defaults");
        messagesSnap.forEach((childSnapshot) => {
            if (childSnapshot.val()["user1"] === currentUserId || childSnapshot.val()["user2"] === currentUserId){
                contactNavigationList.appendChild(inflateSingleContact(childSnapshot, usersSnap, defaultValuesSnap));
            }
        });
    });
}

function inflateSingleContact(conversationSnap, usersSnap, defaultValuesSnap) {
    let conversationSnapValue = conversationSnap.val();
    let singleContact = document.createElement("LI");

    let otherUserData;
    if (conversationSnapValue["user2"] === currentUserId){
        otherUserData = usersSnap[conversationSnapValue["user1"]];
    }else if(conversationSnapValue["user1"] === currentUserId){
        otherUserData = usersSnap[conversationSnapValue["user2"]];
    }

    let userProfilePicture = document.createElement("img");
    if ("profile picture" in otherUserData){
        userProfilePicture.src = otherUserData["profile picture"];
    }else{
        userProfilePicture.src = defaultValuesSnap.val()["profile picture"];
    }

    let userNameContainer = document.createElement("h3");
    userNameContainer.innerText = otherUserData["name"];

    singleContact.addEventListener("click", navigateToConversationLocal);
    function navigateToConversationLocal(){
        navigateToConversation(conversationSnap, usersSnap);
    }

    singleContact.appendChild(userProfilePicture);
    singleContact.appendChild(userNameContainer);
    return singleContact;
}

function inflateStartNewConversation() {
    let startNewConversationButton = document.createElement("LI");
    startNewConversationButton.innerText = "Start New Conversation";
    startNewConversationButton.id = "startNewConversationButton";
    return startNewConversationButton;
}

function navigateToConversation(conversationSnap, usersSnap){
    showSnackbarAlert("LOL no");
}

function showSnackbarAlert(message){
    let snackBar = document.getElementById("snackbar");
    snackBar.innerText = message;
    snackBar.className = "show";

    setTimeout(function(){
            snackBar.className = snackBar.className.replace("show", "");
        }, 3000
    );
}