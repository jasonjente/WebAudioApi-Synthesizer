/*
    AUTHORS:
        ANASTASIOS ARTEMIOS GIANNAKOULIAS P3150024
        IASON CHATZOPOULOS P3150197
        DECEMBER 2020 - JANUARY 2021
 */


window.webkitAudioContext = undefined;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
//REFERENCES TO HTML keyboard:css element me ta keys
let keyboard = document.querySelector(".keyboard");
let wavePicker = document.querySelector("select[name='waveform']"); // epilogh waveform
let volumeControl = document.querySelector("input[name='volume']");  //vol knob
let filterPicker = document.querySelector("select[name='filterType']"); //epilogh filtrou
let filterKnob = document.querySelector("input[name='filter']")

let distortionSlider = document.querySelector("input[name='distRange']");
let Atk = document.querySelector("input[name='A']");
let Dec = document.querySelector("input[name='D']");
let Sus = document.querySelector("input[name='S']");
let Rel = document.querySelector("input[name='R']");
let release = Rel.value;
let sustain = Sus.value;
let comp_ratio, comp_attack, comp_knee, comp_thr, comp_release;
comp_attack = document.querySelector("input[name='comp_attack']");
comp_release = document.querySelector("input[name='comp_release']");
comp_ratio = document.querySelector("input[name='comp_ratio']");
comp_knee = document.querySelector("input[name='comp_knee']");
comp_thr = document.querySelector("input[name='comp_thr']");
comp_attack.addEventListener("change", changeCompAttack, false);
comp_ratio.addEventListener("change", changeCompRatio, false);
comp_knee.addEventListener("change", changeCompKnee, false);
comp_release.addEventListener("change", changeCompRelease, false);
comp_thr.addEventListener("change", changeCompThreshold, false);

let qRange = document.querySelector("input[name='qRange']");
let filterGain = document.querySelector("input[name='filter_gain']");
let distortion;
let filter = new BiquadFilterNode(audioContext, filterPicker.options)
let dynamicsCompressor = audioContext.createDynamicsCompressor();
//CONTAINS THE OSCILLATORS
let oscList = [];
let masterGainNode = null;
let noteFreq = null;

let customWaveform = null;
let sineTerms = null;
let cosineTerms = null;

let lfoHz = 1;
let lfoHz1 = 3;

let lfoFlag = false;
let lfoFlag1 = false;

let envelope;

const lfoControl = document.querySelector("input[name='lfo']");
lfoControl.addEventListener('input', ev => {
    lfoHz = Number(ev.target.value);
}, false);

const lfoControl1 = document.querySelector("input[name='lfo1']");
lfoControl1.addEventListener('input', ev => {
    lfoHz1 = Number(ev.target.value);
}, false);

