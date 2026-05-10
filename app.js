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

const smsHistory =
document.getElementById("smsHistory");

/* ===== VARIABLES ===== */

let currentStep = "idle";

let selectedLanguage = "";

let selectedCrop = "";

let currentAudio = null;

let timerInterval;

let seconds = 0;

let mediaRecorder;

let audioChunks = [];

let symptomTimeouts = [];

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

function stopCurrentAudio(){

if(currentAudio){

currentAudio.pause();

currentAudio.currentTime = 0;

}

}

function playAudio(file,callback){

stopCurrentAudio();

currentAudio =
new Audio("audio/" + file);

currentAudio.preload = "auto";

currentAudio.volume = 1.0;

currentAudio.currentTime = 0;

let playPromise =
currentAudio.play();

if(playPromise !== undefined){

playPromise.catch((e)=>{

console.log(e);

if(callback){

callback();

}

});

}

currentAudio.onended = ()=>{

setTimeout(()=>{

if(callback){

callback();

}

},50);

};

currentAudio.onerror = ()=>{

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

screenText.innerHTML =
"Calling...";

timerText.innerText =
"00:00";

startWave();

playAudio("ringtone.m4a");

setTimeout(()=>{

startTimer();

screenText.innerHTML =
"1 Telugu<br><br>2 English";

playAudio("welcome.m4a");

},3000);

}

/* ===== BUTTONS ===== */

function pressKey(key){

/* ===== LANGUAGE ===== */

if(currentStep==="language"){

if(key==="1"){

selectedLanguage="telugu";

screenText.innerHTML =

"🎤 <b>పంట పేరు చెప్పండి</b><br><br>" +

"1️⃣ వరి<br><br>" +

"2️⃣ పత్తి<br><br>" +

"3️⃣ మిర్చి<br><br>" +

"4️⃣ మొక్కజొన్న";

playAudio(
"telugu_crop.m4a",
()=>{

currentStep="crop";

startListening();

}
);

}

else if(key==="2"){

selectedLanguage="english";

screenText.innerHTML =

"🎤 <b>Say Crop Name</b><br><br>" +

"1️⃣ Paddy<br><br>" +

"2️⃣ Cotton<br><br>" +

"3️⃣ Chilli<br><br>" +

"4️⃣ Maize";

playAudio(
"english_crop.m4a",
()=>{

currentStep="crop";

startListening();

}
);

}

}

/* ===== SYMPTOMS ===== */

else if(currentStep==="symptoms"){

symptomTimeouts.forEach(
t=>clearTimeout(t)
);

symptomTimeouts=[];

stopCurrentAudio();

if(key==="1"){

showFertilizer(
"Urea",
selectedLanguage==="english"
? "urea_en.m4a"
: "urea.m4a"
);

}

else if(key==="2"){

showFertilizer(
"Mancozeb",
selectedLanguage==="english"
? "mancozeb_en.m4a"
: "mancozeb.m4a"
);

}

else if(key==="3"){

showFertilizer(
"Neem Oil",
selectedLanguage==="english"
? "neem_en.m4a"
: "neem.m4a"
);

}

else if(key==="4"){

showFertilizer(
"Spinosad",
selectedLanguage==="english"
? "spinosad_en.m4a"
: "spinosad.m4a"
);

}

}

/* ===== COMPLAINT ===== */

else if(currentStep==="complaint"){

stopCurrentAudio();

if(key==="9"){

startComplaintRecording();

}

else{

endCall();

}

}

/* ===== RECORDING ===== */

else if(currentStep==="recording"){

if(key==="5"){

stopComplaintRecording();

}

else if(key==="6"){

if(mediaRecorder &&
mediaRecorder.state==="recording"){

mediaRecorder.stop();

}

startComplaintRecording();

}

}

}

/* ===== LISTEN ===== */

function startListening(){

startWave();

screenText.innerHTML =

selectedLanguage==="english"

?

"🎤 <b>Listening...</b><br><br>" +

"1️⃣ Paddy<br><br>" +

"2️⃣ Cotton<br><br>" +

"3️⃣ Chilli<br><br>" +

"4️⃣ Maize"

:

"🎤 <b>వింటున్నాను...</b><br><br>" +

"1️⃣ వరి<br><br>" +

"2️⃣ పత్తి<br><br>" +

"3️⃣ మిర్చి<br><br>" +

"4️⃣ మొక్కజొన్న";

setTimeout(()=>{

try{

recognition.start();

}
catch(e){

console.log(e);

}

},1200);

}

/* ===== RESULT ===== */

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

selectedCrop =
selectedLanguage==="telugu"
? "వరి"
: "Paddy";

cropDetected();

}

/* ===== COTTON ===== */

else if(
text.includes("cotton") ||
text.includes("pathi") ||
text.includes("పత్తి")
){

selectedCrop =
selectedLanguage==="telugu"
? "పత్తి"
: "Cotton";

cropDetected();

}

/* ===== CHILLI ===== */

