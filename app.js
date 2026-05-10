/* ===== ELEMENTS ===== */

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

currentAudio.preload = "auto";

currentAudio.play()
.catch(err=>console.log(err));

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

/* ===== RING ===== */

currentAudio =
new Audio("audio/ringtone.m4a");

currentAudio.play();

setTimeout(()=>{

currentAudio.pause();

currentAudio.currentTime = 0;

/* ===== TIMER ===== */

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

/* ===== BUTTON ===== */

function pressKey(num){

/* ===== LANGUAGE ===== */

if(currentStep==="language"){

if(num===1){

selectedLanguage="telugu";

recognition.lang = "te-IN";

currentStep="crop";

screenText.innerText =

"🎤 పంట పేరు చెప్పండి\n\n🌶️ మిర్చి\n🌿 పత్తి\n🌾 వరి\n🌽 మొక్కజొన్న";

playAudio(
"telugu_crop.m4a",
()=>{

startListening();

}
);

return;

}

if(num===2){

selectedLanguage="english";

recognition.lang = "en-IN";

currentStep="crop";

screenText.innerText =

"🎤 Say Crop Name\n\n🌶️ Chilli\n🌿 Cotton\n🌾 Paddy\n🌽 Maize";

playAudio(
"english_crop.m4a",
()=>{

startListening();

}
);

return;

}

}

/* ===== SYMPTOMS ===== */

if(currentStep==="symptom"){

if(num===1){

giveSolution(
"Urea",
selectedLanguage==="telugu"
? "urea.m4a"
: "urea_en.m4a"
);

}

if(num===2){

giveSolution(
"Mancozeb",
selectedLanguage==="telugu"
? "mancozeb.m4a"
: "mancozeb_en.m4a"
);

}

if(num===3){

giveSolution(
"Neem Oil",
selectedLanguage==="telugu"
? "neem.m4a"
: "neem_en.m4a"
);

}

if(num===4){

giveSolution(
"Spinosad",
selectedLanguage==="telugu"
? "spinosad.m4a"
: "spinosad_en.m4a"
);

}

}

/* ===== COMPLAINT ===== */

if(currentStep==="complaint"){

if(num===9){

startComplaint();

}

else{

endCall();

}

}

/* ===== SUBMIT ===== */

if(
currentStep==="recording" &&
num===5
){

submitComplaint();

}

}

/* ===== START LISTEN ===== */

function startListening(){

startWave();

screenText.innerText =

selectedLanguage==="telugu"

?

"🎤 పంట పేరు చెప్పండి\n\n🌶️ మిర్చి\n🌿 పత్తి\n🌾 వరి\n🌽 మొక్కజొన్న"

:

"🎤 Say Crop Name\n\n🌶️ Chilli\n🌿 Cotton\n🌾 Paddy\n🌽 Maize";

try{

recognition.stop();

}catch(e){}

setTimeout(()=>{

try{

recognition.start();

}catch(err){

console.log(err);

}

},300);

/* ===== 5 SECOND FAIL ===== */

clearTimeout(window.voiceTimeout);

window.voiceTimeout = setTimeout(()=>{

if(currentStep==="crop"){

try{

recognition.stop();

}catch(e){}

screenText.innerText =

selectedLanguage==="telugu"

?

"❌ శబ్దం వినిపించలేదు\n\n🎤 మళ్లీ చెప్పండి"

:

"❌ No Voice Detected\n\n🎤 Say Again";

playAudio(

selectedLanguage==="telugu"
? "retry.m4a"
: "retry_en.m4a",

()=>{

startListening();

}

);

}

},5000);

}

/* ===== RESULT ===== */

recognition.onresult = (event)=>{

clearTimeout(window.voiceTimeout);

stopWave();

let text =
event.results[0][0]
.transcript
.toLowerCase()
.trim();

console.log(text);

/* STOP RESTART LOOP */

currentStep = "processing";

/* ===== PADDY ===== */

if(
text.includes("paddy") ||
text.includes("vari") ||
text.includes("vaari") ||
text.includes("వరి")
){

selectedCrop =
selectedLanguage==="telugu"
? "వరి"
: "Paddy";

cropDetected(
selectedLanguage==="telugu"
? "paddy.m4a"
: "paddy_en.m4a"
);

}

/* ===== COTTON ===== */

else if(
text.includes("cotton") ||
text.includes("pathi") ||
text.includes("patti") ||
text.includes("పత్తి")
){

selectedCrop =
selectedLanguage==="telugu"
? "పత్తి"
: "Cotton";

cropDetected(
selectedLanguage==="telugu"
? "cotton.m4a"
: "cotton_en.m4a"
);

}

/* ===== CHILLI ===== */

else if(
text.includes("mirchi") ||
text.includes("మిర్చి") ||
text.includes("chilli")
){

selectedCrop =
selectedLanguage==="telugu"
? "మిర్చి"
: "Chilli";

cropDetected(
selectedLanguage==="telugu"
? "chilli.m4a"
: "chilli_en.m4a"
);

}

/* ===== MAIZE ===== */

else if(
text.includes("mokkajonna") ||
text.includes("మొక్కజొన్న") ||
text.includes("maize")
){

selectedCrop =
selectedLanguage==="telugu"
? "మొక్కజొన్న"
: "Maize";

cropDetected(
selectedLanguage==="telugu"
? "maize.m4a"
: "maize_en.m4a"
);

}

/* ===== RETRY ===== */

else{

currentStep = "crop";

screenText.innerText =

selectedLanguage==="telugu"

?

"❌ పంట గుర్తించలేదు\n\n🎤 మళ్లీ చెప్పండి"

:

"❌ Crop Not Recognized\n\n🎤 Say Again";

playAudio(

selectedLanguage==="telugu"
? "retry.m4a"
: "retry_en.m4a",

()=>{

startListening();

}

);

}

};

/* ===== STOP LOOP ===== */

recognition.onerror = ()=>{

clearTimeout(window.voiceTimeout);

};

recognition.onend = ()=>{

clearTimeout(window.voiceTimeout);

};

/* ===== CROP ===== */

function cropDetected(audio){

screenText.innerText =

selectedLanguage==="telugu"

?

selectedCrop +
"\n\n1 - ఆకులు పసుపు\n2 - గోధుమ మచ్చలు\n3 - ఆకులు ముడుచుకోవడం\n4 - పురుగు దాడి\n\n9 - కంప్లైంట్"

:

selectedCrop +
"\n\n1 - Yellow Leaves\n2 - Brown Spots\n3 - Leaf Curl\n4 - Pest Attack\n\n9 - Complaint";

/* PLAY CROP AUDIO */

playAudio(audio,()=>{

/* AFTER CROP AUDIO */

currentStep = "symptom";

/* PLAY SYMPTOMS */

playSymptoms();

});

}

/* ===== PLAY SYMPTOMS ===== */

function playSymptoms(){

playAudio(

selectedLanguage==="telugu"
? "symptoms.m4a"
: "symptoms_en.m4a"

);

}

/* ===== SOLUTION ===== */

function giveSolution(name,audio){

currentStep = "complaint";

solutionBox.innerText =
"Fertilizer : " + name;

addSMS(selectedCrop,name);

screenText.innerText =

"📩 SMS Sent\n\n" +

"🌱 " + name +

"\n\n9 - Complaint\nAny Other Key - End";

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

/* ===== RECORD ===== */

function startComplaint(){

currentStep = "recording";

screenText.innerText =

"🎤 Recording Complaint\n\n5 - Submit";

startWave();

playAudio(

selectedLanguage==="telugu"
? "recording_instruction.m4a"
: "recording_instruction_en.m4a"

);

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

}

/* ===== SUBMIT ===== */

function submitComplaint(){

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

}

/* ===== END ===== */

function endCall(){

screenText.innerText =
"📞 Call Ended";

stopWave();

clearInterval(timerInterval);

}

/* ===== COMPLAINTS ===== */

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

/* ===== SCORE ===== */

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
