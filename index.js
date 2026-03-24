//  CONFIG 
const CONFIG = {
  DIGITAL_TWIN_URL:  "https://ai-building-silk.vercel.app/", // Replace with your Vercel app URL
  GOOGLE_FORM_URL:   "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse", // Use the Google Form POST endpoint, ending in /formResponse
  SHEET_CSV_URL:     "https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?output=csv", // Use the published Google Sheet CSV URL
  SUMMARY_ENDPOINT:  "/.netlify/functions/generate-summary",
  ADMIN_PASSWORD:    "gate2026"
};

const FORM_FIELD_IDS = {
  startedAt:  "entry.000000000",
  role:       "entry.000000001",
  name:       "entry.000000002",
  task1:      "entry.000000003",
  task2:      "entry.000000004",
  task3:      "entry.000000005",
  rating3d:   "entry.000000006",
  ratingEnergy:"entry.000000007",
  ratingSolar:"entry.000000008",
  ratingIaq:  "entry.000000009",
  ratingFaults:"entry.000000010",
  ratingScenarios:"entry.000000011",
  ratingForecast:"entry.000000012",
  ratingRoles:"entry.000000013",
  mostUseful: "entry.000000014",
  needsWork:  "entry.000000015",
  overall:    "entry.000000016",
  whatWorked: "entry.000000017",
  whatNeeded: "entry.000000018",
  wouldUse:   "entry.000000019",
  other:      "entry.000000020",
  aiSummary:  "entry.000000021",
  email:      "entry.000000022"
};

//  CONSTANTS 
const ROLES = [
  {
    key: "director",

    title: "Building Director / Management",
    desc: "Strategic decisions, costs, sustainability"
  },
  {
    key: "facilities",

    title: "Facilities Manager",
    desc: "Day-to-day operations, maintenance, equipment"
  },
  {
    key: "sustainability",

    title: "Sustainability Officer",
    desc: "Carbon reporting, energy targets, green goals"
  },
  {
    key: "it",

    title: "IT Staff",
    desc: "Systems, servers, infrastructure"
  },
  {
    key: "worker",
 
    title: "Office Worker",
    desc: "Daily occupant, comfort and environment"
  },
  {
    key: "visitor",
    title: "External Visitor / Stakeholder",
    desc: "Visiting the building or reviewing the project"
  }
];
const FEATURES = [
  { key: "viewer",    icon: "🏢", title: "3D Building Viewer", desc: "Navigating the building in 3D" },
  { key: "energy",    icon: "⚡", title: "Energy Monitoring", desc: "Seeing circuit-level power data" },
  { key: "solar",     icon: "☀️", title: "Solar & Battery", desc: "Tracking solar generation and battery" },
  { key: "iaq",       icon: "🌡️", title: "Room Air Quality", desc: "CO2, temperature and humidity by room" },
  { key: "faults",    icon: "🔍", title: "Fault Detection", desc: "Automatic alerts when something is wrong" },
  { key: "scenarios", icon: "🎯", title: "Scenarios", desc: "What-if calculations for changes" },
  { key: "forecast",  icon: "🔮", title: "Forecast", desc: "7-day energy and cost predictions" },
  { key: "roles",     icon: "👤", title: "Role Dashboard", desc: "Personalised view for your role" }
];
const TASKS = [
  {
    key: "task1",
    heading: "Find today's energy cost",
    instructions: [
      "Open the Replay panel (right side)",
      "Click the Energy tab",
      "Find the estimated cost figure"
    ],
    followup: "How long did it take?",
    followupOptions: ["Under 30s", "30s-1min", "Over 1 min"]
  },
  {
    key: "task2",
    heading: "",
    instructions: [],
    followup: "How long did it take?",
    followupOptions: ["Under 30s", "30s-1min", "Over 1 min"]
  },
  {
    key: "task3",
    heading: "Find a 'what if' scenario relevant to you",
    instructions: [
      "Open the Replay panel",
      "Click the Scenarios tab",
      "Find a scenario that interests you",
      "Try adjusting the slider if there is one"
    ],
    followup: "Did the scenario result make sense to you?",
    followupOptions: ["Yes", "Mostly", "Not really"]
  }
];
const TASK2_ROLE_MAP = {
  director: {
    heading: "Find the solar savings for today",
    instructions: [
      "Open the Replay panel",
      "Click the Solar tab",
      "Find how much solar saved today in EUR"
    ]
  },
  sustainability: {
    heading: "Find the solar savings for today",
    instructions: [
      "Open the Replay panel",
      "Click the Solar tab",
      "Find how much solar saved today in EUR"
    ]
  },
  facilities: {
    heading: "Find an active fault",
    instructions: [
      "Look for the fault detection button (top left of the screen)",
      "Open the Fault panel",
      "Find what the most serious fault is and what action is recommended"
    ]
  },
  it: {
    heading: "Find an active fault",
    instructions: [
      "Look for the fault detection button (top left of the screen)",
      "Open the Fault panel",
      "Find what the most serious fault is and what action is recommended"
    ]
  },
  worker: {
    heading: "Check your room's air quality",
    instructions: [
      "Open the Replay panel",
      "Click the IAQ Rooms tab",
      "Find the CO2 level for any room"
    ]
  },
  visitor: {
    heading: "Find out what % solar powers the building",
    instructions: [
      "Open the Replay panel",
      "Click the Solar tab",
      "Find the solar coverage percentage"
    ]
  }
};
const OVERALL_LABELS = [
  "Needs a lot of work",
  "Below expectations",
  "Meets expectations",
  "Exceeds expectations",
  "Exceptional"
];
const OVERALL_EMOJIS = ["😕", "😐", "🙂", "😊", "🤩"];

//  STATE 
function getInitialSurvey() {
  return {
    startedAt: new Date().toISOString(),
    consentAgreed: false,
    role: null,
    name: "",
    currentStep: 1,
    totalSteps: 7,
    tasks: {
      task1: { completed: null, time: null },
      task2: { completed: null, time: null },
      task3: { completed: null, scenario: null },
    },
    ratings: {
      viewer: 0,
      energy: 0,
      solar: 0,
      iaq: 0,
      faults: 0,
      scenarios: 0,
      forecast: 0,
      roles: 0,
    },
    featureComments: {
      viewer: "",
      energy: "",
      solar: "",
      iaq: "",
      faults: "",
      scenarios: "",
      forecast: "",
      roles: "",
    },
    mostUseful: null,
    needsWork: null,
    overall: 0,
    whatWorked: "",
    whatNeeded: "",
    wouldUse: null,
    other: "",
    aiSummary: "",
    email: "",
  };
}
let survey = getInitialSurvey();
let resumeBanner = false;
const LS_KEY = "gate_survey";

