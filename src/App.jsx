
import React, { useMemo, useState } from "react";
import {
  Home, Dumbbell, Droplets, Scale, Trophy, Save, Landmark, CircleDot,
  Heart, Sun, Building2, Gift, CalendarDays, Footprints, Trash2,
  PlusCircle, CheckCircle2, Utensils, Car, IceCreamBowl, WalletCards, Shield
} from "lucide-react";

const START = new Date("2026-07-21T00:00:00");
const END = new Date("2026-09-20T00:00:00");
const VACATION = new Date("2026-08-15T00:00:00");
const CUP_OZ = 26, WATER_GOAL = 5, START_WEIGHT = 210, GOAL_WEIGHT = 198, VACATION_GOAL = 1080;
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const routine = [
  {
    id: "chestfly",
    name: "Chest Fly",
    reps: 12,
    sets: 3,
    level: 3
  },
  {
    id: "ab",
    name: "Ab Crunch",
    reps: 12,
    sets: 3,
    level: 4
  },
  {
    id: "planks",
    name: "Planks",
    reps: 20,
    sets: 3,
    level: 1,

  
  },

    {
    id: "chest",
    name: "Chest Press",
    reps: 12,
    sets: 3,
    level: 8
  },
  {
    id: "triceps",
    name: "Tricep Pushdown",
    reps: 12,
    sets: 3,
    level: 5
  },
  {
    id: "lat",
    name: "Lat Pulldown",
    reps: 12,
    sets: 3,
    level: 6
  },
  {
    id: "legs",
    name: "Leg Curl",
    reps: 13,
    sets: 3,
    level: 7
  }
];

const paychecks = [
  { id:"d0713", date:"Jul 13", person:"Deanna", amount:60 },
  { id:"d0720", date:"Jul 20", person:"Deanna", amount:60 },
  { id:"j0723", date:"Jul 23", person:"Jordan", amount:190 },
  { id:"d0727", date:"Jul 27", person:"Deanna", amount:60 },
  { id:"d0803", date:"Aug 3", person:"Deanna", amount:60 },
  { id:"j0806", date:"Aug 6", person:"Jordan", amount:190 },
  { id:"d0810", date:"Aug 10", person:"Deanna", amount:60 },
];

const budgets = { food:425, iceCream:75, gas:80, jordan:200, deanna:200, buffer:100 };

const blank = {
  water:{}, weights:{}, sets:{}, protein:{}, creatine:{}, family:{}, notes:{},
  conditioning:{},
  surprise:{
    safeCash:0, extraEntries:[], paychecks:{}, spent:{},
    paid:{hotel:true,attractions:true}
  }
};

function normalize(raw={}) {
  return {
    ...blank, ...raw,
    conditioning:{...(raw.conditioning||{})},
    surprise:{
      ...blank.surprise, ...(raw.surprise||{}),
      paid:{...blank.surprise.paid,...(raw.surprise?.paid||{})},
      paychecks:{...(raw.surprise?.paychecks||{})},
      spent:{...(raw.surprise?.spent||{})},
      extraEntries:Array.isArray(raw.surprise?.extraEntries)?raw.surprise.extraEntries:[]
    }
  };
}

function load() {
  try {
    const current = localStorage.getItem("sunshine-city-v13b");
    if (current) return normalize(JSON.parse(current));
    const v13a = localStorage.getItem("sunshine-city-v13a");
    if (v13a) return normalize(JSON.parse(v13a));
    const v12 = localStorage.getItem("sc-v12");
    if (v12) {
      const old = JSON.parse(v12);
      return normalize({
        ...old,
        surprise:{
          safeCash:old?.vacation?.safeCash||0,
          extraEntries:old?.vacation?.extra ? [{
            id:Date.now(), amount:Number(old.vacation.extra),
            note:"Imported extra savings", date:new Date().toLocaleDateString()
          }] : [],
          paychecks:old?.vacation?.paychecks||{},
          spent:old?.vacation?.spent||{},
          paid:{hotel:true,attractions:true}
        }
      });
    }
  } catch {}
  return normalize();
}

