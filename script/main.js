var canvas, canvasW, canvasH, ctx;
var backGrad, jsmediatags;
var inputs, audio, isFirstPlay, volume, isMuted;
var animationId;

var audioContext, contextSrc, analyzer;
var bufferLength, freqArray;
var displayImage;

var playlist, currentPlay;
var radius, angleD, startAngle, scale, imgSize;
var isLoop = false, isRandom = false, isPlaying = false;

var currentTitle, currentArtist, currentAlbum;
var playlistDOM;

var progressBar, currentDuration, fullDuration;
var playPromise;

var loopBtn, shuffleBtn, playBtn, modalContainer, modalIcon;
var resThreshold = 500;

$(document).ready(() => {
    console.log("Additional command\n\nHorizontal arrow key to increase or decrease current track played duration\nVertical arrow key to increase or decrease audio volume\nPress Space to pause / resume the audio\nPress 'Q' to go to previous track\nPress 'E' to go to next track");

    canvas = $('#my-canvas')[0];
    canvas.width = $('.canvas-container')[0].offsetWidth;
    canvas.height = $('.canvas-container')[0].offsetHeight;
    
    canvasW = canvas.width, midX = canvasW / 2;
    canvasH = canvas.height, midY = canvasH / 2;
    ctx = canvas.getContext("2d");
    
    backGrad = ctx.createRadialGradient(canvasW / 2, canvasH / 2, 0, canvasW / 2, canvasH / 2, canvasW / 2);
    backGrad.addColorStop(0, "#F4ACB7");
    backGrad.addColorStop(1, "#FFCAD4");
    
    ctx.fillStyle = backGrad;
    ctx.fillRect(0, 0, canvasW, canvasH);
    isFirstPlay = true;

    inputs = $('.file');
    audio = $('.audio')[0];
    volume = 0.5;
    audio.volume = volume;
    
    jsmediatags = window.jsmediatags;
    playlist = [];
    currentPlay = -1;

    currentTitle = $('.title-content');
    currentArtist = $('.artist-content');
    currentAlbum = $('.album-year-content');

    playlistDOM = $('.playlist-holder');
    progressBar = $('.current-bar');

    loopBtn = $('.loop-btn');
    shuffleBtn = $('.shuffle-btn');
    playBtn = $('.play-btn');
    modalContainer = $('.modal-container');
    modalIcon = $('.modal-icon');

    Array.prototype.forEach.call(inputs, (input) => {
        input.addEventListener('change', (e) => {
            for(var i=0;i<input.files.length;i++){
                var file = input.files[i];
                jsmediatags.read(file, {
                    onSuccess: onDataSuccess(file),
                    onError: (error) => {
                        console.log(error);
                    }
                });
            }
            input.value = "";
        });
    });

    window.addEventListener('resize', () => {
        canvas.width = $('.canvas-container')[0].offsetWidth;
        canvas.height = $('.canvas-container')[0].offsetHeight;

        canvasW = canvas.width, midX = canvasW / 2;
        canvasH = canvas.height, midY = canvasH / 2;

        backGrad = ctx.createRadialGradient(canvasW / 2, canvasH / 2, 0, canvasW / 2, canvasH / 2, canvasW / 2);
        backGrad.addColorStop(0, "#F4ACB7");
        backGrad.addColorStop(1, "#FFCAD4");

        ctx.fillStyle = backGrad;
        ctx.fillRect(0, 0, canvasW, canvasH);

        setDrawRadius();
        setDrawScale();
        imgSize = radius * 1.2;

        if(window.innerWidth > resThreshold){
            $('.side-container').css({'bottom': '0px'});
        }
        else{
            $('.side-container').css({'left': '0px'});
        }
    });

    canvas.addEventListener('click', () => {
        if(window.innerWidth > resThreshold){
            menuSlideOutLeft();
        }
    });

    canvas.tabIndex = 1000;
    $('#my-canvas').on('keydown', (e) => {
        onKeyDown(e);
    });

    audio.addEventListener('ended', () => {
        if(isRandom){
            var randValue = currentPlay;
            while(randValue == currentPlay){
                randValue = Math.floor(Math.random() * playlist.length);
            }
            updateCurrentPlay(randValue, false);
        }
        else if(currentPlay == playlist.length - 1 && isLoop){
            updateCurrentPlay(0, true);
        }
        else if(currentPlay == playlist.length - 1){
            stop();
        }
        else if(currentPlay != playlist.length - 1){
            nextSong();
        }
    });
});