function createFrequencyBoard() {
    // DHMIOURGIA PINAKA SUXNOTITWN KAI NOTAS EXEI THN MORFH:
    /*       0          1
          27.50, A |  29.13, A# ....
    *
    */
    let keyboard = [];
    for (let i = 0; i < 9; i++) {
        keyboard[i] = [];
    }

    keyboard[0]["A"] = 27.500000000000000;
    keyboard[0]["A#"] = 29.135235094880619;
    keyboard[0]["B"] = 30.867706328507756;

    keyboard[1]["C"] = 32.703195662574829;
    keyboard[1]["C#"] = 34.647828872109012;
    keyboard[1]["D"] = 36.708095989675945;
    keyboard[1]["D#"] = 38.890872965260113;
    keyboard[1]["E"] = 41.203444614108741;
    keyboard[1]["F"] = 43.653528929125485;
    keyboard[1]["F#"] = 46.249302838954299;
    keyboard[1]["G"] = 48.999429497718661;
    keyboard[1]["G#"] = 51.913087197493142;
    keyboard[1]["A"] = 55.000000000000000;
    keyboard[1]["A#"] = 58.270470189761239;
    keyboard[1]["B"] = 61.735412657015513;

    keyboard[2]["C"] = 65.406391325149658;
    keyboard[2]["C#"] = 69.295657744218024;
    keyboard[2]["D"] = 73.416191979351890;
    keyboard[2]["D#"] = 77.781745930520227;
    keyboard[2]["E"] = 82.406889228217482;
    keyboard[2]["F"] = 87.307057858250971;
    keyboard[2]["F#"] = 92.498605677908599;
    keyboard[2]["G"] = 97.998858995437323;
    keyboard[2]["G#"] = 103.826174394986284;
    keyboard[2]["A"] = 110.000000000000000;
    keyboard[2]["A#"] = 116.540940379522479;
    keyboard[2]["B"] = 123.470825314031027;

    keyboard[3]["C"] = 130.812782650299317;
    keyboard[3]["C#"] = 138.591315488436048;
    keyboard[3]["D"] = 146.832383958703780;
    keyboard[3]["D#"] = 155.563491861040455;
    keyboard[3]["E"] = 164.813778456434964;
    keyboard[3]["F"] = 174.614115716501942;
    keyboard[3]["F#"] = 184.997211355817199;
    keyboard[3]["G"] = 195.997717990874647;
    keyboard[3]["G#"] = 207.652348789972569;
    keyboard[3]["A"] = 220.000000000000000;
    keyboard[3]["A#"] = 233.081880759044958;
    keyboard[3]["B"] = 246.941650628062055;

    keyboard[4]["C"] = 261.625565300598634;
    keyboard[4]["C#"] = 277.182630976872096;
    keyboard[4]["D"] = 293.664767917407560;
    keyboard[4]["D#"] = 311.126983722080910;
    keyboard[4]["E"] = 329.627556912869929;
    keyboard[4]["F"] = 349.228231433003884;
    keyboard[4]["F#"] = 369.994422711634398;
    keyboard[4]["G"] = 391.995435981749294;
    keyboard[4]["G#"] = 415.304697579945138;
    keyboard[4]["A"] = 440.000000000000000;
    keyboard[4]["A#"] = 466.163761518089916;
    keyboard[4]["B"] = 493.883301256124111;

    keyboard[5]["C"] = 523.251130601197269;
    keyboard[5]["C#"] = 554.365261953744192;
    keyboard[5]["D"] = 587.329535834815120;
    keyboard[5]["D#"] = 622.253967444161821;
    keyboard[5]["E"] = 659.255113825739859;
    keyboard[5]["F"] = 698.456462866007768;
    keyboard[5]["F#"] = 739.988845423268797;
    keyboard[5]["G"] = 783.990871963498588;
    keyboard[5]["G#"] = 830.609395159890277;
    keyboard[5]["A"] = 880.000000000000000;
    keyboard[5]["A#"] = 932.327523036179832;
    keyboard[5]["B"] = 987.766602512248223;

    keyboard[6]["C"] = 1046.502261202394538;
    keyboard[6]["C#"] = 1108.730523907488384;
    keyboard[6]["D"] = 1174.659071669630241;
    keyboard[6]["D#"] = 1244.507934888323642;
    keyboard[6]["E"] = 1318.510227651479718;
    keyboard[6]["F"] = 1396.912925732015537;
    keyboard[6]["F#"] = 1479.977690846537595;
    keyboard[6]["G"] = 1567.981743926997176;
    keyboard[6]["G#"] = 1661.218790319780554;
    keyboard[6]["A"] = 1760.000000000000000;
    keyboard[6]["A#"] = 1864.655046072359665;
    keyboard[6]["B"] = 1975.533205024496447;

    keyboard[7]["C"] = 2093.004522404789077;
    keyboard[7]["C#"] = 2217.461047814976769;
    keyboard[7]["D"] = 2349.318143339260482;
    keyboard[7]["D#"] = 2489.015869776647285;
    keyboard[7]["E"] = 2637.020455302959437;
    keyboard[7]["F"] = 2793.825851464031075;
    keyboard[7]["F#"] = 2959.955381693075191;
    keyboard[7]["G"] = 3135.963487853994352;
    keyboard[7]["G#"] = 3322.437580639561108;
    keyboard[7]["A"] = 3520.000000000000000;
    keyboard[7]["A#"] = 3729.310092144719331;
    keyboard[7]["B"] = 3951.066410048992894;

    keyboard[8]["C"] = 4186.009044809578154;
    return keyboard;
}



