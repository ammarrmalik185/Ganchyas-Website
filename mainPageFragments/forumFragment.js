let fileToUpload;
let fileType;

function goToForumFragment() {
    let fragmentContainer = document.getElementById("fragmentContainer");
    fragmentContainer.innerText = "";
    fragmentContainer.appendChild(inflateAddNewForum());

    let forumsList = document.createElement("UL");
    forumsList.className = "forumList";
    fragmentContainer.appendChild(forumsList);

    let database = firebase.database();
    database.ref().once('value').then (function(snapshot) {
        let forumsSnap = snapshot.child("forumData");
        forumsSnap.forEach(function(childSnapshot) {
            forumsList.appendChild(getForumView(childSnapshot, snapshot.val()["userdata"],snapshot))
        });
    });
}

function getForumView(forumSnap, usersSnap, completeSnapshot) {

    let listNode = document.createElement("LI");
    listNode.id = forumSnap.key;
    let divider = document.createElement("hr");
    divider.className = "divider";

    listNode.appendChild(inflateHeader(forumSnap, usersSnap, completeSnapshot));
    listNode.appendChild(inflateContent(forumSnap));
    listNode.appendChild(inflateFooter(forumSnap, usersSnap));
    listNode.appendChild(divider);

    return listNode;
}

function inflateHeader(forumSnap, usersSnap, completeSnapshot){
    let forumSnapValue = forumSnap.val();
    let senderSnap = usersSnap[forumSnapValue["sender"]];
    let headerNode = document.createElement("div");
    headerNode.className = "forumHeader";

    let profilePicNode = document.createElement("img");
    if (senderSnap["profile picture"]){
        profilePicNode.src = senderSnap["profile picture"]
    }
    else{
        profilePicNode.src = completeSnapshot.child("defaults").child("profile picture").val();
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
                    commentsList.appendChild(getCommentView(childSnapshot, usersRef, snapshot));
                }else{
                    commentsList.insertBefore(getCommentView(childSnapshot, usersRef, snapshot), commentsList.firstChild)
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

function getCommentView(commentSnap, usersRef, completeSnapshot) {

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
    else{
        profilePicNode.src = completeSnapshot.child("defaults").child("profile picture").val();
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

function inflateAddNewForum(){

    let addNewForumContainer = document.createElement("div");
    addNewForumContainer.id = "addNewForumContainer";
    let header = document.createElement("h3");
    header.innerText = "Add New Forum";

    let subjectField = document.createElement("textarea");
    subjectField.placeholder = "Enter Subject";
    subjectField.id = "newForumSubject";

    let textField = document.createElement("textarea");
    textField.placeholder = "Enter Text";
    textField.id = "newForumText";

    let fileInputContainer = document.createElement("div");
    fileInputContainer.id = "fileInputContainer";

    let attachImageContainer = document.createElement("div");
    attachImageContainer.className = "roundIconContainer";
    attachImageContainer.addEventListener("click", selectFileImage);
    function selectFileImage(){
        if (fileToUpload){
            if (fileType === "image"){
                fileToUpload = undefined;
                fileType = undefined;
                attachImageContainer.style["background"] = "#636363";
            }
            else{
                selectFile("image", attachImageContainer);
            }
        }
        else{
            selectFile("image", attachImageContainer);
        }
    }
    let attachImage = document.createElement("img");
    attachImage.src = "images/photo.svg";
    attachImageContainer.appendChild(attachImage);

    let attachVideoContainer = document.createElement("div");
    attachVideoContainer.className = "roundIconContainer";
    attachVideoContainer.title = "Add Video";
    attachVideoContainer.addEventListener("click", selectFileVideo);
    function selectFileVideo(){
        if (fileToUpload){
            if (fileType === "video"){
                fileToUpload = undefined;
                fileType = undefined;
                attachVideoContainer.style["background"] = "#636363";
            }
            else{
                selectFile("video", attachVideoContainer);
            }
        }
        else{
            selectFile("video", attachVideoContainer);
        }

    }
    let attachVideo = document.createElement("img");
    attachVideo.src = "images/video.svg";
    attachVideoContainer.appendChild(attachVideo);

    let attachFileContainer = document.createElement("div");
    attachFileContainer.className = "roundIconContainer";
    attachFileContainer.addEventListener("click", selectFileAny);
    function selectFileAny(){
        if (fileToUpload){
            if (fileType === "*"){
                fileToUpload = undefined;
                fileType = undefined;
                attachFileContainer.style["background"] = "#636363";
            }
            else{
                selectFile("*", attachFileContainer);
            }
        }
        else{
            selectFile("*", attachFileContainer);
        }
    }
    let attachFile = document.createElement("img");
    attachFile.src = "images/file.svg";
    attachFileContainer.appendChild(attachFile);

    fileInputContainer.appendChild(attachImageContainer);
    fileInputContainer.appendChild(attachVideoContainer);
    fileInputContainer.appendChild(attachFileContainer);

    let submitButton = document.createElement("button");
    submitButton.innerText = "Submit";
    submitButton.className = "submitButton";
    submitButton.addEventListener("click", submitForum);

    addNewForumContainer.appendChild(header);
    addNewForumContainer.appendChild(subjectField);
    addNewForumContainer.appendChild(textField);
    addNewForumContainer.appendChild(fileInputContainer);
    addNewForumContainer.appendChild(submitButton);

    return addNewForumContainer;

}

function selectFile(type, feedbackContainer){

    let mimeType = type + "/*";
    let dudInput = document.createElement("input");
    dudInput.type = "file";
    dudInput.accept = mimeType;
    dudInput.addEventListener("change", fileSelected);
    function fileSelected(fileFakePath){
        let file = fileFakePath.target.files[0];
        console.log(file);
        fileToUpload = file;
        fileType = type;
        let containers = document.getElementsByClassName("roundIconContainer");
        let singleContainer;
        for (singleContainer of containers){
            singleContainer.style["background"] = "#636363"
        }
        feedbackContainer.style["background"] = "#0bc500";
    }
    dudInput.click();
}

function submitForum() {

    let subjectText = document.getElementById("newForumSubject").value;
    let mainText = document.getElementById("newForumText").value;

    let d = new Date();
    let ss = d.getSeconds().toString().padStart(2, '0');
    let mm = d.getMinutes().toString().padStart(2, '0');
    let HH = d.getHours().toString().padStart(2, '0');
    let dd = d.getDate().toString().padStart(2, '0');
    let MM = String(d.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = d.getFullYear();
    let timeConstant = yyyy + MM + dd + HH + mm + ss;
    let identifier = "forum_id_" + (50000000000000 - parseInt(timeConstant)).toString();

    let data = {
        "subject" : subjectText,
        "mainText" : mainText,
        "sender" : currentUserId,
        "date" :  dd + '/' + MM + '/' + yyyy
    };

    if (fileToUpload){

        let completeStorageRef = firebase.storage().ref();
        let fileUploadPath;
        let fileUploadExtension = "." + fileToUpload.name.split('.').pop();
        if (fileType === "image"){
            console.log("|" + fileToUpload.type.replace("image/", "") + "|");
            fileUploadPath = completeStorageRef.child("forum images/" + identifier + fileUploadExtension);
        }
        else if (fileType === "video"){
            fileUploadPath = completeStorageRef.child("forum videos/" + identifier + fileUploadExtension);
            data["type"] = "video"
        }
        else if (fileType === "*"){
            console.log(fileToUpload.name.split('.').pop());
            fileUploadPath = completeStorageRef.child("forum files/" + identifier + "/" + fileToUpload.name);
            data["type"] = "file"
        }

        console.log(data);

        let dialog = document.getElementById("dialog");
        let dialogHtmlCode = dialog.innerHTML;
        inflateProgressDialog(dialog);

        let progressBar = document.getElementById("progressBar");
        let progressValue = document.getElementById("progressValue");

        let fileUploadTask = fileUploadPath.put(fileToUpload);
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
            dialog.innerHTML = dialogHtmlCode;
        }, function() {
            fileUploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                dialog.style["display"] = "none";
                dialog.innerHTML = dialogHtmlCode;
                data["fileUri"] = downloadURL;
                firebase.database().ref().child("forumData").child(identifier).set(data);
                goToForumFragment();
            });
        });

    }
    else{
        if ((data.subject + data.mainText).trim() !== "") {
            firebase.database().ref().child("forumData").child(identifier).set(data);
            goToForumFragment();
        }
        else{
            showSnackbarAlert("The forum needs to have a file\n attached or have some text");
        }
    }

}

function inflateProgressDialog(dialog) {
    let dialogContent = document.getElementById("content");
    dialogContent.innerText = "";

    let contentContainer = document.createElement("div");
    contentContainer.id = "progressDialogContentContainer";

    let header = document.createElement("h2");
    header.innerText = "Uploading File";

    let progressBarContainer = document.createElement("div");
    progressBarContainer.id = "progressBarContainer";

    let progressBar = document.createElement("div");
    progressBar.id = "progressBar";

    progressBarContainer.appendChild(progressBar);

    let progressValue = document.createElement("p");
    progressValue.innerText = "0%";
    progressValue.id = "progressValue";

    dialogContent.appendChild(contentContainer);
    contentContainer.appendChild(header);
    contentContainer.appendChild(progressBarContainer);
    contentContainer.appendChild(progressValue);

    dialog.style["display"] = "block";

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
