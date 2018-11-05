function updatePlayBtn(){
    if(isPlaying){
        playBtn.removeClass("fa-play");
        playBtn.addClass("fa-pause");
        playBtn.attr('onclick', 'pause()');
    }
    else{
        playBtn.removeClass("fa-pause");
        playBtn.addClass("fa-play");
        playBtn.attr('onclick', 'resume()');
    }
}

function updateLoopBtn(){
    if(isLoop){
        loopBtn.css('color', '#FFE5D9');
    }
    else{
        loopBtn.css('color', '#F4ACB7');
    }
}

function updateShuffleBtn(){
    if(isRandom){
        shuffleBtn.css('color', '#FFE5D9');
    }
    else{
        shuffleBtn.css('color', '#F4ACB7');
    }
}

function setDrawRadius(){
    if(canvasH < canvasW){
        radius = canvasH * (1 / 4);
    }
    else{
        radius = canvasW * (1 / 4);
    }
}

function setDrawScale(){
    if(canvasH < canvasW){
        scale = canvasH / 1080;
    }
    else{
        scale = canvasW / 1080;
    }
}

function setDetailInfo(){
    var currMusic = playlist[currentPlay];
    if(currMusic.title !== undefined)
        currentTitle.text(currMusic.title);
    
    if(currMusic.artist !== undefined)
        currentArtist.text(currMusic.artist);
    
    if(currMusic.album !== undefined && currMusic.year !== undefined)
        currentAlbum.text(currMusic.album + ' • ' + currMusic.year);
    else if(currMusic.album !== undefined)
    currentAlbum.text(currMusic.album);
}

function popModal(icon){
    modalIcon.addClass(icon);
    modalContainer.css({'display': 'flex', 'opacity': '0'});
    modalContainer.animate({opacity: '1'}, "fast", () => {
        modalContainer.animate({opacity: '0'}, "fast", () => {
            modalContainer.css({'display': 'none'});
            modalIcon.removeClass(icon);
        });
    });
}

function hideHelp(){
    $('.help-modal-container').css({
        'display': 'none'
    });
}

function showHelp(){
    $('.help-modal-container').css({
        'display': 'flex',
    });
}

function menuSlideInLeft(){
    $('.side-container').animate({margin: '0 0 0 0'}, "fast", () => {
        $('.slide-icon').removeClass("fa-angle-right");
        $('.slide-icon').addClass("fa-angle-left");
        $('.slide-icon').attr('onclick', 'menuSlideOutLeft()');
    });
}

function menuSlideOutLeft(){
    $('.side-container').animate({margin: '0 0 0 -360px'}, "fast", () => {
        $('.slide-icon').removeClass("fa-angle-left");
        $('.slide-icon').addClass("fa-angle-right");
        $('.slide-icon').attr('onclick', 'menuSlideInLeft()');
    });
}

function menuSlideInUp(){
    $('.side-container').animate({bottom: '0px'}, "fast", () => {});
}

function menuSlideOutUp(){
    $('.side-container').animate({bottom: '-100%'}, "fast", () => {});
}