function setup() {

    noteFreq = createFrequencyBoard();
    distortionSlider.addEventListener("change", changeDistortion, false);
    Atk.addEventListener("change", changeAttack,false);
    Dec.addEventListener("change",changeDecay,false);
    Sus.addEventListener("change",changeSustain,false);
    Rel.addEventListener("change",changeRelease,false);
    console.log(Atk.value);
    volumeControl.addEventListener("change", changeVolume, false);
    filterKnob.addEventListener("change", changeFilterFreq, false);

    distortion = audioContext.createWaveShaper();

    masterGainNode = audioContext.createGain();
    masterGainNode.connect(audioContext.destination);
    masterGainNode.gain.value = volumeControl.value;


    noteFreq.forEach(function (keys, idx) {
        let keyList = Object.entries(keys);
        let octaveElem = document.createElement("div");
        octaveElem.className = "octave";

        keyList.forEach(function (key) {
            octaveElem.appendChild(createKey(key[0], idx, key[1]));
        });
        keyboard.appendChild(octaveElem);
    });

    document.querySelector("div[data-note='B'][data-octave='5']").scrollIntoView(false);
    // 0 to prwto
    sineTerms = new Float32Array([0, 3.4433, 21, 0.333, 13]);
    cosineTerms = new Float32Array(sineTerms.length);
    customWaveform = audioContext.createPeriodicWave(cosineTerms, sineTerms);

    for (let i = 0; i < 11; i++) {
        oscList[i] = [];
    }
}

setup();


function playTone(freq) {

    dynamicsCompressor.attack.value = comp_attack.value; // min 0.003 max 1  default 0
    dynamicsCompressor.knee.value = comp_knee.value; //min 0 max 40 default 30
    dynamicsCompressor.ratio.value = comp_ratio.value;//The amount of dB change in input for a 1 dB change in output. min 1 max 20 default 12??? gt 12 wtf
    dynamicsCompressor.release.value = comp_release.value;
    dynamicsCompressor.threshold.value = comp_thr.value; // default -24 min -100 max 0

    distortion.curve = makeDistortionCurve(distortionSlider.value/1000);

    let qVal = qRange.value;
    // filter = audioContext.createBiquadFilter();
    //PERNANE MONO TA EPITREPOMENA HDH FILTRWN
    // noinspection JSValidateTypes
    filter.type = filterPicker.options[filterPicker.selectedIndex].value;
    console.log(filter);
    switch (filter.type) {
        case "lowpass" || "highpass" || "bandpass" || "notch" || "allpass":
            filter.frequency.setValueAtTime(filterKnob.value, audioContext.currentTime);
            filter.Q.value = qVal;
            break;

        case "lowshelf" || "highshelf":
            filter.frequency.setValueAtTime(filterKnob.value, audioContext.currentTime);
            filter.gain.setValueAtTime(filterGain.value, audioContext.currentTime);
            break;
        case "peaking":
            filter.frequency.setValueAtTime(filterKnob.value, audioContext.currentTime);
            filter.gain.setValueAtTime(filterGain.value, audioContext.currentTime);
            filter.Q.value = qVal;
            break;
    }
    envelope = audioContext.createGain();

    envelope.gain.exponentialRampToValueAtTime(Sus.value,audioContext.currentTime + parseFloat(Atk.value));

    //oscillator LFO CREATION
    let amp = audioContext.createGain();
    amp.gain.setValueAtTime(1, audioContext.currentTime);
    let lfo = audioContext.createOscillator();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(lfoHz, audioContext.currentTime);

    lfo.start();

    //filter LFO CREATION
    const amp1 = audioContext.createGain();
    amp1.gain.setValueAtTime(1, audioContext.currentTime);

    const lfofilter = audioContext.createOscillator();
    lfofilter.type = 'square';
    lfofilter.frequency.setValueAtTime(lfoHz1, audioContext.currentTime);

    lfofilter.start();
    //OSCILLATOR CREATION
    let osc = audioContext.createOscillator();

    let type = wavePicker.options[wavePicker.selectedIndex].value;

    if (type === "custom") {
        osc.setPeriodicWave(customWaveform);
    } else {
        // noinspection JSValidateTypes
        osc.type = type;
    }

    osc.frequency.value = freq;

    lfoState();
    lfo1State();

    if (lfoFlag) {
        if (lfoFlag1) {
            //lfofilter.connect(filter.frequency);
            lfo.connect(amp.gain);
            osc.connect(envelope);
            osc.connect(amp);
            envelope.connect(distortion);
            amp.connect(distortion);
            distortion.connect(filter);
            filter.connect(dynamicsCompressor);
            dynamicsCompressor.connect(masterGainNode);
            osc.start(audioContext.currentTime);

        } else {
            lfo.connect(amp.gain);
            osc.connect(envelope);
            osc.connect(amp);
            envelope.connect(distortion);
            amp.connect(distortion);
            distortion.connect(filter);
            filter.connect(dynamicsCompressor);
            dynamicsCompressor.connect(masterGainNode);
            osc.start(audioContext.currentTime);
        }
    }else{
        if(lfoFlag1){
            osc.connect(envelope);
            envelope.connect(distortion);
            distortion.connect(filter);
            filter.connect(dynamicsCompressor);
            dynamicsCompressor.connect(masterGainNode);
            osc.start(audioContext.currentTime);

        }
        else{
            osc.connect(envelope);
            envelope.connect(distortion);
            distortion.connect(filter);
            filter.connect(dynamicsCompressor);
            dynamicsCompressor.connect(masterGainNode);
            osc.start(audioContext.currentTime);
        }

    }
    envelope.gain.exponentialRampToValueAtTime(0.0001,audioContext.currentTime + parseFloat(Atk.value + Dec.value+ Rel.value));
    return osc;
}
function lfoState(){
    let remember = document.getElementById('lfochk');
    lfoFlag = remember.checked;
}

