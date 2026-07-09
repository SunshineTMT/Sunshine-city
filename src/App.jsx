
import React,{useMemo,useState}from"react";
import{Home,Dumbbell,Droplets,Scale,Trophy,Save,Landmark,CircleDot,Heart,Sun,Building2,RotateCcw}from"lucide-react";

const START=new Date("2026-07-06T00:00:00"),END=new Date("2026-09-20T00:00:00");
const WEEKS=11,DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],CUP=26,GOAL_CUPS=5,START_WEIGHT=210,GOAL_WEIGHT=198;
const routine=[
{id:"chest",name:"Chest Press",sets:3,reps:12,level:8,goal:12},
{id:"tri",name:"Tricep Pushdown",sets:3,reps:12,level:5,goal:7},
{id:"lat",name:"Lat Pulldown",sets:3,reps:12,level:6,goal:8},
{id:"leg",name:"Leg Curls",sets:3,reps:25,level:5,goal:8}
];
const states=[
{label:"Not Started",cls:"empty"},{label:"1 Workout",cls:"one"},{label:"2 Workouts",cls:"two"},{label:"3 Workouts",cls:"three"},{label:"4 Workouts",cls:"four"},{label:"Rest Day",cls:"rest"},{label:"Cheat Day",cls:"cheat"},{label:"Rest + Cheat",cls:"split"}
];
const blank={days:{},water:{},weights:{},sets:{},protein:{},creatine:{},walk:{},notes:{},family:{}};
function load(){try{return JSON.parse(localStorage.getItem("sunshine-city-v11"))||blank}catch{return blank}}
function enc(d){return btoa(unescape(encodeURIComponent(JSON.stringify(d))))}
function dec(c){return JSON.parse(decodeURIComponent(escape(atob(c))))}

