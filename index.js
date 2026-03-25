//  CONFIG 
const CONFIG = {
  DIGITAL_TWIN_URL:  "https://ai-building-silk.vercel.app/", // Replace with your Vercel app URL
  SUMMARY_ENDPOINT:  "/.netlify/functions/generate-summary",
  RESPONSE_SAVE_ENDPOINT: "/.netlify/functions/save-response",
  RESPONSE_LIST_ENDPOINT: "/.netlify/functions/list-responses",
  ADMIN_PASSWORD:    "gate2026"
};

function buildExtraCommentsSummary() {
  const featureNotes = Object.entries(survey.featureComments || {})
    .filter(([, value]) => String(value || "").trim())
    .map(([key, value]) => {
      const featureTitle = FEATURES.find(feature => feature.key === key)?.title || key;
      return `${featureTitle}: ${String(value).trim()}`;
    });

  const taskNotes = Object.entries(survey.tasks || {})
    .filter(([, value]) => String(value?.note || "").trim())
    .map(([key, value]) => {
      const taskTitle = TASKS.find(task => task.key === key)?.heading
        || (key === "task2" ? (TASK2_ROLE_MAP[survey.role]?.heading || "Task 2") : key);
      return `${taskTitle}: ${String(value.note).trim()}`;
    });

  const combined = [...featureNotes, ...taskNotes];
  if (!combined.length) return survey.other || "";

  const extraBlock = `Additional comments: ${combined.join(" | ")}`;
  return survey.other ? `${survey.other}\n${extraBlock}` : extraBlock;
}

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
    heading: "Play a room heatmap and find the extremes",
    instructions: [
      "Open the Replay panel",
      "Click the IAQ Rooms tab",
      "Play one of the heatmaps on screen",
      "Stop the heatmap at any moment",
      "Identify the rooms with the lowest value and the room with the highest value"
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
      task1: { completed: null, time: null, note: "" },
      task2: { completed: null, time: null, note: "" },
      task3: { completed: null, scenario: null, note: "" },
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
let thankYouSaveMessage = "";
let thankYouSaveTone = "";

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

function getSurveySubmissionRecord() {
  return {
    started_at: survey.startedAt,
    role: survey.role || "",
    name: survey.name || "",
    task1_result: JSON.stringify(survey.tasks.task1 || {}),
    task2_result: JSON.stringify(survey.tasks.task2 || {}),
    task3_result: JSON.stringify(survey.tasks.task3 || {}),
    rating_viewer: survey.ratings.viewer || 0,
    rating_energy: survey.ratings.energy || 0,
    rating_solar: survey.ratings.solar || 0,
    rating_iaq: survey.ratings.iaq || 0,
    rating_faults: survey.ratings.faults || 0,
    rating_scenarios: survey.ratings.scenarios || 0,
    rating_forecast: survey.ratings.forecast || 0,
    rating_roles: survey.ratings.roles || 0,
    most_useful: survey.mostUseful || "",
    needs_work: survey.needsWork || "",
    overall_rating: survey.overall || 0,
    what_worked: survey.whatWorked || "",
    what_needed: survey.whatNeeded || "",
    would_use: survey.wouldUse ?? "",
    other_comments: buildExtraCommentsSummary(),
    ai_summary: survey.aiSummary || "",
    email: survey.email || ""
  };
}

async function saveRemoteSubmission() {
  const response = await fetch(CONFIG.RESPONSE_SAVE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(getSurveySubmissionRecord())
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Save response failed with ${response.status}`);
  }

  return response.json().catch(() => ({}));
}

async function saveThankYouDetails(button) {
  const previousText = button ? button.textContent : "";
  if (button) {
    button.disabled = true;
    button.textContent = "Saving...";
  }

  try {
    await saveRemoteSubmission();
    thankYouSaveMessage = "Your optional details were saved to the shared research database.";
    thankYouSaveTone = "success";
  } catch (error) {
    console.error("Saving optional details failed.", error);
    thankYouSaveMessage = "Could not save your details to Supabase. Please check the Netlify function and Supabase keys.";
    thankYouSaveTone = "error";
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = previousText || "Save details";
    }
    render();
  }
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
  const wrap = document.createElement("div");
  wrap.className = "step-nav";
  const btn = document.createElement("button");
  btn.className = "back-btn";
  btn.textContent = "Back";
  btn.onclick = prevStep;
  wrap.appendChild(btn);

  if (survey.currentStep === 6) {
    return wrap;
  }

  const nextBtn = document.createElement("button");
  nextBtn.className = "step-next-btn";
  const config = getStepNextConfig();
  nextBtn.textContent = config.label;
  nextBtn.disabled = !config.enabled;
  nextBtn.onclick = () => {
    if (config.enabled) config.action();
  };
  wrap.appendChild(nextBtn);
  return wrap;
}

function getStepNextConfig() {
  switch (survey.currentStep) {
    case 2:
      return {
        label: "Next",
        enabled: !!survey.role,
        action: nextStep
      };
    case 3:
      return {
        label: "Next",
        enabled: true,
        action: nextStep
      };
    case 4: {
      const taskIdx = window._taskIdx || 0;
      const tasks = [
        TASKS[0],
        Object.assign({}, TASKS[1], TASK2_ROLE_MAP[survey.role] || {}),
        TASKS[2]
      ];
      const task = tasks[taskIdx];
      const taskState = survey.tasks[task.key];
      const enabled = taskIdx < 2
        ? taskState.completed !== null && taskState.time !== null
        : taskState.completed !== null && survey.tasks.task3.scenario !== null;
      return {
        label: taskIdx < 2 ? "Next Task" : "Continue",
        enabled,
        action: () => {
          if (taskIdx < 2) {
            window._taskIdx = taskIdx + 1;
            render();
          } else {
            window._taskIdx = 0;
            nextStep();
          }
        }
      };
    }
    case 5:
      return {
        label: "Next",
        enabled: Object.values(survey.ratings).every(v => v > 0) && !!survey.mostUseful && !!survey.needsWork,
        action: nextStep
      };
    case 6:
      return {
        label: "Submit",
        enabled: !!survey.overall,
        action: nextStep
      };
    default:
      return {
        label: "Next",
        enabled: false,
        action: nextStep
      };
  }
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
        <div style="font-size:1.1rem;font-weight:600;color:var(--accent);">Energy Digital Twin for Smart Building Management</div>
        <div style="font-size:0.97rem;color:var(--muted);">Please read this information carefully before taking part in the study.</div>
      </div>
      <a id="admin-link" style="display:none;" title="Admin dashboard">Admin</a>
    </div>
    <h1 style="font-size:2rem;font-weight:700;margin-bottom:14px;color:var(--text);line-height:1.2;"><span >Participant Information and Consent</span></h1>
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
  return div;
}


//  STEP 3: GUIDED TOUR 
function renderTour() {
  const div = document.createElement("div");
  const roleTitle = ROLES.find(role => role.key === survey.role)?.title || "your role";
  div.innerHTML = `
    <h2 style='font-size:1.4rem;font-weight:600;margin-bottom:6px;color:var(--text);'>Take a quick guided tour</h2>
    <div style='color:var(--muted);margin-bottom:18px;'>Spend about 2 minutes exploring the platform before you start the tasks. Focus on the panels and insights most relevant to ${roleTitle}.</div>
  `;
  const intro = document.createElement("div");
  intro.className = "tour-intro-card";
  intro.innerHTML = `
    <div class="tour-intro-copy">
      <div class="tour-eyebrow">What to look for</div>
      <div class="tour-intro-title">Understand the building, then the decisions behind it</div>
      <div class="tour-intro-text">Start with the 3D building view, then open the side panels to inspect energy, indoor climate, solar performance, faults, and scenarios. You do not need to understand everything yet. Just get oriented.</div>
    </div>
    <div class="tour-focus-list">
      <div class="tour-focus-item">1. Locate the main navigation or replay panel</div>
      <div class="tour-focus-item">2. Open at least two feature tabs</div>
      <div class="tour-focus-item">3. Notice which view seems most useful for your role</div>
    </div>
  `;
  div.appendChild(intro);
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
  const previewShell = document.createElement("div");
  previewShell.className = "tour-preview-shell";
  const previewHeader = document.createElement("div");
  previewHeader.className = "tour-preview-header";
  previewHeader.innerHTML = `
    <div>
      <div class="tour-preview-title">Live platform preview</div>
      <div class="tour-preview-subtitle">If the embedded preview does not load, open the platform in a new tab.</div>
    </div>
    <a class="tour-open-link" href="${CONFIG.DIGITAL_TWIN_URL}" target="_blank" rel="noopener noreferrer">Open full platform</a>
  `;
  previewShell.appendChild(previewHeader);
  if (!iframeBlocked) {
    previewShell.appendChild(iframe);
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
    previewShell.appendChild(gallery);
  }
  div.appendChild(previewShell);
  // Highlight cards
  const highlights = [
    {icon:"🏢",title:"Live 3D Building",desc:"Navigate the building in 3D and understand how rooms, floors, and systems connect."},
    {icon:"⚡",title:"Energy Monitoring",desc:"Inspect circuit-level demand and spot where energy is being used right now or in replay mode."},
    {icon:"🌡️",title:"Indoor Climate",desc:"Check room comfort indicators such as CO2, temperature, and humidity to understand occupant conditions."},
    {icon:"🔍",title:"Fault Detection",desc:"Review detected issues, likely causes, and recommended actions before they become expensive."},
    {icon:"🎯",title:"Scenarios and Forecasts",desc:"Explore what-if changes and short-term outlooks to support planning and decision-making."}
  ];
  const highlightsTitle = document.createElement("div");
  highlightsTitle.className = "tour-section-title";
  highlightsTitle.textContent = "Core features to explore";
  div.appendChild(highlightsTitle);
  const cards = document.createElement("div");
  cards.className = "highlight-cards";
  highlights.forEach(h => {
    const c = document.createElement("div");
    c.className = "highlight-card";
    c.innerHTML = `<span class='icon'>${h.icon}</span><span class='title'>${h.title}</span><span class='desc'>${h.desc}</span>`;
    cards.appendChild(c);
  });
  div.appendChild(cards);
  const guideGrid = document.createElement("div");
  guideGrid.className = "tour-guide-grid";
  guideGrid.innerHTML = `
    <div class="tour-guide-card">
      <div class="tour-guide-label">Suggested path</div>
      <ol class="tour-guide-list">
        <li>Scan the building overview first.</li>
        <li>Open energy or IAQ panels to inspect live values.</li>
        <li>Try one planning or diagnostic feature such as faults or scenarios.</li>
      </ol>
    </div>
    <div class="tour-guide-card">
      <div class="tour-guide-label">Keep in mind</div>
      <ul class="tour-guide-list">
        <li>You are not being tested on technical accuracy yet.</li>
        <li>Notice what feels intuitive and what feels hidden.</li>
        <li>You will rate these features in the next steps.</li>
      </ul>
    </div>
  `;
  div.appendChild(guideGrid);
  // Continue button
  const btnRow = document.createElement("div");
  btnRow.className = "button-row";
  const btn = document.createElement("button");
  btn.className = "button";
  btn.textContent = "Continue to the task walkthrough";
  btn.onclick = nextStep;
  btnRow.appendChild(btn);
  div.appendChild(btnRow);
  return div;
}

//  STEP 4: TASK TESTING 
function renderTasks() {
  const div = document.createElement("div");
  div.className = "task-page";
  // Task cards
  let taskIdx = window._taskIdx || 0;
  const tasks = [
    TASKS[0],
    Object.assign({}, TASKS[1], TASK2_ROLE_MAP[survey.role] || {}),
    TASKS[2]
  ];
  const task = tasks[taskIdx];
  const taskState = survey.tasks[task.key];
  if (!("note" in taskState)) taskState.note = "";
  const completedCount = tasks.filter(item => survey.tasks[item.key]?.completed !== null).length;
  const previewOpen = !!window._taskPreviewOpen;

  const hero = document.createElement("div");
  hero.className = "task-hero";
  hero.innerHTML = `
    <div class="task-hero-copy">
      <div class="task-hero-eyebrow">Practical validation</div>
      <h2 class="task-hero-title">Test the digital twin while the guidance stays in view.</h2>
      <p class="task-hero-text">Complete the tasks as naturally as you can. We care less about perfection and more about what feels clear, hidden, or frustrating while you explore.</p>
    </div>
    <div class="task-hero-stats">
      <div class="task-hero-stat">
        <span class="task-hero-stat-value">${taskIdx + 1}/3</span>
        <span class="task-hero-stat-label">Current task</span>
      </div>
      <div class="task-hero-stat">
        <span class="task-hero-stat-value">${completedCount}</span>
        <span class="task-hero-stat-label">Answered so far</span>
      </div>
    </div>
  `;
  div.appendChild(hero);

  const overview = document.createElement("div");
  overview.className = "task-overview-card";
  overview.innerHTML = `
    <div class="task-overview-top">
      <div>
        <div class="task-overview-label">Task journey</div>
        <div class="task-overview-title">Work through the tasks as if you were using the platform in real life.</div>
      </div>
      <div class="task-overview-meta">${taskIdx + 1} / 3 active</div>
    </div>
  `;
  const overviewGrid = document.createElement("div");
  overviewGrid.className = "task-overview-grid";
  tasks.forEach((item, index) => {
    const taskBox = document.createElement("button");
    taskBox.type = "button";
    const status = survey.tasks[item.key]?.completed;
    taskBox.className = "task-overview-item";
    if (index === taskIdx) taskBox.className += " active";
    if (status !== null) taskBox.className += " done";
    taskBox.innerHTML = `
      <span class="task-overview-index">Task ${index + 1}</span>
      <span class="task-overview-name">${item.heading}</span>
      <span class="task-overview-status">${status === null ? "Not answered yet" : "Answered"}</span>
    `;
    taskBox.onclick = () => { window._taskIdx = index; render(); };
    overviewGrid.appendChild(taskBox);
  });
  overview.appendChild(overviewGrid);
  div.appendChild(overview);

  const card = document.createElement("div");
  card.className = "task-card";
  card.innerHTML = `
    <div class="task-card-header">
      <div>
        <div class='task-progress'>Task ${taskIdx+1} of 3</div>
        <div class="task-heading">${task.heading}</div>
      </div>
      <div class="task-card-badge">${taskIdx === 2 ? "Scenario check" : "Navigation task"}</div>
    </div>
    <div class="task-subtext">Follow the path below in the digital twin, then record how easy it was to complete.</div>
  `;
  const checklistWrap = document.createElement("div");
  checklistWrap.className = "task-checklist";
  const checklistTitle = document.createElement("div");
  checklistTitle.className = "task-checklist-title";
  checklistTitle.textContent = "Suggested path";
  checklistWrap.appendChild(checklistTitle);
  const inst = document.createElement("ul");
  inst.className = "task-instructions";
  const accessLi = document.createElement("li");
  accessLi.textContent = "Use the preview above by pressing the Open Preview button or open the full platform in a new tab, whichever feels easier for you.";
  inst.appendChild(accessLi);
  task.instructions.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    inst.appendChild(li);
  });
  checklistWrap.appendChild(inst);
  card.appendChild(checklistWrap);
  const tip = document.createElement("div");
  tip.className = "task-tip";
  tip.textContent = "Tip: if something is hard to find, keep going and tell us where you got stuck. That feedback is useful.";
  card.appendChild(tip);
  // Success/difficulty buttons
  const outcomeLabel = document.createElement("div");
  outcomeLabel.className = "task-question";
  outcomeLabel.textContent = "Were you able to complete this task?";
  card.appendChild(outcomeLabel);
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
    follow.className = "task-question";
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
    follow.className = "task-question";
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
  const noteRow = document.createElement("div");
  noteRow.className = "task-note-row";
  noteRow.innerHTML = `
    <label for="task-note-${task.key}">Optional note</label>
    <textarea id="task-note-${task.key}" rows="3" placeholder="Optional: what helped, what was confusing, or where did you get stuck?">${taskState.note || ""}</textarea>
  `;
  const noteArea = noteRow.querySelector("textarea");
  noteArea.oninput = e => {
    survey.tasks[task.key].note = e.target.value;
    saveSurvey();
  };
  const previewToggleRow = document.createElement("div");
  previewToggleRow.className = "task-preview-toggle-row";
  const previewToggleBtn = document.createElement("button");
  previewToggleBtn.type = "button";
  previewToggleBtn.className = "task-preview-toggle-btn";
  previewToggleBtn.textContent = previewOpen ? "Hide preview" : "Open preview";
  previewToggleBtn.onclick = () => {
    window._taskPreviewOpen = !previewOpen;
    render();
  };
  previewToggleRow.appendChild(previewToggleBtn);
  const previewOpenLink = document.createElement("a");
  previewOpenLink.className = "tour-open-link";
  previewOpenLink.href = CONFIG.DIGITAL_TWIN_URL;
  previewOpenLink.target = "_blank";
  previewOpenLink.rel = "noopener noreferrer";
  previewOpenLink.textContent = "Open full platform";
  previewToggleRow.appendChild(previewOpenLink);
  div.appendChild(previewToggleRow);

  if (previewOpen) {
    const previewShell = document.createElement("div");
    previewShell.className = "tour-preview-shell task-preview-panel";
    previewShell.innerHTML = `
      <div class="tour-preview-header">
        <div>
          <div class="tour-preview-title">Digital twin preview</div>
          <div class="tour-preview-subtitle">Use this optional embedded view if you want the platform visible without leaving the task instructions.</div>
        </div>
        <a class="tour-open-link" href="${CONFIG.DIGITAL_TWIN_URL}" target="_blank" rel="noopener noreferrer">Open full platform</a>
      </div>
    `;
    const iframe = document.createElement("iframe");
    iframe.className = "task-preview-frame";
    iframe.src = CONFIG.DIGITAL_TWIN_URL;
    iframe.title = "Gate Sofia Digital Twin task preview";
    iframe.loading = "lazy";
    previewShell.appendChild(iframe);
    const previewNote = document.createElement("div");
    previewNote.className = "task-preview-note";
    previewNote.textContent = "If the embedded preview feels limited, use the full platform button for a larger view.";
    previewShell.appendChild(previewNote);
    div.appendChild(previewShell);
  }
  card.appendChild(noteRow);
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
  const contactRow = document.createElement("div");
  contactRow.className = "input-row feedback-contact-row";
  contactRow.style.marginTop = "18px";
  contactRow.innerHTML = `
    <label>Name (optional - only if comfortable)</label>
    <input type="text" placeholder="Enter your name if you would like to share it" value="${survey.name || ""}" oninput="survey.name=this.value;saveSurvey();">
    <label style="margin-top:8px;">Email (optional - only if comfortable)</label>
    <input type="email" placeholder="Enter your email if you would like updates" value="${survey.email || ""}" oninput="survey.email=this.value;saveSurvey();">
  `;
  div.appendChild(contactRow);
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
  // Submit to Supabase once
  if (!window._submitted) {
    saveRemoteSubmission().catch(error => {
      console.warn("Remote response save failed.", error);
    });
    window._submitted = true;
  }
  const div = document.createElement("div");

  // If AI summary not yet generated, show loading state and kick off generation
  if (!survey.aiSummary) {
    div.innerHTML = `
      <div class='thankyou-shell'>
        <div class='thankyou-hero'>
          <div class='thankyou-check'>Done</div>
          <div class='thankyou-heading'>Thank you for your feedback!</div>
          <div class='thankyou-sub'>Your input directly shapes how the Gate Sofia Digital Twin develops for future users and research. Please wait for the AI summary of your responses.</div>
        </div>
        <div class='thankyou-loading'>
          <div class='thankyou-loading-title'>Preparing your personalised summary</div>
          <div class='thankyou-loading-text'>We are turning your responses into a short research-style recap<span class='loading-dots'>...</span></div>
        </div>
      </div>
    `;
    generateAISummary().then(summary => {
      survey.aiSummary = summary;
      saveSurvey();
      saveRemoteSubmission().catch(error => {
        console.warn("Remote response update failed.", error);
      });
      render();
    });
    return div;
  }

  // Full thank you content once AI is ready
  div.className = "thankyou-shell";
  div.innerHTML = `
    <div class='thankyou-hero'>
      <div class='thankyou-check'>Done</div>
      <div class='thankyou-heading'>Thank you for your feedback!</div>
      <div class='thankyou-sub'>Your input directly shapes how the Gate Sofia Digital Twin develops for future users and research.</div>
    </div>
  `;
  div.appendChild(renderAISummaryCard(survey.aiSummary));
  // Stats
  const completedTasks = [survey.tasks.task1, survey.tasks.task2, survey.tasks.task3].filter(t=>t.completed===0).length;
  const avgRating = (Object.values(survey.ratings).reduce((a,b)=>a+b,0)/8).toFixed(1);
  const topFeatureKey = Object.entries(survey.ratings).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topFeature = FEATURES.find(feature => feature.key === topFeatureKey)?.title || "No feature selected";
  const stats = document.createElement("div");
  stats.className = "thankyou-stats";
  stats.innerHTML = `
    <div class='thankyou-stat'>
      <span class='thankyou-stat-label'>Tasks completed easily</span>
      <span class='thankyou-stat-value'><b id='count-tasks'>0</b>/3</span>
    </div>
    <div class='thankyou-stat'>
      <span class='thankyou-stat-label'>Average feature rating</span>
      <span class='thankyou-stat-value'><b id='count-rating'>0.0</b>/5</span>
    </div>
    <div class='thankyou-stat thankyou-stat-wide'>
      <span class='thankyou-stat-label'>Top rated feature</span>
      <span class='thankyou-stat-value thankyou-stat-text'>${topFeature}</span>
    </div>
  `;
  div.appendChild(stats);
  // Animate count-up
  setTimeout(()=>{
    animateCount("count-tasks", completedTasks);
    animateCount("count-rating", avgRating);
  }, 200);
  const nextBlock = document.createElement("div");
  nextBlock.className = "thankyou-next";
  nextBlock.innerHTML = `
    <div class='thankyou-next-title'>What happens next?</div>
    <div class='thankyou-next-text'>Your responses will be reviewed as part of the evaluation of the Energy Digital Twin for Smart Building Management. We use this feedback to identify what is intuitive, what is confusing, and what needs redesign.</div>
  `;
  div.appendChild(nextBlock);
  const actionWrap = document.createElement("div");
  actionWrap.className = "thankyou-actions";
  // Share button
  const share = document.createElement("a");
  share.href = CONFIG.DIGITAL_TWIN_URL;
  share.target = "_blank";
  share.rel = "noopener noreferrer";
  share.className = "share-btn";
  share.textContent = "Share the digital twin";
  actionWrap.appendChild(share);

  // LinkedIn button
  const linkedin = document.createElement("a");
  linkedin.href = "https://www.linkedin.com/in/joan-waithira/"; // Replace with correct LinkedIn if needed
  linkedin.target = "_blank";
  linkedin.rel = "noopener noreferrer";
  linkedin.className = "linkedin-btn";
  linkedin.textContent = "Contact Joan if you have further questions";
  actionWrap.appendChild(linkedin);

  div.appendChild(actionWrap);
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
function ratingColor(avg) {
  if (avg >= 4) return "#16a34a";
  if (avg >= 3) return "#d97706";
  return "#dc2626";
}

function buildBackendStatusMarkup(activeSource, responseCount) {
  const statuses = [
    {
      label: "Supabase",
      active: activeSource === "Supabase database",
      state: activeSource === "Supabase database" ? "Active" : "Standby",
      detail: activeSource === "Supabase database"
        ? `${responseCount} shared response(s) loaded from the database`
        : "This app now relies on Netlify functions writing directly to Supabase"
    }
  ];

  return `
    <div class='admin-section'>
      <div class='admin-section-header'>
        Backend Status
        <span class='section-badge'>${activeSource}</span>
      </div>
      <div class='admin-status-grid'>
        ${statuses.map(item => `
          <div class='admin-status-card ${item.active ? "active" : ""}'>
            <div class='admin-status-top'>
              <span class='admin-status-label'>${item.label}</span>
              <span class='admin-status-pill ${item.active ? "active" : ""}'>${item.state}</span>
            </div>
            <div class='admin-status-detail'>${item.detail}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderAdminEmptyState(content, activeSource, title, detail, technicalNote = "") {
  const statusMarkup = buildBackendStatusMarkup(activeSource, 0);
  content.innerHTML = `
    ${statusMarkup}
    <div class='admin-no-data'>
      <b>${title}</b><br>${detail}
      ${technicalNote ? `<div class='admin-empty-note'>${technicalNote}</div>` : ""}
    </div>
  `;
}

function escapeAdminHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAdminCell(value, key) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "<span class='admin-cell-empty'>-</span>";
  }

  const isJson = /^[\[{]/.test(raw);
  const isLong = raw.length > 90 || raw.includes("\n");
  const className = [
    "admin-cell-content",
    isJson ? "admin-cell-code" : "",
    isLong ? "admin-cell-multiline" : ""
  ].filter(Boolean).join(" ");

  return `
    <div class='${className}' title="${escapeAdminHtml(raw)}" aria-label="${escapeAdminHtml(key.replace(/_/g, " "))}">
      ${isJson ? "<span class='admin-cell-badge'>JSON</span>" : ""}
      <span>${escapeAdminHtml(raw)}</span>
    </div>
  `;
}

function parseAdminJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function orderAdminHeaders(headers) {
  const priority = [
    "created_at",
    "started_at",
    "role",
    "name",
    "email",
    "overall_rating",
    "would_use",
    "most_useful",
    "needs_work",
    "what_worked",
    "what_needed",
    "ai_summary"
  ];

  return [
    ...priority.filter(header => headers.includes(header)),
    ...headers.filter(header => !priority.includes(header))
  ];
}

function getFeatureMeta(key) {
  if (key === "other") {
    return { icon: "📝", title: "Other" };
  }
  return FEATURES.find(feature => feature.key === key) || { icon: "•", title: key || "Not selected" };
}

function getTaskTitle(taskNumber, roleKey = "") {
  if (taskNumber === 1) return TASKS[0].heading;
  if (taskNumber === 2) return (TASK2_ROLE_MAP[roleKey]?.heading || "Role-specific discovery task");
  if (taskNumber === 3) return TASKS[2].heading;
  return `Task ${taskNumber}`;
}

function getTaskCompletionText(value) {
  if (value === 0) return "Completed easily";
  if (value === 1) return "Completed with difficulty";
  if (value === 2) return "Could not complete";
  return "No result";
}

function getTaskTimeText(value) {
  return ["Under 30s", "30s-1min", "Over 1 min"][value] || "";
}

function getScenarioSenseText(value) {
  return ["Yes", "Mostly", "Not really"][value] || "";
}

function getWouldUseText(value) {
  return ["Yes, regularly", "Yes, occasionally", "Probably not", "No"][value] || "No answer";
}

function getPercent(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function buildPieChartSvg(items, options = {}) {
  const size = options.size || 180;
  const strokeWidth = options.strokeWidth || 24;
  const total = items.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  let offset = 0;

  const segments = total > 0
    ? items.map(item => {
        const count = Number(item.count) || 0;
        const arc = (count / total) * circumference;
        const dashArray = `${arc} ${Math.max(circumference - arc, 0)}`;
        const dashOffset = -offset;
        offset += arc;
        return `
          <circle
            class="admin-pie-segment"
            cx="${center}"
            cy="${center}"
            r="${radius}"
            fill="none"
            stroke="${item.color}"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${dashArray}"
            stroke-dashoffset="${dashOffset}"
            transform="rotate(-90 ${center} ${center})"
          ></circle>
        `;
      }).join("")
    : "";

  return `
    <svg class="admin-pie-svg" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        fill="none"
        stroke="#e2e8f0"
        stroke-width="${strokeWidth}"
      ></circle>
      ${segments}
      <circle cx="${center}" cy="${center}" r="${radius - strokeWidth / 2 + 2}" fill="#ffffff"></circle>
      <text x="${center}" y="${center - 6}" text-anchor="middle" class="admin-pie-total">${total}</text>
      <text x="${center}" y="${center + 16}" text-anchor="middle" class="admin-pie-label">${options.label || "Responses"}</text>
    </svg>
  `;
}

function formatSessionMinutes(startedAt, createdAt) {
  if (!startedAt || !createdAt) return null;
  const started = new Date(startedAt).getTime();
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(started) || !Number.isFinite(created) || created <= started) return null;
  const mins = Math.round((created - started) / 60000);
  if (mins <= 0 || mins > 180) return null;
  return mins;
}

function getResponseTextEntries(row) {
  const featureCommentCount = FEATURES.filter(feature => String(row[`rating_${feature.key}`] || "").trim()).length;
  const textEntries = [
    row.what_worked,
    row.what_needed,
    row.other_comments,
    row.ai_summary,
    ...FEATURES.map(feature => row[`comment_${feature.key}`])
  ].filter(value => String(value || "").trim());

  return {
    featureCommentCount,
    textEntries,
    substantialCount: textEntries.filter(value => String(value).trim().length >= 20).length
  };
}

function getInteractionEvidence(row) {
  const tasks = [1, 2, 3].map(index => parseAdminJson(row[`task${index}_result`]) || {});
  const tasksAnswered = tasks.filter(task => task.completed !== null && task.completed !== undefined).length;
  const tasksCompleted = tasks.filter(task => task.completed === 0 || task.completed === 1).length;
  const tasksCompletedEasily = tasks.filter(task => task.completed === 0).length;
  const ratingsGiven = FEATURES.filter(feature => Number(row[`rating_${feature.key}`]) > 0).length;
  const text = getResponseTextEntries(row);
  const hasWrittenReflection = Boolean(
    String(row.what_worked || "").trim() ||
    String(row.what_needed || "").trim() ||
    String(row.other_comments || "").trim()
  );
  const sessionMinutes = formatSessionMinutes(row.started_at, row.created_at);
  const scenarioJudged = tasks[2]?.scenario !== null && tasks[2]?.scenario !== undefined;
  const signals = [
    tasksAnswered === 3,
    tasksCompleted >= 2,
    ratingsGiven === FEATURES.length,
    hasWrittenReflection,
    scenarioJudged,
    Number(row.overall_rating) > 0,
    sessionMinutes !== null
  ];
  const interactionScore = Math.round((signals.filter(Boolean).length / signals.length) * 100);

  return {
    tasks,
    tasksAnswered,
    tasksCompleted,
    tasksCompletedEasily,
    ratingsGiven,
    hasWrittenReflection,
    substantialCommentCount: text.substantialCount,
    sessionMinutes,
    scenarioJudged,
    interactionScore
  };
}

function buildAdminAnalytics(data) {
  const featureChoiceCounts = FEATURES.reduce((acc, feature) => {
    acc[feature.key] = { mostUseful: 0, needsWork: 0 };
    return acc;
  }, { other: { mostUseful: 0, needsWork: 0 } });

  const roleBreakdown = ROLES.map(role => {
    const rows = data.filter(row => row.role === role.key);
    const evidence = rows.map(getInteractionEvidence);
    const adoptionPositive = rows.filter(row => {
      const idx = Number(row.would_use);
      return idx === 0 || idx === 1;
    }).length;
    const avgOverall = rows.length
      ? (rows.reduce((sum, row) => sum + (Number(row.overall_rating) || 0), 0) / rows.length).toFixed(2)
      : "-";
    const completedAllTasks = evidence.filter(item => item.tasksAnswered === 3).length;

    return {
      role,
      count: rows.length,
      avgOverall,
      adoptionPositive,
      completedAllTasks,
      interactionAvg: rows.length
        ? Math.round(evidence.reduce((sum, item) => sum + item.interactionScore, 0) / rows.length)
        : 0
    };
  });

  const evidence = data.map(getInteractionEvidence);
  const completedAllTasks = evidence.filter(item => item.tasksAnswered === 3).length;
  const completedAtLeastTwoTasks = evidence.filter(item => item.tasksCompleted >= 2).length;
  const ratedAllFeatures = evidence.filter(item => item.ratingsGiven === FEATURES.length).length;
  const leftWrittenReflection = evidence.filter(item => item.hasWrittenReflection).length;
  const scenarioJudged = evidence.filter(item => item.scenarioJudged).length;
  const measurableSessions = evidence.filter(item => item.sessionMinutes !== null);
  const avgInteractionScore = evidence.length
    ? Math.round(evidence.reduce((sum, item) => sum + item.interactionScore, 0) / evidence.length)
    : 0;
  const avgTasksAnswered = evidence.length
    ? (evidence.reduce((sum, item) => sum + item.tasksAnswered, 0) / evidence.length).toFixed(1)
    : "0.0";
  const avgSessionMinutes = measurableSessions.length
    ? Math.round(measurableSessions.reduce((sum, item) => sum + item.sessionMinutes, 0) / measurableSessions.length)
    : null;

  data.forEach(row => {
    const usefulKey = row.most_useful || "";
    const needsKey = row.needs_work || "";
    if (featureChoiceCounts[usefulKey]) featureChoiceCounts[usefulKey].mostUseful += 1;
    if (featureChoiceCounts[needsKey]) featureChoiceCounts[needsKey].needsWork += 1;
  });

  const adoptionCounts = {
    regularly: data.filter(row => Number(row.would_use) === 0).length,
    occasionally: data.filter(row => Number(row.would_use) === 1).length,
    probablyNot: data.filter(row => Number(row.would_use) === 2).length,
    no: data.filter(row => Number(row.would_use) === 3).length
  };

  const featureStats = FEATURES.map(feature => {
    const vals = data.map(row => Number(row[`rating_${feature.key}`]) || 0).filter(Boolean);
    return {
      key: feature.key,
      icon: feature.icon,
      title: feature.title,
      avg: vals.length ? vals.reduce((sum, value) => sum + value, 0) / vals.length : 0,
      count: vals.length,
      mostUsefulCount: featureChoiceCounts[feature.key]?.mostUseful || 0,
      needsWorkCount: featureChoiceCounts[feature.key]?.needsWork || 0
    };
  }).sort((a, b) => b.avg - a.avg);

  const strongestFeature = [...featureStats].sort((a, b) => {
    if (b.mostUsefulCount !== a.mostUsefulCount) return b.mostUsefulCount - a.mostUsefulCount;
    return b.avg - a.avg;
  })[0];
  const weakestFeature = [...featureStats].sort((a, b) => {
    if (b.needsWorkCount !== a.needsWorkCount) return b.needsWorkCount - a.needsWorkCount;
    return a.avg - b.avg;
  })[0];

  const overallDistribution = [1, 2, 3, 4, 5].map(value => ({
    value,
    label: `${value}/5`,
    count: data.filter(row => Number(row.overall_rating) === value).length
  }));

  const wouldUseDistribution = [
    { key: "regularly", label: "Yes, regularly", count: adoptionCounts.regularly },
    { key: "occasionally", label: "Yes, occasionally", count: adoptionCounts.occasionally },
    { key: "probablyNot", label: "Probably not", count: adoptionCounts.probablyNot },
    { key: "no", label: "No", count: adoptionCounts.no }
  ];

  const taskOutcomeDistributions = [1, 2, 3].map(taskNumber => {
    const outcomes = { easy: 0, difficult: 0, failed: 0, noResult: 0 };
    data.forEach(row => {
      const task = parseAdminJson(row[`task${taskNumber}_result`]) || {};
      if (task.completed === 0) outcomes.easy += 1;
      else if (task.completed === 1) outcomes.difficult += 1;
      else if (task.completed === 2) outcomes.failed += 1;
      else outcomes.noResult += 1;
    });
    return {
      taskNumber,
      title: getTaskTitle(taskNumber),
      outcomes
    };
  });

  const interactionBuckets = [
    { label: "0-39%", min: 0, max: 39, count: 0 },
    { label: "40-59%", min: 40, max: 59, count: 0 },
    { label: "60-79%", min: 60, max: 79, count: 0 },
    { label: "80-100%", min: 80, max: 100, count: 0 }
  ];

  evidence.forEach(item => {
    const bucket = interactionBuckets.find(entry => item.interactionScore >= entry.min && item.interactionScore <= entry.max);
    if (bucket) bucket.count += 1;
  });

  return {
    evidence,
    roleBreakdown,
    completedAllTasks,
    completedAtLeastTwoTasks,
    ratedAllFeatures,
    leftWrittenReflection,
    scenarioJudged,
    avgInteractionScore,
    avgTasksAnswered,
    avgSessionMinutes,
    adoptionCounts,
    featureStats,
    strongestFeature,
    weakestFeature,
    overallDistribution,
    wouldUseDistribution,
    taskOutcomeDistributions,
    interactionBuckets
  };
}

function buildParticipantInsightCards(data) {
  return data.slice().reverse().map((row, idx) => {
    const role = ROLES.find(r => r.key === row.role);
    const roleLabel = role ? `${role.icon} ${role.title}` : (row.role || "Unknown role");
    const displayName = row.name || "Anonymous participant";
    const evidence = getInteractionEvidence(row);
    const sessionLabel = evidence.sessionMinutes !== null ? `${evidence.sessionMinutes} min session` : "Session length unavailable";
    const contactBits = [
      row.name ? "Name shared" : "No name shared",
      row.email ? "Email shared" : "No email shared"
    ];
    const taskSummaries = [1, 2, 3].map(i => {
      const task = evidence.tasks[i - 1] || {};
      const extra = [
        i < 3 ? (task.time !== null && task.time !== undefined ? `Time: ${getTaskTimeText(task.time)}` : "") : "",
        i === 3 ? (task.scenario !== null && task.scenario !== undefined ? `Scenario sense: ${getScenarioSenseText(task.scenario)}` : "") : "",
        task.note ? `Note: ${task.note}` : ""
      ].filter(Boolean).join(" | ");
      return `
        <div class='admin-insight-task'>
          <div class='admin-insight-task-title'>Task ${i}</div>
          <div class='admin-insight-task-name'>${escapeAdminHtml(getTaskTitle(i, row.role))}</div>
          <div class='admin-insight-task-status'>${escapeAdminHtml(getTaskCompletionText(task.completed))}</div>
          ${extra ? `<div class='admin-insight-task-meta'>${escapeAdminHtml(extra)}</div>` : ""}
        </div>
      `;
    }).join("");

    return `
      <div class='admin-insight-card'>
        <div class='admin-insight-header'>
          <div>
            <div class='admin-insight-name'>${escapeAdminHtml(displayName)}</div>
            <div class='admin-insight-role'>${escapeAdminHtml(roleLabel)}</div>
          </div>
          <div class='admin-insight-index'>Response #${data.length - idx}</div>
        </div>
        <div class='admin-insight-meta'>
          <span class='admin-insight-pill strong'>Interaction score ${evidence.interactionScore}%</span>
          <span class='admin-insight-pill'>${escapeAdminHtml(`${evidence.tasksAnswered}/3 tasks answered`)}</span>
          <span class='admin-insight-pill'>${escapeAdminHtml(`${evidence.ratingsGiven}/${FEATURES.length} features rated`)}</span>
          <span class='admin-insight-pill'>${escapeAdminHtml(sessionLabel)}</span>
          <span class='admin-insight-pill'>${escapeAdminHtml(contactBits.join(" • "))}</span>
          ${row.email ? `<span class='admin-insight-pill'>${escapeAdminHtml(row.email)}</span>` : ""}
          ${row.created_at ? `<span class='admin-insight-pill'>${escapeAdminHtml(new Date(row.created_at).toLocaleString())}</span>` : ""}
        </div>
        <div class='admin-insight-grid'>
          <div class='admin-insight-block'>
            <div class='admin-insight-label'>Overall</div>
            <div class='admin-insight-value'>${escapeAdminHtml(String(row.overall_rating || "-"))}/5</div>
          </div>
          <div class='admin-insight-block'>
            <div class='admin-insight-label'>Would Use</div>
            <div class='admin-insight-value'>${escapeAdminHtml(getWouldUseText(Number(row.would_use)))}</div>
          </div>
          <div class='admin-insight-block'>
            <div class='admin-insight-label'>Interaction Proof</div>
            <div class='admin-insight-value'>${escapeAdminHtml(`${evidence.tasksCompleted} tasks completed, ${evidence.substantialCommentCount} substantial comments`)}</div>
          </div>
          <div class='admin-insight-block admin-insight-block-wide'>
            <div class='admin-insight-label'>What Worked Best</div>
            <div class='admin-insight-text'>${escapeAdminHtml(row.what_worked || row.most_useful || "No comment shared")}</div>
          </div>
          <div class='admin-insight-block admin-insight-block-wide'>
            <div class='admin-insight-label'>Main Friction</div>
            <div class='admin-insight-text'>${escapeAdminHtml(row.what_needed || row.needs_work || "No issue shared")}</div>
          </div>
          <div class='admin-insight-block admin-insight-block-wide'>
            <div class='admin-insight-label'>Other Notes</div>
            <div class='admin-insight-text'>${escapeAdminHtml(row.other_comments || "No extra comments")}</div>
          </div>
        </div>
        <div class='admin-insight-tasks'>
          ${taskSummaries}
        </div>
      </div>
    `;
  }).join("");
}

function renderAdminContent(content, data, sourceLabel) {
  const total = data.length;
  if (!total) {
    renderAdminEmptyState(
      content,
      sourceLabel,
      "No responses yet.",
      "The selected backend is connected, but there are no saved survey rows yet."
    );
    return;
  }

  const headers = orderAdminHeaders(Object.keys(data[0]));
  const analytics = buildAdminAnalytics(data);
  const rawDataRows = data.map((row, rowIndex) => `
    <tr>
      <td class='admin-row-index'>${rowIndex + 1}</td>
      ${headers.map(header => `<td class='${["name","email","role"].includes(header) ? "admin-col-highlight" : ""}'>${formatAdminCell(row[header], header)}</td>`).join("")}
    </tr>
  `).join("");
  const participantInsightsMarkup = buildParticipantInsightCards(data);
  const overallRatings = data.map(r=>+r["overall_rating"]||0).filter(Boolean);
  const avgOverall = overallRatings.length ? (overallRatings.reduce((a,b)=>a+b,0)/overallRatings.length).toFixed(2) : "N/A";
  const starsDisplay = avgOverall !== "N/A" ? `${Math.round(+avgOverall)}/5` : "";

  const roleCounts = {};
  ROLES.forEach(r=>roleCounts[r.key]=0);
  data.forEach(r=>{ if (roleCounts[r["role"]]!==undefined) roleCounts[r["role"]]++; });
  const uniqueRoles = ROLES.filter(r=>roleCounts[r.key]>0).length;

  const withSummary = data.filter(r=>r["ai_summary"] && r["ai_summary"].trim().length > 10).length;

  const featureStats = analytics.featureStats;

  const taskNames = ["Find today's energy cost","Play a room heatmap and find the extremes","Find a what-if scenario"];
  const taskStats = [1,2,3].map(i=>{
    const easy = data.filter(r=>{
      try { return JSON.parse(r[`task${i}_result`]).completed===0; } catch { return false; }
    }).length;
    return Math.round(100*easy/total);
  });

  const summaries = data.slice(-5).reverse().map((r,i)=>({role:r["role"],summary:r["ai_summary"],idx:total-i}));
  const maxRoleCount = Math.max(...ROLES.map(r=>roleCounts[r.key]), 1);
  const validSummaries = summaries.filter(s=>s.summary && s.summary.trim().length>10);

  let html = "";
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

  html += buildBackendStatusMarkup(sourceLabel, total);

  html += `<div class='admin-section'>
    <div class='admin-section-header'>
      Participant Roles
      <span class='section-badge'>${total} total</span>
    </div>
    <div class='admin-section-note'>Shows how many responses came from each stakeholder group. Taller bars mean more participants from that role.</div>
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

  html += `<div class='admin-section'>
    <div class='admin-section-header'>Feature Ratings
      <span class='section-badge'>sorted by avg</span>
    </div>
    <div class='admin-section-note'>Average usefulness rating for each platform feature. Longer bars and warmer scores indicate stronger feedback.</div>
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

  html += `<div class='admin-section'>
    <div class='admin-section-header'>
      <span class='section-icon'>Task</span> Task Completion - "Completed Easily" Rate
    </div>
    <div class='admin-section-note'>Shows how easily participants completed the guided tasks. Higher percentages suggest clearer navigation and better usability.</div>
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

    if (validSummaries.length) {
    html += `<div class='admin-section'>
      <div class='admin-section-header'>
        <span class='section-icon'>AI</span> Recent AI-Generated Summaries
        <span class='section-badge'>last ${validSummaries.length}</span>
      </div>
      <div class='admin-section-note'>Short AI recaps of recent responses. Useful for scanning common themes before reading the raw comments.</div>
      ${validSummaries.map(s=>{
        const role = ROLES.find(r=>r.key===s.role);
        return `<div class='admin-summary-card'>
          <div class='admin-summary-card-header'>
            <span>${role?.icon || ""}</span>
            <span class='admin-summary-role'>${role?role.title:s.role}</span>
            <span class='admin-summary-idx'>Response #${s.idx}</span>
          </div>
          <div class='admin-summary-text'>${s.summary}</div>
        </div>`;
      }).join("")}
    </div>`;
  }

  html += `<div class='admin-section'>
    <div class='admin-section-header'>
      <span class='section-icon'>Data</span> Raw Response Data
      <span class='section-badge'>${total} rows</span>
    </div>
    <div class='admin-section-note'>The full response dataset exactly as stored. Use this for detailed checking, export, and research traceability.</div>
    <div class='admin-table-shell'>
      <div class='admin-table-toolbar'>
        <div class='admin-table-title'>Research export view</div>
        <div class='admin-table-note'>Hover any cell to see the full value. Long responses wrap automatically.</div>
      </div>
      <div class='admin-table-wrap'>
        <table class='admin-table admin-raw-table'>
          <tr>
            <th class='admin-row-index'>#</th>
            ${headers.map(h=>`<th class='${["name","email","role"].includes(h) ? "admin-col-highlight" : ""}'>${escapeAdminHtml(h.replace(/_/g, " "))}</th>`).join("")}
          </tr>
          ${rawDataRows}
        </table>
      </div>
    </div>
    <div class='admin-download-row'>
      <button class='admin-download-btn' onclick='downloadCSV()'>Download CSV</button>
    </div>
    <div class='admin-subsection-divider'></div>
    <div class='admin-section-header admin-section-header-secondary'>
      <span class='section-icon'>Sense</span> Interpreted Participant Responses
      <span class='section-badge'>${total} cards</span>
    </div>
    <div class='admin-section-note'>A cleaner participant-by-participant summary. Interaction score estimates how much evidence each response provides of real platform use.</div>
    <div class='admin-insight-list'>
      ${participantInsightsMarkup}
    </div>
  </div>`;

  html += `
    <div class='admin-stats-grid'>
      <div class='admin-stat-card'>
        <div class='admin-stat-value'>${analytics.avgInteractionScore}%</div>
        <div class='admin-stat-label'>Interaction Evidence Score</div>
        <div class='admin-stat-sub'>based on task, rating, and reflection signals</div>
      </div>
      <div class='admin-stat-card'>
        <div class='admin-stat-value'>${analytics.completedAllTasks}/${total}</div>
        <div class='admin-stat-label'>Completed All Tasks</div>
        <div class='admin-stat-sub'>finished the 3 guided interaction tasks</div>
      </div>
      <div class='admin-stat-card'>
        <div class='admin-stat-value'>${analytics.ratedAllFeatures}/${total}</div>
        <div class='admin-stat-label'>Rated All Features</div>
        <div class='admin-stat-sub'>gave full feature-level feedback</div>
      </div>
      <div class='admin-stat-card'>
        <div class='admin-stat-value'>${analytics.leftWrittenReflection}/${total}</div>
        <div class='admin-stat-label'>Left Written Reflection</div>
        <div class='admin-stat-sub'>shared qualitative evidence for analysis</div>
      </div>
    </div>`;

  html += `<div class='admin-section'>
    <div class='admin-section-header'>
      Thesis-ready evidence
      <span class='section-badge'>interaction proof</span>
    </div>
    <div class='admin-section-note'>High-level indicators you can cite to show that stakeholders did not only answer opinions, but actually worked through tasks and feature feedback.</div>
    <div class='admin-evidence-grid'>
      <div class='admin-evidence-card'>
        <div class='admin-evidence-label'>Task participation</div>
        <div class='admin-evidence-value'>${analytics.completedAllTasks}/${total}</div>
        <div class='admin-evidence-text'>completed all 3 guided validation tasks. Another ${analytics.completedAtLeastTwoTasks}/${total} completed at least 2 tasks.</div>
      </div>
      <div class='admin-evidence-card'>
        <div class='admin-evidence-label'>Deep feedback</div>
        <div class='admin-evidence-value'>${analytics.ratedAllFeatures}/${total}</div>
        <div class='admin-evidence-text'>rated all ${FEATURES.length} core features, while ${analytics.leftWrittenReflection}/${total} left written reflections you can quote qualitatively.</div>
      </div>
      <div class='admin-evidence-card'>
        <div class='admin-evidence-label'>Scenario engagement</div>
        <div class='admin-evidence-value'>${analytics.scenarioJudged}/${total}</div>
        <div class='admin-evidence-text'>judged whether the scenario result made sense, which is a direct sign they reached and interpreted the planning feature.</div>
      </div>
      <div class='admin-evidence-card'>
        <div class='admin-evidence-label'>Measured sessions</div>
        <div class='admin-evidence-value'>${analytics.avgSessionMinutes !== null ? `${analytics.avgSessionMinutes} min` : "-"}</div>
        <div class='admin-evidence-text'>average observed response session across records with both start and submission timestamps. Mean tasks answered: ${analytics.avgTasksAnswered}/3.</div>
      </div>
    </div>
    <div class='admin-thesis-note'>
      These indicators help demonstrate that stakeholders did more than submit opinions: they navigated guided tasks, rated specific product features, and recorded reflective comments grounded in hands-on interaction.
    </div>
  </div>`;

  html += `<div class='admin-section'>
    <div class='admin-section-header'>
      Stakeholder interaction by feature
      <span class='section-badge'>supplementary evidence</span>
    </div>
    <div class='admin-section-note'>Compares which features were chosen most often as useful and which were flagged most often for improvement.</div>
    ${featureStats.map(f=>{
      const featureMeta = getFeatureMeta(f.key);
      return `<div class='admin-feature-row'>
        <span class='admin-feature-icon'>${featureMeta.icon}</span>
        <span class='admin-feature-name'>${featureMeta.title}</span>
        <div class='admin-feature-bar-wrap'>
          <div class='admin-feature-bar-fill' style='width:${Math.max(f.mostUsefulCount, f.needsWorkCount) > 0 ? Math.min(100, Math.max(f.mostUsefulCount, f.needsWorkCount) * 20) : 0}%;background:linear-gradient(90deg, #2563eb, #60a5fa)'></div>
        </div>
        <span class='admin-feature-score'>${f.mostUsefulCount} useful</span>
        <span class='admin-feature-count'>${f.needsWorkCount} needs work</span>
      </div>`;
    }).join("")}
  </div>`;

  html += `<div class='admin-section'>
    <div class='admin-section-header'>
      Research findings snapshot
      <span class='section-badge'>for thesis write-up</span>
    </div>
    <div class='admin-section-note'>Condensed takeaways from the collected responses. Useful for a quick narrative summary of strengths, weaknesses, and adoption interest.</div>
    <div class='admin-findings-grid'>
      <div class='admin-finding-card'>
        <div class='admin-finding-title'>Strongest perceived feature</div>
        <div class='admin-finding-value'>${escapeAdminHtml(`${analytics.strongestFeature?.icon || ""} ${analytics.strongestFeature?.title || "No data"}`)}</div>
        <div class='admin-finding-text'>Average rating ${analytics.strongestFeature?.avg ? analytics.strongestFeature.avg.toFixed(2) : "-"} / 5 and selected as "most useful" by ${analytics.strongestFeature?.mostUsefulCount || 0} participant(s).</div>
      </div>
      <div class='admin-finding-card'>
        <div class='admin-finding-title'>Highest improvement demand</div>
        <div class='admin-finding-value'>${escapeAdminHtml(`${analytics.weakestFeature?.icon || ""} ${analytics.weakestFeature?.title || "No data"}`)}</div>
        <div class='admin-finding-text'>Marked as needing the most improvement by ${analytics.weakestFeature?.needsWorkCount || 0} participant(s), with an average rating of ${analytics.weakestFeature?.avg ? analytics.weakestFeature.avg.toFixed(2) : "-"} / 5.</div>
      </div>
      <div class='admin-finding-card'>
        <div class='admin-finding-title'>Adoption signal</div>
        <div class='admin-finding-value'>${analytics.adoptionCounts.regularly + analytics.adoptionCounts.occasionally}/${total}</div>
        <div class='admin-finding-text'>said they would use the system at least occasionally. Regular use: ${analytics.adoptionCounts.regularly}. Occasional use: ${analytics.adoptionCounts.occasionally}. Negative intent: ${analytics.adoptionCounts.probablyNot + analytics.adoptionCounts.no}.</div>
      </div>
    </div>
  </div>`;

  html += `<div class='admin-section'>
    <div class='admin-section-header'>
      Stakeholder evidence by role
      <span class='section-badge'>comparative view</span>
    </div>
    <div class='admin-section-note'>Compares response quality and adoption signals across stakeholder groups so you can discuss differences between roles.</div>
    <div class='admin-role-evidence-list'>
      ${analytics.roleBreakdown.map(item => `
        <div class='admin-role-evidence-card'>
          <div class='admin-role-evidence-top'>
            <div class='admin-role-evidence-title'>${escapeAdminHtml(`${item.role.icon} ${item.role.title}`)}</div>
            <div class='admin-role-evidence-pill'>${item.count} response(s)</div>
          </div>
          <div class='admin-role-evidence-metrics'>
            <span>All tasks answered: ${item.completedAllTasks}/${item.count || 0}</span>
            <span>Avg overall: ${item.avgOverall}/5</span>
            <span>Would use: ${item.adoptionPositive}/${item.count || 0}</span>
            <span>Avg interaction score: ${item.interactionAvg}%</span>
          </div>
        </div>
      `).join("")}
    </div>
  </div>`;

  html += `<div class='admin-section'>
    <div class='admin-section-header'>
      Response graphs
      <span class='section-badge'>visual analysis</span>
    </div>
    <div class='admin-section-note'>Visual summaries of response patterns. Longer bars mean more responses in that category.</div>
    <div class='admin-inline-legend'>
      <span><i style='background:linear-gradient(90deg, #f59e0b, #fbbf24)'></i> Overall rating distribution</span>
      <span><i style='background:linear-gradient(90deg, #2563eb, #60a5fa)'></i> Adoption and feature-interest bars</span>
      <span><i style='background:linear-gradient(90deg, #0f766e, #2dd4bf)'></i> Interaction score spread</span>
      <span><i style='background:#16a34a'></i> Easy</span>
      <span><i style='background:#f59e0b'></i> Difficult</span>
      <span><i style='background:#dc2626'></i> Not completed</span>
      <span><i style='background:#94a3b8'></i> No result</span>
    </div>
    <div class='admin-pie-grid'>
      <div class='admin-graph-card'>
        <div class='admin-graph-title'>Overall ratings pie</div>
        <div class='admin-section-note'>Each slice shows the share of participants who gave that overall score.</div>
        <div class='admin-pie-layout'>
          ${buildPieChartSvg(
            analytics.overallDistribution.map((item, index) => ({
              ...item,
              color: ["#dc2626", "#f97316", "#f59e0b", "#84cc16", "#16a34a"][index]
            })),
            { label: "Ratings" }
          )}
          <div class='admin-pie-legend'>
            ${analytics.overallDistribution.map((item, index) => `
              <div class='admin-pie-legend-item'>
                <span class='admin-pie-dot' style='background:${["#dc2626", "#f97316", "#f59e0b", "#84cc16", "#16a34a"][index]}'></span>
                <span>${item.label}</span>
                <strong>${item.count}</strong>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
      <div class='admin-graph-card'>
        <div class='admin-graph-title'>Use-intention pie</div>
        <div class='admin-section-note'>This shows the split between strong adoption, occasional use, and negative intent.</div>
        <div class='admin-pie-layout'>
          ${buildPieChartSvg(
            analytics.wouldUseDistribution.map((item, index) => ({
              ...item,
              color: ["#16a34a", "#3b82f6", "#f59e0b", "#dc2626"][index]
            })),
            { label: "Intent" }
          )}
          <div class='admin-pie-legend'>
            ${analytics.wouldUseDistribution.map((item, index) => `
              <div class='admin-pie-legend-item'>
                <span class='admin-pie-dot' style='background:${["#16a34a", "#3b82f6", "#f59e0b", "#dc2626"][index]}'></span>
                <span>${escapeAdminHtml(item.label)}</span>
                <strong>${item.count}</strong>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
    <div class='admin-graph-grid'>
      <div class='admin-graph-card'>
        <div class='admin-graph-title'>Overall rating distribution</div>
        <div class='admin-section-note'>Amber bars show how many participants gave each overall score from 1 to 5.</div>
        <div class='admin-graph-stack'>
          ${analytics.overallDistribution.map(item => `
            <div class='admin-graph-bar-group'>
              <div class='admin-graph-bar-track'>
                <div class='admin-graph-bar-fill amber' style='width:${getPercent(item.count, total)}%'></div>
              </div>
              <div class='admin-graph-bar-meta'>
                <span>${item.label}</span>
                <span>${item.count} responses</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
      <div class='admin-graph-card'>
        <div class='admin-graph-title'>Daily-use intention</div>
        <div class='admin-section-note'>Blue bars show whether participants said they would use the system in daily work.</div>
        <div class='admin-graph-stack'>
          ${analytics.wouldUseDistribution.map(item => `
            <div class='admin-graph-bar-group'>
              <div class='admin-graph-bar-track'>
                <div class='admin-graph-bar-fill blue' style='width:${getPercent(item.count, total)}%'></div>
              </div>
              <div class='admin-graph-bar-meta'>
                <span>${escapeAdminHtml(item.label)}</span>
                <span>${item.count} responses</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
    <div class='admin-graph-grid admin-graph-grid-secondary'>
      <div class='admin-graph-card admin-graph-card-wide'>
        <div class='admin-graph-title'>Task outcome comparison</div>
        <div class='admin-section-note'>Each stacked bar shows the mix of easy, difficult, failed, and missing outcomes for each task.</div>
        <div class='admin-task-outcome-list'>
          ${analytics.taskOutcomeDistributions.map(item => {
            const easyPct = getPercent(item.outcomes.easy, total);
            const difficultPct = getPercent(item.outcomes.difficult, total);
            const failedPct = getPercent(item.outcomes.failed, total);
            const noResultPct = getPercent(item.outcomes.noResult, total);
            return `
              <div class='admin-task-outcome-row'>
                <div class='admin-task-outcome-header'>
                  <span>${escapeAdminHtml(`Task ${item.taskNumber}`)}</span>
                  <span>${escapeAdminHtml(item.title)}</span>
                </div>
                <div class='admin-task-outcome-track'>
                  <div class='admin-task-outcome-segment easy' style='width:${easyPct}%'></div>
                  <div class='admin-task-outcome-segment difficult' style='width:${difficultPct}%'></div>
                  <div class='admin-task-outcome-segment failed' style='width:${failedPct}%'></div>
                  <div class='admin-task-outcome-segment empty' style='width:${noResultPct}%'></div>
                </div>
                <div class='admin-task-outcome-legend'>
                  <span>Easy ${item.outcomes.easy}</span>
                  <span>Difficult ${item.outcomes.difficult}</span>
                  <span>Not completed ${item.outcomes.failed}</span>
                  <span>No result ${item.outcomes.noResult}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
      <div class='admin-graph-card'>
        <div class='admin-graph-title'>Interaction score spread</div>
        <div class='admin-section-note'>Teal bars group participants by how much evidence their responses provide of meaningful interaction.</div>
        <div class='admin-graph-stack'>
          ${analytics.interactionBuckets.map(item => `
            <div class='admin-graph-bar-group'>
              <div class='admin-graph-bar-track'>
                <div class='admin-graph-bar-fill teal' style='width:${getPercent(item.count, total)}%'></div>
              </div>
              <div class='admin-graph-bar-meta'>
                <span>${item.label}</span>
                <span>${item.count} participants</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  </div>`;

  content.innerHTML = html;
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

  const content = document.getElementById('admin-content');
  if (!content) return;

  fetch(CONFIG.RESPONSE_LIST_ENDPOINT).then(async response => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `List responses failed with ${response.status}`);
    }
    return response.json();
  }).then(payload => {
    const rows = Array.isArray(payload?.responses) ? payload.responses : [];
    renderAdminContent(content, rows, "Supabase database");
  }).catch(() => {
    renderAdminEmptyState(
      content,
      "Supabase standby",
      "Could not load Supabase responses.",
      "The admin dashboard could not reach the Supabase-backed Netlify functions.",
      "Check that you are running through Netlify Functions, SUPABASE_URL is correct, SUPABASE_SERVICE_ROLE_KEY is the real service role key, and the survey_responses table exists."
    );
  });

  setTimeout(()=>{ if(isAdmin()) render(); }, 60000);
}

function downloadCSV() {
  fetch(CONFIG.RESPONSE_LIST_ENDPOINT).then(async response => {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `List responses failed with ${response.status}`);
    }
    return response.json();
  }).then(payload => {
    const data = Array.isArray(payload?.responses) ? payload.responses : [];
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const escapeCell = value => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escapeCell).join(","),
      ...data.map(row => headers.map(header => escapeCell(row[header])).join(","))
    ].join("\n");
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gate_sofia_responses.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }).catch(error => {
    console.error("CSV download failed:", error);
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
  app.innerHTML = `
    <div class='admin-password-modal'>
      <div class='admin-password-box'>
        <div class='admin-password-badge'>Restricted access</div>
        <div class='admin-password-title'>Admin dashboard login</div>
        <div class='admin-password-subtitle'>Enter the administrator password to review survey responses, ratings, and AI-generated summaries.</div>
        <div class='admin-password-field'>
          <label for='admin_pw'>Password</label>
          <input type='password' id='admin_pw' placeholder='Enter admin password' autocomplete='current-password' />
        </div>
        <button class='button admin-login-btn' onclick='checkAdminPassword()'>Access dashboard</button>
        <div class='admin-password-note'>This area is intended only for the researcher and authorised supervisors.</div>
        <div id='admin_pw_err' class='admin-password-error'></div>
      </div>
    </div>
  `;
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
  
