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

setTimeout(()=>{

try{

recognition.start();

}catch(e){

console.log(e);

}

},1200);

}

/* ===== VOICE RESULT ===== */

recognition.onresult =
function(event){

let text =
event.results[0][0]
.transcript
.toLowerCase()
.trim();

console.log(text);

/* BETTER MATCHING */

if(
text.includes("paddy")
){

selectedCrop = "Paddy";

cropDetected();

}

else if(
text.includes("cotton")
||
text.includes("cotten")
){

selectedCrop = "Cotton";

cropDetected();

}

else if(
text.includes("chilli")
||
text.includes("chili")
){

selectedCrop = "Chilli";

cropDetected();

}

else if(
text.includes("maize")
||
text.includes("maze")
){

selectedCrop = "Maize";

cropDetected();

}

else{

playAudio("retry.m4a");

}

};

/* ===== CROP DETECTED ===== */

function cropDetected(){

stopWave();

screenText.innerText =
selectedCrop +
"\nDetected\n\n1 Yellow\n2 Spots\n3 Curl\n4 Pest";

if(selectedLanguage === "telugu"){

playAudio("complaint.m4a");

}

else{

playAudio("complaint.m4a");

}

currentStep = "symptoms";

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

screenText.innerText =
"9 Record Complaint\n5 End Call";

playAudio("press9.m4a");

currentStep = "complaint";

},4000);

}

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
