const countries = [
  "United States","India","France","Germany","Brazil","Canada","Japan","Australia",
  // 👉 replace with full 196 list later
];

const aliases = {
  "usa":"United States",
  "us":"United States",
  "uk":"United Kingdom",
  "turkey":"Türkiye",
  "turkiye":"Türkiye",
  "türkiye":"Türkiye"
};

const flagImg = document.getElementById("flagImg");
const input = document.getElementById("answerInput");
const scoreEl = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const giveUpBtn = document.getElementById("giveUpBtn");
const status = document.getElementById("status");

let index = 0;
let score = 0;
let timer;
let time = 600; // 10 min

function normalize(s){
  return s.toLowerCase().trim();
}

function loadFlag(){
  const country = countries[index];
  const code = countryToCode(country);
  flagImg.src = `https://flagcdn.com/w320/${code}.png`;
}

function countryToCode(name){
  const map = {
    "United States":"us",
    "India":"in",
    "France":"fr",
    "Germany":"de",
    "Brazil":"br",
    "Canada":"ca",
    "Japan":"jp",
    "Australia":"au"
  };
  return map[name] || "un";
}

function startQuiz(){
  input.disabled = false;
  startBtn.disabled = true;
  giveUpBtn.disabled = false;
  loadFlag();

  timer = setInterval(()=>{
    time--;
    let m = Math.floor(time/60);
    let s = time%60;
    document.getElementById("timer").textContent =
      `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

    if(time<=0) endQuiz();
  },1000);
}

function checkAnswer(val){
  let ans = normalize(val);
  if(aliases[ans]) ans = aliases[ans];

  if(ans === countries[index]){
    score++;
    scoreEl.textContent = score;
    status.textContent = "Correct!";
    index++;
    if(index >= countries.length) return endQuiz();
    loadFlag();
  } else {
    status.textContent = "Wrong";
  }
}

function endQuiz(){
  clearInterval(timer);
  input.disabled = true;
  status.textContent = "Quiz finished!";
}

input.addEventListener("keydown",(e)=>{
  if(e.key==="Enter"){
    checkAnswer(input.value);
    input.value="";
  }
});

startBtn.onclick = startQuiz;
giveUpBtn.onclick = endQuiz;
