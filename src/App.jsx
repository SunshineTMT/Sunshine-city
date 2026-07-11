
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
  Gift,
  WalletCards,
  Utensils,
  Car,
  IceCreamBowl,
  Shield,
  PlusCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

const START = new Date("2026-07-06T00:00:00");
const END = new Date("2026-09-20T00:00:00");
const VACATION = new Date("2026-08-15T00:00:00");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CUP_OZ = 26;
const WATER_GOAL_CUPS = 5;
const START_WEIGHT = 210;
const GOAL_WEIGHT = 198;
const VACATION_GOAL = 1080;

const routine = [
  { id: "chest", name: "Chest Press", sets: 3, reps: 12, level: 8, goal: 12 },
  { id: "triceps", name: "Tricep Pushdown", sets: 3, reps: 12, level: 5, goal: 7 },
  { id: "lat", name: "Lat Pulldown", sets: 3, reps: 12, level: 6, goal: 8 },
  { id: "legs", name: "Leg Curls", sets: 3, reps: 25, level: 6, goal: 8 },
];

const paychecks = [
  { id: "d0713", date: "Jul 13", person: "Deanna", amount: 60 },
  { id: "d0720", date: "Jul 20", person: "Deanna", amount: 60 },
  { id: "j0723", date: "Jul 23", person: "Jordan", amount: 190 },
  { id: "d0727", date: "Jul 27", person: "Deanna", amount: 60 },
  { id: "d0803", date: "Aug 3", person: "Deanna", amount: 60 },
  { id: "j0806", date: "Aug 6", person: "Jordan", amount: 190 },
  { id: "d0810", date: "Aug 10", person: "Deanna", amount: 60 },
];

const budget = {
  food: 425,
  iceCream: 75,
  gas: 80,
  jordan: 200,
  deanna: 200,
  buffer: 100,
};

const blankData = {
  water: {},
  weights: {},
  sets: {},
  protein: {},
  creatine: {},
  walk: {},
  family: {},
  notes: {},
  surprise: {
    safeCash: 0,
    extraEntries: [],
    paychecks: {},
    spent: {},
    paid: {
      hotel: true,
      attractions: true,
    },
  },
};

function mergeLoaded(raw) {
  return {
    ...blankData,
    ...raw,
    surprise: {
      ...blankData.surprise,
      ...(raw?.surprise || {}),
      paid: {
        ...blankData.surprise.paid,
        ...(raw?.surprise?.paid || {}),
      },
      paychecks: {
        ...(raw?.surprise?.paychecks || {}),
      },
      spent: {
        ...(raw?.surprise?.spent || {}),
      },
      extraEntries: Array.isArray(raw?.surprise?.extraEntries)
        ? raw.surprise.extraEntries
        : [],
    },
  };
}

function safeLoad() {
  try {
    const current = localStorage.getItem("sunshine-city-v13a");
    if (current) return mergeLoaded(JSON.parse(current));

    const legacy = localStorage.getItem("sc-v12");
    if (legacy) {
      const old = JSON.parse(legacy);
      return mergeLoaded({
        ...old,
        surprise: {
          safeCash: old?.vacation?.safeCash || 0,
          extraEntries: old?.vacation?.extra
            ? [{ id: Date.now(), amount: Number(old.vacation.extra), note: "Imported extra savings", date: new Date().toLocaleDateString() }]
            : [],
          paychecks: old?.vacation?.paychecks || {},
          spent: old?.vacation?.spent || {},
          paid: { hotel: true, attractions: true },
        },
      });
    }
  } catch {
    return blankData;
  }
  return blankData;
}

