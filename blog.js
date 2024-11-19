hexToRGB=hex=>{
    if (!(hex.startsWith('#') && hex.length===7)){
        return [0,0,0];
    }
    return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))
}
rgbToHex=rgb=>{
    let hex = '#';
    for (let i=0; i<3; i++){
        hex += rgb[i].toString(16).padStart(2,0)
    }
    return hex;
}
intTo8bit=v=>v.toString(2).padStart(8,0);


colorUpdate=(hexLeading=false)=>{
    let r = parseInt(rgbR.value);
    let g = parseInt(rgbG.value); 
    let b = parseInt(rgbB.value); 
    let hexCode = rgbColor.value;
    
    if (hexLeading){    
        [r,g,b] = hexToRGB(hexCode);
        rgbR.value = r;
        rgbG.value = g;
        rgbB.value = b;
    } else {
        hexCode = rgbToHex([r,g,b]);
        rgbColor.value=hexCode;
    }

    colorHex.innerHTML=hexCode;
    colorHex.style.color=hexCode;
    binaryColor

    let bits = [r,g,b].map(v=>intTo8bit(v)) 
    rbits.innerHTML = bits[0];
    gbits.innerHTML = bits[1];
    bbits.innerHTML = bits[2];
    binaryColor.innerHTML = bits.join('');
}


var X1 = undefined;

HALF_OF_THE_TIME = true;
APPLY_TO_CHANNELS = 'all';
setHalfOfTheTime=_=>{HALF_OF_THE_TIME = bitflipoptions.value === 'half-time'?true:false}
setChannelsToFlip=_=>{APPLY_TO_CHANNELS = bitflipchannels.value}
//CANVAS_HEIGHT = 400;

changeImage=(canvas, f_input)=>{
    const file = f_input.files[0];
    const reader = new FileReader();
    let ctx = canvas.getContext('2d', {'willReadFrequently': true});
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    reader.onload = function(event) {
        const img = new Image();

        //img.crossOrigin = "Anonymous";

        img.onload = function() {
            canvas.width = img.width;
            canvas.height=img.height;
            // TODO: scale with css?
            //let scale = canvas.width / img.width;
            // canvas.height = img.height//*scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;
    };
    if (file) {
        reader.readAsDataURL(file);
    }
}
loadImage=(canvas, filename)=>{
    let ctx = canvas.getContext('2d', {'willReadFrequently': true});
    let img = new Image();
    img.src = filename; 
    //img.setAttribute('crossOrigin', '');
    //img.crossOrigin = "Anonymous";
    img.onload = function() {
        canvas.width = img.width;
        canvas.height=img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    };
}

convertTextToBinary=text=>{
    let binary = '';
    for (let i=0; i<text.length; i++){
        let charCode = text.charCodeAt(i);

        if (charCode>255){
            console.error(text[i], ' has a charCode outside the range 0-255, it has been replaced by a space')
            charCode = 32;  // default to space
        }
        let binaryString = String(charCode.toString(2)).padStart(8, '0')
        binary += binaryString;
    }
    return binary;
}
convertBinaryToText=binary=>{
    // binary is a string like '01110101010101010101001...' and has to be chopped in substrings of length 8,
    // because only characters in 0-255 char range are expected, which have exactly length 8 each
    let text = '';
    for (let i=0; i<binary.length; i+=8){
        let substring = binary.slice(i, i+8);
        let intValue = parseInt(substring, 2);  // turns '01010101' into the integer 85
        let textChar = String.fromCharCode(intValue);
        text += textChar;
    }
    return text;
}
MAX_ITERS = 20000;
readImage=canvas=>{
    let ctx = canvas.getContext('2d', {'willReadFrequently': true});
    let binaryString = '';
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i ++) {  // steps of 4 since there are 4 channels, RGB & alpha
        if (i%4===3){continue}  // ignore alpha channel
        if (i>MAX_ITERS){break}
        binaryString += imageData.data[i] % 2;  // just add 0 or 1 to the binary string
    }
    return convertBinaryToText(binaryString);
}
// encryptTextIntoImage=text=>{
//     let targetBinaryString = convertTextToBinary(text);
//     let imgData = X.getImageData(0, 0, C.width, C.height);  // get rid of width/height?
//     let stringIndex=0;

