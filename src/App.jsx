import React, { useMemo, useState } from "react";
import {
  Home,
  Dumbbell,
  Droplets,
  Scale,
  Trophy,
  Save,
  Landmark,
  CircleDot,
  Heart,
  Sun,
  Building2,
} from "lucide-react";

const START = new Date("2026-07-06T00:00:00");
const END = new Date("2026-09-20T00:00:00");
const WEEKS = 11;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CUP_OZ = 26;
const WATER_GOAL = 130;
const START_WEIGHT = 210;
const GOAL_LOSS = 12;

const dayStates = [
  { label: "—", className: "state-empty" },
  { label: "1 Workout", className: "state-one" },
  { label: "2 Workouts", className: "state-two" },
  { label: "3 Workouts", className: "state-three" },
  { label: "4 Workouts", className: "state-four" },
  { label: "Rest", className: "state-rest" },
  { label: "Cheat", className: "state-cheat" },
  { label: "Rest+Cheat", className: "state-split" },
];

const blankData = {
  days: {},
  water: {},
  weights: {},
  exercises: {},
  protein: {},
  creatine: {},
  notes: {},
  family: {},
};

function safeLoad() {
  try {
    return JSON.parse(localStorage.getItem("sunshine-city-v1")) || blankData;
  } catch {
    return blankData;
  }
}