//  LOCAL STORAGE 
function saveSurvey() {
  localStorage.setItem(LS_KEY, JSON.stringify(survey));
}
function loadSurvey() {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data && typeof data === "object" && data.currentStep) {
      return data;
    }
  } catch {}
  return null;
}
function clearSurvey() {
  localStorage.removeItem(LS_KEY);
}

//  STEP NAVIGATION 
function goToStep(n) {
  survey.currentStep = n;
  saveSurvey();
  render();
}
function nextStep() {
  if (survey.currentStep < survey.totalSteps) {
    survey.currentStep++;
    saveSurvey();
    render();
  }
}
function prevStep() {
  if (survey.currentStep > 1) {
    survey.currentStep--;
    saveSurvey();
    render();
  }
}

//  RESUME BANNER 
function checkResume() {
  const saved = loadSurvey();
  if (saved && saved.currentStep && saved.currentStep < 7) {
    survey = saved;
    resumeBanner = true;
  }
}
function handleResume() {
  resumeBanner = false;
  render();
}
function handleStartOver() {
  survey = getInitialSurvey();
  resumeBanner = false;
  saveSurvey();
  render();
}

//  RENDER 
function render() {
  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = "";
  // Logo/branding
  app.appendChild(renderLogo());
  // Progress bar
  if (!isAdmin()) {
    app.appendChild(renderProgressBar());
    app.appendChild(renderStepIndicator());
  }
  // Resume banner
  if (resumeBanner) {
    app.appendChild(renderResumeBanner());
    return;
  }
  // Back button
  if (survey.currentStep > 1 && !isAdmin()) {
    app.appendChild(renderBackBtn());
  }
  // Step content
  if (isAdmin()) {
    renderAdmin(app);
    return;
  }
  const stepDiv = document.createElement("div");
  stepDiv.className = "step";
  switch (survey.currentStep) {
    case 1: stepDiv.appendChild(renderWelcome()); break;
    case 2: stepDiv.appendChild(renderRole()); break;
    case 3: stepDiv.appendChild(renderTour()); break;
    case 4: stepDiv.appendChild(renderTasks()); break;
    case 5: stepDiv.appendChild(renderRatings()); break;
    case 6: stepDiv.appendChild(renderFeedback()); break;
    case 7: stepDiv.appendChild(renderThankYou()); break;
    default: stepDiv.appendChild(renderWelcome()); break;
  }
  app.appendChild(stepDiv);
}

//  LOGO / BRANDING 
function renderLogo() {
  const div = document.createElement("div");
  div.className = "logo-area";
  div.innerHTML = `
    <span class="brand">Energy Digital Twin</span>
    <span class="subtitle">Validation</span>
  `;
  return div;
}

//  PROGRESS BAR & STEP INDICATOR 
function renderProgressBar() {
  const bar = document.createElement("div");
  bar.className = "progress-bar";
  const inner = document.createElement("div");
  inner.className = "progress-bar-inner";
  inner.style.width = `${(survey.currentStep-1)/(survey.totalSteps-1)*100}%`;
  bar.appendChild(inner);
  return bar;
}
function renderStepIndicator() {
  const div = document.createElement("div");
  div.className = "step-indicator";
  const stepNames = [
    "Welcome",
    "Role Selection",
    "Guided Tour",
    "Task Testing",
    "Feature Ratings",
    "Feedback",
    "Thank You"
  ];
  div.textContent = `Step ${survey.currentStep} of ${survey.totalSteps} - ${stepNames[survey.currentStep-1]}`;
  return div;
}

//  BACK BUTTON 
function renderBackBtn() {
  const btn = document.createElement("button");
  btn.className = "back-btn";
  btn.textContent = "Back";
  btn.onclick = prevStep;
  return btn;
}

//  RESUME BANNER 
function renderResumeBanner() {
  const div = document.createElement("div");
  div.className = "resume-banner";
  div.innerHTML = `
    <span style="color:var(--text);font-weight:500;">Resume your survey?</span>
    <div style="display:flex;gap:10px;">
      <button class="button" onclick="handleResume()">Continue</button>
      <button class="button" style="background:#f1f5f9;color:var(--text);" onclick="handleStartOver()">Start over</button>
    </div>
  `;
  return div;
}

