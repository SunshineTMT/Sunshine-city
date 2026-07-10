
import React,{useMemo,useState}from"react";
import{Home,Dumbbell,Droplets,Scale,Trophy,Save,Landmark,CircleDot,Heart,Sun,Building2,Palmtree,WalletCards,Utensils,Car,IceCreamBowl,Shield}from"lucide-react";

const START=new Date("2026-07-06"),END=new Date("2026-09-20"),VACATION=new Date("2026-08-15");
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],CUP=26,START_WEIGHT=210,GOAL_WEIGHT=198;
const routine=[["chest","Chest Press",12,8,12],["tri","Tricep Pushdown",12,5,7],["lat","Lat Pulldown",12,6,8],["leg","Leg Curls",25,5,8]];
const budget={food:425,iceCream:75,gas:80,jordan:200,deanna:200,buffer:100};
const paycheck=[["d0713","Jul 13","Deanna",60],["d0720","Jul 20","Deanna",60],["j0723","Jul 23","Jordan",190],["d0727","Jul 27","Deanna",60],["d0803","Aug 3","Deanna",60],["j0806","Aug 6","Jordan",190],["d0810","Aug 10","Deanna",60]];
const blank={water:{},days:{},weights:{},sets:{},protein:{},creatine:{},walk:{},family:{},notes:{},vacation:{safeCash:0,extra:0,paychecks:{},spent:{}}};
function load(){try{return {...blank,...JSON.parse(localStorage.getItem("sc-v12"))}}catch{return blank}}
function money(n){return "$"+Number(n||0).toFixed(0)}
function enc(d){return btoa(unescape(encodeURIComponent(JSON.stringify(d))))}
function dec(c){return JSON.parse(decodeURIComponent(escape(atob(c))))}

