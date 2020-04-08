function goToForumFragment() {
    let fragmentContainer = document.getElementById("fragmentContainer");
    fragmentContainer.innerText = "";
    let forumsList = document.createElement("UL");
    forumsList.className = "forumList";
    let database = firebase.database();
    database.ref().once('value').then (function(snapshot) {
        let forumsSnap = snapshot.child("forumData");
        forumsSnap.forEach(function(childSnapshot) {
            forumsList.appendChild(getForumView(childSnapshot, snapshot.val()["userdata"]))
        });
        fragmentContainer.appendChild(forumsList);
    });
}

function getForumView(forumSnap, usersSnap) {

    let listNode = document.createElement("LI");
    listNode.id = forumSnap.key;
    let divider = document.createElement("hr");
    divider.className = "divider";

    listNode.appendChild(inflateHeader(forumSnap, usersSnap));
    listNode.appendChild(inflateContent(forumSnap));
    listNode.appendChild(inflateFooter(forumSnap, usersSnap));
    listNode.appendChild(divider);

    return listNode;
}

function inflateHeader(forumSnap, usersSnap){
    let forumSnapValue = forumSnap.val();
    let senderSnap = usersSnap[forumSnapValue["sender"]];
    let headerNode = document.createElement("div");
    headerNode.className = "forumHeader";

    let profilePicNode = document.createElement("img");
    if (senderSnap["profile picture"]){
        profilePicNode.src = senderSnap["profile picture"]
    }

    let senderNameNode = document.createElement("H1");
    senderNameNode.innerText = senderSnap["name"];

    let postDate = document.createElement("p");
    postDate.innerText = forumSnapValue["date"];

    headerNode.appendChild(profilePicNode);
    headerNode.appendChild(senderNameNode);
    headerNode.appendChild(postDate);

    return headerNode;

}

function inflateContent(forumSnap){
    let forumSnapValue = forumSnap.val();
    let contentNode = document.createElement("div");
    contentNode.className = "forumContent";

    let subjectNode = document.createElement("H3");
    subjectNode.innerText = forumSnapValue["subject"];

    let textNode = document.createElement("p");
    textNode.innerText = forumSnapValue["mainText"];

    contentNode.appendChild(subjectNode);
    contentNode.appendChild(textNode);

    if ("type" in forumSnapValue || "fileUri" in forumSnapValue){
        if (forumSnapValue["type"] === "video"){
            let video = document.createElement("video");
            let source = document.createElement("source");
            source.src = forumSnapValue["fileUri"];
            source.type = "video/mp4";
            video.appendChild(source);
            video.controls = true;
            contentNode.appendChild(video);

        }
        else if (forumSnapValue["type"] === "file"){

            let container = document.createElement("div");

            let fileImage = document.createElement("img");
            fileImage.src = "images/file icon.png";

            let fileName = document.createElement("p");
            fileName.innerText = forumSnapValue["fileName"];
            fileName.className = "fileIcon";

            let downloadImage = document.createElement("img");
            downloadImage.src = "images/download icon.png";
            downloadImage.className = "downloadFileButton";
            downloadImage.addEventListener("click", downloadFileLocal);
            function downloadFileLocal(){
                downloadFile(forumSnapValue["fileUri"]);
            }

            container.appendChild(fileImage);
            container.appendChild(fileName);
            container.appendChild(downloadImage);
            contentNode.appendChild(container);
        }
        else {
            let image = document.createElement("img");
            image.src = forumSnapValue["fileUri"];
            contentNode.appendChild(image);
        }
    }
    return contentNode;

}

function downloadFile(link){
    window.open(link);
}

function inflateFooter(forumSnap, usersSnap) {

    let forumSnapValue = forumSnap.val();
    let counts = getForumCounts(forumSnapValue);
    let footer = document.createElement("div");
    footer.className = "forumFooter";

    let likeCountNode = document.createElement("p");
    likeCountNode.innerText = counts["likers"];
    likeCountNode.addEventListener("click", showLikersLocal);
    function showLikersLocal(){
        displayLikers(forumSnap, usersSnap);
    }

    let dislikeCountNode = document.createElement("p");
    dislikeCountNode.innerText = counts["disLikers"];
    dislikeCountNode.addEventListener("click", showDisLikersLocal);
    function showDisLikersLocal(){
        displayDisLikers(forumSnap, usersSnap);
    }
    let commentCountNode = document.createElement("p");
    commentCountNode.innerText = counts["comments"];
    commentCountNode.addEventListener("click", commentPressedLocal);

    let likeButton = document.createElement("button");
    likeButton.className = "likeButton";
    if (counts["liked"])
        likeButton.innerText = "Unlike";
    else
        likeButton.innerText = "Like";
    likeButton.addEventListener("click", likePressedLocal);
    function likePressedLocal(){
        likePressed(forumSnap);
    }

    let dislikeButton = document.createElement("button");
    dislikeButton.className = "disLikeButton";
    if (counts["disliked"])
        dislikeButton.innerText = "Un Dislike";
    else
        dislikeButton.innerText = "Dislike";
    dislikeButton.addEventListener("click", dislikePressedLocal);
    function dislikePressedLocal(){
        disLikePressed(forumSnap);
    }

    let commentButton = document.createElement("button");
    commentButton.className = "commentButton";
    commentButton.innerText = "Comment";
    commentButton.addEventListener("click", commentPressedLocal);
    function commentPressedLocal(){
        commentPressed(forumSnap);
    }

    footer.appendChild(likeCountNode);
    footer.appendChild(dislikeCountNode);
    footer.appendChild(commentCountNode);

    footer.appendChild(likeButton);
    footer.appendChild(dislikeButton);
    footer.appendChild(commentButton);

    return footer;
}