//  STEP 1: WELCOME 
function renderWelcome() {
  const div = document.createElement("div");
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  div.innerHTML = `
    <div style="display:flex;align-items:center;gap:18px;margin-bottom:22px;flex-wrap:wrap;">
      <img src='./img/Joan.jpeg' alt='University of Twente' style='height:44px;background:#fff;border-radius:8px;padding:4px 10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid var(--border);'>
      <div>
        <div style="font-size:1.1rem;font-weight:600;color:var(--accent);">Research Consent</div>
        <div style="font-size:0.97rem;color:var(--muted);">Please read this information carefully before taking part in the study.</div>
      </div>
      <a id="admin-link" style="display:none;" title="Admin dashboard">Admin</a>
    </div>
    <h1 style="font-size:2rem;font-weight:700;margin-bottom:14px;color:var(--text);line-height:1.2;">Energy Digital Twin for Smart Building Management<br><span style="color:var(--accent);">Participant Information and Consent</span></h1>
    <div class="consent-card">
      <div class="consent-meta">
        <div><b>Researcher:</b> <a href="https://www.linkedin.com/in/joan-waithira/" target="_blank" rel="noopener noreferrer" style="color:var(--accent);font-weight:700;text-decoration:underline;text-underline-offset:2px;">Joan Waithira Njoroge</a></div>
        <div><b>University:</b> University of Twente</div>
        <div><b>Programme:</b> MSE Spatial Engineering</div>
      </div>
      <div class="consent-section">
        <h3>Introduction</h3>
        <p>You are invited to take part in a research study about the evaluation of a digital platform for building energy management. Before you decide whether to participate, please read the information below carefully.</p>
      </div>
      <div class="consent-section">
        <h3>Purpose of the study</h3>
        <p>The purpose of this study is to evaluate the usability and usefulness of a digital twin platform that visualizes and forecasts building energy consumption. Your feedback will help improve the design and functionality of the platform.</p>
      </div>
      <div class="consent-section">
        <h3>What participation involves</h3>
        <ul>
          <li>You will be asked to complete a short online survey of approximately 5 to 10 minutes.</li>
          <li>You will be asked questions about usability, clarity of visualizations, and overall user experience.</li>
          <li>No sensitive or personal questions will be asked.</li>
        </ul>
      </div>
      <div class="consent-section">
        <h3>Voluntary participation</h3>
        <p>Your participation is completely voluntary. You may choose not to participate or to stop at any time without giving a reason and without any negative consequences.</p>
        <ul>
          <li>No identifying personal data such as name or email address will be collected.</li>
          <li>Your responses will be anonymized and used only for research purposes.</li>
          <li>Only the researcher and academic supervisors will have access to the data.</li>
          <li>The data will be stored securely and will not be shared with third parties.</li>
        </ul>
        <p>There are no known risks associated with participation. While there is no direct personal benefit, your feedback will contribute to improving research and energy management tools.</p>
        <p>You may withdraw from the study at any time. If you choose to withdraw, your data will not be used in the analysis, as long as it can still be identified and removed.</p>
      </div>
      <div class="consent-section">
        <h3>By selecting "I agree" below, you confirm that:</h3>
        <ul>
          <li>You have read and understood the information above.</li>
          <li>You are 18 years or older.</li>
          <li>You voluntarily agree to participate in this study.</li>
        </ul>
      </div>
    </div>
    <div class="welcome-box-green">
      Your feedback will directly support this research and help improve digital energy management tools for smart buildings.
    </div>
    <label class="consent-check">
      <input type="checkbox" ${survey.consentAgreed ? "checked" : ""} onchange="survey.consentAgreed=this.checked;saveSurvey();render();">
      <span>I agree to participate in this study</span>
    </label>
    <div class="consent-signoff">
      <div><b>Date:</b> ${today}</div>
      <div><b>Participant:</b> Anonymous</div>
    </div>
    <button class="button" style="width:100%;font-size:1.1rem;padding:15px;" onclick="nextStep()" ${survey.consentAgreed ? "" : "disabled"}>Start survey</button>
    <div class="footer-note">Your responses are anonymous and will be used only for research purposes.</div>
  `;
  // Add admin link handler
  setTimeout(() => {
    const adminLink = document.getElementById("admin-link");
    if (adminLink) {
      adminLink.onclick = () => {
        // Switch to admin mode by updating the URL
        if (!window.location.search.includes("admin=true")) {
          window.location.search = "?admin=true";
        } else {
          render();
        }
      };
    }
  }, 0);
  return div;
}

//  STEP 2: ROLE SELECTION 
function renderRole() {
  const div = document.createElement("div");
  div.innerHTML = `
    <h2 style="font-size:1.4rem;font-weight:600;margin-bottom:6px;color:var(--text);">First, tell us your role</h2>
    <div style="color:var(--muted);margin-bottom:20px;">This helps us understand your perspective</div>
  `;
  const grid = document.createElement("div");
  grid.className = "card-grid";
  ROLES.forEach(role => {
    const card = document.createElement("div");
    card.className = "role-card" + (survey.role === role.key ? " selected" : "");
    card.tabIndex = 0;
    card.onclick = () => {
      survey.role = role.key;
      saveSurvey();
      // Auto-advance to next step if role selected
      nextStep();
    };
    card.onkeydown = e => { if (e.key === "Enter") { card.onclick(); } };
    card.innerHTML = `
      <span class="role-title">${role.title}</span>
      <span class="role-desc">${role.desc}</span>
    `;
    grid.appendChild(card);
  });
  div.appendChild(grid);
  // Name field
  const nameRow = document.createElement("div");
  nameRow.className = "input-row";
  nameRow.innerHTML = `
    <input type="text" placeholder="Your name (optional)" value="${survey.name||""}" style="font-size:14px;" oninput="survey.name=this.value;saveSurvey();">
  `;
  div.appendChild(nameRow);
  return div;
}


//  STEP 3: GUIDED TOUR 
function renderTour() {
  const div = document.createElement("div");
  div.innerHTML = `
    <h2 style='font-size:1.4rem;font-weight:600;margin-bottom:6px;color:var(--text);'>Here's what the digital twin does</h2>
    <div style='color:var(--muted);margin-bottom:18px;'>Take 2 minutes to explore these features</div>
  `;
  // Try iframe, fallback to gallery
  let iframeBlocked = false;
  const iframe = document.createElement("iframe");
  iframe.src = CONFIG.DIGITAL_TWIN_URL;
  iframe.style = "width:100%;height:500px;border-radius:12px;border:1.5px solid var(--border);background:#f1f5f9;margin-bottom:12px;";
  iframe.title = "Gate Sofia Digital Twin";
  iframe.onload = () => { iframeBlocked = false; };
  iframe.onerror = () => { iframeBlocked = true; render(); };
  // Gallery fallback
  const screenshots = [
    {src: "https://dummyimage.com/800x480/e0e7ef/2563eb&text=3D+building+overview", caption: "3D building overview"},
    {src: "https://dummyimage.com/800x480/e0e7ef/2563eb&text=Energy+monitoring+by+circuit", caption: "Energy monitoring by circuit"},
    {src: "https://dummyimage.com/800x480/e0e7ef/2563eb&text=Solar+generation+and+battery", caption: "Solar generation and battery"},
    {src: "https://dummyimage.com/800x480/e0e7ef/2563eb&text=Fault+detection+alerts", caption: "Fault detection alerts"}
  ];
  if (!iframeBlocked) {
    div.appendChild(iframe);
  } else {
    // Gallery
    let galleryIdx = window._galleryIdx || 0;
    const gallery = document.createElement("div");
    gallery.className = "gallery";
    const img = document.createElement("img");
    img.className = "gallery-img";
    img.src = screenshots[galleryIdx].src;
    img.alt = screenshots[galleryIdx].caption;
    gallery.appendChild(img);
    const caption = document.createElement("div");
    caption.className = "gallery-caption";
    caption.textContent = screenshots[galleryIdx].caption;
    gallery.appendChild(caption);
    const arrows = document.createElement("div");
    arrows.className = "gallery-arrows";
    const prev = document.createElement("button");
    prev.textContent = "Previous";
    prev.disabled = galleryIdx === 0;
    prev.onclick = () => { window._galleryIdx = Math.max(0, galleryIdx-1); render(); };
    const next = document.createElement("button");
    next.textContent = "Next";
    next.disabled = galleryIdx === screenshots.length-1;
    next.onclick = () => { window._galleryIdx = Math.min(screenshots.length-1, galleryIdx+1); render(); };
    arrows.appendChild(prev);
    arrows.appendChild(next);
    gallery.appendChild(arrows);
    div.appendChild(gallery);
  }
  // Highlight cards
  const highlights = [
    {title:"Live 3D Building",desc:"Navigate the building in 3D and see real-time data overlaid on each room"},
    {title:"Energy Monitoring",desc:"Track 16 electrical circuits with 48 hours of replay data"},
    {title:"Fault Detection",desc:"19 automated rules detect problems before they become expensive"}
  ];
  const cards = document.createElement("div");
  cards.className = "highlight-cards";
  highlights.forEach(h => {
    const c = document.createElement("div");
    c.className = "highlight-card";
    c.innerHTML = `<span class='title'>${h.title}</span><span class='desc'>${h.desc}</span>`;
    cards.appendChild(c);
  });
  div.appendChild(cards);
  // Continue button
  const btnRow = document.createElement("div");
  btnRow.className = "button-row";
  const btn = document.createElement("button");
  btn.className = "button";
  btn.textContent = "I've had a look - continue";
  btn.onclick = nextStep;
  btnRow.appendChild(btn);
  div.appendChild(btnRow);
  return div;
}

