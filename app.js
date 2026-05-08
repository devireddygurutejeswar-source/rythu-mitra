const screenText =
document.getElementById("screenText");

const solutionBox =
document.getElementById("solution");

const waves =
document.getElementById("waves");

const smsBox =
document.getElementById("smsBox");

const historyBox =
document.getElementById("history");

const scoreBoard =
document.getElementById("scoreBoard");

/* ===== VARIABLES ===== */

let currentAudio = null;

let currentStep = "language";

let selectedLanguage = "";

let selectedCrop = "";

let seconds = 0;

let timerInterval;

/* ===== RECORDING ===== */

let mediaRecorder;

let audioChunks = [];

let complaintAudioURL = "";

/* ===== SCORES ===== */

let scores = {

Urea:9,
Mancozeb:8,
"Neem Oil":7,
Spinosad:6

};

/* ===== SPEECH ===== */

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

const recognition =
new SpeechRecognition();

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

/* ===== WAVES ===== */

function startWave(){

waves.classList.add("active");

}

function stopWave(){

waves.classList.remove("active");

}

/* ===== START CALL ===== */

function startCall(){

currentStep = "language";

selectedLanguage = "";

selectedCrop = "";

solutionBox.innerText = "";

screenText.innerText =
"Calling...";

clearInterval(timerInterval);

seconds = 0;

document.getElementById("timer")
.innerText = "00:00";

startWave();

/* ===== PLAY RING ===== */

currentAudio =
new Audio("audio/ringtone.m4a");

currentAudio.play();

/* ===== AFTER 3 SEC ===== */

setTimeout(()=>{

currentAudio.pause();

currentAudio.currentTime = 0;

/* ===== START TIMER ===== */

timerInterval = setInterval(()=>{

seconds++;

let mins =
String(Math.floor(seconds/60))
.padStart(2,"0");

let secs =
String(seconds%60)
.padStart(2,"0");

document.getElementById("timer")
.innerText =
mins + ":" + secs;

},1000);

screenText.innerText =

"1 - Telugu\n2 - English";

playAudio("welcome.m4a");

},3000);

}

/* ===== BUTTON PRESS ===== */

function pressKey(num){

/* ===== LANGUAGE ===== */

if(currentStep === "language"){

if(num === 1){

selectedLanguage = "telugu";

recognition.lang = "te-IN";

currentStep = "crop";

screenText.innerText =
"🎤 Say Crop Name";

playAudio(
"telugu_crop.m4a",
()=>{

startListening();

}
);

return;

}

if(num === 2){

selectedLanguage = "english";

recognition.lang = "en-US";

currentStep = "crop";

screenText.innerText =
"🎤 Say Crop Name";

playAudio(
"english_crop.m4a",
()=>{

startListening();

}
);

return;

}

}

/* ===== SYMPTOM BUTTONS ===== */

if(currentStep === "symptom"){

if(num === 1){

giveSolution(
"Urea",

selectedLanguage==="telugu"
? "urea.m4a"
: "urea_en.m4a"
);

}

if(num === 2){

giveSolution(
"Mancozeb",

selectedLanguage==="telugu"
? "mancozeb.m4a"
: "mancozeb_en.m4a"
);

}

if(num === 3){

giveSolution(
"Neem Oil",

selectedLanguage==="telugu"
? "neem.m4a"
: "neem_en.m4a"
);

}

if(num === 4){

giveSolution(
"Spinosad",

selectedLanguage==="telugu"
? "spinosad.m4a"
: "spinosad_en.m4a"
);

}

/* ===== START COMPLAINT ===== */

if(num === 9){

currentStep = "complaint";

screenText.innerText =

"🎤 Recording Complaint...\n\nPress 5 To Submit";

startWave();

playAudio(

selectedLanguage==="telugu"
? "recording_instruction.m4a"
: "recording_instruction_en.m4a"

);

/* ===== REAL RECORDING ===== */

navigator.mediaDevices
.getUserMedia({audio:true})
.then(stream=>{

mediaRecorder =
new MediaRecorder(stream);

audioChunks = [];

mediaRecorder.start();

mediaRecorder.ondataavailable =
event=>{

audioChunks.push(event.data);

};

mediaRecorder.onstop = ()=>{

const audioBlob =
new Blob(audioChunks,
{type:"audio/webm"});

complaintAudioURL =
URL.createObjectURL(audioBlob);

addComplaint(
complaintAudioURL
);

};

});

return;

}

/* ===== NO COMPLAINT ===== */

if(num === 5){

screenText.innerText =

"✅ Thank You\nCall Ended";

playAudio(

selectedLanguage==="telugu"
? "thankyou.m4a"
: "thankyou_en.m4a"

);

clearInterval(timerInterval);

stopWave();

return;

}

}

/* ===== SUBMIT COMPLAINT ===== */

if(
currentStep === "complaint" &&
num === 5
){

if(mediaRecorder){

mediaRecorder.stop();

}

screenText.innerText =

"✅ Complaint Submitted\nCall Ended";

stopWave();

playAudio(

selectedLanguage==="telugu"
? "thankyou.m4a"
: "thankyou_en.m4a"

);

clearInterval(timerInterval);

return;

}

}

/* ===== START LISTEN ===== */