export default function App(){
 const[screen,setScreen]=useState("city"),[data,setData]=useState(load),[code,setCode]=useState("");
 const today=useMemo(()=>{const n=new Date();const diff=Math.floor((new Date(n.getFullYear(),n.getMonth(),n.getDate())-START)/86400000);const safe=Math.max(0,Math.min(diff,76));return{week:Math.floor(safe/7),day:safe%7,num:safe+1}},[]);
 const ck=`w${today.week}-d${today.day}`,wk=t=>`w${today.week}-${t}`;
 const cups=data.water[ck]||0,oz=cups*CUP,hydrated=cups>=5;
 const latest=Object.values(data.weights).map(Number).filter(Boolean).at(-1),lost=latest?START_WEIGHT-latest:0;
 const setDone=routine.reduce((s,[id])=>s+[1,2,3].filter(i=>data.sets[`${ck}-${id}-${i}`]).length,0),setTotal=12,iron=setDone===12;
 const vacDays=Math.max(0,Math.ceil((VACATION-new Date())/86400000));
 const paycheckSaved=paycheck.filter(p=>data.vacation?.paychecks?.[p[0]]).reduce((s,p)=>s+p[3],0);
 const vacSaved=paycheckSaved+Number(data.vacation?.safeCash||0)+Number(data.vacation?.extra||0);
 const spent=Object.values(data.vacation?.spent||{}).reduce((s,v)=>s+Number(v||0),0);
 const power=[hydrated,iron,!!data.protein[ck],!!data.creatine[ck],!!data.walk[ck]].filter(Boolean).length;
 const goal=1080;
 function update(fn){setData(p=>{const n=structuredClone(p);n.vacation=n.vacation||{safeCash:0,extra:0,paychecks:{},spent:{}};n.vacation.paychecks=n.vacation.paychecks||{};n.vacation.spent=n.vacation.spent||{};fn(n);localStorage.setItem("sc-v12",JSON.stringify(n));return n})}
 function toggle(sec,key){update(n=>{n[sec][key]=!n[sec][key]})}
 function setVal(sec,key,val){update(n=>{n[sec][key]=val})}
 function vac(key,val){update(n=>{n.vacation[key]=val})}
 function spend(cat,val){update(n=>{n.vacation.spent[cat]=Math.max(0,Number(n.vacation.spent[cat]||0)+Number(val||0))})}
 const districts=[
  ["mission","Mission Control",Home,`${power}/5 city power`,power>=3],
  ["iron","Iron District",Dumbbell,`${setDone}/12 sets`,iron],
  ["hydration","Hydration Bay",Droplets,`${oz} oz`,hydrated],
  ["scale","Scale Street",Scale,"Wed + Sat weigh-ins",!!(data.weights[wk("wed")]||data.weights[wk("sat")])],
  ["vacation","Vacation District",Palmtree,`${vacDays} days to Pigeon Forge`,vacSaved>=680],
  ["joan","The Joan",Landmark,"Marshall football",false],
  ["diamond","Diamond District",CircleDot,"Fall baseball",false],
  ["family","Family Park",Heart,"Dad mission",!!data.family[ck]],
  ["hq","Sunshine TMT HQ",Sun,"Brand HQ",false],
  ["progress","Progress Board",Trophy,"Stats",false],
  ["save","Save Garage",Save,"Backup",false]
 ];
 return <div className="app">
  <div className="glow pink"/><div className="glow cyan"/>
  <header className={`hero ${power===5?"litHero":""}`}><div className="skyline"/><p className="kicker">SUNSHINE CITY LIMITS</p><h1>Sunshine City</h1><p className="tag">Operation September • Training camp for life</p><div className="heroStats"><Stat label="mission day" value={today.num}/><Stat label="vacation" value={`${vacDays}d`} hot/><Stat label="city power" value={`${power}/5`}/></div></header>
  {screen!=="city"&&<button className="back" onClick={()=>setScreen("city")}>← Back to City Map</button>}
  {screen==="city"&&<><Card special title={power===5?"City fully lit.":"Build the city today."}><p className="muted">Hydration {cups}/5 • Iron {setDone}/12 sets • Vacation {money(vacSaved)}/{money(goal)}</p><Progress value={power*20}/></Card><section className="cityMap">{districts.map(([id,name,Icon,desc,lit])=><button key={id} className={`district ${lit?"lit":""}`} onClick={()=>setScreen(id)}><Building2 className="ghost" size={54}/><Icon className="icon" size={28}/><span>{name}</span><small>{desc}</small></button>)}</section></>}
  {screen==="mission"&&<Card title={`Mission Control • ${DAYS[today.day]} • Week ${today.week+1}`}><div className="score"><Box label="Weight" val={`${latest||START_WEIGHT} lb`}/><Box label="Lost" val={`${lost.toFixed(1)} lb`}/><Box label="Water" val={`${cups}/5`}/><Box label="Iron" val={`${setDone}/12`}/></div><h3>Daily Checks</h3><div className="grid2"><Toggle active={data.walk[ck]} onClick={()=>toggle("walk",ck)}>Walk</Toggle><Toggle active={data.protein[ck]} onClick={()=>toggle("protein",ck)}>Protein</Toggle><Toggle active={data.creatine[ck]} onClick={()=>toggle("creatine",ck)}>Creatine</Toggle><Toggle active={data.family[ck]} onClick={()=>toggle("family",ck)}>Family</Toggle></div><textarea value={data.notes[ck]||""} onChange={e=>setVal("notes",ck,e.target.value)} placeholder="Quick note..."/></Card>}
  {screen==="hydration"&&<Card title="Hydration Bay"><div className="tower"><div className="towerFill" style={{height:`${Math.min(100,cups/5*100)}%`}}/><span>{oz} oz</span></div><p className="muted">{cups} Sunshine cup(s) × 26 oz</p><Progress value={oz/130*100}/><div className="grid2"><button className="primary" onClick={()=>update(n=>{n.water[ck]=(n.water[ck]||0)+1})}>+26 oz</button><button onClick={()=>update(n=>{n.water[ck]=Math.max(0,(n.water[ck]||0)-1)})}>-26 oz</button></div>{hydrated&&<div className="cash">🏆 HYDRATION BAY CASHED</div>}</Card>}
  {screen==="iron"&&<Card title="Iron District"><p className="muted">Your Marcy MWM-4965 circuit. Tap each set as you finish it.</p><Progress value={setDone/12*100}/>{routine.map(([id,name,reps,lvl,goal])=><div className="exercise" key={id}><h3>{name}</h3><p className="muted">3×{reps} • Level {lvl} • Goal {goal}</p><div className="setRow">{[1,2,3].map(i=>{const sk=`${ck}-${id}-${i}`;return <button key={sk} className={data.sets[sk]?"setDone":"setBtn"} onClick={()=>toggle("sets",sk)}>Set {i} {data.sets[sk]?"✅":""}</button>})}</div></div>)}{iron&&<div className="cash">💪 IRON DISTRICT COMPLETE</div>}</Card>}
  {screen==="scale"&&<Card title="Scale Street"><div className="grid2"><label><span>Wednesday</span><input type="number" step="0.1" value={data.weights[wk("wed")]||""} onChange={e=>setVal("weights",wk("wed"),e.target.value)} placeholder="Weight"/></label><label><span>Saturday</span><input type="number" step="0.1" value={data.weights[wk("sat")]||""} onChange={e=>setVal("weights",wk("sat"),e.target.value)} placeholder="Weight"/></label></div><h3>Weight Road</h3><p>Start: {START_WEIGHT} lb</p><p>Latest: {latest||"—"} lb</p><p>Goal: {GOAL_WEIGHT} lb</p><p>Lost: {lost.toFixed(1)} lb</p><Progress value={lost/(START_WEIGHT-GOAL_WEIGHT)*100}/></Card>}
  {screen==="vacation"&&<Vacation data={data} setVac={vac} update={update} spend={spend} togglePay={(id)=>update(n=>{n.vacation.paychecks[id]=!n.vacation.paychecks[id]})} paycheck={paycheck} saved={vacSaved} goal={goal} days={vacDays}/>}
  {screen==="joan"&&<Placeholder title="The Joan" text="🏟️ Marshall football bridge."/>}
  {screen==="diamond"&&<Placeholder title="Diamond District" text="⚾ Fall baseball purpose."/>}
  {screen==="family"&&<Card title="Family Park"><p className="muted">Zander gets prep. Isabella gets dedicated dad time.</p><Toggle active={data.family[ck]} onClick={()=>toggle("family",ck)}>Family moment logged</Toggle></Card>}
  {screen==="hq"&&<Placeholder title="Sunshine TMT HQ" text="☀️ Betting cards, Diamond Watch, recaps, and records live here later."/>}
  {screen==="progress"&&<Placeholder title="Progress Board" text={`Workout days and streaks will expand here. Hydration cashed days already live in Hydration Bay.`}/>}
  {screen==="save"&&<Card title="Save Garage"><p className="notice">Generate before big updates.</p><button className="primary" onClick={()=>setCode(enc(data))}>Generate Save Code</button><textarea className="saveBox" value={code} onChange={e=>setCode(e.target.value)} placeholder="Save code"/><button onClick={()=>{try{const p=dec(code.trim());setData(p);localStorage.setItem("sc-v12",JSON.stringify(p));alert("Loaded")}catch{alert("Bad code")}}}>Load Save Code</button></Card>}
 </div>
}

