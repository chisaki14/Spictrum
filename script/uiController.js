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
    currentTitle.text(currMusic.title);
    currentArtist.text(currMusic.artist);
    currentAlbum.text(currMusic.album + ' • ' + currMusic.year);
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

function menuSlideInLeft(){
    $('.side-container').animate({left: '0px'}, "fast", () => {
        $('.slide-icon').removeClass("fa-angle-right");
        $('.slide-icon').addClass("fa-angle-left");
        $('.slide-icon').attr('onclick', 'menuSlideOutLeft()');
    });
}

function menuSlideOutLeft(){
    $('.side-container').animate({left: '-360px'}, "fast", () => {
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