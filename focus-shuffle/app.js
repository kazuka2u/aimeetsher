(() => {
  /* ---------------- mock data ---------------- */

  const deviceSignals = {
    sourceSummary: "Phone, watch, calendar, and workspace signals are already connected.",
    inferredTaskType: "deep work",
    inferredMood: "scattered",
  };

  const mockFactors = {
    location: "Home desk",
    health: "Mild eye strain",
    sleep: "5.5h sleep last night",
    weather: "Rainy, low sunlight",
    calendar: "42 min until next meeting",
    team: "3 teammates are currently in focus mode",
  };

  function factorChips() {
    return [
      { label: "Phone", value: mockFactors.location, tag: "home desk" },
      { label: "Watch", value: "Sleep 5.5h", tag: "low sleep" },
      { label: "Weather", value: "Rainy", tag: "rainy" },
      { label: "Calendar", value: "42 min gap", tag: "calendar gap over 40 minutes" },
      { label: "Workspace", value: "3 people focusing", tag: "team members available" },
      { label: "Health", value: "Eye strain", tag: "eye strain" },
      { label: "Focus app", value: "Deep work", tag: "deep work" },
      { label: "Watch", value: "Scattered state", tag: "scattered" },
    ];
  }

  const recipes = [
    {
      id: "standing-sound-sprint",
      title: "Standing Sound Sprint",
      subtitle: "Raise stimulation without leaving your desk.",
      bestFor: ["sleepy", "bored", "low energy"],
      taskTypes: ["admin task", "creative work"],
      factors: ["low sleep", "home desk", "rainy"],
      time: "25 min",
      steps: [
        "Stand up or raise your desk.",
        "Play loud instrumental music or brown noise.",
        "Pick one ugly 5-minute starting task.",
        "Work until the timer ends. No optimization.",
      ],
      mood: "low energy",
    },
    {
      id: "silent-deep-cave",
      title: "Silent Deep Cave",
      subtitle: "Disappear into one tiny output.",
      bestFor: ["distracted", "overwhelmed"],
      taskTypes: ["deep work"],
      factors: ["calendar gap over 40 minutes", "home desk"],
      time: "45 min",
      steps: [
        "Turn on white noise.",
        "Hide notifications.",
        "Write the next tiny output.",
        "Do one 45-minute block.",
      ],
      mood: "calm",
    },
    {
      id: "body-double-ping",
      title: "Body Double Ping",
      subtitle: "Borrow focus from people working nearby.",
      bestFor: ["isolated"],
      taskTypes: ["communication", "admin task"],
      factors: ["team members available"],
      time: "25 min",
      steps: [
        "Join a silent focus room.",
        "Declare your task in one sentence.",
        "Work for 25 minutes.",
        "Report done / not done.",
      ],
      mood: "scattered",
    },
    {
      id: "cafe-reset",
      title: "Cafe Reset",
      subtitle: "A change of place resets your loop.",
      bestFor: ["restless", "distracted"],
      taskTypes: ["creative work", "learning"],
      factors: ["home desk"],
      time: "30 min",
      steps: [
        "Leave your current desk.",
        "Move to a cafe, lobby, or shared space.",
        "Do only one lightweight task first.",
        "Re-enter deep work after momentum returns.",
      ],
      mood: "scattered",
    },
    {
      id: "mood-unclench",
      title: "Mood Unclench",
      subtitle: "Lower the tension before you start.",
      bestFor: ["tense", "frustrated", "overwhelmed"],
      taskTypes: ["deep work", "meeting prep"],
      factors: ["eye strain"],
      time: "10 min",
      steps: [
        "Full-screen breathing animation for 60 seconds.",
        "Relax your shoulders.",
        "Write what \"done\" means in one sentence.",
        "Start with the smallest visible step.",
      ],
      mood: "tense",
    },
    {
      id: "calendar-gap-attack",
      title: "Calendar Gap Attack",
      subtitle: "Use this short window before the next meeting.",
      bestFor: ["scattered", "task unclear"],
      taskTypes: ["meeting prep", "admin task"],
      factors: ["calendar gap over 40 minutes"],
      time: "15 min",
      steps: [
        "Do not start deep work.",
        "Pick one 10-minute admin task.",
        "Clear one blocker.",
        "Stop before the next meeting.",
      ],
      mood: "scattered",
    },
  ];

  const moodColors = {
    calm:        { core: "#9ee7d7", edge: "#b8a6ff", glow1: "rgba(158,231,215,.28)", glow2: "rgba(184,166,255,.16)" },
    tense:       { core: "#b8a6ff", edge: "#9ee7d7", glow1: "rgba(184,166,255,.30)", glow2: "rgba(158,231,215,.14)" },
    "low energy":{ core: "#ffca8a", edge: "#b8a6ff", glow1: "rgba(255,202,138,.30)", glow2: "rgba(184,166,255,.14)" },
    scattered:   { core: "#8aa6ff", edge: "#b8a6ff", glow1: "rgba(138,166,255,.30)", glow2: "rgba(184,166,255,.16)" },
    frustrated:  { core: "#ff8a9a", edge: "#b8a6ff", glow1: "rgba(255,138,154,.28)", glow2: "rgba(184,166,255,.14)" },
    numb:        { core: "#8a9bb0", edge: "#b8a6ff", glow1: "rgba(138,155,176,.26)", glow2: "rgba(184,166,255,.12)" },
  };

  const learningCopies = {
    "standing-sound-sprint": "Standing + sound seems useful when you are low energy at home.",
    "silent-deep-cave": "Silence and a tiny first step help when you feel overwhelmed at your desk.",
    "body-double-ping": "Working alongside others — even quietly — helps when you feel isolated.",
    "cafe-reset": "A change of place helps shake loose a restless mind.",
    "mood-unclench": "A short breathing pause helps before tense or frustrated work.",
    "calendar-gap-attack": "Small admin wins fit well into short gaps before meetings.",
  };

  /* ---------------- state ---------------- */

  const state = {
    stuckType: null,
    taskType: null,
    mood: null,
    recipe: null,
    shuffleQueue: [],
    shuffleIndex: 0,
    result: null,
    moodAfter: null,
    sessionTimer: null,
  };

  /* ---------------- screen navigation ---------------- */

  const screens = {};
  document.querySelectorAll(".screen").forEach((el) => {
    screens[el.dataset.screen] = el;
  });

  function goTo(name) {
    Object.values(screens).forEach((el) => el.classList.remove("active"));
    screens[name].classList.add("active");
    onEnter(name);
  }

  function onEnter(name) {
    if (name === "scan") runFactorScan();
    if (name === "shuffle") runShuffle();
    if (name === "result") renderRecipe();
    if (name === "session") startSession();
    if (name === "landing") resetState();
    if (name === "learned") renderLearned();
  }

  function resetState() {
    state.stuckType = null;
    state.taskType = null;
    state.mood = null;
    state.recipe = null;
    state.result = null;
    state.moodAfter = null;
    if (state.sessionTimer) clearInterval(state.sessionTimer);
    document.querySelectorAll(".choice-card.selected, .mood-orb.selected")
      .forEach((el) => el.classList.remove("selected"));
    setMoodTheme(null);
  }

  function hydrateFromDeviceSignals() {
    state.taskType = deviceSignals.inferredTaskType;
    state.mood = deviceSignals.inferredMood;
    setMoodTheme(state.mood);
  }

  /* ---------------- next-button wiring ---------------- */

  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => goTo(btn.dataset.next));
  });

  /* selection cards (stuck type, task type, feedback result) */
  document.querySelectorAll(".card-grid[data-group]").forEach((grid) => {
    const group = grid.dataset.group;
    grid.querySelectorAll(".choice-card").forEach((card) => {
      card.addEventListener("click", () => {
        grid.querySelectorAll(".choice-card").forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
        const value = card.dataset.value;

        if (group === "stuckType") {
          state.stuckType = value;
          hydrateFromDeviceSignals();
          setTimeout(() => goTo("scan"), 320);
        } else if (group === "taskType") {
          state.taskType = value;
          setTimeout(() => goTo("mood"), 320);
        } else if (group === "result") {
          state.result = value;
        }
      });
    });
  });

  /* mood orbs (mood check-in + feedback moodAfter) */
  document.querySelectorAll(".mood-grid[data-group]").forEach((grid) => {
    const group = grid.dataset.group;
    grid.querySelectorAll(".mood-orb").forEach((orb) => {
      orb.addEventListener("click", () => {
        grid.querySelectorAll(".mood-orb").forEach((o) => o.classList.remove("selected"));
        orb.classList.add("selected");
        const value = orb.dataset.value;

        if (group === "mood") {
          state.mood = value;
          setMoodTheme(value);
          setTimeout(() => goTo("scan"), 320);
        } else if (group === "moodAfter") {
          state.moodAfter = value;
          saveFeedback();
          setTimeout(() => goTo("learned"), 500);
        }
      });
    });
  });

  /* ---------------- mood theming ---------------- */

  function setMoodTheme(mood) {
    const root = document.documentElement;
    const c = moodColors[mood] || moodColors.calm;
    if (!mood) {
      root.style.removeProperty("--orb-core");
      root.style.removeProperty("--orb-edge");
      root.style.removeProperty("--orb-glow-1");
      root.style.removeProperty("--orb-glow-2");
      root.style.removeProperty("--mood-color-glow");
      return;
    }
    root.style.setProperty("--orb-core", c.core);
    root.style.setProperty("--orb-edge", c.edge);
    root.style.setProperty("--orb-glow-1", c.glow1);
    root.style.setProperty("--orb-glow-2", c.glow2);
    root.style.setProperty("--mood-color-glow", c.glow1);
  }

  /* ---------------- factor scan ---------------- */

  function runFactorScan() {
    const stack = document.getElementById("chipStack");
    const footer = document.getElementById("scanFooter");
    const title = document.getElementById("scanTitle");
    const deviceCopy = document.getElementById("deviceCopy");
    const chips = factorChips();
    stack.innerHTML = "";
    footer.style.opacity = "0";
    title.textContent = "Reading your work state…";
    deviceCopy.textContent = deviceSignals.sourceSummary;

    chips.forEach((f, i) => {
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.innerHTML = `<span class="chip-label">${f.label}</span><span class="chip-value">${f.value}</span>`;
      stack.appendChild(chip);

      setTimeout(() => chip.classList.add("show"), 200 + i * 220);
      setTimeout(() => chip.classList.add("glow"), 400 + i * 220);
      setTimeout(() => chip.classList.remove("glow"), 900 + i * 220);
    });

    const totalDelay = 200 + chips.length * 220 + 700;

    setTimeout(() => {
      title.textContent = "Matching a recipe that changes your state, not your office.";
      stack.querySelectorAll(".chip").forEach((chip) => chip.classList.add("collapse"));
      footer.style.transition = "opacity .6s var(--ease-soft)";
      footer.style.opacity = "1";
    }, totalDelay);

    setTimeout(() => goTo("shuffle"), totalDelay + 1400);
  }

  /* ---------------- scoring ---------------- */

  function getFactorTags() {
    return factorChips().map((f) => f.tag);
  }

  function scoreRecipe(recipe, st) {
    let score = 0;
    if (recipe.bestFor.includes(st.stuckType)) score += 4;
    if (recipe.taskTypes.includes(st.taskType)) score += 3;
    if (recipe.bestFor.includes(st.mood)) score += 2;
    getFactorTags().forEach((tag) => {
      if (recipe.factors.includes(tag)) score += 1;
    });
    return score;
  }

  function rankedRecipes() {
    return [...recipes]
      .map((r) => ({ recipe: r, score: scoreRecipe(r, state) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.recipe);
  }

  /* ---------------- shuffle animation ---------------- */

  function runShuffle() {
    const top = rankedRecipes().slice(0, 3);
    // slight randomness
    state.shuffleQueue = top;
    const pick = top[Math.floor(Math.random() * Math.min(2, top.length))];
    state.recipe = pick;

    const stage = document.getElementById("shuffleStage");
    stage.innerHTML = "";
    const labels = document.querySelectorAll("#leverLabels span");
    labels.forEach((l) => l.classList.remove("active"));

    // floating mini cards
    const palette = recipes;
    for (let i = 0; i < 5; i++) {
      const card = document.createElement("div");
      card.className = "shuffle-card";
      card.textContent = palette[(i * 2) % palette.length].title.split(" ")[0];
      card.style.animationDelay = `${i * 0.12}s`;
      card.style.left = `calc(50% + ${(Math.random() * 160 - 80)}px)`;
      card.style.top = `calc(50% + ${(Math.random() * 120 - 60)}px)`;
      stage.appendChild(card);
    }

    // cycle lever labels
    let li = 0;
    const leverInterval = setInterval(() => {
      labels.forEach((l) => l.classList.remove("active"));
      labels[li % labels.length].classList.add("active");
      li++;
    }, 220);

    setTimeout(() => {
      clearInterval(leverInterval);
      setMoodTheme(pick.mood);
      goTo("result");
    }, 1900);
  }

  /* ---------------- recipe result ---------------- */

  function renderRecipe() {
    const r = state.recipe;
    const card = document.getElementById("recipeCard");
    card.classList.remove("land");
    // restart landing animation
    requestAnimationFrame(() => card.classList.add("land"));

    document.getElementById("recipeTitle").textContent = r.title;
    document.getElementById("recipeSubtitle").textContent = r.subtitle;
    document.getElementById("recipeTime").textContent = r.time;

    const matchedTags = [];
    if (state.stuckType) matchedTags.push(state.stuckType);
    getFactorTags().forEach((tag) => {
      if (r.factors.includes(tag) && matchedTags.length < 4) matchedTags.push(tag);
    });
    if (state.taskType && matchedTags.length < 4) matchedTags.push(state.taskType);
    document.getElementById("matchedTags").textContent = matchedTags.join(" · ");

    const stepsEl = document.getElementById("recipeSteps");
    stepsEl.innerHTML = "";
    r.steps.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      stepsEl.appendChild(li);
    });
  }

  document.getElementById("acceptBtn").addEventListener("click", () => goTo("session"));

  document.getElementById("remixBtn").addEventListener("click", () => {
    const top = state.shuffleQueue;
    let next = top[Math.floor(Math.random() * top.length)];
    if (top.length > 1 && next.id === state.recipe.id) {
      next = top.find((r) => r.id !== state.recipe.id) || next;
    }
    state.recipe = next;
    setMoodTheme(next.mood);
    goTo("shuffle");
  });

  /* ---------------- session ---------------- */

  function startSession() {
    const r = state.recipe;
    const minutes = parseInt(r.time, 10) || 25;
    document.getElementById("sessionTime").textContent = minutes;
    document.getElementById("sessionSummary").textContent = r.steps.slice(0, 3).join(" · ");

    const ring = document.getElementById("ringFg");
    const circumference = 2 * Math.PI * 52;
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = "0";

    const timeEl = document.getElementById("ringTime");

    const totalSeconds = minutes * 60;
    let remaining = totalSeconds;
    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    timeEl.textContent = formatTime(remaining);

    if (state.sessionTimer) clearInterval(state.sessionTimer);
    state.sessionTimer = setInterval(() => {
      remaining -= 1;
      if (remaining < 0) remaining = 0;
      const frac = remaining / totalSeconds;
      ring.style.strokeDashoffset = `${circumference * (1 - frac)}`;
      timeEl.textContent = formatTime(remaining);
      if (remaining <= 0) clearInterval(state.sessionTimer);
    }, 1000);
  }

  document.getElementById("finishBtn").addEventListener("click", () => {
    if (state.sessionTimer) clearInterval(state.sessionTimer);
    goTo("feedback");
  });

  /* ---------------- feedback / learning ---------------- */

  function saveFeedback() {
    const entry = {
      recipeId: state.recipe.id,
      result: state.result,
      moodBefore: state.mood,
      moodAfter: state.moodAfter,
      timestamp: Date.now(),
    };
    try {
      const key = "focusShuffleFeedback";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(entry);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      /* localStorage unavailable, ignore */
    }
  }

  function renderLearned() {
    const text = learningCopies[state.recipe.id] || "This recipe has been added to your patterns.";
    document.getElementById("learnedText").textContent = text;
    setMoodTheme(state.moodAfter || state.mood);
  }

  /* ---------------- init ---------------- */

  goTo("landing");
})();