function Vacation({data,setVac,spend,togglePay,paycheck,saved,goal,days}){
 const spent=data.vacation.spent||{},remaining=goal-Object.values(spent).reduce((s,v)=>s+Number(v||0),0);
 return <Card title="Vacation District"><p className="muted">Pigeon Forge • August 15 • 4 days • hotel paid • attractions bought before trip.</p><div className="score"><Box label="Days Left" val={days}/><Box label="Saved" val={money(saved)}/><Box label="Goal" val={money(goal)}/><Box label="Needed" val={money(Math.max(0,goal-saved))}/></div><Progress value={saved/goal*100}/><h3>Funding Sources</h3><div className="grid2"><label><span>Safe Cash Used Max $400</span><input type="number" value={data.vacation.safeCash||""} onChange={e=>setVac("safeCash",e.target.value)} placeholder="0"/></label><label><span>Extra Saved</span><input type="number" value={data.vacation.extra||""} onChange={e=>setVac("extra",e.target.value)} placeholder="0"/></label></div><div className="panel">🏦 Barclays protected: $2,500 current / $2,000 minimum ✅</div><h3>Paycheck Plan</h3>{paycheck.map(([id,date,person,amount])=><button key={id} className={`pay ${data.vacation.paychecks?.[id]?"checked":""}`} onClick={()=>togglePay(id)}><span>{date}</span><strong>{person}</strong><em>Save {money(amount)}</em>{data.vacation.paychecks?.[id]?" ✅":""}</button>)}<h3>Vacation Spending</h3><Budget icon={<Utensils/>} cat="food" name="Food" amount={425} spent={spent.food} spend={spend}/><Budget icon={<IceCreamBowl/>} cat="iceCream" name="Ice Cream" amount={75} spent={spent.iceCream} spend={spend}/><Budget icon={<Car/>} cat="gas" name="Gas" amount={80} spent={spent.gas} spend={spend}/><Budget icon={<WalletCards/>} cat="jordan" name="Jordan" amount={200} spent={spent.jordan} spend={spend}/><Budget icon={<WalletCards/>} cat="deanna" name="Deanna" amount={200} spent={spent.deanna} spend={spend}/><Budget icon={<Shield/>} cat="buffer" name="Buffer" amount={100} spent={spent.buffer} spend={spend}/><div className="cash">Vacation Cash Remaining: {money(Math.max(0,remaining))}</div></Card>
}
function Budget({icon,cat,name,amount,spent=0,spend}){const[amt,setAmt]=useState("");const rem=amount-Number(spent||0);return <div className="budget"><div className="budgetTop">{icon}<div><strong>{name}</strong><span>{money(rem)} left of {money(amount)}</span></div></div><Progress value={Number(spent||0)/amount*100}/><div className="grid2"><input type="number" value={amt} onChange={e=>setAmt(e.target.value)} placeholder="Spend"/><button onClick={()=>{spend(cat,amt);setAmt("")}}>Log</button></div></div>}
function Card({title,children,special}){return <section className={`card ${special?"special":""}`}><p className="kicker">SUNSHINE CITY</p><h2>{title}</h2>{children}</section>}
function Placeholder({title,text}){return <Card title={title}><div className="panel">{text}</div></Card>}
function Stat({label,value,hot}){return <div className={`stat ${hot?"hot":""}`}><strong>{value}</strong><span>{label}</span></div>}
function Progress({value}){return <div className="bar"><div className="fill" style={{width:`${Math.max(0,Math.min(100,value||0))}%`}}/></div>}
function Toggle({active,onClick,children}){return <button className={active?"checked":""} onClick={onClick}>{children} {active?"✅":""}</button>}
function Box({label,val}){return <div><span>{label}</span><strong>{val}</strong></div>}
