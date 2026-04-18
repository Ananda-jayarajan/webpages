
const QUIZ_DATA = {
  Europe: {
    title: "Europe Countries Quiz",
    color: "#1010d8",
    center: [15, 54],
    scale: 520,
    box: [-25, 33, 45, 72],
    countries: ['Albania','Andorra','Austria','Belarus','Belgium','Bosnia and Herzegovina','Bulgaria','Croatia','Czech Republic','Denmark','Estonia','Finland','France','Germany','Greece','Hungary','Iceland','Ireland','Italy','Kosovo','Latvia','Liechtenstein','Lithuania','Luxembourg','Malta','Moldova','Monaco','Montenegro','Netherlands','North Macedonia','Norway','Poland','Portugal','Romania','Russia','San Marino','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Ukraine','United Kingdom','Vatican City'],
    aliases: {'uk': 'United Kingdom','u k':'United Kingdom','czechia':'Czech Republic','turkey':'Türkiye','turkiye':'Türkiye','türkiye':'Türkiye'},
  },
  Asia: {
    title: "Asia Countries Quiz",
    color: "#e30000",
    center: [95, 34],
    scale: 360,
    box: [25, -10, 150, 70],
    countries: ['Afghanistan','Armenia','Azerbaijan','Bahrain','Bangladesh','Bhutan','Brunei','Cambodia','China','Cyprus','Georgia','India','Indonesia','Iran','Iraq','Israel','Japan','Jordan','Kazakhstan','Kuwait','Kyrgyzstan','Laos','Lebanon','Malaysia','Maldives','Mongolia','Myanmar','Nepal','North Korea','Oman','Pakistan','Philippines','Qatar','Saudi Arabia','Singapore','South Korea','Sri Lanka','Syria','Taiwan','Tajikistan','Thailand','Türkiye','Turkmenistan','United Arab Emirates','Uzbekistan','Vietnam','Yemen','Timor-Leste'],
    aliases: {'east timor':'Timor-Leste','timor leste':'Timor-Leste','uae':'United Arab Emirates','south korea':'South Korea','north korea':'North Korea','turkey':'Türkiye','turkiye':'Türkiye','türkiye':'Türkiye'},
  },
  Africa: {
    title: "Africa Countries Quiz",
    color: "#a000a8",
    center: [20, 5],
    scale: 400,
    box: [-20, -36, 55, 38],
    countries: ['Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cameroon','Cape Verde','Central African Republic','Chad','Comoros','Democratic Republic of the Congo','Djibouti','Egypt','Equatorial Guinea','Eritrea','Eswatini','Ethiopia','Gabon','Gambia','Ghana','Guinea','Guinea-Bissau',"Côte d'Ivoire",'Kenya','Lesotho','Liberia','Libya','Madagascar','Malawi','Mali','Mauritania','Mauritius','Morocco','Mozambique','Namibia','Niger','Nigeria','Republic of the Congo','Rwanda','São Tomé and Príncipe','Senegal','Seychelles','Sierra Leone','Somalia','South Africa','South Sudan','Sudan','Tanzania','Togo','Tunisia','Uganda','Zambia','Zimbabwe'],
    aliases: {'ivory coast':"Côte d'Ivoire",'cote divoire':"Côte d'Ivoire",'dr congo':'Democratic Republic of the Congo','drc':'Democratic Republic of the Congo','congo brazzaville':'Republic of the Congo','sao tome and principe':'São Tomé and Príncipe'},
  },
  "North America": {
    title: "North America Countries Quiz",
    color: "#f59a00",
    center: [-95, 31],
    scale: 250,
    box: [-170, 5, -52, 85],
    countries: ['Antigua and Barbuda','Bahamas','Barbados','Belize','Canada','Costa Rica','Cuba','Dominica','Dominican Republic','El Salvador','Grenada','Guatemala','Haiti','Honduras','Jamaica','Mexico','Nicaragua','Panama','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Trinidad and Tobago','United States'],
    aliases: {'usa':'United States','us':'United States'},
  },
  "South America": {
    title: "South America Countries Quiz",
    color: "#0a9b00",
    center: [-60, -17],
    scale: 430,
    box: [-92, -58, -28, 15],
    countries: ['Argentina','Bolivia','Brazil','Chile','Colombia','Ecuador','Guyana','Paraguay','Peru','Suriname','Uruguay','Venezuela'],
    aliases: {},
  },
  Oceania: {
    title: "Oceania Countries Quiz",
    color: "#00a7a7",
    center: [150, -18],
    scale: 240,
    box: [105, -50, 185, 10],
    countries: ['Australia','Fiji','Kiribati','Marshall Islands','Micronesia','Nauru','New Zealand','Palau','Papua New Guinea','Samoa','Solomon Islands','Tonga','Tuvalu','Vanuatu'],
    aliases: {'federated states of micronesia':'Micronesia'},
  }
};
const GEO_NAME_MAP = {'Czechia':'Czech Republic','Russian Federation':'Russia','Turkey':'Türkiye','Viet Nam':'Vietnam','Lao PDR':'Laos','Syrian Arab Republic':'Syria','United States of America':'United States','Timor-Leste':'Timor-Leste','Congo':'Republic of the Congo','Dem. Rep. Congo':'Democratic Republic of the Congo',"Côte d'Ivoire":"Côte d'Ivoire",'Eswatini':'Eswatini','Micronesia':'Micronesia','Moldova':'Moldova','North Macedonia':'North Macedonia','Dominican Rep.':'Dominican Republic','Bosnia and Herz.':'Bosnia and Herzegovina','Central African Rep.':'Central African Republic','S. Sudan':'South Sudan','Eq. Guinea':'Equatorial Guinea','Solomon Is.':'Solomon Islands'};
function normalize(text){return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();}
const continent=document.body.dataset.continent||'Europe';
const config=QUIZ_DATA[continent];
const answerMap=new Map();
config.countries.forEach(c=>answerMap.set(normalize(c),c));
Object.entries(config.aliases||{}).forEach(([k,v])=>answerMap.set(normalize(k),v));
document.getElementById('pageTitle').textContent=config.title;document.getElementById('continentHeading').textContent=continent;document.documentElement.style.setProperty('--continent-color',config.color);
const listEl=document.getElementById('answersList');config.countries.forEach(c=>{const div=document.createElement('div');div.className='slot';div.dataset.country=c;div.textContent='____________';listEl.appendChild(div);});
const guessed=new Set();let remaining=15*60,timer=null,running=false,finished=false;
const timerEl=document.getElementById('timer'),scoreEl=document.getElementById('score'),totalEl=document.getElementById('total'),inputEl=document.getElementById('answerInput'),statusEl=document.getElementById('status'),resultEl=document.getElementById('result'),mapWrap=document.getElementById('mapWrap'),svg=d3.select('#map');
totalEl.textContent=config.countries.length;timerEl.textContent='15:00';
function formatTime(sec){return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}
function setStatus(msg='',cls=''){statusEl.textContent=msg;statusEl.className='status '+cls;}
function updateScore(){scoreEl.textContent=guessed.size;}
function updateCell(country,cls){const el=document.querySelector(`.slot[data-country="${CSS.escape(country)}"]`);if(!el)return;el.textContent=country;el.className=`slot ${cls}`;}
const featureNodes=new Map();
function registerFeature(canonical,node){if(!canonical)return;if(!featureNodes.has(canonical))featureNodes.set(canonical,[]);featureNodes.get(canonical).push(node);} 
function colorCountry(country,cls){(featureNodes.get(country)||[]).forEach(node=>{node.classList.remove('guessed','missed');node.classList.add(cls);});}
function canonicalGeoName(name){if(!name)return null;if(GEO_NAME_MAP[name])return GEO_NAME_MAP[name];if(config.countries.includes(name))return name;const n=normalize(name);if(answerMap.has(n))return answerMap.get(n);return null;}
async function loadMap(){const geo=await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');const countries=topojson.feature(geo,geo.objects.countries).features;const projection=d3.geoMercator().center(config.center).scale(config.scale).translate([650,380]);const path=d3.geoPath(projection);const g=svg.append('g');svg.attr('viewBox','0 0 1300 760');g.selectAll('path').data(countries).join('path').attr('d',path).attr('class',d=>{const name=d.properties?.name||d.properties?.NAME||d.properties?.admin||'';const canonical=canonicalGeoName(name);return canonical&&config.countries.includes(canonical)?'country-shape in-region':'country-shape out-region';}).each(function(d){const name=d.properties?.name||d.properties?.NAME||d.properties?.admin||'';const canonical=canonicalGeoName(name);if(canonical&&config.countries.includes(canonical))registerFeature(canonical,this);});const p0=projection([config.box[0],config.box[1]]), p1=projection([config.box[2],config.box[3]]);const minX=Math.min(p0[0],p1[0])-35,maxX=Math.max(p0[0],p1[0])+35,minY=Math.min(p0[1],p1[1])-35,maxY=Math.max(p0[1],p1[1])+35;svg.attr('viewBox',`${minX} ${minY} ${maxX-minX} ${maxY-minY}`);document.getElementById('mapNote').textContent='Click map to zoom';}
function startQuiz(){if(running||finished)return;running=true;inputEl.disabled=false;document.getElementById('startBtn').disabled=true;document.getElementById('giveUpBtn').disabled=false;inputEl.focus();setStatus('Quiz started.','ok');timer=setInterval(()=>{remaining--;timerEl.textContent=formatTime(remaining);if(remaining<=0)finishQuiz(false);},1000);}
function finishQuiz(perfect){if(finished)return;finished=true;running=false;clearInterval(timer);inputEl.disabled=true;document.getElementById('startBtn').disabled=true;document.getElementById('giveUpBtn').disabled=true;config.countries.forEach(c=>{if(!guessed.has(c)){updateCell(c,'missed');colorCountry(c,'missed');}});const pct=((guessed.size/config.countries.length)*100).toFixed(1);resultEl.innerHTML=perfect?`<strong>Perfect!</strong> You got all ${config.countries.length}.`:`<strong>Quiz finished.</strong> Score: ${guessed.size}/${config.countries.length} (${pct}%).`;resultEl.style.display='block';setStatus(perfect?'All correct.':'Quiz ended.',perfect?'ok':'err');}
function resetQuiz(){clearInterval(timer);remaining=15*60;guessed.clear();running=false;finished=false;timerEl.textContent='15:00';inputEl.value='';inputEl.disabled=true;document.getElementById('startBtn').disabled=false;document.getElementById('giveUpBtn').disabled=true;resultEl.style.display='none';resultEl.innerHTML='';setStatus('');updateScore();document.querySelectorAll('.slot').forEach(el=>{el.textContent='____________';el.className='slot';});document.querySelectorAll('.country-shape.in-region').forEach(el=>el.classList.remove('guessed','missed'));}
function submitAnswer(v){if(!running||finished)return;const country=answerMap.get(normalize(v));if(!country)return setStatus('Not recognized.','err');if(guessed.has(country))return setStatus('Already guessed.','err');guessed.add(country);updateCell(country,'guessed');colorCountry(country,'guessed');updateScore();setStatus(`Correct: ${country}`,'ok');if(guessed.size===config.countries.length)finishQuiz(true);}
document.getElementById('startBtn').onclick=startQuiz;document.getElementById('giveUpBtn').onclick=()=>finishQuiz(false);document.getElementById('resetBtn').onclick=resetQuiz;inputEl.addEventListener('keydown',e=>{if(e.key==='Enter'){submitAnswer(inputEl.value);inputEl.value='';}});mapWrap.addEventListener('click',()=>mapWrap.classList.toggle('zoomed'));updateScore();loadMap().catch(err=>{document.getElementById('mapNote').textContent='Map failed to load';console.error(err);});
