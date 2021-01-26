/*
    AUTHORS:
        ANASTASIOS ARTEMIOS GIANNAKOULIAS P3150024
        IASON CHATZOPOULOS P3150197
        DECEMBER 2020 - JANUARY 2021
 */
window.webkitAudioContext = undefined;
//we will use this to handle all audio
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
//REFERENCES TO HTML keyboard
let keyboard = document.querySelector(".keyboard");
//select waveform
let wavePicker = document.querySelector("select[name='waveform']");
//master gain
let volumeControl = document.querySelector("input[name='volume']");
//filtertype high pass, low pass, band pass etc
let filterPicker = document.querySelector("select[name='filterType']");
//frequency for the filter
let filterKnob = document.querySelector("input[name='filter']")
//Q range for filter
let qRange = document.querySelector("input[name='qRange']");
//gain filter
let filterGain = document.querySelector("input[name='filter_gain']");
//filter setup
let filter = audioContext.createBiquadFilter();
//let filter = new BiquadFilterNode(audioContext, filterPicker.options)
//distortion input
let distortion;
let distortionSlider = document.querySelector("input[name='distRange']");
//envelope ADSR html input
let Atk = document.querySelector("input[name='A']");
let Dec = document.querySelector("input[name='D']");
let Sus = document.querySelector("input[name='S']");
let Rel = document.querySelector("input[name='R']");
//S and R
let release = Rel.value;
let sustain = Sus.value;
//compressor setup
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
let dynamicsCompressor = audioContext.createDynamicsCompressor();
//CONTAINS THE OSCILLATORS
let oscList = [];
let masterGainNode = null;
let noteFreq = null;
//custom waveform
let customWaveform = null;
let sineTerms = null;
let cosineTerms = null;
//ADSR Envelope
let envelope;
//lfo setup
let lfoHz = 1;
let lfoHz1 = 3;
let lfoFlag = false;
let lfoFlag1 = false;

const lfoControl = document.querySelector("input[name='lfo']");
lfoControl.addEventListener('input', ev => {
    lfoHz = Number(ev.target.value);
}, false);

const lfoControl1 = document.querySelector("input[name='lfo1']");
lfoControl1.addEventListener('input', ev => {
    lfoHz1 = Number(ev.target.value);
}, false);

