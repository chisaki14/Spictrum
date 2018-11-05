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
                    onError: onDataError(file),
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

function onDataError(file){
    return (error) => {
        var img = new Image(50, 50);
        img.src = './assets/no-image.png';
        addToPlaylist(new Music('unknown', file.name, 'unknown', 'unknown', img, URL.createObjectURL(file)));

        if(isFirstPlay){
            currentPlay = 0;
            play();
        }
    }
}

function onDataSuccess(file){
    return (tag) => {
        artist = tag.tags.artist || 'unknown';
        title = tag.tags.title || 'unknown';
        album = tag.tags.album || 'unknown';
        year = tag.tags.year || 'unknown';
        
        var picture = tag.tags.picture;
        if(picture !== undefined){
            var img64String = "";
            for(var j=0;j<picture.data.length;j++){
                img64String += String.fromCharCode(picture.data[j]);
            }
            img = new Image(50, 50);
            img.src = "data:" + picture.format + ";base64," + window.btoa(img64String);
        }
        else{
            var img = new Image(50, 50);
            img.src = './assets/no-image.png';
        }    
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
        if(mobileCheck())
            analyzer.fftSize = 512;
        else
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

function mobileCheck() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}