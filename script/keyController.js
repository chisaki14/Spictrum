function onLeftKeyDown(){
    audio.currentTime -= 10;
    popModal("fa-backward");
}

function onRightKeyDown(){
    audio.currentTime += 10;
    popModal("fa-forward");
}

function onUpKeyDown(){
    volume += 0.1;
    if(volume >= 1){
        volume = 1;
    }

    popModal("fa-volume-up");
    audio.volume = volume;
}

function onDownKeyDown(){
    volume -= 0.1;
    if(volume <= 0){
        volume = 0;
    }

    popModal("fa-volume-down");
    audio.volume = volume;
}

function onSpaceKeyDown(){
    playBtn.click();
}

function onQKeyDown(){
    prevSong();
}

function onEKeyDown(){
    nextSong();
}

function onMKeyDown(){
    mute();
    if(isMuted){
        popModal("fa-volume-off");
    }
    else{
        popModal("fa-volume-up");
    }
}

function onKeyDown(e){
    switch(e.keyCode){
        case 32:
            onSpaceKeyDown();
            break;
        case 37:
            onLeftKeyDown();
            break;
        case 39:
            onRightKeyDown();
            break;
        case 38:
            onUpKeyDown();
            break;
        case 40:
            onDownKeyDown();
            break;
        case 81:
            onQKeyDown();
            break;
        case 69:
            onEKeyDown();
            break;
        case 77:
            onMKeyDown();
            break;
    }
}