const money = n => `$${Number(n||0).toFixed(0)}`;
const dateKey = d => d.toISOString().slice(0,10);
const encode = d => btoa(unescape(encodeURIComponent(JSON.stringify(d))));
const decode = c => JSON.parse(decodeURIComponent(escape(atob(c))));

export default function App(){
  const [practiceStatus, setPracticeStatus] = useState("full");
  const [screen,setScreen]=useState("city");
  const [data,setData]=useState(load);
  const [saveCode,setSaveCode]=useState("");

  const today = useMemo(()=>{
    const n=new Date();
    const diff=Math.floor((new Date(n.getFullYear(),n.getMonth(),n.getDate())-START)/86400000);
    const safe=Math.max(0,Math.min(diff,76));
    return {week:Math.floor(safe/7), day:safe%7, missionDay:safe+1, date:new Date(n.getFullYear(),n.getMonth(),n.getDate())};
  },[]);

  const todayDateKey=dateKey(today.date);
  const weekKey=`w${today.week}-d${today.day}`;
  const weightKey=t=>`w${today.week}-${t}`;

  const cups=data.water[weekKey]||0;
  const waterOz=cups*CUP_OZ;
  const hydrationDone=cups>=WATER_GOAL;

  const completedSets=routine.reduce((sum,ex)=>sum+[1,2,3].filter(s=>data.sets[`${weekKey}-${ex.id}-${s}`]).length,0);

 const goalLineDone =
completedSets === 21 || practiceStatus === "recovery";
  const conditioning=data.conditioning[todayDateKey]||{};
  const totalMiles=Number(conditioning.total||0);
  const intentionalMiles=Number(conditioning.intentional||0);
  const activityMiles=Math.max(0,totalMiles-intentionalMiles);
  const conditioningDone=intentionalMiles>0;

  const checks=[
    hydrationDone,
    goalLineDone,
    conditioningDone,
    Boolean(data.protein[weekKey]),
    Boolean(data.creatine[weekKey]),
  ];
  const cityPower=checks.filter(Boolean).length;

  const latestWeight=Object.values(data.weights).map(Number).filter(Boolean).at(-1);
  const poundsLost=latestWeight?START_WEIGHT-latestWeight:0;

  const paycheckSaved=paychecks.filter(p=>data.surprise.paychecks[p.id]).reduce((s,p)=>s+p.amount,0);
  const extraSaved=data.surprise.extraEntries.reduce((s,e)=>s+Number(e.amount||0),0);
  const surpriseSaved=paycheckSaved+extraSaved+Number(data.surprise.safeCash||0);
  const surpriseSpent=Object.values(data.surprise.spent).reduce((s,v)=>s+Number(v||0),0);

  const vacationDays=Math.max(0,Math.ceil((VACATION-new Date())/86400000));
  const operationDays=Math.max(0,Math.ceil((END-new Date())/86400000));

  function getDayScore(key) {
    const day = data.conditioning[key] || {};
    const dateObj = new Date(`${key}T12:00:00`);
    const diff=Math.floor((dateObj-START)/86400000);
    if(diff<0||diff>76) return null;
    const wk=`w${Math.floor(diff/7)}-d${diff%7}`;
    const dailyChecks=[
      (data.water[wk]||0)>=5,
      routine.every(ex=>[1,2,3].every(s=>data.sets[`${wk}-${ex.id}-${s}`])),
      Number(day.intentional||0)>0,
      Boolean(data.protein[wk]),
      Boolean(data.creatine[wk]),
    ];
    return {score:dailyChecks.filter(Boolean).length, checks:dailyChecks, wk};
  }

  const calendarDays=useMemo(()=>{
    const first=new Date(today.date.getFullYear(),today.date.getMonth(),1);
    const last=new Date(today.date.getFullYear(),today.date.getMonth()+1,0);
    const cells=[];
    const offset=(first.getDay()+6)%7;
    for(let i=0;i<offset;i++) cells.push(null);
    for(let d=1;d<=last.getDate();d++) cells.push(new Date(today.date.getFullYear(),today.date.getMonth(),d));
    return cells;
  },[today.date]);

  const streaks=useMemo(()=>{
    let longest=0,total=0,run=0;
    for(let i=0;i<77;i++){
      const d=new Date(START); d.setDate(d.getDate()+i);
      const perfect=getDayScore(dateKey(d))?.score===5;
      if(perfect){run++;total++;longest=Math.max(longest,run)} else run=0;
    }
    let current=0;
    let cursor=new Date(today.date);
    while(cursor>=START){
      if(getDayScore(dateKey(cursor))?.score===5){current++;cursor.setDate(cursor.getDate()-1)} else break;
    }
    return {current,longest,total};
  },[data,today.date]);

  const weeklyMiles=useMemo(()=>{
    const monday=new Date(today.date);
    monday.setDate(monday.getDate()-today.day);
    let total=0,intentional=0;
    for(let i=0;i<7;i++){
      const d=new Date(monday);d.setDate(d.getDate()+i);
      const entry=data.conditioning[dateKey(d)]||{};
      total+=Number(entry.total||0); intentional+=Number(entry.intentional||0);
    }
    return {total,intentional};
  },[data,today]);

  const lifetimeMiles=Object.values(data.conditioning).reduce((acc,e)=>({
    total:acc.total+Number(e.total||0),
    intentional:acc.intentional+Number(e.intentional||0)
  }),{total:0,intentional:0});

  function update(mutator){
    setData(prev=>{
      const next=structuredClone(prev);
      mutator(next);
      localStorage.setItem("sunshine-city-v13b",JSON.stringify(next));
      return next;
    });
  }

  function toggle(section,key){
    update(n=>{n[section][key]=!n[section][key]});
  }

  const districtDefs=[
    ["mission","Mission Control",Home,`${cityPower}/5 city power`,cityPower>=3,"cyan"],
    ["goal","The Goal Line",Dumbbell,`${completedSets}/21 sets`,goalLineDone,"orange"],
    ["hydration","Hydration Bay",Droplets,`${waterOz} oz`,hydrationDone,"blue"],
    ["conditioning","Conditioning Field",Footprints,`${intentionalMiles.toFixed(1)} intentional mi`,conditioningDone,"green"],
    ["film","Film Room",Scale,"Wednesday + Saturday review",Boolean(data.weights[weightKey("wed")]||data.weights[weightKey("sat")]),"purple"],
    ["surprise","The Surprise",Gift,`${vacationDays} days to Pigeon Forge`,surpriseSaved>=680,"pink"],
    ["calendar","City Lights Calendar",CalendarDays,`${streaks.total} perfect days`,streaks.total>0,"gold"],
    ["clubhouse","The Clubhouse",CircleDot,"Baseball headquarters",false,"red"],
    ["family","Family Park",Heart,"Dad mission",Boolean(data.family[weekKey]),"pink"],
    ["hq","Sunshine TMT HQ",Sun,"Brand command center",false,"gold"],
    ["progress","Progress Board",Trophy,"Season stats",streaks.total>0,"cyan"],
    ["save","Save Garage",Save,"Backup code",false,"purple"],
  ];

  return <div className={`app ${cityPower===5?"cityFullyLit":""}`}>
    <div className="glow glowPink"/><div className="glow glowCyan"/>
    <header className={`hero ${cityPower===5?"heroLit":""}`}>
      <div className="skyline"/>
      <p className="kicker">SUNSHINE CITY LIMITS</p>
      <h1>Sunshine City</h1>
      <p className="tagline">Training Complex for Life</p>
      <div className="versionBadge">v1.3B • Lights On Update</div>
      <div className="heroStats">
        <Stat label="mission day" value={today.missionDay}/>
        <Stat label="days left" value={operationDays} hot/>
        <Stat label="city power" value={`${cityPower}/5`}/>
      </div>
    </header>

    {screen!=="city"&&<button className="backButton" onClick={()=>setScreen("city")}>← Back to City Map</button>}

    {screen==="city"&&<>
      <Card special title={cityPower===5?"🌆 CITY FULLY LIT":"🏈 Today’s Game Plan"}>
        <div className="gamePlan">
          <Plan label="Hydration Bay" done={hydrationDone}/>
          <Plan label="The Goal Line" done={goalLineDone}/>
          <Plan label="Conditioning Field" done={conditioningDone}/>
          <Plan label="Protein" done={Boolean(data.protein[weekKey])}/>
          <Plan label="Creatine" done={Boolean(data.creatine[weekKey])}/>
        </div>
        <Progress value={cityPower*20}/>
      </Card>

      <section className="cityMap">
        {districtDefs.map(([id,name,Icon,desc,lit,tone])=>
          <button key={id} className={`district ${lit?"lit":""} tone-${tone}`} onClick={()=>setScreen(id)}>
            <Building2 className="buildingGhost" size={54}/>
            <Icon className="districtIcon" size={28}/>
            <span>{name}</span><small>{desc}</small>
          </button>
        )}
      </section>
    </>}

    {screen==="mission"&&<Card title={`Mission Control • ${DAYS[today.day]} • Week ${today.week+1}`}>
      <div className="scoreGrid">
        <Score label="Weight" value={`${latestWeight||START_WEIGHT} lb`}/>
        <Score label="Lost" value={`${poundsLost.toFixed(1)} lb`}/>
        <Score label="Water" value={`${cups}/5`}/>
        <Score label="City Power" value={`${cityPower}/5`}/>
      </div>
      <h3>Daily Checks</h3>
      <div className="twoColumn">
        <Toggle active={data.protein[weekKey]} onClick={()=>toggle("protein",weekKey)}>Protein</Toggle>
        <Toggle active={data.creatine[weekKey]} onClick={()=>toggle("creatine",weekKey)}>Creatine</Toggle>
        <Toggle active={data.family[weekKey]} onClick={()=>toggle("family",weekKey)}>Family</Toggle>
      </div>
      <h3>Coach Notes</h3>
      <textarea value={data.notes[weekKey]||""} onChange={e=>update(n=>{n.notes[weekKey]=e.target.value})} placeholder="Quick note..."/>
    </Card>}

    {screen==="goal"&&<Card title="The Goal Line">
      <p className="muted">Complete all 12 sets and punch it into the end zone.</p>
      <div style={{
  margin:"12px 0",
  padding:"12px",
  borderRadius:"12px",
  border:"1px solid rgba(0,255,255,.25)"
}}>
  <strong>🏈 Practice Status</strong>

  <div style={{marginTop:"10px", display:"flex", gap:"10px"}}>
 <button
  onClick={() => setPracticeStatus("full")}
  style={{
    background:
      practiceStatus === "full"
        ? "linear-gradient(135deg,#00eaff,#ff4fd8)"
        : "",
    boxShadow:
      practiceStatus === "full"
        ? "0 0 18px rgba(0,234,255,.65)"
        : "none"
  }}
>
  🏈 Full Practice
</button>

<button
  onClick={() => setPracticeStatus("recovery")}
  style={{
    background:
      practiceStatus === "recovery"
        ? "linear-gradient(135deg,#7c3cff,#d946ef)"
        : "",
    boxShadow:
      practiceStatus === "recovery"
        ? "0 0 18px rgba(168,85,247,.75)"
        : "none"
  }}
>
  🛡️ Recovery Day
</button>
  </div>
</div>
      <Progress value={(completedSets/21)*100}/>
      {routine.map(ex=><div className="exerciseCard" key={ex.id}>
        <h3>{ex.name}</h3>
        <p className="muted">
 {ex.sets}× {ex.reps} • Current Level {ex.level}
</p>
        <div className="setRow">{[1,2,3].map(s=>{
          const key=`${weekKey}-${ex.id}-${s}`,done=Boolean(data.sets[key]);
          return <button key={key} className={done?"setDone":"setButton"} onClick={()=>toggle("sets",key)}>
            {s===3?"Goal Line":`Set ${s}`} {done?"✅":""}
          </button>
        })}</div>
      </div>)}
      {goalLineDone&&<div className="cashBanner">🏈 TOUCHDOWN — THE GOAL LINE COMPLETE</div>}
    </Card>}

    {screen==="hydration"&&<Card title="Hydration Bay">
      <div className="waterTower">
        <div className="waterFill" style={{height:`${Math.min(100,cups/5*100)}%`}}/>
        <span>{waterOz} oz</span>
      </div>
      <p className="muted">{cups} Sunshine cup(s) × 26 oz</p>
      <Progress value={waterOz/130*100}/>
      <div className="twoColumn">
        <button className="primary" onClick={()=>update(n=>{n.water[weekKey]=(n.water[weekKey]||0)+1})}>+26 oz</button>
        <button onClick={()=>update(n=>{n.water[weekKey]=Math.max(0,(n.water[weekKey]||0)-1)})}>-26 oz</button>
      </div>
      {hydrationDone&&<div className="cashBanner">💧 WATER TOWER ONLINE</div>}
    </Card>}

    {screen==="conditioning"&&<Card title="Conditioning Field">
      <p className="muted">Log total miles at day’s end and separate the miles you earned intentionally.</p>
      <div className="scoreGrid">
        <Score label="Total Miles" value={totalMiles.toFixed(1)}/>
        <Score label="Intentional" value={intentionalMiles.toFixed(1)}/>
        <Score label="Activity" value={activityMiles.toFixed(1)}/>
        <Score label="Streak" value={`${streaks.current} days`}/>
      </div>
      <div className="twoColumn">
        <label><span>Total Daily Miles</span><input type="number" step="0.1" value={conditioning.total||""} onChange={e=>update(n=>{n.conditioning[todayDateKey]={...(n.conditioning[todayDateKey]||{}),total:e.target.value}})} placeholder="0.0"/></label>
        <label><span>Intentional Miles</span><input type="number" step="0.1" value={conditioning.intentional||""} onChange={e=>update(n=>{n.conditioning[todayDateKey]={...(n.conditioning[todayDateKey]||{}),intentional:e.target.value}})} placeholder="0.0"/></label>
      </div>
      <h3>This Week</h3>
      <div className="scoreGrid">
        <Score label="Total" value={weeklyMiles.total.toFixed(1)}/>
        <Score label="Intentional" value={weeklyMiles.intentional.toFixed(1)}/>
      </div>
      <h3>Operation September</h3>
      <div className="scoreGrid">
        <Score label="Total Miles" value={lifetimeMiles.total.toFixed(1)}/>
        <Score label="Intentional" value={lifetimeMiles.intentional.toFixed(1)}/>
      </div>
      {conditioningDone&&<div className="cashBanner">🏈 CONDITIONING COMPLETE</div>}
    </Card>}

    {screen==="film"&&<Card title="Film Room">
      <p className="muted">Wednesday and Saturday are review days. The scale is feedback, not judgment.</p>
      <div className="twoColumn">
        <label><span>Wednesday Review</span><input type="number" step="0.1" value={data.weights[weightKey("wed")]||""} onChange={e=>update(n=>{n.weights[weightKey("wed")]=e.target.value})} placeholder="Weight"/></label>
        <label><span>Saturday Review</span><input type="number" step="0.1" value={data.weights[weightKey("sat")]||""} onChange={e=>update(n=>{n.weights[weightKey("sat")]=e.target.value})} placeholder="Weight"/></label>
      </div>
      <h3>Film Review</h3>
      <p>Start: {START_WEIGHT} lb</p><p>Latest: {latestWeight||"—"} lb</p><p>Goal: {GOAL_WEIGHT} lb</p><p>Season change: {poundsLost.toFixed(1)} lb</p>
      <Progress value={poundsLost/(START_WEIGHT-GOAL_WEIGHT)*100}/>
    </Card>}

    {screen==="calendar"&&<Card title="City Lights Calendar">
      <div className="streakGrid">
        <Score label="Current Streak" value={streaks.current}/>
        <Score label="Best Streak" value={streaks.longest}/>
        <Score label="Perfect Days" value={streaks.total}/>
      </div>
      <div className="weekLabels">{DAYS.map(d=><span key={d}>{d}</span>)}</div>
      <div className="calendarGrid">
        {calendarDays.map((d,i)=>{
          if(!d)return <div key={`blank-${i}`} className="calendarBlank"/>;
          const result=getDayScore(dateKey(d));
          const score=result?.score??0;
          const isToday=dateKey(d)===todayDateKey;
          return <div key={dateKey(d)} className={`calendarDay score-${score} ${isToday?"today":""}`}>
            <strong>{d.getDate()}</strong><span>{score}/5</span>
          </div>
        })}
      </div>
      <div className="legend">
        <span>🌟 5/5 Fully Lit</span><span>🟢 4/5</span><span>🔵 3/5</span><span>⚪ 0–2/5</span>
      </div>
    </Card>}

    {screen==="surprise"&&<Surprise data={data} update={update} totalSaved={surpriseSaved} paycheckSaved={paycheckSaved} extraSaved={extraSaved} totalSpent={surpriseSpent} vacationDays={vacationDays}/>}

    {screen==="clubhouse"&&<Placeholder title="The Clubhouse" text="⚾ Baseball headquarters is open. Schedule, milestones, and trophy case come later."/>}
    {screen==="family"&&<Card title="Family Park"><p className="muted">Zander gets prep and shared sports moments. Isabella gets dedicated dad time.</p><Toggle active={data.family[weekKey]} onClick={()=>toggle("family",weekKey)}>Family moment logged</Toggle></Card>}
    {screen==="hq"&&<Placeholder title="Sunshine TMT HQ" text="☀️ Brand command center coming later."/>}
    {screen==="progress"&&<Card title="Progress Board"><div className="scoreGrid"><Score label="Perfect Days" value={streaks.total}/><Score label="Best Streak" value={streaks.longest}/><Score label="Total Miles" value={lifetimeMiles.total.toFixed(1)}/><Score label="Intentional" value={lifetimeMiles.intentional.toFixed(1)}/></div></Card>}
    {screen==="save"&&<Card title="Save Garage">
      <p className="notice">Generate a save code before major updates.</p>
      <button className="primary" onClick={()=>setSaveCode(encode(data))}>Generate Save Code</button>
      <textarea className="saveBox" value={saveCode} onChange={e=>setSaveCode(e.target.value)} placeholder="Generate or paste save code here"/>
      <button onClick={()=>{try{const p=normalize(decode(saveCode.trim()));setData(p);localStorage.setItem("sunshine-city-v13b",JSON.stringify(p));alert("Save code loaded.")}catch{alert("That save code didn't work.")}}}>Load Save Code</button>
    </Card>}
  </div>
}