//  STEP 4: TASK TESTING 
function renderTasks() {
  const div = document.createElement("div");
  div.innerHTML = `<h2 style='font-size:1.4rem;font-weight:600;margin-bottom:6px;color:var(--text);'>Now try these 3 tasks</h2><div style='color:var(--muted);margin-bottom:18px;'>Open the digital twin in a new tab and try each task. Then come back and tell us how it went.</div>`;
  // Open digital twin button
  const openBtn = document.createElement("a");
  openBtn.href = CONFIG.DIGITAL_TWIN_URL;
  openBtn.target = "_blank";
  openBtn.rel = "noopener noreferrer";
  openBtn.className = "share-btn";
  openBtn.style.marginBottom = "18px";
  openBtn.textContent = "Open Gate Sofia Digital Twin";
  div.appendChild(openBtn);
  // Task cards
  let taskIdx = window._taskIdx || 0;
  const tasks = [
    TASKS[0],
    Object.assign({}, TASKS[1], TASK2_ROLE_MAP[survey.role] || {}),
    TASKS[2]
  ];
  const task = tasks[taskIdx];
  const card = document.createElement("div");
  card.className = "task-card";
  card.innerHTML = `<div class='task-progress'>Task ${taskIdx+1} of 3</div><div style='font-weight:600;font-size:1.05rem;margin-bottom:8px;color:var(--text);'>${task.heading}</div>`;
  const inst = document.createElement("ul");
  inst.style.marginBottom = "10px";
  inst.style.color = "var(--muted)";
  task.instructions.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    inst.appendChild(li);
  });
  card.appendChild(inst);
  // Success/difficulty buttons
  const btns = document.createElement("div");
  btns.className = "task-btns";
  ["Yes, easily","Yes, with some difficulty","No, I couldn't find it"].forEach((label, i) => {
    const b = document.createElement("button");
    b.className = "task-btn" + (survey.tasks[task.key].completed === i ? " selected" : "");
    b.textContent = label;
    b.onclick = () => { survey.tasks[task.key].completed = i; saveSurvey(); render(); };
    btns.appendChild(b);
  });
  card.appendChild(btns);
  // Follow-up
  if (taskIdx < 2) {
    const follow = document.createElement("div");
    follow.style.margin = "12px 0 4px 0";
    follow.style.fontWeight = "500";
    follow.style.color = "var(--text)";
    follow.textContent = task.followup;
    card.appendChild(follow);
    const radios = document.createElement("div");
    radios.className = "radio-row";
    task.followupOptions.forEach((opt, i) => {
      const label = document.createElement("label");
      label.className = "radio-label";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `task${taskIdx}_time`;
      input.checked = survey.tasks[task.key].time === i;
      input.onclick = () => { survey.tasks[task.key].time = i; saveSurvey(); render(); };
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      radios.appendChild(label);
    });
    card.appendChild(radios);
  } else {
    // Task 3 extra question
    const follow = document.createElement("div");
    follow.style.margin = "12px 0 4px 0";
    follow.style.fontWeight = "500";
    follow.style.color = "var(--text)";
    follow.textContent = task.followup;
    card.appendChild(follow);
    const radios = document.createElement("div");
    radios.className = "radio-row";
    task.followupOptions.forEach((opt, i) => {
      const label = document.createElement("label");
      label.className = "radio-label";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `task3_scenario`;
      input.checked = survey.tasks.task3.scenario === i;
      input.onclick = () => { survey.tasks.task3.scenario = i; saveSurvey(); render(); };
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      radios.appendChild(label);
    });
    card.appendChild(radios);
  }
  div.appendChild(card);
  // Next/prev task navigation
  const navRow = document.createElement("div");
  navRow.className = "button-row";
  if (taskIdx > 0) {
    const prevBtn = document.createElement("button");
    prevBtn.className = "button";
    prevBtn.style.background = "#f1f5f9";
    prevBtn.style.color = "var(--text)";
    prevBtn.textContent = "Previous Task";
    prevBtn.onclick = () => { window._taskIdx = taskIdx-1; render(); };
    navRow.appendChild(prevBtn);
  }
  if (taskIdx < 2) {
    const nextBtn = document.createElement("button");
    nextBtn.className = "button";
    nextBtn.textContent = "Next Task";
    nextBtn.disabled = survey.tasks[task.key].completed === null || survey.tasks[task.key].time === null;
    nextBtn.onclick = () => { window._taskIdx = taskIdx+1; render(); };
    navRow.appendChild(nextBtn);
  } else {
    const contBtn = document.createElement("button");
    contBtn.className = "button";
    contBtn.textContent = "Continue to ratings";
    contBtn.disabled = survey.tasks[task.key].completed === null || survey.tasks.task3.scenario === null;
    contBtn.onclick = () => { window._taskIdx = 0; nextStep(); };
    navRow.appendChild(contBtn);
  }
  div.appendChild(navRow);
  return div;
}

