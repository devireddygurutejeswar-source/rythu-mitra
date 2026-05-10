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

/* CREATE */

currentAudio =
new Audio("audio/" + file);

/* BETTER AUDIO */

currentAudio.preload = "auto";

currentAudio.volume = 1.0;

currentAudio.currentTime = 0;

/* PLAY */

let playPromise =
currentAudio.play();

if(playPromise !== undefined){

playPromise
.then(()=>{

console.log(file + " playing");

})
.catch((e)=>{

console.log(e);

if(callback){

callback();

}

});

}

/* ENDED */

currentAudio.onended = ()=>{

setTimeout(()=>{

if(callback){

callback();

}

},100);

};

/* ERROR */

currentAudio.onerror = ()=>{

console.log(file + " missing");

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

playAudio("ringtone.m4a");

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

if(key==="1"){

selectedLanguage = "telugu";

screenText.innerHTML =

"🎤 <b>Say Crop Name</b><br><br>" +

"1️⃣ Paddy<br><br>" +

"2️⃣ Cotton<br><br>" +

"3️⃣ Chilli<br><br>" +

"4️⃣ Maize";

playAudio(
"telugu_crop.m4a",
()=>{

currentStep = "crop";

startListening();

}
);

}

else if(key==="2"){

selectedLanguage = "english";

screenText.innerHTML =

"🎤 <b>Say Crop Name</b><br><br>" +

"1️⃣ Paddy<br><br>" +

"2️⃣ Cotton<br><br>" +

"3️⃣ Chilli<br><br>" +

"4️⃣ Maize";

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

else if(currentStep === "symptoms"){

symptomTimeouts.forEach(
t=>clearTimeout(t)
);

symptomTimeouts = [];

stopCurrentAudio();

/* BUTTON 1 */

if(key==="1"){

showFertilizer(
"Urea",
selectedLanguage==="english"
? "urea_en.m4a"
: "urea.m4a"
);

}

/* BUTTON 2 */

else if(key==="2"){

showFertilizer(
"Mancozeb",
selectedLanguage==="english"
? "mancozeb_en.m4a"
: "mancozeb.m4a"
);

}

/* BUTTON 3 */

else if(key==="3"){

showFertilizer(
"Neem Oil",
selectedLanguage==="english"
? "neem_en.m4a"
: "neem.m4a"
);

}

/* BUTTON 4 */

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

else if(currentStep === "complaint"){

stopCurrentAudio();

/* RECORD */

if(key==="9"){

startComplaintRecording();

}

/* END */

else{

endCall();

}

}

/* ===== RECORDING ===== */

else if(currentStep === "recording"){

if(key==="5"){

stopComplaintRecording();

}

}

}

/* ===== START LISTEN ===== */

function startListening(){

startWave();

screenText.innerHTML =

"🎤 <b>Listening...</b><br><br>" +

"1️⃣ Paddy<br><br>" +

"2️⃣ Cotton<br><br>" +

"3️⃣ Chilli<br><br>" +

"4️⃣ Maize";

setTimeout(()=>{

try{

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

/* PADDY */

if(
text.includes("paddy") ||
text.includes("vari") ||
text.includes("వరి")
){

selectedCrop = "Paddy";

cropDetected();

}

/* COTTON */

else if(
text.includes("cotton") ||
text.includes("cotten")
){

selectedCrop = "Cotton";

cropDetected();

}

/* CHILLI */

else if(
text.includes("chilli") ||
text.includes("chili")
){

selectedCrop = "Chilli";

cropDetected();

}

/* MAIZE */

else if(
text.includes("maize") ||
text.includes("maze")
){

selectedCrop = "Maize";

cropDetected();

}

/* RETRY */

else{

screenText.innerHTML =

"❌ <b>Crop Not Recognized</b><br><br>" +

"🎤 Say Again<br><br>" +

"1️⃣ Paddy<br><br>" +

"2️⃣ Cotton<br><br>" +

"3️⃣ Chilli<br><br>" +

"4️⃣ Maize";

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

screenText.innerHTML =

"🌾 <b>" + selectedCrop + " Detected</b><br><br>" +

"1️⃣ Yellow Leaves<br><br>" +

"2️⃣ Brown Spots<br><br>" +

"3️⃣ Leaf Curl<br><br>" +

"4️⃣ Pest Attack";

let cropAudio = "";

/* AUDIO */

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

}

/* ===== PLAY SYMPTOMS ===== */

function playSymptoms(){

currentStep = "symptoms";

screenText.innerHTML =

"🌾 <b>" + selectedCrop + " Detected</b><br><br>" +

"1️⃣ Yellow Leaves<br><br>" +

"2️⃣ Brown Spots<br><br>" +

"3️⃣ Leaf Curl<br><br>" +

"4️⃣ Pest Attack";

/* CLEAR */

symptomTimeouts.forEach(
t=>clearTimeout(t)
);

symptomTimeouts = [];

/* FILES */

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

/* CONTINUOUS */

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

symptomTimeouts = [];

stopCurrentAudio();

/* BEAUTIFUL SCREEN */

screenText.innerHTML =

"📩 <b>SMS Sent To Mobile</b><br><br>" +

"🌱 <b>Fertilizer :</b> " + name +

"<br><br><hr><br>" +

"🎤 <b>Press 9 To Record Complaint</b><br><br>" +

"📞 <b>Press Any Other Key To End Call</b>";

solutionBox.innerText = "";

/* IMPORTANT */

currentStep = "complaint";

/* PLAY */

playAudio(audio,()=>{

playAudio(

selectedLanguage==="english"
? "press9_en.m4a"
: "press9.m4a"

);

});

}

/* ===== RECORD COMPLAINT ===== */

async function startComplaintRecording(){

currentStep = "recording";

screenText.innerHTML =

"🎤 <b>Recording Complaint...</b><br><br>" +

"Press 5 To Submit";

/* AUDIO FIRST */

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

);

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

screenText.innerHTML =
"📞 <b>Call Ended</b>";

currentStep = "idle";

}