function Surprise({data,update,totalSaved,paycheckSaved,extraSaved,totalSpent,vacationDays}){
  const [amount,setAmount]=useState(""),[note,setNote]=useState("");
  function addExtra(){
    const n=Number(amount);if(!n||n<=0)return;
    update(next=>{next.surprise.extraEntries.unshift({id:Date.now(),amount:n,note:note.trim()||"Extra savings",date:new Date().toLocaleDateString()})});
    setAmount("");setNote("");
  }
  const remaining=Math.max(0,VACATION_GOAL-totalSpent);
  return <Card title="The Surprise">
    <p className="muted">Pigeon Forge • August 15 • Team Craig</p>
    <div className="scoreGrid">
      <Score label="Days Left" value={vacationDays}/><Score label="Saved" value={money(totalSaved)}/><Score label="Goal" value={money(VACATION_GOAL)}/><Score label="Needed" value={money(Math.max(0,VACATION_GOAL-totalSaved))}/>
    </div>
    <Progress value={totalSaved/VACATION_GOAL*100}/>
    <h3>Already Paid</h3>
    <div className="twoColumn">
      <Toggle active={data.surprise.paid.hotel} onClick={()=>update(n=>{n.surprise.paid.hotel=!n.surprise.paid.hotel})}>Hotel</Toggle>
      <Toggle active={data.surprise.paid.attractions} onClick={()=>update(n=>{n.surprise.paid.attractions=!n.surprise.paid.attractions})}>Attractions $215</Toggle>
    </div>
    <h3>Funding</h3>
    <div className="scoreGrid"><Score label="Paychecks" value={money(paycheckSaved)}/><Score label="Extra Savings" value={money(extraSaved)}/></div>
    <label><span>Safe Cash Used — Max $400</span><input type="number" max="400" value={data.surprise.safeCash||""} onChange={e=>update(n=>{n.surprise.safeCash=Math.min(400,Math.max(0,Number(e.target.value||0)))})} placeholder="0"/></label>
    <div className="notice">🏦 Barclays protected: $2,500 current / $2,000 minimum</div>
    <h3>Paycheck Plan</h3>
    {paychecks.map(p=><button key={p.id} className={`paycheck ${data.surprise.paychecks[p.id]?"checked":""}`} onClick={()=>update(n=>{n.surprise.paychecks[p.id]=!n.surprise.paychecks[p.id]})}>
      <span>{p.date}</span><strong>{p.person}</strong><em>Save {money(p.amount)}</em>{data.surprise.paychecks[p.id]?<CheckCircle2 size={17}/>:null}
    </button>)}
    <h3>Extra Savings Ledger</h3>
    <div className="extraForm">
      <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount"/>
      <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Source or note"/>
      <button className="primary" onClick={addExtra}><PlusCircle size={17}/> Add Extra Savings</button>
    </div>
    <div className="ledger">
      {data.surprise.extraEntries.length===0?<p className="muted">No extra savings logged yet.</p>:data.surprise.extraEntries.map(entry=><div className="ledgerRow" key={entry.id}>
        <div><strong>+{money(entry.amount)}</strong><span>{entry.note}</span><small>{entry.date}</small></div>
        <button className="iconButton" onClick={()=>update(n=>{n.surprise.extraEntries=n.surprise.extraEntries.filter(e=>e.id!==entry.id)})}><Trash2 size={17}/></button>
      </div>)}
    </div>
    <h3>Vacation Spending</h3>
    <Budget icon={<Utensils/>} category="food" name="Food" amount={budgets.food} data={data} update={update}/>
    <Budget icon={<IceCreamBowl/>} category="iceCream" name="Ice Cream" amount={budgets.iceCream} data={data} update={update}/>
    <Budget icon={<Car/>} category="gas" name="Gas" amount={budgets.gas} data={data} update={update}/>
    <Budget icon={<WalletCards/>} category="jordan" name="Jordan" amount={budgets.jordan} data={data} update={update}/>
    <Budget icon={<WalletCards/>} category="deanna" name="Deanna" amount={budgets.deanna} data={data} update={update}/>
    <Budget icon={<Shield/>} category="buffer" name="Buffer" amount={budgets.buffer} data={data} update={update}/>
    <div className="cashBanner">Vacation Cash Remaining: {money(remaining)}</div>
  </Card>
}