export default function App(){
const[screen,setScreen]=useState("city"),[data,setData]=useState(load),[save,setSave]=useState("");
const today=useMemo(()=>{const n=new Date();const diff=Math.floor((new Date(n.getFullYear(),n.getMonth(),n.getDate())-START)/86400000);const safe=Math.max(0,Math.min(diff,WEEKS*7-1));return{week:Math.floor(safe/7),day:safe%7,missionDay:safe+1}},[]);
const k=(w,d)=>`w${w}-d${d}`,wk=(w,t)=>`w${w}-${t}`,ck=k(today.week,today.day);
const state=states[data.days[ck]||0],daysLeft=Math.max(0,Math.ceil((END-new Date())/86400000));
const cups=data.water[ck]||0,oz=cups*CUP,hydrated=cups>=GOAL_CUPS;
const latest=Object.values(data.weights).map(Number).filter(Boolean).at(-1),lost=latest?START_WEIGHT-latest:0;
const setDone=routine.reduce((s,e)=>s+[1,2,3].filter(i=>data.sets[`${ck}-${e.id}-${i}`]).length,0),setTotal=12,ironDone=setDone===setTotal;
const checks=[hydrated,ironDone||data.days[ck]===5,!!data.protein[ck],!!data.creatine[ck],!!data.walk[ck]],power=checks.filter(Boolean).length;
const totals={workouts:Object.values(data.days).filter(v=>v>=1&&v<=4).length,rest:Object.values(data.days).filter(v=>v===5||v===7).length,cheat:Object.values(data.days).filter(v=>v===6||v===7).length,hydration:Object.values(data.water).filter(c=>c>=5).length};
function update(fn){setData(p=>{const n=structuredClone(p);fn(n);localStorage.setItem("sunshine-city-v11",JSON.stringify(n));return n})}
function toggle(section,key){update(n=>{n[section][key]=!n[section][key]})}
function setVal(section,key,val){update(n=>{n[section][key]=val})}
function addWater(a){update(n=>{n.water[ck]=Math.max(0,(n.water[ck]||0)+a)})}
function cycleDay(){update(n=>{n.days[ck]=((n.days[ck]||0)+1)%8})}
function resetToday(){if(!confirm("Reset today?"))return;update(n=>{["water","days","protein","creatine","walk","family","notes"].forEach(s=>delete n[s][ck]);Object.keys(n.sets).forEach(x=>{if(x.startsWith(ck))delete n.sets[x]})})}
function exportCode(){setSave(enc(data))}
function importCode(){try{const p=dec(save.trim());setData(p);localStorage.setItem("sunshine-city-v11",JSON.stringify(p));alert("Loaded.")}catch{alert("Bad save code.")}}
const districts=[
["mission","Mission Control",Home,`${power}/5 city power`,power>=3],
["iron","Iron District",Dumbbell,`${setDone}/${setTotal} sets`,ironDone],
["hydration","Hydration Bay",Droplets,`${oz} oz`,hydrated],
["scale","Scale Street",Scale,"Wed + Sat weigh-ins",!!(data.weights[wk(today.week,"wed")]||data.weights[wk(today.week,"sat")])],
["joan","The Joan",Landmark,"Marshall football bridge",false],
["diamond","Diamond District",CircleDot,"Fall baseball purpose",false],
["family","Family Park",Heart,"Dad mission",!!data.family[ck]],
["hq","Sunshine TMT HQ",Sun,"Brand command center",false],
["progress","Progress Board",Trophy,"Stats and streaks",totals.workouts>0],
["save","Save Garage",Save,"Backup code",false]
];
return <div className="app">
<div className="glow pink"/><div className="glow cyan"/>
<header className={`hero ${power===5?"litHero":""}`}><div className="skyline"/><p className="kicker">SUNSHINE CITY LIMITS</p><h1>Sunshine City</h1><p className="tag">Operation September • Training camp for life</p><div className="heroStats"><Stat label="mission day" value={today.missionDay}/><Stat label="days left" value={daysLeft} hot/><Stat label="city power" value={`${power}/5`}/></div></header>
{screen!=="city"&&<button className="back" onClick={()=>setScreen("city")}>← Back to City Map</button>}
{screen==="city"&&<><Card special title={power===5?"City fully lit.":"Build the city today."}><p className="muted">{state.label} • Hydration Bay {cups}/5 • Iron District {setDone}/{setTotal} sets • Weight {latest||START_WEIGHT} lb</p><Progress value={power*20}/><div className="miniGrid">{["Water","Iron","Protein","Creatine","Walk"].map((x,i)=><div key={x} className={`mini ${checks[i]?"done":""}`}>{checks[i]?"✅":"⬜"} {x}</div>)}</div></Card><section className="cityMap">{districts.map(([id,name,Icon,desc,lit])=><button key={id} className={`district ${lit?"lit":""}`} onClick={()=>setScreen(id)}><Building2 className="ghost" size={54}/><Icon className="icon" size={28}/><span>{name}</span><small>{desc}</small></button>)}</section></>}
{screen==="mission"&&<Card title={`Mission Control • ${DAYS[today.day]} • Week ${today.week+1}`}><div className="score"><Box label="Weight" val={`${latest||START_WEIGHT} lb`}/><Box label="Lost" val={`${lost.toFixed(1)} lb`}/><Box label="Water" val={`${cups}/5`}/><Box label="Iron" val={`${setDone}/${setTotal}`}/></div><button className={`big ${state.cls}`} onClick={cycleDay}>{state.label}<small>tap to cycle workout / rest / cheat</small></button><h3>Daily Checks</h3><div className="grid2"><Toggle active={data.walk[ck]} onClick={()=>toggle("walk",ck)}>Walk</Toggle><Toggle active={data.protein[ck]} onClick={()=>toggle("protein",ck)}>Protein</Toggle><Toggle active={data.creatine[ck]} onClick={()=>toggle("creatine",ck)}>Creatine</Toggle><Toggle active={data.family[ck]} onClick={()=>toggle("family",ck)}>Family</Toggle></div><h3>Notes</h3><textarea value={data.notes[ck]||""} onChange={e=>setVal("notes",ck,e.target.value)} placeholder="Quick note if needed..."/><button className="danger" onClick={resetToday}><RotateCcw size={16}/> Reset Today</button></Card>}
{screen==="iron"&&<Card title="Iron District"><p className="muted">Your Marcy MWM-4965 circuit is built in. Tap each set as you complete it.</p><Progress value={setDone/setTotal*100}/>{routine.map(ex=><div className="exercise" key={ex.id}><h3>{ex.name}</h3><p className="muted">3×{ex.reps} • Level {ex.level} • Goal {ex.goal}</p><div className="setRow">{[1,2,3].map(i=>{const sk=`${ck}-${ex.id}-${i}`;return <button key={sk} className={data.sets[sk]?"setDone":"setBtn"} onClick={()=>toggle("sets",sk)}>Set {i} {data.sets[sk]?"✅":""}</button>})}</div></div>)}{ironDone&&<div className="cash">💪 IRON DISTRICT COMPLETE</div>}</Card>}
{screen==="hydration"&&<Card title="Hydration Bay"><div className="tower"><div className="towerFill" style={{height:`${Math.min(100,cups/GOAL_CUPS*100)}%`}}/><span>{oz} oz</span></div><p className="muted">{cups} Sunshine cup(s) × 26 oz</p><Progress value={oz/130*100}/><div className="grid2"><button className="primary" onClick={()=>addWater(1)}>+26 oz</button><button onClick={()=>addWater(-1)}>-26 oz</button></div>{hydrated&&<div className="cash">🏆 HYDRATION BAY CASHED</div>}</Card>}
{screen==="scale"&&<Card title="Scale Street"><div className="grid2"><label><span>Wednesday weigh-in</span><input type="number" step="0.1" value={data.weights[wk(today.week,"wed")]||""} onChange={e=>setVal("weights",wk(today.week,"wed"),e.target.value)} placeholder="Weight"/></label><label><span>Saturday weigh-in</span><input type="number" step="0.1" value={data.weights[wk(today.week,"sat")]||""} onChange={e=>setVal("weights",wk(today.week,"sat"),e.target.value)} placeholder="Weight"/></label></div><h3>Weight Road</h3><p>Start: {START_WEIGHT} lb</p><p>Latest: {latest||"—"} lb</p><p>Goal: {GOAL_WEIGHT} lb</p><p>Lost: {lost.toFixed(1)} lb</p><Progress value={lost/(START_WEIGHT-GOAL_WEIGHT)*100}/></Card>}
{screen==="joan"&&<Placeholder title="The Joan" text="🏟️ The Joan is waiting. Marshall football is one of the bridge pieces."/>}
{screen==="diamond"&&<Placeholder title="Diamond District" text="⚾ First pitch ready. Fall baseball prep and purpose live here."/>}
{screen==="family"&&<Card title="Family Park"><p className="muted">Zander gets prep and shared sports moments. Isabella gets dedicated dad time in her world.</p><Toggle active={data.family[ck]} onClick={()=>toggle("family",ck)}>Family moment logged</Toggle></Card>}
{screen==="hq"&&<Placeholder title="Sunshine TMT HQ" text="☀️ HQ coming online. Betting cards, Diamond Watch, recaps, and records live here later."/>}
{screen==="progress"&&<><Card title="Progress Board"><p>Workout days: <strong>{totals.workouts}</strong></p><p>Hydration goal days: <strong>{totals.hydration}</strong></p><p>Rest days: <strong>{totals.rest}</strong></p><p>Cheat days: <strong>{totals.cheat}</strong></p></Card><Card title="Consistency Lights"><div className="grid77">{Array.from({length:WEEKS*7}).map((_,i)=>{const w=Math.floor(i/7),d=i%7,s=states[data.days[k(w,d)]||0];return <div key={i} className={`cell ${s.cls}`}/>})}</div></Card></>}
{screen==="save"&&<Card title="Save Garage"><p className="notice">Your app saves on this browser. Save code is your backup before updates.</p><button className="primary" onClick={exportCode}>Generate Save Code</button><textarea className="saveBox" value={save} onChange={e=>setSave(e.target.value)} placeholder="Generate or paste save code here"/><button onClick={importCode}>Load Save Code</button></Card>}
</div>
}
function Card({title,children,special}){return <section className={`card ${special?"special":""}`}><p className="kicker">SUNSHINE CITY</p><h2>{title}</h2>{children}</section>}
function Placeholder({title,text}){return <Card title={title}><div className="panel">{text}</div></Card>}
function Stat({label,value,hot}){return <div className={`stat ${hot?"hot":""}`}><strong>{value}</strong><span>{label}</span></div>}
function Progress({value}){return <div className="bar"><div className="fill" style={{width:`${Math.max(0,Math.min(100,value||0))}%`}}/></div>}
function Toggle({active,onClick,children}){return <button className={active?"checked":""} onClick={onClick}>{children} {active?"✅":""}</button>}
function Box({label,val}){return <div><span>{label}</span><strong>{val}</strong></div>}
