function nextSong(){
    currentPlay += 1;
    currentPlay %= playlist.length;
    play();
}

function prevSong(){
    currentPlay -= 1;
    if(currentPlay < 0){
        currentPlay = playlist.length - 1;
    }
    play();
}

function pause(){
    if(playPromise !== undefined){
        playPromise.then(() => {
            audio.pause();
            isPlaying = false;
            updatePlayBtn();
        }).catch((error) => {
            console.log(error);
        });
    }
}

function resume(){
    if(playPromise !== undefined){
        playPromise.then(() => {
            var startDuration = currentDuration;
            audio.play();
            audio.currentTime = startDuration;
            isPlaying = true;
            updatePlayBtn();
        }).catch((error) => {
            console.log(error);
        });   
    }
}

function stop(){
    if(playPromise !== undefined){
        playPromise.then(() => {
            isPlaying = false;
            updatePlayBtn();
            playBtn.attr('onclick', 'play()');
        }).catch((error) => {
            console.log(error);
        });   
    }
}

function mute(){
    isMuted = !isMuted;
    audio.muted = isMuted;
}

function shuffle(){
    isRandom = !isRandom;
    updateShuffleBtn();
}

function loop(){
    isLoop = !isLoop;
    updateLoopBtn();
}

function play(){
    if(playlist.length == 0){
        console.log("Playlist is empty");
        return;
    }

    audio.setAttribute('src', playlist[currentPlay].audioSrc);
    audio.load();
    audio.crossOrigin = "anonymous";
    playPromise = audio.play();
    isPlaying = true;
    isMessage = false;
    isEnded = false;
    updatePlayBtn();

    window.cancelAnimationFrame(animationId);
    setDetailInfo();
    generateSpectrum();
}