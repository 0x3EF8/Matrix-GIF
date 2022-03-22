var fontFamily = 'Roboto Mono';

var ascii = function() {

    var meassureBrightness = char => {
        var size = 25;
        var charCanvas = document.createElement('canvas');
        var charCtx = charCanvas.getContext('2d');
        charCanvas.width = charCanvas.height = size;
        charCtx.font = '18px ' + fontFamily;
        charCtx.fillStyle = 'mediumseagreen';
        charCtx.fillText(char, size * 0.5, size * 0.5);

        var brightness = 0;

        var imageData = charCtx.getImageData(0, 0, size, size);

        for (var i = 0; i < imageData.data.length; i++) {
            if (window.CP.shouldStopExecution(0)) break;
            brightness += imageData.data[i];
        }
        window.CP.exitedLoop(0);

        return brightness;
    };

    var char, brightness, chars = [],
        maxBrightness = 0;

    for (var i = 32; i <= 127; i++) {
        if (window.CP.shouldStopExecution(1)) break;
        char = String.fromCharCode(i);
        brightness = meassureBrightness(char);
        if (brightness > maxBrightness) maxBrightness = brightness;
        chars.push({
            char: char,
            brightness: brightness
        });

    }
    window.CP.exitedLoop(1);

    chars = chars.map(char => {
        return {
            char: char.char,
            brightness: Math.round(255 / maxBrightness * char.brightness)
        };

    });

    chars.sort((a, b) => {
        if (a.brightness > b.brightness) return 1;
        if (a.brightness < b.brightness) return -1;
        return 0;
    });

    return chars;
}();

var fileInput = document.querySelector('input[type="file"]');

fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = e => {
            var img = new Image();
            img.src = e.target.result;

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            var size = 150;

            var w = canvas.width = size;
            var h = canvas.height = size / img.width * img.height;

            ctx.drawImage(img, 0, 0, w, h);

            document.body.appendChild(canvas);

            createGif(ctx.getImageData(0, 0, w, h));

        };
        reader.readAsDataURL(this.files[0]);
    }
});

var getChar = pixelBrightness => {
    var closest = false;
    pixelBrightness *= .75 + Math.random() * .25;
    var difference = charBrightness => Math.abs(charBrightness - pixelBrightness);
    ascii.forEach(char => {
        if (!closest || difference(char.brightness) < difference(closest.brightness)) {
            closest = char;
        }
    });
    return closest.char;
};

var createGif = imgData => {

    var encoder = new GIFEncoder();

    encoder.setRepeat(0); //auto-loop
    encoder.setDelay(Math.round(1000 / 20));
    encoder.start();

    for (var i = 0; i < 4; i++) {
        if (window.CP.shouldStopExecution(2)) break;
        encoder.addFrame(createAscii(imgData).ctx);
    }
    window.CP.exitedLoop(2);;

    encoder.finish();

    var gif = new Image();
    var binaryGif = encoder.stream().getData();
    gif.src = 'data:image/gif;base64,' + encode64(binaryGif);

    var link = document.createElement('a');
    link.href = gif.src;
    link.setAttribute('download', 'my-matrix-gif');

    link.appendChild(gif);
    document.body.appendChild(link);

};

var createAscii = imgData => {

    var size = 5;

    var data = imgData.data;

    var chars = '',
        pixel;
    var getBrightness = i => (data[i] + data[i + 1] + data[i + 2]) / 3;
    var getOpacity = i => data[i + 4] / 255;

    for (var i = 0; i < data.length; i += 4) {
        if (window.CP.shouldStopExecution(3)) break;
        chars += getChar(getBrightness(i));
    }
    window.CP.exitedLoop(3);

    chars = chars.match(new RegExp('.{1,' + imgData.width + '}', 'g'));

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    ctx.font = size + 'px ' + fontFamily;

    canvas.width = imgData.width * size;
    canvas.height = imgData.height * size;

    canvas.style.width = '100%';

    ctx.scale(1.66, 1);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = size + 'px ' + fontFamily;



    chars.forEach((line, i) => {
        ctx.fillStyle = 'mediumseagreen';
        ctx.fillText(line, 0, i * size);
    });

    return {
        canvas: canvas,
        ctx: ctx
    };


};