function createFrequencyBoard() {
    // Creation of the keyboard, an index of note, octave and frequency.
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
    //create the board
    noteFreq = createFrequencyBoard();
    //DOM manipulation, use of EventListener
    distortionSlider.addEventListener("change", changeDistortion, false);
    Atk.addEventListener("change", changeAttack,false);
    Dec.addEventListener("change",changeDecay,false);
    Sus.addEventListener("change",changeSustain,false);
    Rel.addEventListener("change",changeRelease,false);
    volumeControl.addEventListener("change", changeVolume, false);
    filterKnob.addEventListener("change", changeFilterFreq, false);

    //distortion initialization
    distortion = audioContext.createWaveShaper();
    //Creation of master channel
    masterGainNode = audioContext.createGain();
    masterGainNode.connect(audioContext.destination);
    masterGainNode.gain.value = volumeControl.value;

    //for each note in the frequency board create an element,
    // if it is a sharp note it will create a black note on the UI
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
    //Custom waveform, change the values in this array
    sineTerms = new Float32Array([0, 3.4433, 21, 0.333, 13]);
    cosineTerms = new Float32Array(sineTerms.length);
    customWaveform = audioContext.createPeriodicWave(cosineTerms, sineTerms);
    //creates an index to know which note is playing at all times.
    for (let i = 0; i < 11; i++) {
        oscList[i] = [];
    }
}
//initialize
setup();
//is called by the notePressed method with the frequency and returtns this oscillator
function playTone(freq) {
    //setup the values for the components
    dynamicsCompressor.attack.value = comp_attack.value; // min 0.003 max 1  default 0
    dynamicsCompressor.knee.value = comp_knee.value; //min 0 max 40 default 30
    dynamicsCompressor.ratio.value = comp_ratio.value;//The amount of dB change in input for a 1 dB change in output. min 1 max 20 default 12
    dynamicsCompressor.release.value = comp_release.value;
    dynamicsCompressor.threshold.value = comp_thr.value; // default -24 min -100 max 0
    //distortion curve
    distortion.curve = makeDistortionCurve(distortionSlider.value/1000);
    //Qval for the filter
    let qVal = qRange.value;
    //We allow only the filters allowed by the library
    // noinspection JSValidateTypes
    // not all filters share the same components
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
    //initialization of the ADSR envelope
    envelope = audioContext.createGain();
    //Attack
    envelope.gain.exponentialRampToValueAtTime(Sus.value,audioContext.currentTime + parseFloat(Atk.value));
    //Decay
    envelope.gain.exponentialRampToValueAtTime(Sus.value*0.9,audioContext.currentTime + parseFloat(Atk.value)+parseFloat(Dec.value));
    //oscillator LFO CREATION and setup
    let amp = audioContext.createGain();
    amp.gain.setValueAtTime(1, audioContext.currentTime);
    let lfo = audioContext.createOscillator();
    lfo.type = 'square';
    lfo.frequency.setValueAtTime(lfoHz, audioContext.currentTime);
    lfo.start();
    //BUG BUG
    //filter LFO CREATION
    const amp1 = audioContext.createGain();
    amp1.gain.setValueAtTime(1, audioContext.currentTime);
    const lfofilter = audioContext.createOscillator();
    lfofilter.type = 'square';
    lfofilter.frequency.setValueAtTime(lfoHz1, audioContext.currentTime);
    lfofilter.start();

    //OSCILLATOR CREATION and setup
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
    //4 cases for the configuration of the synth
    if (lfoFlag) {
        //!BUGBUG CASE 1:
        //Both LFO's open
        if (lfoFlag1) {
            //BUGBUG
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
            //CASE 2:
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
        //CASE 3:
        if(lfoFlag1){
            osc.connect(envelope);
            envelope.connect(distortion);
            distortion.connect(filter);
            filter.connect(dynamicsCompressor);
            dynamicsCompressor.connect(masterGainNode);
            osc.start(audioContext.currentTime);

        }
        else{
            //CASE 4:
            osc.connect(envelope);
            envelope.connect(distortion);
            distortion.connect(filter);
            filter.connect(dynamicsCompressor);
            dynamicsCompressor.connect(masterGainNode);
            osc.start(audioContext.currentTime);
        }

    }
    //this is supposed to be the release part of the adsr
    envelope.gain.exponentialRampToValueAtTime(0.00001,audioContext.currentTime + parseFloat(Atk.value + Dec.value+ Rel.value));
    return osc;
}
//checks if the user has turned on this lfo
function lfoState(){
    let remember = document.getElementById('lfochk');
    lfoFlag = remember.checked;
}

//checks if the user has turned on this lfo
function lfo1State(){
    let remember = document.getElementById('lfochk1');
    lfoFlag1 = remember.checked;
}
//Creates all html elements and appends them adding event listener events
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
//Change ADSR attack
function changeAttack() {
    console.log(Atk.value)
    envelope.gain.exponentialRampToValueAtTime(1,audioContext.currentTime+ parseFloat(Atk.value));
}
//Change ADSR Decay
function changeDecay() {
    envelope.gain.exponentialRampToValueAtTime(Sus.value,audioContext.currentTime + parseFloat(Dec.value));
}
//Change ADSR sustain
function changeSustain() {
    sustain = Sus.value;
}
//Change ADSR release
function changeRelease() {
    release = Rel.value;
}
//triggers on click and uses the osclist index to create a new osc while the note is pressed
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
//stops the oscillators when the users releases the mouse
function noteReleased(event) {
    let dataset = event.target.dataset;

    if (dataset && dataset["pressed"]) {

        oscList[dataset["octave"][dataset["note"]]].stop(Rel.value);
        oscList[dataset["octave"][dataset["note"]]] = null;

        delete dataset["pressed"];
    }

}
//changes the master volume
function changeVolume() {
    masterGainNode.gain.value = volumeControl.value
    console.log(masterGainNode.gain);
}
//changes the frequency of the filter
function changeFilterFreq() {
    filter.frequency.value = filterKnob.value;
    console.log(filter.frequency);
}
//creates a new distortion curve
function changeDistortion() {
    distortion.curve = makeDistortionCurve(distortionSlider.value);
}
//change compressor ratio
function changeCompRatio() {
    dynamicsCompressor.ratio.value = comp_ratio.value;
}
//change compressor release
function changeCompRelease() {
    dynamicsCompressor.release.value = comp_release.value;
}
//change compressor knee
function changeCompKnee() {
    dynamicsCompressor.knee.value = comp_knee.value;
}
//change compressor threshold
function changeCompThreshold() {
    dynamicsCompressor.threshold.value = comp_thr.value;
    console.log(dynamicsCompressor.attack);
}
//change compressor attack
function changeCompAttack() {
    dynamicsCompressor.attack.value = comp_attack.value;
    console.log(dynamicsCompressor.attack);
}
//creates the curve of the distortion by resampling the signal (?)
//found on a mozilla tutorial and to be honest it just works, no idea how.
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