//  STEP 5: FEATURE RATINGS 
function renderRatings() {
  const div = document.createElement("div");
  div.innerHTML = `<h2 style='font-size:1.4rem;font-weight:600;margin-bottom:6px;color:var(--text);'>Rate these features</h2><div style='color:var(--muted);margin-bottom:20px;'>Rate each feature from 1 to 5, then leave an optional note if something stood out.</div>`;
  FEATURES.forEach(f => {
    const card = document.createElement("div");
    card.className = "feature-card";
    const currentRating = survey.ratings[f.key];
    const currentComment = survey.featureComments?.[f.key] || "";
    card.innerHTML = `
      <div class='feature-header'>
        <span class='feature-badge'>${f.icon}</span>
        <div class='feature-copy'>
          <span class='title'>${f.title}</span>
          <span class='desc'>${f.desc}</span>
        </div>
      </div>
    `;
    const stars = document.createElement("div");
    stars.className = "rating-scale";
    for (let i=1; i<=5; ++i) {
      const star = document.createElement("button");
      star.type = "button";
      star.className = "rating-pill" + (currentRating === i ? " selected" : "");
      star.textContent = String(i);
      star.setAttribute("aria-label", `${f.title}: rate ${i} out of 5`);
      star.onclick = () => { survey.ratings[f.key] = i; saveSurvey(); render(); };
      stars.appendChild(star);
    }
    card.appendChild(stars);
    const scaleHint = document.createElement("div");
    scaleHint.className = "rating-scale-hint";
    scaleHint.textContent = currentRating
      ? `Current rating: ${currentRating}/5`
      : "1 = not useful, 5 = very useful";
    card.appendChild(scaleHint);
    const commentRow = document.createElement("div");
    commentRow.className = "feature-comment-row";
    commentRow.innerHTML = `
      <label for="comment-${f.key}">Optional comment</label>
      <textarea id="comment-${f.key}" rows="2" placeholder="Optional: what worked well, what was unclear, or what should change?">${currentComment}</textarea>
    `;
    const textarea = commentRow.querySelector("textarea");
    textarea.oninput = e => {
      survey.featureComments[f.key] = e.target.value;
      saveSurvey();
    };
    card.appendChild(commentRow);
    div.appendChild(card);
  });
  // Dropdowns
  const dropdownRow = document.createElement("div");
  dropdownRow.className = "dropdown-row";
  dropdownRow.innerHTML = `
    <label>Which feature would you use most often?</label>
    <select onchange="survey.mostUseful=this.value;saveSurvey();render();">
      <option value="">Select...</option>
      ${FEATURES.map(f=>`<option value='${f.key}'${survey.mostUseful===f.key?" selected":""}>${f.icon} ${f.title}</option>`).join("")}
    </select>
    <label>Which feature needs the most improvement?</label>
    <select onchange="survey.needsWork=this.value;saveSurvey();render();">
      <option value="">Select...</option>
      ${FEATURES.map(f=>`<option value='${f.key}'${survey.needsWork===f.key?" selected":""}>${f.icon} ${f.title}</option>`).join("")}
      <option value="other"${survey.needsWork==="other"?" selected":""}>Other</option>
    </select>
  `;
  div.appendChild(dropdownRow);
  // Continue button
  const btnRow = document.createElement("div");
  btnRow.className = "button-row";
  const btn = document.createElement("button");
  btn.className = "button";
  btn.textContent = "Continue";
  btn.disabled = !Object.values(survey.ratings).every(v=>v>0) || !survey.mostUseful || !survey.needsWork;
  btn.onclick = () => { if (!btn.disabled) nextStep(); };
  btnRow.appendChild(btn);
  div.appendChild(btnRow);
  return div;
}

//  STEP 6: FEEDBACK 
function renderFeedback() {
  const div = document.createElement("div");
  div.innerHTML = `<h2 style='font-size:1.4rem;font-weight:600;margin-bottom:14px;color:var(--text);'>A few more questions</h2>
  <div style="font-weight:500;margin-bottom:8px;color:var(--text);">Overall impression</div>`;
  // Overall impression (emoji)
  const emojiRow = document.createElement("div");
  emojiRow.className = "emoji-row";
  OVERALL_EMOJIS.forEach((emoji, i) => {
    const btn = document.createElement("button");
    btn.className = "emoji-btn" + (survey.overall === i+1 ? " selected" : "");
    btn.textContent = emoji;
    btn.onclick = () => { survey.overall = i+1; saveSurvey(); render(); };
    emojiRow.appendChild(btn);
  });
  div.appendChild(emojiRow);
  const label = document.createElement("div");
  label.className = "emoji-label";
  label.textContent = survey.overall ? OVERALL_LABELS[survey.overall-1] : "";
  div.appendChild(label);
  // Free-form questions
  const qRow = document.createElement("div");
  qRow.className = "input-row";
  qRow.style.marginTop = "22px";
  qRow.innerHTML = `
    <label>What did you find most useful or impressive?</label>
    <textarea rows="3" placeholder="e.g. The 3D view made it easy to understand the building layout" oninput="survey.whatWorked=this.value;saveSurvey();">${survey.whatWorked||""}</textarea>
    <label style="margin-top:8px;">What was confusing, missing, or frustrating?</label>
    <textarea rows="3" placeholder="e.g. I couldn't figure out how to switch between roles" oninput="survey.whatNeeded=this.value;saveSurvey();">${survey.whatNeeded||""}</textarea>
    <label style="margin-top:8px;">If this system was running in your building, would you use it in your daily work?</label>
    <div class="radio-row">
      ${["Yes, regularly","Yes, occasionally","Probably not","No"].map((opt,i)=>`<label class='radio-label'><input type='radio' name='wouldUse' ${survey.wouldUse===i?"checked":""} onclick='survey.wouldUse=${i};saveSurvey();render();'>${opt}</label>`).join("")}
    </div>
    <label style="margin-top:8px;">Any other comments, ideas, or questions?</label>
    <textarea rows="2" oninput="survey.other=this.value;saveSurvey();">${survey.other||""}</textarea>
  `;
  div.appendChild(qRow);
  // Continue button
  const btnRow = document.createElement("div");
  btnRow.className = "button-row";
  const btn = document.createElement("button");
  btn.className = "button";
  btn.textContent = "Submit feedback";
  btn.disabled = !survey.overall;
  btn.onclick = () => { if (!btn.disabled) nextStep(); };
  btnRow.appendChild(btn);
  div.appendChild(btnRow);
  return div;
}