//     for (let i = 0; i < imgData.data.length; i++) {  // steps of 4 since there are 4 channels, RGB & alpha
//         if (i%4===3){continue}  // ignore alpha channel
//             let v = imgData.data[i];  // currentValue
//             let target = targetBinaryString[stringIndex]  // targetBinary
//             imgData.data[i] = v%2 === parseInt(target)?v:v<1?1:v>254?254:v+[-1,1][Math.random()*2|0];
//             stringIndex ++;  // position in target binary string, should not increment when i%4===3 (when it is the alpha channel)
//         if (stringIndex > targetBinaryString.length-1){break}
//     }
//     X.putImageData(imgData, 0, 0);
// }


readImageAndUpdateTextarea=(canvasId)=>{
    let canvas = document.getElementById(canvasId);
    let text = readImage(canvas);
    textarea1.value = text;
}

document.addEventListener('DOMContentLoaded', () => {
    let fi1 = document.getElementById('fileInput');
    let fi2 = document.getElementById('fileInput2');
    let C1 = document.getElementById('canvas1');
    let C2 = document.getElementById('canvas2');
    let C3 = document.getElementById('canvas3');


    fi1.addEventListener('change', ()=>changeImage(canvas1, fi1));
    fi2.addEventListener('change', ()=>changeImage(canvas3, fi2));

    //loadImage(canvas1, "incircles08.jpeg");
    loadImage(C1, "triangle_subdivisions.png");
    C2.height = C1.height;
    C2.width = C1.width;

    loadImage(C3, "layers.png");
});


flipBits=(int,index)=>{
    let newBits = '';
    let bits = intTo8bit(int%256)

    // console.log(bits);
    // let SCHEME = {}
    for (let i=0;i<bits.length;i++){
        //if (i<start || Math.random()<.5){
        
        let original = bits[i];
        let newBit = bits[i];

        if (i>6-index) {
            if (!HALF_OF_THE_TIME || (HALF_OF_THE_TIME && Math.random()<.5)){
                newBit = (bits[i]==='1')?'0':'1';
            }
        }
        newBits += newBit;
        // SCHEME[i] = [original, newBit, original===newBit?' ':'<--']
    }
    // console.table(SCHEME)
    // console.log(newBits)
    return parseInt(newBits,2);
}

clickBit=power=>{
    for (let i=0;i<8;i++){
        document.getElementById(`btnBit${i}`).style.background=(i<=power)?'#007bff':'#ccc';
    }

    // check if canvas1 has data. opy 
    const C = document.getElementById('canvas1');
    const X = C.getContext('2d',{'willReadFrequently': true});

    let C2 = document.getElementById('canvas2');
    const X2 = C2.getContext('2d',{'willReadFrequently': true});
    C2.width = C.width;
    C2.height = C.height;

    let imgData = X.getImageData(0, 0, C.width, C.height);
    let imgData2 = X2.getImageData(0,0,C2.width, C2.height);
    let stringIndex=0;

    for (let i = 0; i < imgData.data.length; i++) {
        let v = imgData.data[i];  // currentValue
        if (
            (APPLY_TO_CHANNELS==='all' && i%4<3) ||
            (APPLY_TO_CHANNELS==='R' && i%4===0) ||
            (APPLY_TO_CHANNELS==='G' && i%4===1) ||
            (APPLY_TO_CHANNELS==='B' && i%4===2)
        ){
            v = flipBits(v,power);
        }
        imgData2.data[i] = v;
    }
    X2.putImageData(imgData2, 0, 0);
}

formatInt=n=>new Intl.NumberFormat().format(n);
updateCalc=_=>{
    let w = document.getElementById('calcW').value;
    let h = document.getElementById('calcH').value;

    let totalPixels = w*h;
    let totalChannels = totalPixels *3;
    let totalTextChars = totalChannels/8|0;

    document.getElementById('calcTotalPixels').innerHTML = formatInt(totalPixels);
    document.getElementById('calcColorChannels').innerHTML = formatInt(totalChannels);
    document.getElementById('calcTextChars').innerHTML = formatInt(totalTextChars);
}