function Budget({icon,category,name,amount,data,update}){
  const [value,setValue]=useState("");
  const spent=Number(data.surprise.spent[category]||0),remaining=amount-spent;
  return <div className="budgetCard">
    <div className="budgetHeader">{icon}<div><strong>{name}</strong><span>{money(remaining)} left of {money(amount)}</span></div></div>
    <Progress value={spent/amount*100}/>
    <div className="twoColumn">
      <input type="number" value={value} onChange={e=>setValue(e.target.value)} placeholder="Spend amount"/>
      <button onClick={()=>{const n=Number(value);if(!n||n<=0)return;update(next=>{next.surprise.spent[category]=Math.max(0,Number(next.surprise.spent[category]||0)+n)});setValue("")}}>Log Spend</button>
    </div>
  </div>
}

function Card({title,children,special}){return <section className={`card ${special?"specialCard":""}`}><p className="kicker">SUNSHINE CITY</p><h2>{title}</h2>{children}</section>}
function Placeholder({title,text}){return <Card title={title}><div className="notice">{text}</div></Card>}
function Stat({label,value,hot}){return <div className={`stat ${hot?"hot":""}`}><strong>{value}</strong><span>{label}</span></div>}
function Score({label,value}){return <div className="scoreCard"><span>{label}</span><strong>{value}</strong></div>}
function Progress({value}){return <div className="bar"><div className="fill" style={{width:`${Math.max(0,Math.min(100,value||0))}%`}}/></div>}
function Toggle({active,onClick,children}){return <button className={active?"checked":""} onClick={onClick}>{children} {active?"✅":""}</button>}
function Plan({label,done}){return <div className={`planRow ${done?"planDone":""}`}><span>{done?"✅":"⬜"}</span><strong>{label}</strong></div>}
