/* ===== ELEMENTS ===== */

const screenText =
document.getElementById("screenText");

const solutionBox =
document.getElementById("solution");

const timerText =
document.getElementById("timer");

const complaintList =
document.getElementById("complaints");

const wave =
document.getElementById("wave");

/* ===== VARIABLES ===== */

let currentStep = "idle";

let selectedLanguage = "";

let selectedCrop = "";

let selectedSymptom = "";

let seconds = 0;

let timerInterval;

let mediaRecorder;

let audioChunks = [];

let currentAudio = null;

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

function playAudio(file){

if(currentAudio){

currentAudio.pause();

currentAudio.currentTime = 0;

}

currentAudio =
new Audio("audio/" + file);

currentAudio.play();

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

selectedSymptom = "";

solutionBox.innerText = "";

screenText.innerText = "Calling...";

timerText.innerText = "00:00";

startWave();

/* RINGTONE */

const ring =
new Audio("audio/ringtone.m4a");

ring.play();

currentAudio = ring;

/* AFTER 3 SEC */

setTimeout(()=>{

ring.pause();

ring.currentTime = 0;

startTimer();

screenText.innerText =
"1 - Telugu\n2 - English";

playAudio("welcome.m4a");

},3000);

}

/* ===== BUTTONS ===== */

function pressKey(key){

/* LANGUAGE */

if(currentStep === "language"){

if(key === "1"){

selectedLanguage = "telugu";

screenText.innerText =
"Say Crop Name";

playAudio("telugu_crop.m4a");

currentStep = "crop";

setTimeout(()=>{

startListening();

},2500);

}

else if(key === "2"){

selectedLanguage = "english";

screenText.innerText =
"Say Crop Name";

playAudio("english_crop.m4a");

currentStep = "crop";

setTimeout(()=>{

startListening();

},2500);

}

}

/* SYMPTOMS */

else if(currentStep === "symptoms"){

if(key === "1"){

selectedSymptom = "Yellow";

showFertilizer("Urea");

}

else if(key === "2"){

selectedSymptom = "Spots";

showFertilizer("Mancozeb");

}

else if(key === "3"){

selectedSymptom = "Curl";

showFertilizer("Neem Oil");

}

else if(key === "4"){

selectedSymptom = "Pest";

showFertilizer("Spinosad");

}

}

/* COMPLAINT */

else if(currentStep === "complaint"){

if(key === "9"){

startComplaintRecording();

}

else if(key === "5"){

endCall();

}

}

/* RECORDING */

else if(currentStep === "recording"){

if(key === "5"){

stopComplaintRecording();

}

}

}

/* ===== LISTEN ===== */

function startListening(){

startWave();

screenText.innerText =
"🎤 Listening...\n\nSay Crop Name Clearly";

setTimeout(()=>{

try{

recognition.lang = "en-IN";

recognition.continuous = false;

recognition.interimResults = false;

recognition.start();

}catch(e){

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

/* ===== NOT RECOGNIZED ===== */

else{

screenText.innerText =

"❌ Crop Not Recognized\n\nSpeak Again";

playAudio("retry.m4a");

setTimeout(()=>{

screenText.innerText =
"🎤 Say Crop Name";

startListening();

},2500);

}

};

/* ===== CROP DETECTED ===== */

function cropDetected(){

stopWave();

/* ===== SCREEN ===== */

screenText.innerText =

selectedCrop +
" Detected\n\n1 Yellow Leaves\n2 Brown Spots\n3 Leaf Curl\n4 Pest Attack";

/* ===== CROP DETECTED AUDIO ===== */

if(selectedCrop === "Paddy"){

playAudio("paddy.m4a");

}

else if(selectedCrop === "Cotton"){

playAudio("cotton.m4a");

}

else if(selectedCrop === "Chilli"){

playAudio("chilli.m4a");

}

else if(selectedCrop === "Maize"){

playAudio("maize.m4a");

}

/* ===== AFTER CROP AUDIO ===== */

setTimeout(()=>{

playSymptoms();

},2500);

currentStep = "symptoms";

}
function playSymptoms(){

playAudio("yellow.m4a");

setTimeout(()=>{

playAudio("spots.m4a");

},4000);

setTimeout(()=>{

playAudio("curl.m4a");

},8000);

setTimeout(()=>{

playAudio("pest.m4a");

},12000);

}

/* ===== FERTILIZER ===== */

function showFertilizer(name){

solutionBox.innerText =
"Fertilizer : " + name;

if(name === "Urea"){

playAudio("urea.m4a");

}

else if(name === "Mancozeb"){

playAudio("mancozeb.m4a");

}

else if(name === "Neem Oil"){

playAudio("neem.m4a");

}

else if(name === "Spinosad"){

playAudio("spinosad.m4a");

}

/* COMPLAINT OPTION */

setTimeout(()=>{

playAudio("sms.m4a");

screenText.innerText =
"📩 SMS Sent To Mobile";

setTimeout(()=>{

screenText.innerText =
"9 Record Complaint\n5 End Call";

playAudio("press9.m4a");

currentStep = "complaint";

},3000);

},5000);

/* ===== RECORDING ===== */

async function startComplaintRecording(){

screenText.innerText =
"Recording...\nPress 5 To Submit";

playAudio("recording_instruction.m4a");

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

playAudio("submitted.m4a");

endCall();

}

/* ===== END CALL ===== */

function endCall(){

stopTimer();

stopWave();

screenText.innerText =
"Call Ended";

currentStep = "idle";

}