function getForumCounts(forumSnapValue){
    let likeCount = 0;
    let dislikeCount = 0;
    let commentCount = 0;
    let liked;
    let disliked;


    let likesSnap = forumSnapValue["likers"];
    let dislikesSnap = forumSnapValue["disLikers"];
    let commentsSnap = forumSnapValue["comments"];

    if (likesSnap){
        let liker;
        for (liker in likesSnap)
            if (likesSnap[liker])
                likeCount ++;
        liked = forumSnapValue["likers"][currentUserId];
    }
    else{
        liked = false;
    }
    if (dislikesSnap){
        let disLiker;
        for (disLiker in dislikesSnap)
            if (dislikesSnap[disLiker])
                dislikeCount ++;
        disliked = forumSnapValue["disLikers"][currentUserId];
    }else{
        disliked = false;
    }

    if (commentsSnap){
        commentCount = Object.keys(commentsSnap).length;
    }

    return {
        "likers":likeCount.toString(),
        "disLikers":dislikeCount.toString(),
        "comments":commentCount.toString(),
        "liked" : liked,
        "disliked" : disliked
    }
}

function likePressed(forumSnap){
    let counts = getForumCounts(forumSnap.val());
    let database = firebase.database().ref();
    console.log(forumSnap);
    if (counts["liked"]){
        database.child("forumData").child(forumSnap.key).child("likers").child(currentUserId).set(false);
        updateListEntity(forumSnap);
    }
    else if (counts["disliked"]){
        database.child("forumData").child(forumSnap.key).child("disLikers").child(currentUserId).set(false);
        database.child("forumData").child(forumSnap.key).child("likers").child(currentUserId).set(true);
        updateListEntity(forumSnap);
    }
    else{
        database.child("forumData").child(forumSnap.key).child("likers").child(currentUserId).set(true);
        updateListEntity(forumSnap);
    }
}

function disLikePressed(forumSnap){
    let counts = getForumCounts(forumSnap.val());
    let database = firebase.database().ref();
    console.log(forumSnap);
    if (counts["disliked"]){
        database.child("forumData").child(forumSnap.key).child("disLikers").child(currentUserId).set(false);
        updateListEntity(forumSnap);
    }
    else if (counts["liked"]){
        database.child("forumData").child(forumSnap.key).child("likers").child(currentUserId).set(false);
        database.child("forumData").child(forumSnap.key).child("disLikers").child(currentUserId).set(true);
        updateListEntity(forumSnap);
    }
    else{
        database.child("forumData").child(forumSnap.key).child("disLikers").child(currentUserId).set(true);
        updateListEntity(forumSnap);
    }
}

function displayLikers(forumSnap, userSnap){
    let likersArray = [];
    let likersRef = firebase.database().ref().child("forumData").child(forumSnap.key).child("likers");
    likersRef.once("value").then((snapshot) => {
        if (snapshot.exists()){
                let likersSnapValue = snapshot.val();
                let singleLikerSnapValue;
                for (singleLikerSnapValue in likersSnapValue){
                    if (likersSnapValue[singleLikerSnapValue]){
                        likersArray.push(singleLikerSnapValue)
                    }
                }
        }
        displayUserList(likersArray, userSnap);
    });

}

function displayDisLikers(forumSnap, userSnap) {
    let disLikersArray = [];
    let disLikersRef = firebase.database().ref().child("forumData").child(forumSnap.key).child("disLikers");
    disLikersRef.once("value").then((snapshot) => {
        if (snapshot.exists()){
            let disLikersSnapValue = snapshot.val();
            let singleDisLikerSnapValue;
            for (singleDisLikerSnapValue in disLikersSnapValue){
                if (disLikersSnapValue[singleDisLikerSnapValue]){
                    disLikersArray.push(singleDisLikerSnapValue)
                }
            }
        }
        displayUserList(disLikersArray, userSnap);
    });
}

function displayUserList(displayList, userSnap){
    let dialogContent = document.getElementById("inflateContent");
    dialogContent.innerText = "";
    document.getElementById("extraContentContainer").innerText = "";
    let cancelButton = document.getElementById("cancelButton");
    let dialog = document.getElementById("dialog");
    let usersList = document.createElement("UL");
    usersList.className = "userListContainer";
    let singleUserId;
    cancelButton.addEventListener("click", closeCommentDialog);
    function closeCommentDialog(){
        dialog.style["display"] = "none";
    }
    for (singleUserId of displayList){

        let singleListEntity = document.createElement("LI");
        let profilePicNode = document.createElement("img");
        if (userSnap[singleUserId]["profile picture"]){
            profilePicNode.src = userSnap[singleUserId]["profile picture"]
        }

        let header = document.createElement("H2");
        header.innerText = userSnap[singleUserId]["name"];

        singleListEntity.appendChild(profilePicNode);
        singleListEntity.appendChild(header);

        usersList.appendChild(singleListEntity);
    }
    dialogContent.appendChild(usersList);
    dialog.style["display"] = "block";
}