else if(
text.includes("chilli") ||
text.includes("mirchi") ||
text.includes("మిర్చి")
){

selectedCrop =
selectedLanguage==="telugu"
? "మిర్చి"
: "Chilli";

cropDetected();

}

/* ===== MAIZE ===== */

else if(
text.includes("maize") ||
text.includes("mokka jonna") ||
text.includes("మొక్కజొన్న")
){

selectedCrop =
selectedLanguage==="telugu"
? "మొక్కజొన్న"
: "Maize";

cropDetected();

}

/* ===== RETRY ===== */

else{

screenText.innerHTML =

selectedLanguage==="english"

?

"❌ <b>Crop Not Recognized</b><br><br>" +

"🎤 Say Again"

:

"❌ <b>పంట గుర్తించలేదు</b><br><br>" +

"🎤 మళ్లీ చెప్పండి";

playAudio(
selectedLanguage==="english"
? "retry_en.m4a"
: "retry.m4a"
);

setTimeout(()=>{

startListening();

},5000);

}

};

/* ===== CROP DETECTED ===== */

function cropDetected(){

screenText.innerHTML =

"🌾 <b>" + selectedCrop + " Detected</b><br><br>" +

"1️⃣ Yellow Leaves<br><br>" +

"2️⃣ Brown Spots<br><br>" +

"3️⃣ Leaf Curl<br><br>" +

"4️⃣ Pest Attack";

let cropAudio = "";

/* AUDIO */

if(
selectedCrop==="Paddy" ||
selectedCrop==="వరి"
){

cropAudio =
selectedLanguage==="english"
? "paddy_en.m4a"
: "paddy.m4a";

}

else if(
selectedCrop==="Cotton" ||
selectedCrop==="పత్తి"
){

cropAudio =
selectedLanguage==="english"
? "cotton_en.m4a"
: "cotton.m4a";

}

else if(
selectedCrop==="Chilli" ||
selectedCrop==="మిర్చి"
){

cropAudio =
selectedLanguage==="english"
? "chilli_en.m4a"
: "chilli.m4a";

}

else if(
selectedCrop==="Maize" ||
selectedCrop==="మొక్కజొన్న"
){

cropAudio =
selectedLanguage==="english"
? "maize_en.m4a"
: "maize.m4a";

}

playAudio(cropAudio,()=>{

playSymptoms();

});

}

/* ===== PLAY SYMPTOMS ===== */

function playSymptoms(){

currentStep="symptoms";

screenText.innerHTML =

"🌾 <b>" + selectedCrop + "</b><br><br>" +

"1️⃣ Yellow Leaves<br><br>" +

"2️⃣ Brown Spots<br><br>" +

"3️⃣ Leaf Curl<br><br>" +

"4️⃣ Pest Attack";

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

if(currentStep==="symptoms"){

playAudio(spots,()=>{

if(currentStep==="symptoms"){

playAudio(curl,()=>{

if(currentStep==="symptoms"){

playAudio(pest);

}

});

}

});

}

});

}

/* ===== FERTILIZER ===== */

function showFertilizer(name,audio){

symptomTimeouts.forEach(
t=>clearTimeout(t)
);

symptomTimeouts=[];

stopCurrentAudio();

/* DATE */

let today =
new Date()
.toLocaleString();

/* SMS HISTORY */

if(smsHistory){

smsHistory.innerHTML +=

"<div class='message'>" +

"📩 <b>SMS Sent</b><br><br>" +

"🌾 Crop : " + selectedCrop +

"<br><br>" +

"🌱 Fertilizer : " + name +

"<br><br>" +

"📅 " + today +

"</div>";

}

/* SCREEN */

screenText.innerHTML =

"📩 <b>SMS Sent To Mobile</b><br><br>" +

"🌾 Crop : " + selectedCrop +

"<br><br>" +

"🌱 Fertilizer : " + name +

"<br><br><hr><br>" +

"🎤 <b>Press 9 To Record Complaint</b><br><br>" +

"📞 <b>Press Any Other Key To End Call</b>";

currentStep="complaint";

/* AUDIO */

playAudio(audio,()=>{

playAudio(

selectedLanguage==="english"
? "press9_en.m4a"
: "press9.m4a"

);

});

}

/* ===== RECORD ===== */

async function startComplaintRecording(){

currentStep="recording";

screenText.innerHTML =

"🎤 <b>Recording Complaint...</b><br><br>" +

"5️⃣ Submit<br><br>" +

"6️⃣ Re-record";

playAudio(

selectedLanguage==="english"
? "recording_instruction_en.m4a"
: "recording_instruction.m4a",

async ()=>{

const stream =
await navigator.mediaDevices
.getUserMedia({audio:true});

mediaRecorder =
new MediaRecorder(stream);

audioChunks=[];

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

);

}

/* ===== STOP RECORD ===== */

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

/* ===== END ===== */

function endCall(){

stopTimer();

stopWave();

screenText.innerHTML =
"📞 <b>Call Ended</b>";

currentStep="idle";

}