function lfo1State(){
    let remember = document.getElementById('lfochk1');
    lfoFlag1 = remember.checked;
}

function createKey(note, octave, freq) {
    let keyElement = document.createElement("div");
    let labelElement = document.createElement("div");
    if (note.length === 1) {
        keyElement.className = "key";
    } else {
        keyElement.className = "keySharp";
    }
    keyElement.dataset["octave"] = octave;
    keyElement.dataset["note"] = note;
    keyElement.dataset["frequency"] = freq;

    labelElement.innerHTML = note + "<sub>" + octave + "</sub>";

    keyElement.appendChild(labelElement);

    keyElement.addEventListener("mousedown", notePressed, false);
    keyElement.addEventListener("mouseup", noteReleased, false);
    keyElement.addEventListener("mouseover", notePressed, false);
    keyElement.addEventListener("mouseleave", noteReleased, false);

    return keyElement;
}
function changeAttack() {
    console.log(Atk.value)
    envelope.gain.exponentialRampToValueAtTime(1,audioContext.currentTime+ parseFloat(Atk.value));
}

function changeDecay() {
    envelope.gain.exponentialRampToValueAtTime(Sus.value,audioContext.currentTime + parseFloat(Dec.value));
}

function changeSustain() {
    sustain = Sus.value;
}

function changeRelease() {
    release = Rel.value;
}
function notePressed(event) {
    if (event.buttons && 1) {
        let dataset = event.target.dataset;
        console.log(dataset["frequency"])
        if (!dataset["pressed"]) {
            oscList[dataset["octave"][dataset["note"]]] = playTone(dataset["frequency"]);
            dataset["pressed"] = "yes";
        }
    }
}

function noteReleased(event) {
    let dataset = event.target.dataset;

    if (dataset && dataset["pressed"]) {

        oscList[dataset["octave"][dataset["note"]]].stop(Rel.value);
        oscList[dataset["octave"][dataset["note"]]] = null;

        delete dataset["pressed"];
    }

}

function changeVolume() {
    masterGainNode.gain.value = volumeControl.value
    console.log(masterGainNode.gain);
}

function changeFilterFreq() {
    filter.frequency.value = filterKnob.value;
    console.log(filter.frequency);
}

function changeDistortion() {

    distortion.curve = makeDistortionCurve(distortionSlider.value);
}

function changeCompRatio() {
    dynamicsCompressor.ratio.value = comp_ratio.value;
}

function changeCompRelease() {
    dynamicsCompressor.release.value = comp_release.value;
}

function changeCompKnee() {
    dynamicsCompressor.knee.value = comp_knee.value;
}

function changeCompThreshold() {
    dynamicsCompressor.threshold.value = comp_thr.value;
    console.log(dynamicsCompressor.attack);
}

function changeCompAttack() {
    dynamicsCompressor.attack.value = comp_attack.value;
    console.log(dynamicsCompressor.attack);
}

function makeDistortionCurve(amount) {
    let k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
    for (; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
}
