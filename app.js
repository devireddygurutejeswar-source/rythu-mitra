/* ===== ELEMENTS ===== */

const screenText =
document.getElementById("screenText");

const solutionBox =
document.getElementById("solution");

const timerText =
document.getElementById("timer");

const complaintList =
document.getElementById("complaints");

const smsBox =
document.getElementById("smsBox");

const wave =
document.getElementById("wave");

/* ===== VARIABLES ===== */

let currentStep = "idle";

let selectedLanguage = "";

let selectedCrop = "";

let currentAudio = null;

let seconds = 0;

let timerInterval;

let mediaRecorder;

let audioChunks = [];

let symptomReady = false;

/* ===== SPEECH ===== */

window.SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

const recognition =
new webkitSpeechRecognition();

recognition.lang = "en-IN";

recognition.continuous = false;

recognition.interimResults = false;

/* ===== AUDIO ===== */

function playAudio(file,callback){

if(currentAudio){

currentAudio.pause();

currentAudio.currentTime = 0;

}

currentAudio =
new Audio("audio/" + file);

currentAudio.play();

currentAudio.onended = ()=>{

if(callback){

callback();

}

};

}

/* ===== WAVE ===== */

function startWave(){

wave.style.opacity = "1";

}

function stopWave(){

wave.style.opacity = "0";

}

/* ===== TIMER ===== */

function startTimer(){

clearInterval(timerInterval);

seconds = 0;

timerInterval = setInterval(()=>{

seconds++;

let mins =
String(Math.floor(seconds/60))
.padStart(2,"0");

let secs =
String(seconds%60)
.padStart(2,"0");

timerText.innerText =
mins + ":" + secs;

},1000);

}

function stopTimer(){

clearInterval(timerInterval);

}

/* ===== START CALL ===== */

function startCall(){

currentStep = "language";

selectedLanguage = "";

selectedCrop = "";

solutionBox.innerText = "";

screenText.innerText =
"Calling...";

timerText.innerText =
"00:00";

startWave();

/* ===== RING ===== */

playAudio("ringtone.m4a");

/* ===== AFTER RING ===== */

setTimeout(()=>{

startTimer();

screenText.innerText =
"1 Telugu\n2 English";

playAudio("welcome.m4a");

},3000);

}

/* ===== BUTTONS ===== */

function pressKey(key){

/* ===== LANGUAGE ===== */

if(currentStep === "language"){

if(key === "1"){

selectedLanguage = "telugu";

screenText.innerText =
"🎤 Say Crop Name";

playAudio(
"telugu_crop.m4a",
()=>{

currentStep = "crop";

startListening();

}
);

}

else if(key === "2"){

selectedLanguage = "english";

screenText.innerText =
"🎤 Say Crop Name";

playAudio(
"english_crop.m4a",
()=>{

currentStep = "crop";

startListening();

}
);

}

}

/* ===== SYMPTOMS ===== */

else if(
currentStep === "symptoms"
&& symptomReady
){

symptomReady = false;

if(key === "1"){

showFertilizer(
"Urea",
selectedLanguage==="english"
? "urea_en.m4a"
: "urea.m4a"
);

}

else if(key === "2"){

showFertilizer(
"Mancozeb",
selectedLanguage==="english"
? "mancozeb_en.m4a"
: "mancozeb.m4a"
);

}

else if(key === "3"){

showFertilizer(
"Neem Oil",
selectedLanguage==="english"
? "neem_en.m4a"
: "neem.m4a"
);

}

else if(key === "4"){

showFertilizer(
"Spinosad",
selectedLanguage==="english"
? "spinosad_en.m4a"
: "spinosad.m4a"
);

}

}

/* ===== COMPLAINT ===== */

else if(currentStep === "complaint"){

if(key === "9"){

startComplaintRecording();

}

else if(key === "5"){

endCall();

}

}

/* ===== RECORDING ===== */

else if(currentStep === "recording"){

if(key === "5"){

stopComplaintRecording();

}

}

}

/* ===== START LISTENING ===== */

function startListening(){

startWave();

screenText.innerText =
"🎤 Listening...\n\nSay Crop Name Clearly";

setTimeout(()=>{

try{

recognition.lang = "en-IN";

recognition.start();

}
catch(e){

console.log(e);

}

},1500);

}

/* ===== VOICE RESULT ===== */