function commentPressed(forumSnap){

    let dialogContent = document.getElementById("inflateContent");
    dialogContent.innerText = "";
    document.getElementById("extraContentContainer").innerText = "";
    let cancelButton = document.getElementById("cancelButton");
    let dialog = document.getElementById("dialog");
    let commentsList = document.createElement("UL");
    commentsList.className = "commentsContainer";

    let newCommentContainer = document.createElement("div");
    newCommentContainer.className = "submitNewComment";
    let newCommentText = document.createElement("input");
    newCommentText.placeholder = "Enter Comment";
    newCommentText.margin = 0;
    let newCommentSubmitButton = document.createElement("button");
    newCommentSubmitButton.innerText = "Submit";
    newCommentSubmitButton.margin = 0;
    newCommentSubmitButton.addEventListener("click", submitComment);
    function submitComment(){
        postComment(forumSnap, newCommentText.value);
        commentPressed(forumSnap);
    }
    newCommentContainer.appendChild(newCommentText);
    newCommentContainer.appendChild(newCommentSubmitButton);

    cancelButton.addEventListener("click", closeCommentDialog);
    function closeCommentDialog(){
        dialog.style["display"] = "none";
        database.ref().off();
        updateListEntity(forumSnap);
    }

    let database = firebase.database();
    database.ref().on('value', (snapshot) => {
        if (snapshot.child("forumData").child(forumSnap.key).child("comments").exists()) {
            let commentsRef = snapshot.child("forumData").child(forumSnap.key).child("comments");
            let usersRef = snapshot.val()["userdata"];
            commentsRef.forEach(function(childSnapshot) {
                let check = document.getElementById(childSnapshot.key);
                if (check) {
                    commentsList.appendChild(getCommentView(childSnapshot, usersRef));
                }else{
                    commentsList.insertBefore(getCommentView(childSnapshot, usersRef), commentsList.firstChild)
                }
            });
        }
        dialog.style["display"] = "block";
        document.getElementById("extraContentContainer").appendChild(newCommentContainer);
        dialogContent.appendChild(commentsList);
        dialogContent.scrollTop = dialogContent.scrollHeight;
        updateListEntity(forumSnap);

    });

}

function postComment(forumSnap, text) {
    if (text !== "" && text !== " ") {
        let d = new Date();
        let ss = d.getSeconds().toString().padStart(2, '0');
        let mm = d.getMinutes().toString().padStart(2, '0');
        let HH = d.getHours().toString().padStart(2, '0');
        let dd = d.getDate().toString().padStart(2, '0');
        let MM = String(d.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = d.getFullYear();
        let date = dd + '/' + MM + '/' + yyyy;
        let timeConstant = yyyy + MM + dd + HH + mm + ss;
        let identifier = "comment id : " + (50000000000000 - parseInt(timeConstant)).toString();
        let data = {
            "date" : date,
            "sender" : currentUserId,
            "text" : text
        };
        firebase.database().ref().child("forumData").child(forumSnap.key).child("comments").child(identifier).set(data);
    }
}

function getCommentView(commentSnap, usersRef) {

    let commentValue = commentSnap.val();
    let senderSnap = usersRef[commentValue["sender"]];
    let commentView = document.createElement("LI");
    commentView.id = commentSnap.key;

    let profilePicNode = document.createElement("img");
    profilePicNode.width = 50;
    profilePicNode.height = 50;
    if (senderSnap["profile picture"]){
        profilePicNode.src = senderSnap["profile picture"]
    }

    let header = document.createElement("H2");
    header.innerText = senderSnap["name"];

    let content = document.createElement("p");
    content.innerText = commentValue["text"];

    let date = document.createElement("p");
    date.className = "commentDate";
    date.innerText = commentValue["date"];

    let divider = document.createElement("hr");

    commentView.appendChild(profilePicNode);
    commentView.appendChild(header);
    commentView.appendChild(content);
    commentView.appendChild(date);
    commentView.appendChild(divider);

    return commentView;
}

function updateListEntity(forumSnap){
    let listToUpdate = document.getElementById(forumSnap.key);
    let database = firebase.database();
    if (listToUpdate){
        database.ref().once('value').then(function(snapshot) {
            let forumsSnapUpdated = snapshot.child("forumData").child(forumSnap.key);
            let usersRef = snapshot.val()["userdata"];
            listToUpdate.getElementsByClassName("forumFooter")[0].remove();
            listToUpdate.insertBefore(
                inflateFooter(forumsSnapUpdated, usersRef),
                listToUpdate.getElementsByClassName("divider")[0]
            );
            return forumsSnapUpdated;
        });
    }
}
