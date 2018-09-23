function updatePlaylist(){
    playlistDOM.text("");
    for(var i=0;i<playlist.length;i++){
        var currItem = playlist[i];
        var playlistDiv = $('<div class="playlist-item-' + i + '"></div>');

        var imageDiv = $('<div class="item-image-container"></div>');
        var imageObj = currItem.image;
        var overlay = $('<div class="item-image-overlay"></div>');
        var imageOverlay = $('<div class="text-overlay"><i class="fas fa-trash-alt"></i></div>');
        overlay.append(imageOverlay);
        overlay.attr('onclick', 'removeFromPlaylist(' + i + ')');

        imageDiv.append(imageObj);
        imageDiv.append(overlay);

        var detailDiv = $('<div class="item-detail"></div>');
        var titleDiv = $('<div class="item-title"></div>');
        titleDiv.append(currItem.title);

        var artistDiv = $('<div class="item-artist"></div>');
        artistDiv.append(currItem.artist);
        detailDiv.append(titleDiv);
        detailDiv.append(artistDiv);
        detailDiv.attr('onclick', 'updateCurrentPlay(' + i + ', false)');

        playlistDiv.append(imageDiv);
        playlistDiv.append(detailDiv);

        playlistDOM.append(playlistDiv);
    }
}

function addToPlaylist(value){
    playlist.push(value);
    updatePlaylist();
}

function removeFromPlaylist(index){
    if(index == currentPlay){
        console.log("Can't remove currently played song");
        return;
    }

    if(index < currentPlay && index >= 0){
        currentPlay -= 1;
    }

    playlist.splice(index, 1);
    updatePlaylist();
}

function updateCurrentPlay(index, isForce){    
    if(index < 0 || index >= playlist.length)
        index = 0;

    if(currentPlay == index && !isForce)
        return;

    currentPlay = index;
    play();
}