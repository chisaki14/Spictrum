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
    else{
        console.log("NO");
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
    else{
        console.log("NO");
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
    else{
        console.log("NO");
    }
}

function mute(){
    isMuted = !isMuted;
    audio.muted = isMuted;
}

function shuffle(){
    isRandom = !isRandom;
    isLoop = false;
    
    updateShuffleBtn();
    updateLoopBtn();
}

function loop(){
    isLoop = !isLoop;
    isRandom = false;

    updateShuffleBtn();
    updateLoopBtn();
}

function play(){
    if(playlist.length == 0){
        console.log("Playlist is empty");
        return;
    }

    audio.setAttribute('src', playlist[currentPlay].audioSrc);
    audio.load();
    playPromise = audio.play();
    isPlaying = true;
    isMessage = false;
    isEnded = false;
    updatePlayBtn();

    window.cancelAnimationFrame(animationId);
    setDetailInfo();
    generateSpectrum();
}