//  STEP 7: THANK YOU + AI SUMMARY 
function renderThankYou() {
  // Submit to Google Form once
  if (!window._submitted) {
    submitToGoogleForm();
    window._submitted = true;
  }
  const div = document.createElement("div");

  // If AI summary not yet generated, show loading state and kick off generation
  if (!survey.aiSummary) {
    div.innerHTML = `
      <div class='thankyou-check'>Done</div>
      <div class='thankyou-heading'>Thank you for your feedback!</div>
      <div class='thankyou-sub'>Your input directly shapes how the Gate Sofia Digital Twin develops.</div>
      <div style="text-align:center;color:var(--muted);font-size:1rem;margin-top:8px;">
        Generating your personalised summary<span class='loading-dots'>...</span>
      </div>
    `;
    generateAISummary().then(summary => {
      survey.aiSummary = summary;
      saveSurvey();
      render();
    });
    return div;
  }

  // Full thank you content once AI is ready
  div.innerHTML = `<div class='thankyou-check'>Done</div><div class='thankyou-heading'>Thank you for your feedback!</div><div class='thankyou-sub'>Your input directly shapes how the Gate Sofia Digital Twin develops.</div>`;
  div.appendChild(renderAISummaryCard(survey.aiSummary));
  // Stats
  const completedTasks = [survey.tasks.task1, survey.tasks.task2, survey.tasks.task3].filter(t=>t.completed===0).length;
  const avgRating = (Object.values(survey.ratings).reduce((a,b)=>a+b,0)/8).toFixed(1);
  const stats = document.createElement("div");
  stats.className = "thankyou-stats";
  stats.innerHTML = `<div class='thankyou-stat'>Tasks completed easily: <b id='count-tasks'>0</b>/3</div><div class='thankyou-stat'>Average feature rating: <b id='count-rating'>0.0</b>/5</div>`;
  div.appendChild(stats);
  // Animate count-up
  setTimeout(()=>{
    animateCount("count-tasks", completedTasks);
    animateCount("count-rating", avgRating);
  }, 200);
  // Share button
  const share = document.createElement("a");
  share.href = CONFIG.DIGITAL_TWIN_URL;
  share.target = "_blank";
  share.rel = "noopener noreferrer";
  share.className = "share-btn";
  share.textContent = "Share the digital twin";
  div.appendChild(share);
  // Email notify
  const notifyRow = document.createElement("div");
  notifyRow.className = "notify-row";
  notifyRow.innerHTML = `<input type='email' placeholder='Your email (optional)' value='${survey.email||""}' oninput='survey.email=this.value;saveSurvey();'><button class='button' onclick='submitToGoogleForm(true)'>Notify me</button>`;
  div.appendChild(notifyRow);
  return div;
}

function renderAISummaryCard(summary) {
  const card = document.createElement("div");
  card.className = "ai-summary-card";
  card.innerHTML = `<div class='ai-summary-title'>AI Summary of your feedback</div><div class='ai-summary-text'>${summary}</div>`;
  return card;
}