function encodeData(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeData(code) {
  return JSON.parse(decodeURIComponent(escape(atob(code))));
}

export default function App() {
  const [screen, setScreen] = useState("city");
  const [data, setData] = useState(safeLoad);
  const [saveCode, setSaveCode] = useState("");

  const today = useMemo(() => {
    const now = new Date();
    const diff = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - START) / 86400000);
    const safe = Math.max(0, Math.min(diff, WEEKS * 7 - 1));
    return {
      week: Math.floor(safe / 7),
      day: safe % 7,
      missionDay: safe + 1,
    };
  }, []);

  const key = (w, d) => `w${w}-d${d}`;
  const weightKey = (w, type) => `w${w}-${type}`;
  const currentKey = key(today.week, today.day);
  const currentState = dayStates[data.days[currentKey] || 0];

  const daysLeft = Math.max(0, Math.ceil((END - new Date()) / 86400000));
  const waterCups = data.water[currentKey] || 0;
  const waterOz = waterCups * CUP_OZ;

  const latestWeight = Object.values(data.weights).map(Number).filter(Boolean).at(-1);
  const poundsLost = latestWeight ? START_WEIGHT - latestWeight : 0;

  const totals = {
    workouts: Object.values(data.days).filter((v) => v >= 1 && v <= 4).length,
    rest: Object.values(data.days).filter((v) => v === 5 || v === 7).length,
    cheat: Object.values(data.days).filter((v) => v === 6 || v === 7).length,
    hydration: Object.values(data.water).filter((cups) => cups * CUP_OZ >= WATER_GOAL).length,
  };

  function update(fn) {
    setData((prev) => {
      const next = structuredClone(prev);
      fn(next);
      localStorage.setItem("sunshine-city-v1", JSON.stringify(next));
      return next;
    });
  }

  function cycleDay(w, d) {
    update((next) => {
      const k = key(w, d);
      next.days[k] = ((next.days[k] || 0) + 1) % 8;
    });
  }

  function addWater(amount) {
    update((next) => {
      next.water[currentKey] = Math.max(0, (next.water[currentKey] || 0) + amount);
    });
  }

  function toggle(section, k) {
    update((next) => {
      next[section][k] = !next[section][k];
    });
  }

  function setValue(section, k, value) {
    update((next) => {
      next[section][k] = value;
    });
  }

  function exportCode() {
    setSaveCode(encodeData(data));
  }

  function importCode() {
    try {
      const parsed = decodeData(saveCode.trim());
      setData(parsed);
      localStorage.setItem("sunshine-city-v1", JSON.stringify(parsed));
      alert("Save code loaded.");
    } catch {
      alert("That save code didn't work.");
    }
  }

  const districts = [
    {
      id: "mission",
      name: "Mission Control",
      icon: Home,
      desc: "Today’s main win",
      lit: (data.days[currentKey] || 0) > 0,
    },
    {
      id: "iron",
      name: "Iron District",
      icon: Dumbbell,
      desc: "Workouts and training",
      lit: Object.keys(data.exercises).some((k) => k.startsWith(currentKey) && data.exercises[k]),
    },
    {
      id: "hydration",
      name: "Hydration Bay",
      icon: Droplets,
      desc: `${waterOz} oz today`,
      lit: waterOz >= WATER_GOAL,
    },
    {
      id: "scale",
      name: "Scale Street",
      icon: Scale,
      desc: "Wed + Sat weigh-ins",
      lit: Boolean(data.weights[weightKey(today.week, "wed")] || data.weights[weightKey(today.week, "sat")]),
    },
    {
      id: "joan",
      name: "The Joan",
      icon: Landmark,
      desc: "Marshall football bridge",
      lit: false,
    },
    {
      id: "diamond",
      name: "Diamond District",
      icon: CircleDot,
      desc: "Fall baseball purpose",
      lit: false,
    },
    {
      id: "family",
      name: "Family Park",
      icon: Heart,
      desc: "Zander + Isabella",
      lit: Boolean(data.family[currentKey]),
    },
    {
      id: "hq",
      name: "Sunshine TMT HQ",
      icon: Sun,
      desc: "Brand command center",
      lit: false,
    },
    {
      id: "progress",
      name: "Progress Board",
      icon: Trophy,
      desc: "Stats and streaks",
      lit: totals.workouts > 0,
    },
    {
      id: "save",
      name: "Save Garage",
      icon: Save,
      desc: "Backup code",
      lit: false,
    },
  ];

  return (
    <div className="app">
      <div className="glow glowPink" />
      <div className="glow glowCyan" />

      <header className="hero">
        <div className="skyline" />
        <p className="kicker">SUNSHINE CITY LIMITS</p>
        <h1>Sunshine City</h1>
        <p className="tagline">Operation September is the first mission.</p>

        <div className="heroStats">
          <Stat label="mission day" value={today.missionDay} />
          <Stat label="days left" value={daysLeft} hot />
          <Stat label="target loss" value="12+" />
        </div>
      </header>

      {screen !== "city" && (
        <button className="backButton" onClick={() => setScreen("city")}>
          ← Back to City Map
        </button>
      )}

      {screen === "city" && (
        <>
          <section className="card missionCard">
            <p className="kicker">TODAY’S READOUT</p>
            <h2>Welcome back, Jordan</h2>
            <p className="muted">
              {currentState.label} • Hydration Bay: {waterOz} oz • Scale Street:{" "}
              {latestWeight || START_WEIGHT} lb
            </p>
            <Progress value={(poundsLost / GOAL_LOSS) * 100} />
          </section>

          <section className="cityMap">
            {districts.map((district) => {
              const Icon = district.icon;
              return (
                <button
                  key={district.id}
                  className={`district ${district.lit ? "lit" : ""}`}
                  onClick={() => setScreen(district.id)}
                >
                  <Building2 className="buildingGhost" size={52} />
                  <Icon className="districtIcon" size={28} />
                  <span>{district.name}</span>
                  <small>{district.desc}</small>
                </button>
              );
            })}
          </section>
        </>
      )}

      {screen === "mission" && (
        <Card title={`Mission Control • Week ${today.week + 1} • ${DAYS[today.day]}`}>
          <button className={`bigCycle ${currentState.className}`} onClick={() => cycleDay(today.week, today.day)}>
            {currentState.label}
            <small>tap to cycle workout / rest / cheat</small>
          </button>

          <h3>Daily Checks</h3>
          <div className="row">
            <Toggle active={data.protein[currentKey]} onClick={() => toggle("protein", currentKey)}>
              Protein
            </Toggle>
            <Toggle active={data.creatine[currentKey]} onClick={() => toggle("creatine", currentKey)}>
              Creatine
            </Toggle>
          </div>

          <h3>Notes</h3>
          <textarea
            value={data.notes[currentKey] || ""}
            onChange={(e) => setValue("notes", currentKey, e.target.value)}
            placeholder="Quick note if needed..."
          />
        </Card>
      )}

      {screen === "iron" && (
        <Card title="Iron District">
          <p className="muted">Tap what you trained today. The full sets/reps/level builder is next.</p>
          <div className="exerciseGrid">
            {["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Cardio", "Walk"].map((exercise) => {
              const exKey = `${currentKey}-${exercise}`;
              return (
                <Toggle key={exercise} active={data.exercises[exKey]} onClick={() => toggle("exercises", exKey)}>
                  {exercise}
                </Toggle>
              );
            })}
          </div>
        </Card>
      )}

      {screen === "hydration" && (
        <Card title="Hydration Bay">
          <div className="water">{waterOz} oz</div>
          <p className="muted">{waterCups} Sunshine cup(s) × 26 oz</p>
          <Progress value={(waterOz / WATER_GOAL) * 100} />
          <div className="row">
            <button className="primary" onClick={() => addWater(1)}>
              +26 oz
            </button>
            <button onClick={() => addWater(-1)}>-26 oz</button>
          </div>
        </Card>
      )}

      {screen === "scale" && (
        <Card title="Scale Street">
          <WeighIns week={today.week} data={data} setValue={setValue} weightKey={weightKey} />
          <h3>Weight Road</h3>
          <p>Start: {START_WEIGHT} lb</p>
          <p>Latest: {latestWeight || "—"} lb</p>
          <p>Lost: {poundsLost.toFixed(1)} lb</p>
          <Progress value={(poundsLost / GOAL_LOSS) * 100} />
        </Card>
      )}

      {screen === "joan" && (
        <Card title="The Joan">
          <div className="featurePanel">🏟️ The Joan is waiting.</div>
          <p className="muted">
            This is one of the bridge pieces — something on the horizon so the summer gap doesn’t hollow you out.
          </p>
        </Card>
      )}

      {screen === "diamond" && (
        <Card title="Diamond District">
          <div className="featurePanel">⚾ First pitch ready.</div>
          <p className="muted">
            Fall baseball prep, Zander’s work, and the version of you that’s ready when the season starts.
          </p>
        </Card>
      )}

      {screen === "family" && (
        <Card title="Family Park">
          <p className="muted">
            The dad mission. Zander gets prep and shared sports moments. Isabella gets dedicated dad time in her world.
          </p>
          <Toggle active={data.family[currentKey]} onClick={() => toggle("family", currentKey)}>
            Family moment logged
          </Toggle>
        </Card>
      )}

      {screen === "hq" && (
        <Card title="Sunshine TMT HQ">
          <div className="featurePanel">☀️ HQ coming online.</div>
          <p className="muted">
            Long term, this becomes your Sunshine TMT brand hub: graphics, betting cards, Diamond Watch, records, and recaps.
          </p>
        </Card>
      )}

      {screen === "progress" && (
        <>
          <Card title="Progress Board">
            <p>Workout days: <strong>{totals.workouts}</strong></p>
            <p>Hydration goal days: <strong>{totals.hydration}</strong></p>
            <p>Rest days: <strong>{totals.rest}</strong></p>
            <p>Cheat days: <strong>{totals.cheat}</strong></p>
          </Card>

          <Card title="Consistency Lights">
            <div className="grid77">
              {Array.from({ length: WEEKS * 7 }).map((_, idx) => {
                const w = Math.floor(idx / 7);
                const d = idx % 7;
                const state = dayStates[data.days[key(w, d)] || 0];
                return <div key={idx} className={`cell ${state.className}`} />;
              })}
            </div>
          </Card>

          <Card title="Weight by Week">
            {Array.from({ length: WEEKS }).map((_, w) => (
              <div className="progressRow" key={w}>
                <span>Week {w + 1}</span>
                <span>Wed: {data.weights[weightKey(w, "wed")] || "—"}</span>
                <span>Sat: {data.weights[weightKey(w, "sat")] || "—"}</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {screen === "save" && (
        <Card title="Save Garage">
          <p className="notice">Your app saves on this phone. Save code is your backup before updates.</p>
          <button className="primary" onClick={exportCode}>Generate Save Code</button>
          <textarea
            className="saveBox"
            value={saveCode}
            onChange={(e) => setSaveCode(e.target.value)}
            placeholder="Generate or paste save code here"
          />
          <button onClick={importCode}>Load Save Code</button>
        </Card>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="card">
      <p className="kicker">SUNSHINE CITY</p>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Stat({ label, value, hot }) {
  return (
    <div className={`stat ${hot ? "hot" : ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Progress({ value }) {
  return (
    <div className="bar">
      <div className="fill" style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }} />
    </div>
  );
}

function Toggle({ active, onClick, children }) {
  return (
    <button className={active ? "checked" : ""} onClick={onClick}>
      {children} {active ? "✅" : ""}
    </button>
  );
}

function WeighIns({ week, data, setValue, weightKey }) {
  return (
    <div className="two">
      <label>
        <span>Wednesday weigh-in</span>
        <input
          type="number"
          step="0.1"
          value={data.weights[weightKey(week, "wed")] || ""}
          onChange={(e) => setValue("weights", weightKey(week, "wed"), e.target.value)}
          placeholder="Weight"
        />
      </label>
      <label>
        <span>Saturday weigh-in</span>
        <input
          type="number"
          step="0.1"
          value={data.weights[weightKey(week, "sat")] || ""}
          onChange={(e) => setValue("weights", weightKey(week, "sat"), e.target.value)}
          placeholder="Weight"
        />
      </label>
    </div>
  );
}