function startListening(){

startWave();

setTimeout(()=>{

recognition.start();

},200);

}

/* ===== VOICE RESULT ===== */

recognition.onresult = (event)=>{

stopWave();

let text =
event.results[0][0]
.transcript
.toLowerCase();

console.log(text);

/* ===== CROP DETECTION ===== */

if(currentStep === "crop"){

if(
text.includes("paddy") ||
text.includes("వరి")
){

selectedCrop = "Paddy";

cropDetected(

selectedLanguage==="telugu"
? "paddy.m4a"
: "paddy_en.m4a"

);

}

else if(
text.includes("cotton") ||
text.includes("పత్తి")
){

selectedCrop = "Cotton";

cropDetected(

selectedLanguage==="telugu"
? "cotton.m4a"
: "cotton_en.m4a"

);

}

else if(
text.includes("chilli") ||
text.includes("mirchi") ||
text.includes("మిర్చి")
){

selectedCrop = "Chilli";

cropDetected(

selectedLanguage==="telugu"
? "chilli.m4a"
: "chilli_en.m4a"

);

}

else if(
text.includes("maize") ||
text.includes("మొక్కజొన్న")
){

selectedCrop = "Maize";

cropDetected(

selectedLanguage==="telugu"
? "maize.m4a"
: "maize_en.m4a"

);

}

}

};

/* ===== CROP DETECTED ===== */

function cropDetected(audio){

currentStep = "symptom";

screenText.innerText =

"Crop Recognized\n\n1 - Yellow Leaves\n2 - Brown Spots\n3 - Leaf Curl\n4 - Pest Attack\n5 - No Complaint\n9 - Complaint";

playAudio(audio,()=>{

playSymptoms();

});

}

/* ===== PLAY SYMPTOMS ===== */

function playSymptoms(){

let yellow =
selectedLanguage==="telugu"
? "yellow.m4a"
: "yellow_en.m4a";

let spots =
selectedLanguage==="telugu"
? "spots.m4a"
: "spots_en.m4a";

let curl =
selectedLanguage==="telugu"
? "curl.m4a"
: "curl_en.m4a";

let pest =
selectedLanguage==="telugu"
? "pest.m4a"
: "pest_en.m4a";

playAudio(yellow,()=>{

playAudio(spots,()=>{

playAudio(curl,()=>{

playAudio(pest);

});

});

});

}

/* ===== SOLUTION ===== */

function giveSolution(name,audio){

solutionBox.innerText =

"Fertilizer : " + name;

addSMS(selectedCrop,name);

playAudio(audio,()=>{

playAudio(

selectedLanguage==="telugu"
? "press9.m4a"
: "press9_en.m4a"

);

});

}

/* ===== SMS ===== */

function addSMS(crop,solution){

let sms =
JSON.parse(
localStorage.getItem("sms")
) || [];

sms.push({

crop,
solution,

time:
new Date().toLocaleString()

});

localStorage.setItem(

"sms",

JSON.stringify(sms)

);

loadSMS();

}

function loadSMS(){

let sms =
JSON.parse(
localStorage.getItem("sms")
) || [];

if(sms.length===0){

smsBox.innerHTML =

`
<h2>📩 SMS History</h2>

<div class="message">

No SMS Sent

</div>
`;

return;

}

smsBox.innerHTML =

`<h2>📩 SMS History</h2>` +

sms.map(s=>`

<div class="message">

<b>${s.crop}</b>

<br><br>

${s.solution}

<div class="time">

${s.time}

</div>

</div>

`).join("");

}

/* ===== COMPLAINT ===== */

function addComplaint(audioURL){

let complaints =
JSON.parse(
localStorage.getItem("complaints")
) || [];

complaints.push({

message:
"Complaint Registered",

audio:audioURL,

time:
new Date().toLocaleString()

});

localStorage.setItem(

"complaints",

JSON.stringify(complaints)

);

loadComplaints();

}

function loadComplaints(){

let complaints =
JSON.parse(
localStorage.getItem("complaints")
) || [];

if(complaints.length===0){

historyBox.innerHTML =

`
<h2>🎤 Complaint History</h2>

<div class="message">

No Complaint

</div>
`;

return;

}

historyBox.innerHTML =

`<h2>🎤 Complaint History</h2>` +

complaints.map(c=>`

<div class="message">

${c.message}

<br><br>

<audio controls
src="${c.audio}">
</audio>

<div class="time">

${c.time}

</div>

</div>

`).join("");

}

/* ===== SCORE BAR ===== */

function scoreBar(name,value){

let width = value * 10;

return '<div class="score-item">' +

'<div class="score-title">' +
name +
'</div>' +

'<div class="score-bg">' +

'<div class="score-fill" style="width:' +
width +
'%">' +

value +
'/10</div></div></div>';

}

/* ===== UPDATE SCORES ===== */

function updateScores(){

scoreBoard.innerHTML =

'<h2>📊 Smart Learning Scores</h2>' +

scoreBar("Urea",scores.Urea) +

scoreBar("Mancozeb",scores.Mancozeb) +

scoreBar("Neem Oil",scores["Neem Oil"]) +

scoreBar("Spinosad",scores.Spinosad);

}

/* ===== LOAD ===== */

loadSMS();

loadComplaints();

updateScores();