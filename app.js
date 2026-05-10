/* ===== ELEMENTS ===== */

const screenText = document.getElementById("screenText");
const solutionBox = document.getElementById("solution");
const waves = document.getElementById("waves");
const smsBox = document.getElementById("smsBox");
const historyBox = document.getElementById("history");
const scoreBoard = document.getElementById("scoreBoard");

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
let voiceTimeout;

/* ===== SCORES ===== */

let scores = {
  Urea: 9,
  Mancozeb: 8,
  "Neem Oil": 7,
  Spinosad: 6
};

/* ===== SPEECH ===== */

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.interimResults = false;
recognition.maxAlternatives = 5;

/* ===== AUDIO ===== */

function playAudio(file, callback){

  /* CLEAR OLD AUDIO */

  if(currentAudio){

    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onended = null;
    currentAudio.src = "";

  }

  /* CREATE NEW AUDIO */

  currentAudio = new Audio();

  currentAudio.src = "audio/" + file;

  currentAudio.preload = "auto";

  currentAudio.load();

  currentAudio.play().catch(err=>{

    console.log(err);

  });

  currentAudio.onended = ()=>{

    setTimeout(()=>{

      if(callback){

        callback();

      }

    },200);

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

  clearInterval(timerInterval);

  seconds = 0;

  document.getElementById("timer").innerText =
  "00:00";

  screenText.innerHTML =
  "📞 Calling...";

  startWave();

  currentAudio =
  new Audio("audio/ringtone.m4a");

  currentAudio.play();

  setTimeout(()=>{

    currentAudio.pause();

    timerInterval = setInterval(()=>{

      seconds++;

      let mins =
      String(Math.floor(seconds/60))
      .padStart(2,"0");

      let secs =
      String(seconds%60)
      .padStart(2,"0");

      document.getElementById("timer").innerText =
      mins + ":" + secs;

    },1000);

    screenText.innerHTML =
    "1 - Telugu<br><br>2 - English";

    playAudio("welcome.m4a");

  },3000);

}

/* ===== BUTTON ===== */

function pressKey(num){

  /* ===== LANGUAGE ===== */

  if(currentStep==="language"){

    /* ===== TELUGU ===== */

    if(num===1){

      selectedLanguage = "telugu";

      recognition.lang = "te-IN";

      currentStep = "crop";

      screenText.innerHTML =

      "🎤 పంట పేరు చెప్పండి<br><br>" +

      "🌶️ మిర్చి<br><br>" +

      "🌿 పత్తి<br><br>" +

      "🌾 వరి<br><br>" +

      "🌽 మొక్కజొన్న";

      playAudio("telugu_crop.m4a");

      currentAudio.onended = ()=>{

        startListening();

      };

      return;

    }

    /* ===== ENGLISH ===== */

    if(num===2){

      selectedLanguage = "english";

      recognition.lang = "en-IN";

      currentStep = "crop";

      screenText.innerHTML =

      "🎤 Say Crop Name<br><br>" +

      "🌶️ Chilli<br><br>" +

      "🌿 Cotton<br><br>" +

      "🌾 Paddy<br><br>" +

      "🌽 Maize";

      playAudio("english_crop.m4a");

      currentAudio.onended = ()=>{

        startListening();

      };

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

    }else{

      endCall();

    }

  }

  /* ===== SUBMIT ===== */

  if(currentStep==="recording" && num===5){

    submitComplaint();

  }

}

/* ===== START LISTEN ===== */

function startListening(){

  clearTimeout(voiceTimeout);

  currentStep = "crop";

  startWave();

  try{

    recognition.start();

  }catch(err){

    console.log(err);

  }

  /* WAIT 5 SEC */

  voiceTimeout = setTimeout(()=>{

    if(currentStep==="crop"){

      try{

        recognition.stop();

      }catch(e){}

      stopWave();

      screenText.innerHTML =

      selectedLanguage==="telugu"

      ?

      "❌ పంట గుర్తించలేదు<br><br>" +
      "🎤 మళ్లీ చెప్పండి"

      :

      "❌ Crop Not Recognized<br><br>" +
      "🎤 Please Speak Again";

      playAudio(

      selectedLanguage==="telugu"
      ? "retry.m4a"
      : "retry_english.m4a",

      ()=>{

        startListening();

      }

      );

    }

  },5000);

}

/* ===== RESULT ===== */

recognition.onresult = (event)=>{

  clearTimeout(voiceTimeout);

  stopWave();

  let text =
  event.results[0][0]
  .transcript
  .toLowerCase()
  .trim();

  currentStep = "processing";

  /* ===== MIRCHI ===== */

  if(
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

  /* ===== COTTON ===== */

  else if(
  text.includes("pathi") ||
  text.includes("patti") ||
  text.includes("పత్తి") ||
  text.includes("cotton")
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

  /* ===== PADDY ===== */

  else if(
  text.includes("vari") ||
  text.includes("vaari") ||
  text.includes("వరి") ||
  text.includes("paddy")
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

  /* ===== NOT RECOGNIZED ===== */

  else{

    currentStep = "crop";

    stopWave();

    screenText.innerHTML =

    selectedLanguage==="telugu"

    ?

    "❌ పంట గుర్తించలేదు<br><br>" +
    "🎤 మళ్లీ చెప్పండి"

    :

    "❌ Crop Not Recognized<br><br>" +
    "🎤 Please Speak Again";

    playAudio(

    selectedLanguage==="telugu"
    ? "retry.m4a"
    : "retry_english.m4a",

    ()=>{

      startListening();

    }

    );

  }

};

/* ===== ERROR ===== */

recognition.onerror = ()=>{};

/* ===== END ===== */

recognition.onend = ()=>{

  stopWave();

};

/* ===== CROP DETECT ===== */

function cropDetected(audio){

  clearTimeout(voiceTimeout);

  stopWave();

  try{

    recognition.stop();

  }catch(e){}

  currentStep = "symptom";

  screenText.innerHTML =

  selectedLanguage==="telugu"

  ?

  "✅ " + selectedCrop +

  "<br><br>" +

  "1 - ఆకులు పసుపు" +

  "<br><br>" +

  "2 - గోధుమ మచ్చలు" +

  "<br><br>" +

  "3 - ఆకులు ముడుచుకోవడం" +

  "<br><br>" +

  "4 - పురుగు దాడి"

  :

  "✅ " + selectedCrop +

  "<br><br>" +

  "1 - Yellow Leaves" +

  "<br><br>" +

  "2 - Brown Spots" +

  "<br><br>" +

  "3 - Leaf Curl" +

  "<br><br>" +

  "4 - Pest Attack";

  /* PLAY CROP AUDIO */

  playAudio(audio,()=>{

    /* YELLOW */

    playAudio(

    selectedLanguage==="telugu"
    ? "yellow.m4a"
    : "yellow_en.m4a",

    ()=>{

      /* SPOTS */

      playAudio(

      selectedLanguage==="telugu"
      ? "spots.m4a"
      : "spots_en.m4a",

      ()=>{

        /* CURL */

        playAudio(

        selectedLanguage==="telugu"
        ? "curl.m4a"
        : "curl_en.m4a",

        ()=>{

          /* PEST */

          playAudio(

          selectedLanguage==="telugu"
          ? "pest.m4a"
          : "pest_en.m4a"

          );

        });

      });

    });

  });

}

/* ===== SOLUTION ===== */

function giveSolution(name,audio){

  currentStep = "complaint";

  solutionBox.innerText =
  "Fertilizer : " + name;

  addSMS(selectedCrop,name);

  playAudio(audio,()=>{

    screenText.innerHTML =

    "📩 SMS Sent<br><br>" +

    "🌱 Fertilizer : " + name +

    "<br><br>" +

    "🎤 Press 9 For Complaint" +

    "<br><br>" +

    "📞 Any Other Key To End Call";

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

  <br><br>

  ${s.time}

  </div>

  `).join("");

}

/* ===== COMPLAINT ===== */

function startComplaint(){

  currentStep = "recording";

  screenText.innerHTML =

  "🎤 Recording Complaint<br><br>" +
  "Press 5 To Submit";

  startWave();

  playAudio(

  selectedLanguage==="telugu"
  ? "recording_instruction.m4a"
  : "recording_instruction_en.m4a",

  ()=>{

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

  });

}

/* ===== SUBMIT ===== */

function submitComplaint(){

  if(mediaRecorder){

    mediaRecorder.stop();

  }

  screenText.innerHTML =

  "✅ Complaint Submitted<br><br>" +
  "📞 Call Ended";

  stopWave();

  playAudio(

  selectedLanguage==="telugu"
  ? "submitted.m4a"
  : "submitted_en.m4a"

  );

  clearInterval(timerInterval);

}

/* ===== END ===== */

function endCall(){

  screenText.innerHTML =
  "📞 Call Ended";

  stopWave();

  clearInterval(timerInterval);

}

/* ===== HISTORY ===== */

function addComplaint(audioURL){

  let complaints =
  JSON.parse(
  localStorage.getItem("complaints")
  ) || [];

  complaints.push({

    message:
    "Complaint Recorded",

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
    <h2>🎤 Complaint Recordings</h2>

    <div class="message">
    No Complaint Yet
    </div>
    `;

    return;

  }

  historyBox.innerHTML =

  `<h2>🎤 Complaint Recordings</h2>` +

  complaints.map(c=>`

  <div class="message">

  ${c.message}

  <br><br>

  <audio controls
  src="${c.audio}">
  </audio>

  <br><br>

  ${c.time}

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