recognition.onresult =
function(event){

stopWave();

let text =
event.results[0][0]
.transcript
.toLowerCase()
.trim();

console.log(text);

/* ===== PADDY ===== */

if(
text.includes("paddy") ||
text.includes("vari") ||
text.includes("వరి")
){

selectedCrop = "Paddy";

cropDetected();

}

/* ===== COTTON ===== */

else if(
text.includes("cotton") ||
text.includes("cotten") ||
text.includes("పత్తి")
){

selectedCrop = "Cotton";

cropDetected();

}

/* ===== CHILLI ===== */

else if(
text.includes("chilli") ||
text.includes("chili") ||
text.includes("mirchi") ||
text.includes("మిర్చి")
){

selectedCrop = "Chilli";

cropDetected();

}

/* ===== MAIZE ===== */

else if(
text.includes("maize") ||
text.includes("maze") ||
text.includes("మొక్కజొన్న")
){

selectedCrop = "Maize";

cropDetected();

}

/* ===== RETRY ===== */

else{

screenText.innerText =
"❌ Crop Not Recognized\n\nSpeak Again";

playAudio(
selectedLanguage==="english"
? "retry_en.m4a"
: "retry.m4a",
()=>{

startListening();

}
);

}

};

/* ===== CROP DETECTED ===== */

function cropDetected(){

screenText.innerText =

selectedCrop +
" Detected\n\n1 Yellow Leaves\n2 Brown Spots\n3 Leaf Curl\n4 Pest Attack";

let cropAudio = "";

/* ===== CROP AUDIO ===== */

if(selectedCrop==="Paddy"){

cropAudio =
selectedLanguage==="english"
? "paddy_en.m4a"
: "paddy.m4a";

}

else if(selectedCrop==="Cotton"){

cropAudio =
selectedLanguage==="english"
? "cotton_en.m4a"
: "cotton.m4a";

}

else if(selectedCrop==="Chilli"){

cropAudio =
selectedLanguage==="english"
? "chilli_en.m4a"
: "chilli.m4a";

}

else if(selectedCrop==="Maize"){

cropAudio =
selectedLanguage==="english"
? "maize_en.m4a"
: "maize.m4a";

}

playAudio(cropAudio,()=>{

playSymptoms();

});

currentStep = "symptoms";

}

/* ===== PLAY SYMPTOMS ===== */

function playSymptoms(){

let yellow =
selectedLanguage==="english"
? "yellow_en.m4a"
: "yellow.m4a";

let spots =
selectedLanguage==="english"
? "spots_en.m4a"
: "spots.m4a";

let curl =
selectedLanguage==="english"
? "curl_en.m4a"
: "curl.m4a";

let pest =
selectedLanguage==="english"
? "pest_en.m4a"
: "pest.m4a";

playAudio(yellow,()=>{

playAudio(spots,()=>{

playAudio(curl,()=>{

playAudio(pest,()=>{

symptomReady = true;

});

});

});

});

}

/* ===== FERTILIZER ===== */

function showFertilizer(name,audio){

solutionBox.innerText =
"🌱 Fertilizer : " + name;

playAudio(audio,()=>{

screenText.innerText =
"📩 SMS Sent To Mobile";

playAudio(

selectedLanguage==="english"
? "sms_en.m4a"
: "sms.m4a",

()=>{

screenText.innerText =
"9 Record Complaint\n5 End Call";

playAudio(

selectedLanguage==="english"
? "press9_en.m4a"
: "press9.m4a"

);

currentStep = "complaint";

}

);

});

}

/* ===== RECORDING ===== */

async function startComplaintRecording(){

screenText.innerText =
"🎤 Recording...\nPress 5 To Submit";

playAudio(

selectedLanguage==="english"
? "recording_instruction_en.m4a"
: "recording_instruction.m4a"

);

currentStep = "recording";

const stream =
await navigator.mediaDevices
.getUserMedia({audio:true});

mediaRecorder =
new MediaRecorder(stream);

audioChunks = [];

mediaRecorder.ondataavailable =
event=>{

audioChunks.push(event.data);

};

mediaRecorder.onstop = ()=>{

const blob =
new Blob(audioChunks);

const audioURL =
URL.createObjectURL(blob);

const audio =
document.createElement("audio");

audio.controls = true;

audio.src = audioURL;

const item =
document.createElement("div");

item.className = "message";

item.innerHTML =
"<p>Complaint Recorded</p>";

item.appendChild(audio);

complaintList.appendChild(item);

};

mediaRecorder.start();

}

/* ===== STOP RECORDING ===== */

function stopComplaintRecording(){

mediaRecorder.stop();

playAudio(

selectedLanguage==="english"
? "submitted_en.m4a"
: "submitted.m4a",

()=>{

endCall();

}

);

}

/* ===== END CALL ===== */

function endCall(){

stopTimer();

stopWave();

screenText.innerText =
"📞 Call Ended";

currentStep = "idle";

}