async function generateAISummary() {
  const payload = {
    role: ROLES.find(r=>r.key===survey.role)?.title || survey.role || "",
    tasks: {
      task1: survey.tasks.task1,
      task2: survey.tasks.task2,
      task3: survey.tasks.task3
    },
    ratings: survey.ratings,
    featureComments: survey.featureComments,
    overall: survey.overall,
    whatWorked: survey.whatWorked,
    whatNeeded: survey.whatNeeded,
    wouldUse: ["Yes, regularly","Yes, occasionally","Probably not","No"][survey.wouldUse||0] || ""
  };

  try {
    const response = await fetch(CONFIG.SUMMARY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Summary request failed with ${response.status}`);
    }

    const data = await response.json();
    return data.summary || buildLocalSummary(payload);
  } catch (e) {
    console.error("AI summary failed:", e);
    return buildLocalSummary(payload);
  }
}

function buildLocalSummary(payload) {
  const roleText = payload.role || "This participant";
  const ratings = payload.ratings || {};
  const featuresByScore = Object.entries(ratings)
    .sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const bestFeatureKey = featuresByScore[0]?.[0];
  const lowestFeatureKey = featuresByScore[featuresByScore.length - 1]?.[0];
  const bestFeature = FEATURES.find(f => f.key === bestFeatureKey)?.title || "the platform";
  const weakestFeature = FEATURES.find(f => f.key === lowestFeatureKey)?.title || "the experience";
  const worked = payload.whatWorked?.trim();
  const needed = payload.whatNeeded?.trim();
  const overall = payload.overall || 0;
  const useText = payload.wouldUse || "No answer given";

  const taskResults = Object.values(payload.tasks || {});
  const easyCount = taskResults.filter(task => task?.completed === 0).length;

  return [
    `${roleText} saw the most value in ${bestFeature} and rated the overall experience ${overall}/5.`,
    worked ? `What worked best: ${worked}` : `They completed ${easyCount} of 3 tasks easily and found the platform generally usable.`,
    needed ? `Main improvement area: ${needed}` : `${weakestFeature} appears to need the most improvement based on the submitted ratings.`,
    `Likely day-to-day adoption: ${useText}.`
  ].join(" ");
}

function animateCount(id, end) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const isFloat = String(end).includes(".");
  const step = () => {
    start += (end-start)*0.2+0.1;
    if ((isFloat && start+0.05 >= end) || (!isFloat && start+1 >= end)) {
      el.textContent = end;
      return;
    }
    el.textContent = isFloat ? start.toFixed(1) : Math.round(start);
    requestAnimationFrame(step);
  };
  step();
}
function submitToGoogleForm(emailOnly) {
  // Compose form data
  const fd = new FormData();
  const appendField = (fieldId, value) => {
    if (!fieldId || !String(fieldId).startsWith("entry.")) return;
    fd.append(fieldId, value ?? "");
  };

  appendField(FORM_FIELD_IDS.startedAt, survey.startedAt);
  appendField(FORM_FIELD_IDS.role, survey.role);
  appendField(FORM_FIELD_IDS.name, survey.name);
  appendField(FORM_FIELD_IDS.task1, JSON.stringify(survey.tasks.task1));
  appendField(FORM_FIELD_IDS.task2, JSON.stringify(survey.tasks.task2));
  appendField(FORM_FIELD_IDS.task3, JSON.stringify(survey.tasks.task3));
  appendField(FORM_FIELD_IDS.rating3d, survey.ratings.viewer);
  appendField(FORM_FIELD_IDS.ratingEnergy, survey.ratings.energy);
  appendField(FORM_FIELD_IDS.ratingSolar, survey.ratings.solar);
  appendField(FORM_FIELD_IDS.ratingIaq, survey.ratings.iaq);
  appendField(FORM_FIELD_IDS.ratingFaults, survey.ratings.faults);
  appendField(FORM_FIELD_IDS.ratingScenarios, survey.ratings.scenarios);
  appendField(FORM_FIELD_IDS.ratingForecast, survey.ratings.forecast);
  appendField(FORM_FIELD_IDS.ratingRoles, survey.ratings.roles);
  appendField(FORM_FIELD_IDS.mostUseful, survey.mostUseful);
  appendField(FORM_FIELD_IDS.needsWork, survey.needsWork);
  appendField(FORM_FIELD_IDS.overall, survey.overall);
  appendField(FORM_FIELD_IDS.whatWorked, survey.whatWorked);
  appendField(FORM_FIELD_IDS.whatNeeded, survey.whatNeeded);
  appendField(FORM_FIELD_IDS.wouldUse, survey.wouldUse);
  appendField(FORM_FIELD_IDS.other, survey.other);
  appendField(FORM_FIELD_IDS.aiSummary, survey.aiSummary);
  appendField(FORM_FIELD_IDS.email, survey.email);
  fetch(CONFIG.GOOGLE_FORM_URL, { method: "POST", mode: "no-cors", body: fd });
}

//  ADMIN DASHBOARD 
function renderAdmin(app) {
  const loadedAt = new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  app.innerHTML = `
    <div class='admin-bar'>
      <div>
        <div class='admin-bar-title'>Gate Sofia Digital Twin - Admin Dashboard</div>
        <div class='admin-bar-meta'>Validation Results - Last loaded at ${loadedAt}</div>
      </div>
      <button class='admin-refresh-btn' onclick='window.location.reload()'>Refresh</button>
    </div>
    <div id='admin-content'><div class='admin-no-data'>Loading responses...</div></div>
  `;
  // Fetch CSV
  fetch(CONFIG.SHEET_CSV_URL).then(r=>r.text()).then(csv=>{
    const content = document.getElementById('admin-content');
    const rows = csv.split(/\r?\n/).filter(Boolean).map(r=>r.split(","));
    if (rows.length < 2) {
      content.innerHTML = `<div class='admin-no-data'><b>No responses yet.</b><br>Share the survey link to start collecting data.</div>`;
      return;
    }
    const headers = rows[0];
    const data = rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]])));

    //  Compute stats 
    const total = data.length;
    const overallRatings = data.map(r=>+r["overall_rating"]||0).filter(Boolean);
    const avgOverall = overallRatings.length ? (overallRatings.reduce((a,b)=>a+b,0)/overallRatings.length).toFixed(2) : "N/A";
    const starsDisplay = avgOverall !== "N/A" ? `${Math.round(+avgOverall)}/5` : "";

    const roleCounts = {};
    ROLES.forEach(r=>roleCounts[r.key]=0);
    data.forEach(r=>{ if (roleCounts[r["role"]]!==undefined) roleCounts[r["role"]]++; });
    const uniqueRoles = ROLES.filter(r=>roleCounts[r.key]>0).length;

    const withSummary = data.filter(r=>r["ai_summary"] && r["ai_summary"].trim().length > 10).length;

    const featureStats = FEATURES.map(f=>{
      const vals = data.map(r=>+r[`rating_${f.key}`]||0).filter(Boolean);
      return {key:f.key,icon:f.icon,title:f.title,avg:vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0,count:vals.length};
    }).sort((a,b)=>b.avg-a.avg);

    const taskNames = ["Find today's energy cost","Find room air quality","Find a what-if scenario"];
    const taskStats = [1,2,3].map(i=>{
      const easy = data.filter(r=>{
        try { return JSON.parse(r[`task${i}_result`]).completed===0; } catch { return false; }
      }).length;
      return Math.round(100*easy/total);
    });

    const summaries = data.slice(-5).reverse().map((r,i)=>({role:r["role"],summary:r["ai_summary"],idx:total-i}));
    const maxRoleCount = Math.max(...ROLES.map(r=>roleCounts[r.key]), 1);

    //  Helper: rating color 
    function ratingColor(avg) {
      if (avg >= 4) return "#16a34a";
      if (avg >= 3) return "#d97706";
      return "#dc2626";
    }

    let html = "";

    //  Stats grid 
    html += `
    <div class='admin-stats-grid'>
      <div class='admin-stat-card'>

        <div class='admin-stat-value'>${total}</div>
        <div class='admin-stat-label'>Total Responses</div>
        <div class='admin-stat-sub'>${withSummary} with AI summary</div>
      </div>
      <div class='admin-stat-card'>
  
        <div class='admin-stat-value'>${avgOverall}</div>
        <div class='admin-stat-label'>Avg Overall Rating</div>
        <div class='admin-stat-sub' style='color:#f59e0b;letter-spacing:1px'>${starsDisplay}</div>
      </div>
      <div class='admin-stat-card'>

        <div class='admin-stat-value'>${uniqueRoles}</div>
        <div class='admin-stat-label'>Roles Represented</div>
        <div class='admin-stat-sub'>out of ${ROLES.length} total roles</div>
      </div>
      <div class='admin-stat-card'>

        <div class='admin-stat-value'>${taskStats[0]}%</div>
        <div class='admin-stat-label'>Task 1 Easy Rate</div>
        <div class='admin-stat-sub'>completed without difficulty</div>
      </div>
    </div>`;

    //  Role breakdown 
    html += `<div class='admin-section'>
      <div class='admin-section-header'>

        <span class='section-badge'>${total} total</span>
      </div>
      <div class='admin-role-chart'>
        ${ROLES.map(r=>{
          const count = roleCounts[r.key];
          const pct = total > 0 ? Math.round(100*count/total) : 0;
          const barH = Math.max(4, Math.round(90 * count / maxRoleCount));
          return `<div class='admin-role-col-wrap'>
            <div class='admin-role-count'>${count}</div>
            <div class='admin-role-pct'>${pct}%</div>
            <div class='admin-role-bar' style='height:${barH}px' title='${r.title}: ${count} response(s)'></div>
            <div class='admin-role-label'><br>${r.title.split(" ").slice(0,2).join(" ")}</div>
          </div>`;
        }).join("")}
      </div>
    </div>`;

    //  Feature ratings 
    html += `<div class='admin-section'>
      <div class='admin-section-header'> Feature Ratings
        <span class='section-badge'>sorted by avg</span>
      </div>
      ${featureStats.map(f=>{
        const barW = f.avg > 0 ? Math.round(100*f.avg/5) : 0;
        const color = ratingColor(f.avg);
        return `<div class='admin-feature-row'>
          <span class='admin-feature-icon'>${f.icon}</span>
          <span class='admin-feature-name'>${f.title}</span>
          <div class='admin-feature-bar-wrap'>
            <div class='admin-feature-bar-fill' style='width:${barW}%;background:${color}'></div>
          </div>
          <span class='admin-feature-score' style='color:${color}'>${f.avg>0?f.avg.toFixed(2):"-"}/5</span>
          <span class='admin-feature-count'>${f.count} rated</span>
        </div>`;
      }).join("")}
    </div>`;

    //  Task completion 
    html += `<div class='admin-section'>
      <div class='admin-section-header'>
        <span class='section-icon'>Task</span> Task Completion - "Completed Easily" Rate
      </div>
      ${taskStats.map((pct,i)=>`
        <div class='admin-task-row'>
          <div class='admin-task-header'>
            <span class='admin-task-label'>Task ${i+1}: ${taskNames[i]||""}</span>
            <span class='admin-task-pct'>${pct}%</span>
          </div>
          <div class='admin-task-progress'>
            <div class='admin-task-progress-fill' style='width:${pct}%'></div>
          </div>
          <div class='admin-task-desc'>${data.filter(r=>{ try{return JSON.parse(r[`task${i+1}_result`]).completed===0;}catch{return false;} }).length} out of ${total} respondents completed this easily</div>
        </div>
      `).join("")}
    </div>`;

    //  AI Summaries 
    const validSummaries = summaries.filter(s=>s.summary && s.summary.trim().length>10);
    if (validSummaries.length) {
      html += `<div class='admin-section'>
        <div class='admin-section-header'>
          <span class='section-icon'>AI</span> Recent AI-Generated Summaries
          <span class='section-badge'>last ${validSummaries.length}</span>
        </div>
        ${validSummaries.map(s=>{
          const role = ROLES.find(r=>r.key===s.role);
          return `<div class='admin-summary-card'>
            <div class='admin-summary-card-header'>
              <span>${role?role.icon:""}</span>
              <span class='admin-summary-role'>${role?role.title:s.role}</span>
              <span class='admin-summary-idx'>Response #${s.idx}</span>
            </div>
            <div class='admin-summary-text'>${s.summary||"<em style='color:#94a3b8'>No summary generated</em>"}</div>
          </div>`;
        }).join("")}
      </div>`;
    }

    //  Raw responses 
    html += `<div class='admin-section'>
      <div class='admin-section-header'>
        <span class='section-icon'>Data</span> Raw Response Data
        <span class='section-badge'>${total} rows</span>
      </div>
      <div style='overflow-x:auto;max-width:100%;'>
        <table class='admin-table'>
          <tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr>
          ${data.map(r=>`<tr>${headers.map(h=>`<td>${r[h]||""}</td>`).join("")}</tr>`).join("")}
        </table>
      </div>
      <button class='admin-download-btn' onclick='downloadCSV()'>Download CSV</button>
    </div>`;

    content.innerHTML = html;
  }).catch(()=>{
    const content = document.getElementById('admin-content');
    if (content) content.innerHTML = `<div class='admin-no-data'><div class='no-data-icon'>Error</div><b>Could not load data.</b><br>Check that <code>SHEET_CSV_URL</code> is configured correctly.</div>`;
  });
  // Auto-refresh
  setTimeout(()=>{ if(isAdmin()) render(); }, 60000);
}
function downloadCSV() {
  fetch(CONFIG.SHEET_CSV_URL).then(r=>r.text()).then(csv=>{
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gate_sofia_responses.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  });
}

//  INIT 
window.addEventListener("DOMContentLoaded", () => {
  if (window.location.search.includes("admin=true")) {
    // Admin mode  always require login
    showAdminPasswordModal();
    return;
  } else {
    checkResume();
  }
  render();
});

// Keyboard navigation
window.addEventListener("keydown", e => {
  if (resumeBanner) return;
  if (document.activeElement && ["TEXTAREA","INPUT"].includes(document.activeElement.tagName)) return;
  if (e.key === "Enter") {
    if (survey.currentStep === 1) nextStep();
    else if (survey.currentStep === 2 && survey.role) nextStep();
  }
});

// Admin password modal
function showAdminPasswordModal() {
  const app = document.getElementById("app");
  app.innerHTML = `<div class='admin-password-modal'><div class='admin-password-box'><div style='font-size:1.2rem;font-weight:600;margin-bottom:8px;color:var(--text);'>Admin Login</div><input type='password' id='admin_pw' placeholder='Password' autocomplete='current-password' /><button class='button' onclick='checkAdminPassword()'>Login</button><div id='admin_pw_err' class='admin-password-error'></div></div></div>`;
  document.getElementById('admin_pw').focus();
}
function checkAdminPassword() {
  const pw = document.getElementById('admin_pw').value;
  if (pw === CONFIG.ADMIN_PASSWORD) {
    sessionStorage.setItem("admin_ok", "1"); // used only to hand off from modal to render()
    render();
  } else {
    document.getElementById('admin_pw_err').textContent = "Incorrect password.";
  }
}
function isAdmin() {
  return window.location.search.includes("admin=true") && sessionStorage.getItem("admin_ok");
}
// Clear admin flag on every unload so login is required each visit
window.addEventListener("beforeunload", () => sessionStorage.removeItem("admin_ok"));
  
