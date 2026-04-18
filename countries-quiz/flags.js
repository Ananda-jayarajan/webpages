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


const countryCodeMap = {
  "Afghanistan":"af","Albania":"al","Algeria":"dz","Andorra":"ad","Angola":"ao",
  "Antigua and Barbuda":"ag","Argentina":"ar","Armenia":"am","Australia":"au","Austria":"at",
  "Azerbaijan":"az","Bahamas":"bs","Bahrain":"bh","Bangladesh":"bd","Barbados":"bb",
  "Belarus":"by","Belgium":"be","Belize":"bz","Benin":"bj","Bhutan":"bt",
  "Bolivia":"bo","Bosnia and Herzegovina":"ba","Botswana":"bw","Brazil":"br","Brunei":"bn",
  "Bulgaria":"bg","Burkina Faso":"bf","Burundi":"bi","Cambodia":"kh","Cameroon":"cm",
  "Canada":"ca","Cape Verde":"cv","Central African Republic":"cf","Chad":"td","Chile":"cl",
  "China":"cn","Colombia":"co","Comoros":"km","Republic of the Congo":"cg",
  "Democratic Republic of the Congo":"cd","Costa Rica":"cr","Côte d'Ivoire":"ci",
  "Croatia":"hr","Cuba":"cu","Cyprus":"cy","Czech Republic":"cz","Denmark":"dk",
  "Djibouti":"dj","Dominica":"dm","Dominican Republic":"do","Ecuador":"ec","Egypt":"eg",
  "El Salvador":"sv","Equatorial Guinea":"gq","Eritrea":"er","Estonia":"ee","Eswatini":"sz",
  "Ethiopia":"et","Fiji":"fj","Finland":"fi","France":"fr","Gabon":"ga","Gambia":"gm",
  "Georgia":"ge","Germany":"de","Ghana":"gh","Greece":"gr","Grenada":"gd",
  "Guatemala":"gt","Guinea":"gn","Guinea-Bissau":"gw","Guyana":"gy","Haiti":"ht",
  "Honduras":"hn","Hungary":"hu","Iceland":"is","India":"in","Indonesia":"id",
  "Iran":"ir","Iraq":"iq","Ireland":"ie","Israel":"il","Italy":"it","Jamaica":"jm",
  "Japan":"jp","Jordan":"jo","Kazakhstan":"kz","Kenya":"ke","Kiribati":"ki",
  "Kuwait":"kw","Kyrgyzstan":"kg","Laos":"la","Latvia":"lv","Lebanon":"lb",
  "Lesotho":"ls","Liberia":"lr","Libya":"ly","Liechtenstein":"li","Lithuania":"lt",
  "Luxembourg":"lu","Madagascar":"mg","Malawi":"mw","Malaysia":"my","Maldives":"mv",
  "Mali":"ml","Malta":"mt","Marshall Islands":"mh","Mauritania":"mr","Mauritius":"mu",
  "Mexico":"mx","Micronesia":"fm","Moldova":"md","Monaco":"mc","Mongolia":"mn",
  "Montenegro":"me","Morocco":"ma","Mozambique":"mz","Myanmar":"mm","Namibia":"na",
  "Nauru":"nr","Nepal":"np","Netherlands":"nl","New Zealand":"nz","Nicaragua":"ni",
  "Niger":"ne","Nigeria":"ng","North Korea":"kp","North Macedonia":"mk","Norway":"no",
  "Oman":"om","Pakistan":"pk","Palau":"pw","Panama":"pa","Papua New Guinea":"pg",
  "Paraguay":"py","Peru":"pe","Philippines":"ph","Poland":"pl","Portugal":"pt",
  "Qatar":"qa","Romania":"ro","Russia":"ru","Rwanda":"rw",
  "Saint Kitts and Nevis":"kn","Saint Lucia":"lc","Saint Vincent and the Grenadines":"vc",
  "Samoa":"ws","San Marino":"sm","São Tomé and Príncipe":"st","Saudi Arabia":"sa",
  "Senegal":"sn","Serbia":"rs","Seychelles":"sc","Sierra Leone":"sl","Singapore":"sg",
  "Slovakia":"sk","Slovenia":"si","Solomon Islands":"sb","Somalia":"so","South Africa":"za",
  "South Korea":"kr","South Sudan":"ss","Spain":"es","Sri Lanka":"lk","Sudan":"sd",
  "Suriname":"sr","Sweden":"se","Switzerland":"ch","Syria":"sy","Taiwan":"tw",
  "Tajikistan":"tj","Tanzania":"tz","Thailand":"th","Timor-Leste":"tl","Togo":"tg",
  "Tonga":"to","Trinidad and Tobago":"tt","Tunisia":"tn","Türkiye":"tr","Turkey":"tr",
  "Turkmenistan":"tm","Tuvalu":"tv","Uganda":"ug","Ukraine":"ua","United Arab Emirates":"ae",
  "United Kingdom":"gb","United States":"us","Uruguay":"uy","Uzbekistan":"uz",
  "Vanuatu":"vu","Vatican City":"va","Venezuela":"ve","Vietnam":"vn","Yemen":"ye",
  "Zambia":"zm","Zimbabwe":"zw"
};

function countryToCode(name){
  return countryCodeMap[name] || "un";
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