function onDataSuccess(file){
    return (tag) => {
        artist = tag.tags.artist;
        title = tag.tags.title;
        album = tag.tags.album;
        year = tag.tags.year;
        
        var picture = tag.tags.picture;
        var img64String = "";
        for(var j=0;j<picture.data.length;j++){
            img64String += String.fromCharCode(picture.data[j]);
        }
        img = new Image(50, 50);
        img.src = "data:" + picture.format + ";base64," + window.btoa(img64String);
        addToPlaylist(new Music(artist, title, album, year, img, URL.createObjectURL(file)));

        if(isFirstPlay){
            currentPlay = 0;
            play();
        }
    };
}

function getX(c1, c2, radius, angle){
    return c1 + Math.cos(angle) * radius;
}

function getY(c1, c2, radius, angle){
    return c2 + Math.sin(angle) * radius;
}

function generateSpectrum(){
    if(isFirstPlay){
        isFirstPlay = false;
        currentPlay = 0;

        audioContext = new AudioContext();
        contextSrc = audioContext.createMediaElementSource(audio);
        analyzer = audioContext.createAnalyser();

        contextSrc.connect(analyzer);
        analyzer.connect(audioContext.destination);
        analyzer.fftSize = 1024;

        bufferLength = analyzer.frequencyBinCount;
        freqArray = new Uint8Array(bufferLength);
        bufferLength = Math.floor(bufferLength * 0.65);
        bufferLength *= 2;

        angleD = 2 / bufferLength;
        setDrawRadius();
        setDrawScale();
        imgSize = radius * 1.2;
    }

    startAngle = Math.random() * 2;
    displayImage = playlist[currentPlay].image;

    draw();
}

function draw(){
    animationId = window.requestAnimationFrame(draw);
    analyzer.getByteFrequencyData(freqArray);

    ctx.fillStyle = backGrad;
    ctx.fillRect(0, 0, canvasW, canvasH);
    var angle = startAngle;
    
    for(var i=0;i<bufferLength / 2;i++){
        var srcX = getX(midX, midY, radius, Math.PI * angle), srcY = getY(midX, midY, radius, Math.PI * angle);
        var dstX = getX(midX, midY, radius + freqArray[i] * scale, Math.PI * angle), dstY = getY(midX, midY, radius + freqArray[i] * scale, Math.PI * angle);

        ctx.beginPath();
        ctx.moveTo(srcX, srcY);
        ctx.lineTo(dstX, dstY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#FFE5D9";
        ctx.stroke();
        ctx.closePath();

        angle += angleD;
    }

    for(var i=bufferLength / 2 - 1;i>=0;i--){
        var srcX = getX(midX, midY, radius, Math.PI * angle), srcY = getY(midX, midY, radius, Math.PI * angle);
        var dstX = getX(midX, midY, radius + freqArray[i] * scale, Math.PI * angle), dstY = getY(midX, midY, radius + freqArray[i] * scale, Math.PI * angle);

        ctx.beginPath();
        ctx.moveTo(srcX, srcY);
        ctx.lineTo(dstX, dstY);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#FFE5D9";
        ctx.stroke();
        ctx.closePath();

        angle += angleD;
    }
    
    ctx.drawImage(displayImage, midX - imgSize / 2, midY - imgSize / 2, imgSize, imgSize);

    if(playPromise !== undefined){
        currentDuration = audio.currentTime;
        fullDuration = audio.duration;
        
        progressBar.css('width', (currentDuration / fullDuration * 100) + '%');
    }
}