function money(value) {
  return `$${Number(value || 0).toFixed(0)}`;
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
    const diff = Math.floor(
      (new Date(now.getFullYear(), now.getMonth(), now.getDate()) - START) / 86400000
    );
    const safe = Math.max(0, Math.min(diff, 76));
    return {
      week: Math.floor(safe / 7),
      day: safe % 7,
      missionDay: safe + 1,
    };
  }, []);

  const currentKey = `w${today.week}-d${today.day}`;
  const weightKey = (type) => `w${today.week}-${type}`;

  const daysLeft = Math.max(0, Math.ceil((END - new Date()) / 86400000));
  const vacationDays = Math.max(0, Math.ceil((VACATION - new Date()) / 86400000));

  const cups = data.water[currentKey] || 0;
  const waterOz = cups * CUP_OZ;
  const hydrationDone = cups >= WATER_GOAL_CUPS;

  const latestWeight = Object.values(data.weights).map(Number).filter(Boolean).at(-1);
  const poundsLost = latestWeight ? START_WEIGHT - latestWeight : 0;

  const completedSets = routine.reduce((sum, exercise) => {
    return sum + [1, 2, 3].filter((setNumber) => data.sets[`${currentKey}-${exercise.id}-${setNumber}`]).length;
  }, 0);
  const goalLineDone = completedSets === 12;

  const paycheckSaved = paychecks
    .filter((item) => data.surprise.paychecks[item.id])
    .reduce((sum, item) => sum + item.amount, 0);

  const extraSaved = data.surprise.extraEntries.reduce(
    (sum, entry) => sum + Number(entry.amount || 0),
    0
  );

  const totalSaved = paycheckSaved + Number(data.surprise.safeCash || 0) + extraSaved;
  const totalSpent = Object.values(data.surprise.spent).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  const cityPowerChecks = [
    hydrationDone,
    goalLineDone,
    Boolean(data.protein[currentKey]),
    Boolean(data.creatine[currentKey]),
    Boolean(data.walk[currentKey]),
  ];
  const cityPower = cityPowerChecks.filter(Boolean).length;

  function update(mutator) {
    setData((previous) => {
      const next = structuredClone(previous);
      mutator(next);
      localStorage.setItem("sunshine-city-v13a", JSON.stringify(next));
      return next;
    });
  }

  function toggle(section, key) {
    update((next) => {
      next[section][key] = !next[section][key];
    });
  }

  function addWater(amount) {
    update((next) => {
      next.water[currentKey] = Math.max(0, (next.water[currentKey] || 0) + amount);
    });
  }

  function setWeight(type, value) {
    update((next) => {
      next.weights[weightKey(type)] = value;
    });
  }

  function addExtraSaving(amount, note) {
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) return;

    update((next) => {
      next.surprise.extraEntries.unshift({
        id: Date.now(),
        amount: numeric,
        note: note.trim() || "Extra savings",
        date: new Date().toLocaleDateString(),
      });
    });
  }

  function removeExtraSaving(id) {
    update((next) => {
      next.surprise.extraEntries = next.surprise.extraEntries.filter((entry) => entry.id !== id);
    });
  }

  function exportCode() {
    setSaveCode(encodeData(data));
  }

  function importCode() {
    try {
      const parsed = mergeLoaded(decodeData(saveCode.trim()));
      setData(parsed);
      localStorage.setItem("sunshine-city-v13a", JSON.stringify(parsed));
      alert("Save code loaded.");
    } catch {
      alert("That save code didn't work.");
    }
  }

  const districts = [
    ["mission", "Mission Control", Home, `${cityPower}/5 city power`, cityPower >= 3],
    ["goal", "The Goal Line", Dumbbell, `${completedSets}/12 sets`, goalLineDone],
    ["hydration", "Hydration Bay", Droplets, `${waterOz} oz`, hydrationDone],
    ["film", "Film Room", Scale, "Wednesday + Saturday review", Boolean(data.weights[weightKey("wed")] || data.weights[weightKey("sat")])],
    ["conditioning", "Conditioning Field", Landmark, "Mileage tracker coming next", Boolean(data.walk[currentKey])],
    ["surprise", "The Surprise", Gift, `${vacationDays} days to Pigeon Forge`, totalSaved >= 680],
    ["clubhouse", "The Clubhouse", CircleDot, "Baseball headquarters", false],
    ["family", "Family Park", Heart, "Dad mission", Boolean(data.family[currentKey])],
    ["hq", "Sunshine TMT HQ", Sun, "Brand command center", false],
    ["progress", "Progress Board", Trophy, "Season stats", false],
    ["save", "Save Garage", Save, "Backup code", false],
  ];

  return (
    <div className="app">
      <div className="glow glowPink" />
      <div className="glow glowCyan" />

      <header className={`hero ${cityPower === 5 ? "heroLit" : ""}`}>
        <div className="skyline" />
        <p className="kicker">SUNSHINE CITY LIMITS</p>
        <h1>Sunshine City</h1>
        <p className="tagline">Training Complex for Life</p>

        <div className="versionBadge">v1.3A • Training Complex Update</div>

        <div className="heroStats">
          <Stat label="mission day" value={today.missionDay} />
          <Stat label="days left" value={daysLeft} hot />
          <Stat label="city power" value={`${cityPower}/5`} />
        </div>
      </header>

      {screen !== "city" && (
        <button className="backButton" onClick={() => setScreen("city")}>
          ← Back to City Map
        </button>
      )}

      {screen === "city" && (
        <>
          <Card special title={cityPower === 5 ? "City fully lit." : "Build the city today."}>
            <p className="muted">
              Hydration {cups}/5 • Goal Line {completedSets}/12 • The Surprise {money(totalSaved)}/{money(VACATION_GOAL)}
            </p>
            <Progress value={cityPower * 20} />
          </Card>

          <section className="cityMap">
            {districts.map(([id, name, Icon, description, lit]) => (
              <button
                key={id}
                className={`district ${lit ? "lit" : ""}`}
                onClick={() => setScreen(id)}
              >
                <Building2 className="buildingGhost" size={54} />
                <Icon className="districtIcon" size={28} />
                <span>{name}</span>
                <small>{description}</small>
              </button>
            ))}
          </section>
        </>
      )}

      {screen === "mission" && (
        <Card title={`Mission Control • ${DAYS[today.day]} • Week ${today.week + 1}`}>
          <div className="scoreGrid">
            <Score label="Weight" value={`${latestWeight || START_WEIGHT} lb`} />
            <Score label="Lost" value={`${poundsLost.toFixed(1)} lb`} />
            <Score label="Water" value={`${cups}/5`} />
            <Score label="Goal Line" value={`${completedSets}/12`} />
          </div>

          <h3>Daily Checks</h3>
          <div className="twoColumn">
            <Toggle active={data.walk[currentKey]} onClick={() => toggle("walk", currentKey)}>Conditioning</Toggle>
            <Toggle active={data.protein[currentKey]} onClick={() => toggle("protein", currentKey)}>Protein</Toggle>
            <Toggle active={data.creatine[currentKey]} onClick={() => toggle("creatine", currentKey)}>Creatine</Toggle>
            <Toggle active={data.family[currentKey]} onClick={() => toggle("family", currentKey)}>Family</Toggle>
          </div>

          <h3>Coach Notes</h3>
          <textarea
            value={data.notes[currentKey] || ""}
            onChange={(event) => update((next) => { next.notes[currentKey] = event.target.value; })}
            placeholder="Quick note..."
          />
        </Card>
      )}

      {screen === "goal" && (
        <Card title="The Goal Line">
          <p className="muted">
            Complete all 12 sets and punch it into the end zone.
          </p>
          <Progress value={(completedSets / 12) * 100} />

          {routine.map((exercise) => (
            <div className="exerciseCard" key={exercise.id}>
              <h3>{exercise.name}</h3>
              <p className="muted">
                3×{exercise.reps} • Current Level {exercise.level} • Goal {exercise.goal}
              </p>

              <div className="setRow">
                {[1, 2, 3].map((setNumber) => {
                  const setKey = `${currentKey}-${exercise.id}-${setNumber}`;
                  const complete = Boolean(data.sets[setKey]);

                  return (
                    <button
                      key={setKey}
                      className={complete ? "setDone" : "setButton"}
                      onClick={() => toggle("sets", setKey)}
                    >
                      {setNumber === 3 ? "Goal Line" : `Set ${setNumber}`} {complete ? "✅" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {goalLineDone && (
            <div className="cashBanner">🏈 TOUCHDOWN — THE GOAL LINE COMPLETE</div>
          )}
        </Card>
      )}

      {screen === "hydration" && (
        <Card title="Hydration Bay">
          <div className="waterTower">
            <div
              className="waterFill"
              style={{ height: `${Math.min(100, (cups / WATER_GOAL_CUPS) * 100)}%` }}
            />
            <span>{waterOz} oz</span>
          </div>

          <p className="muted">{cups} Sunshine cup(s) × 26 oz</p>
          <Progress value={(waterOz / 130) * 100} />

          <div className="twoColumn">
            <button className="primary" onClick={() => addWater(1)}>+26 oz</button>
            <button onClick={() => addWater(-1)}>-26 oz</button>
          </div>

          {hydrationDone && (
            <div className="cashBanner">🏆 HYDRATION BAY CASHED</div>
          )}
        </Card>
      )}

      {screen === "film" && (
        <Card title="Film Room">
          <p className="muted">
            Wednesday and Saturday are review days. The scale is feedback, not judgment.
          </p>

          <div className="twoColumn">
            <label>
              <span>Wednesday Review</span>
              <input
                type="number"
                step="0.1"
                value={data.weights[weightKey("wed")] || ""}
                onChange={(event) => setWeight("wed", event.target.value)}
                placeholder="Weight"
              />
            </label>

            <label>
              <span>Saturday Review</span>
              <input
                type="number"
                step="0.1"
                value={data.weights[weightKey("sat")] || ""}
                onChange={(event) => setWeight("sat", event.target.value)}
                placeholder="Weight"
              />
            </label>
          </div>

          <h3>Film Review</h3>
          <p>Start: {START_WEIGHT} lb</p>
          <p>Latest: {latestWeight || "—"} lb</p>
          <p>Goal: {GOAL_WEIGHT} lb</p>
          <p>Season change: {poundsLost.toFixed(1)} lb</p>
          <Progress value={(poundsLost / (START_WEIGHT - GOAL_WEIGHT)) * 100} />
        </Card>
      )}

      {screen === "conditioning" && (
        <Placeholder
          title="Conditioning Field"
          text="🏈 Mileage tracking is the next construction phase. For now, today’s conditioning check still counts toward City Power."
        />
      )}

      {screen === "surprise" && (
        <Surprise
          data={data}
          update={update}
          addExtraSaving={addExtraSaving}
          removeExtraSaving={removeExtraSaving}
          totalSaved={totalSaved}
          paycheckSaved={paycheckSaved}
          extraSaved={extraSaved}
          totalSpent={totalSpent}
          vacationDays={vacationDays}
        />
      )}

      {screen === "clubhouse" && (
        <Placeholder
          title="The Clubhouse"
          text="⚾ Baseball headquarters is open. Zander’s schedule, milestones, and trophy case come in a future update."
        />
      )}

      {screen === "family" && (
        <Card title="Family Park">
          <p className="muted">
            Zander gets prep and shared sports moments. Isabella gets dedicated dad time in her world.
          </p>
          <Toggle active={data.family[currentKey]} onClick={() => toggle("family", currentKey)}>
            Family moment logged
          </Toggle>
        </Card>
      )}

      {screen === "hq" && (
        <Placeholder title="Sunshine TMT HQ" text="☀️ Brand command center coming later." />
      )}

      {screen === "progress" && (
        <Placeholder title="Progress Board" text="📊 City Lights Calendar and streak tracking arrive in v1.3B." />
      )}

      {screen === "save" && (
        <Card title="Save Garage">
          <p className="notice">
            Generate a save code before major updates.
          </p>
          <button className="primary" onClick={exportCode}>Generate Save Code</button>
          <textarea
            className="saveBox"
            value={saveCode}
            onChange={(event) => setSaveCode(event.target.value)}
            placeholder="Generate or paste save code here"
          />
          <button onClick={importCode}>Load Save Code</button>
        </Card>
      )}
    </div>
  );
}

function Surprise({
  data,
  update,
  addExtraSaving,
  removeExtraSaving,
  totalSaved,
  paycheckSaved,
  extraSaved,
  totalSpent,
  vacationDays,
}) {
  const [extraAmount, setExtraAmount] = useState("");
  const [extraNote, setExtraNote] = useState("");

  const remainingCash = Math.max(0, VACATION_GOAL - totalSpent);

  return (
    <Card title="The Surprise">
      <p className="muted">
        Pigeon Forge • August 15 • 4 days • Team Craig
      </p>

      <div className="scoreGrid">
        <Score label="Days Left" value={vacationDays} />
        <Score label="Saved" value={money(totalSaved)} />
        <Score label="Goal" value={money(VACATION_GOAL)} />
        <Score label="Needed" value={money(Math.max(0, VACATION_GOAL - totalSaved))} />
      </div>

      <Progress value={(totalSaved / VACATION_GOAL) * 100} />

      <h3>Already Paid</h3>
      <div className="paidGrid">
        <Toggle
          active={data.surprise.paid.hotel}
          onClick={() => update((next) => {
            next.surprise.paid.hotel = !next.surprise.paid.hotel;
          })}
        >
          Hotel
        </Toggle>

        <Toggle
          active={data.surprise.paid.attractions}
          onClick={() => update((next) => {
            next.surprise.paid.attractions = !next.surprise.paid.attractions;
          })}
        >
          Attractions $215
        </Toggle>
      </div>

      <h3>Funding Sources</h3>
      <div className="fundingGrid">
        <div className="fundingCard">
          <span>Planned Paychecks</span>
          <strong>{money(paycheckSaved)}</strong>
        </div>
        <div className="fundingCard">
          <span>Extra Savings</span>
          <strong>{money(extraSaved)}</strong>
        </div>
      </div>

      <label className="singleField">
        <span>Safe Cash Used — Maximum $400</span>
        <input
          type="number"
          max="400"
          value={data.surprise.safeCash || ""}
          onChange={(event) => update((next) => {
            next.surprise.safeCash = Math.min(400, Math.max(0, Number(event.target.value || 0)));
          })}
          placeholder="0"
        />
      </label>

      <div className="notice">
        🏦 Barclays protected: $2,500 current / $2,000 minimum
      </div>

      <h3>Paycheck Plan</h3>
      {paychecks.map((item) => {
        const complete = Boolean(data.surprise.paychecks[item.id]);
        return (
          <button
            key={item.id}
            className={`paycheck ${complete ? "checked" : ""}`}
            onClick={() => update((next) => {
              next.surprise.paychecks[item.id] = !next.surprise.paychecks[item.id];
            })}
          >
            <span>{item.date}</span>
            <strong>{item.person}</strong>
            <em>Save {money(item.amount)}</em>
            {complete ? <CheckCircle2 size={18} /> : null}
          </button>
        );
      })}

      <h3>Extra Savings Ledger</h3>
      <div className="extraEntryForm">
        <input
          type="number"
          value={extraAmount}
          onChange={(event) => setExtraAmount(event.target.value)}
          placeholder="Amount"
        />
        <input
          type="text"
          value={extraNote}
          onChange={(event) => setExtraNote(event.target.value)}
          placeholder="Source or note"
        />
        <button
          className="primary"
          onClick={() => {
            addExtraSaving(extraAmount, extraNote);
            setExtraAmount("");
            setExtraNote("");
          }}
        >
          <PlusCircle size={17} /> Add Extra Savings
        </button>
      </div>

      <div className="ledger">
        {data.surprise.extraEntries.length === 0 ? (
          <p className="muted">No extra savings logged yet.</p>
        ) : (
          data.surprise.extraEntries.map((entry) => (
            <div className="ledgerRow" key={entry.id}>
              <div>
                <strong>+{money(entry.amount)}</strong>
                <span>{entry.note}</span>
                <small>{entry.date}</small>
              </div>
              <button className="iconButton" onClick={() => removeExtraSaving(entry.id)}>
                <Trash2 size={17} />
              </button>
            </div>
          ))
        )}
      </div>

      <h3>Vacation Spending</h3>
      <BudgetCard icon={<Utensils />} name="Food" category="food" amount={budget.food} data={data} update={update} />
      <BudgetCard icon={<IceCreamBowl />} name="Ice Cream" category="iceCream" amount={budget.iceCream} data={data} update={update} />
      <BudgetCard icon={<Car />} name="Gas" category="gas" amount={budget.gas} data={data} update={update} />
      <BudgetCard icon={<WalletCards />} name="Jordan" category="jordan" amount={budget.jordan} data={data} update={update} />
      <BudgetCard icon={<WalletCards />} name="Deanna" category="deanna" amount={budget.deanna} data={data} update={update} />
      <BudgetCard icon={<Shield />} name="Buffer" category="buffer" amount={budget.buffer} data={data} update={update} />

      <div className="cashBanner">
        Vacation Cash Remaining: {money(remainingCash)}
      </div>
    </Card>
  );
}

function BudgetCard({ icon, name, category, amount, data, update }) {
  const [spendAmount, setSpendAmount] = useState("");
  const spent = Number(data.surprise.spent[category] || 0);
  const remaining = amount - spent;

  return (
    <div className="budgetCard">
      <div className="budgetHeader">
        {icon}
        <div>
          <strong>{name}</strong>
          <span>{money(remaining)} left of {money(amount)}</span>
        </div>
      </div>

      <Progress value={(spent / amount) * 100} />

      <div className="twoColumn">
        <input
          type="number"
          value={spendAmount}
          onChange={(event) => setSpendAmount(event.target.value)}
          placeholder="Spend amount"
        />
        <button
          onClick={() => {
            const numeric = Number(spendAmount);
            if (!numeric || numeric <= 0) return;
            update((next) => {
              next.surprise.spent[category] = Math.max(
                0,
                Number(next.surprise.spent[category] || 0) + numeric
              );
            });
            setSpendAmount("");
          }}
        >
          Log Spend
        </button>
      </div>
    </div>
  );
}

function Card({ title, children, special }) {
  return (
    <section className={`card ${special ? "specialCard" : ""}`}>
      <p className="kicker">SUNSHINE CITY</p>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Placeholder({ title, text }) {
  return (
    <Card title={title}>
      <div className="notice">{text}</div>
    </Card>
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

function Score({ label, value }) {
  return (
    <div className="scoreCard">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Progress({ value }) {
  return (
    <div className="bar">
      <div
        className="fill"
        style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
      />
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
