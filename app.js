/**
 * NOVA HOSPITAL CLINICAL DIGITAL OS v2.0
 * Core Application Script
 */

// GLOBAL VARIABLES STATE
const OS_STATE = {
  config: {
    topic: "PHÁT TRIỂN CHIỀU CAO TỐI ƯU (NOVA HOSPITAL)",
    factorsCount: 3,
    factors: ["Dinh dưỡng", "Giấc ngủ", "Vận động"],
    charactersCount: 3,
    characters: ["Nhi", "Nam", "Minh"],
    patientsCount: 5,
    patients: ["Minh", "Lâm", "My", "Nhi", "An"]
  },
  // Audio state
  audio: {
    ctx: null,
    ambientGain: null,
    isMusicPlaying: false,
    ambientNodes: [],
    pulseIntervalId: null
  },
  // Global timer state
  timer: {
    duration: 120, // 2 minutes in seconds by default
    remaining: 120,
    intervalId: null,
    isRunning: false,
    soundTriggered: false
  },
  // Current active slide
  activeSlideId: "act1-s1",
  // Envelope states
  envelopesOpened: {},
  // Spinner state
  spinner: {
    isSpinning: false,
    currentAngle: 0,
    groups: ["NHÓM 1", "NHÓM 2", "NHÓM 3", "NHÓM 4", "NHÓM 5"],
    colors: ["#06B6D4", "#1E293B", "#10B981", "#1E293B", "#F43F5E"]
  }
};

// PRESET MEDICAL DIAGNOSTICS FOR ACTIVITY 2
const PATIENT_DIAGNOSTICS = {
  "minh": {
    habits: "Không ăn rau/cá, chỉ ăn cơm nước tương; Lười vận động",
    cause: "THIẾU HỤT CANXI / ĐẠM"
  },
  "lam": {
    habits: "Thức khuya xem iPad đến 12h đêm; Buổi trưa ngủ bù nhiều",
    cause: "THỨC KHUYA XEM IPAD"
  },
  "my": {
    habits: "Không tập thể dục; Đi học về chỉ nằm lướt TikTok/FB",
    cause: "THIẾU VẬN ĐỘNG"
  },
  "nhi": {
    habits: "Uống coca/pepsi hàng ngày; Lười nhảy dây và tập thể dục",
    cause: "THIẾU DINH DƯỠNG + VẬN ĐỘNG"
  },
  "an": {
    habits: "Bỏ bữa sáng; Ngủ trễ; Lười vận động; Nghiện trà sữa ngọt",
    cause: "SAI LỆCH CẢ 3 YẾU TỐ"
  }
};

// SLIDE NAVIGATION ORDER
const LESSON1_SLIDES = [
  "act1-s1", "act1-s2", "act1-s3", "act1-s4", "act1-s5",
  "act2-s1", "act2-s2", "act2-s3", "act2-s4", "act2-s5",
  "act3-s1", "act3-s2", "act3-s3", "act3-s4",
  "act4-s1", "act4-s2", "act4-s3", "act4-s4"
];

const LESSON2_SLIDES = [
  "l2-s1", "l2-s2", "l2-s3", "l2-s4", "l2-s5", "l2-s6", "l2-s7-prep", "l2-s7", "l2-s8", "l2-s9"
];

const LESSON3_SLIDES = [
  "l3-s1", "l3-s2", "l3-s3", "l3-s4", "l3-s5", "l3-s6", "l3-s7", "l3-s8", "l3-s9"
];

let SLIDE_ORDER = LESSON1_SLIDES;

// INITIALIZATION
window.addEventListener("DOMContentLoaded", () => {
  initUI();
  initSlidesNavigation();
  initGlobalTimer();
  initAmbientMusic();
  initSpinnerWheel();
  initConfetti();
  initGlobalConfig();
  initSpecialSlidesInteractions();
  initMatchingGame();

  // Lesson 2 Initializations
  initLessonSwitcher();
  initL2Fingerprint();
  initL2HabitsGame();
  initL2EmailMindmap();
  initL2HabitMap();
  initL2XRay();
  initL2Debate();
  initSpinnerWheelL2();
  initL2PosterMusic();
  initL2Notepad();
  initL2Commitment();

  // Lesson 3 Initializations
  initL3RetinaScan();
  initL3FactCheck();
  initL3RadarGoals();
  initL3Checklist();
  initL3SloganUpgrade();
  initL3Rehearsal();
  initL3StarsBroadcast();
  initL3ReflectionTimer();
  initL3Closing();

  // Run dynamic sync once on startup
  syncConfigToUI();

  // Highlight initial slide navigation state
  navigateToSlide("act1-s1");
});

// UI DYNAMIC BINDING / SYNCHRONIZATION
function syncConfigToUI() {
  const cfg = OS_STATE.config;

  // 1. Sync header topic
  const headerTopic = document.getElementById("display-header-topic");
  if (headerTopic) headerTopic.textContent = cfg.topic;
  document.title = cfg.topic;

  // 2. Sync characters text on Activity 1 Flip Cards
  const char1Name = cfg.characters[0] || "Nhi";
  const char2Name = cfg.characters[1] || "Nam";
  const char3Name = cfg.characters[2] || "Minh";

  document.querySelectorAll("#dynamic-char-1").forEach(el => el.textContent = char1Name);
  document.querySelectorAll("#dynamic-char-2").forEach(el => el.textContent = char2Name);
  document.querySelectorAll("#dynamic-char-3").forEach(el => el.textContent = char3Name);

  const lblChar1 = document.getElementById("lbl-char-1");
  const lblChar2 = document.getElementById("lbl-char-2");
  const lblChar3 = document.getElementById("lbl-char-3");
  if (lblChar1) lblChar1.textContent = char1Name.toUpperCase();
  if (lblChar2) lblChar2.textContent = char2Name.toUpperCase();
  if (lblChar3) lblChar3.textContent = char3Name.toUpperCase();

  const avatarChar1 = document.getElementById("avatar-char-1");
  const avatarChar2 = document.getElementById("avatar-char-2");
  const avatarChar3 = document.getElementById("avatar-char-3");
  if (avatarChar1) avatarChar1.textContent = char1Name.substring(0, 3).toUpperCase();
  if (avatarChar2) avatarChar2.textContent = char2Name.substring(0, 3).toUpperCase();
  if (avatarChar3) avatarChar3.textContent = char3Name.substring(0, 3).toUpperCase();

  // 3. Sync elements on Act 1 Slide 5 (3 factors)
  const factor1 = cfg.factors[0] || "Dinh dưỡng";
  const factor2 = cfg.factors[1] || "Giấc ngủ";
  const factor3 = cfg.factors[2] || "Vận động";

  const factorTitle1 = document.getElementById("factor-title-1");
  const factorTitle2 = document.getElementById("factor-title-2");
  const factorTitle3 = document.getElementById("factor-title-3");
  if (factorTitle1) factorTitle1.textContent = factor1;
  if (factorTitle2) factorTitle2.textContent = factor2;
  if (factorTitle3) factorTitle3.textContent = factor3;

  const tabLabel1 = document.getElementById("tab-label-1");
  const tabLabel2 = document.getElementById("tab-label-2");
  const tabLabel3 = document.getElementById("tab-label-3");
  if (tabLabel1) tabLabel1.textContent = "🧪 " + factor1.toUpperCase();
  if (tabLabel2) tabLabel2.textContent = "🌙 " + factor2.toUpperCase();
  if (tabLabel3) tabLabel3.textContent = "🏃 " + factor3.toUpperCase();

  const tabContentTitle1 = document.getElementById("tab-content-title-1");
  const tabContentTitle2 = document.getElementById("tab-content-title-2");
  const tabContentTitle3 = document.getElementById("tab-content-title-3");
  if (tabContentTitle1) tabContentTitle1.textContent = "Phác đồ " + factor1 + " Tối ưu";
  if (tabContentTitle2) tabContentTitle2.textContent = "Đồng hồ sinh học & " + factor2;
  if (tabContentTitle3) tabContentTitle3.textContent = "Phác đồ Kích thích " + factor3;

  // 4. Render Envelope Items in Activity 2 Slide 2 dynamically (matching new style.css selectors)
  const envelopesContainer = document.getElementById("envelopes-box-container");
  if (envelopesContainer) {
    envelopesContainer.innerHTML = "";
    cfg.patients.forEach((patient, idx) => {
      const key = patient.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
      const div = document.createElement("div");
      div.className = "env-wrap btn-click";
      div.setAttribute("data-patient", key);
      
      // Check if previously opened
      const isOpened = OS_STATE.envelopesOpened[key];
      if (isOpened) div.classList.add("opened");

      div.innerHTML = `
        <div class="env-box">
          <div class="env-flap"></div>
          <div class="env-body">
            <span class="env-lock">🔒 CONFIDENTIAL</span>
            <span class="env-index">CASE 0${idx + 1}</span>
          </div>
          <div class="env-paper">
            <h4 class="env-patient-name">${patient.toUpperCase()}</h4>
            <span class="env-patient-status">${isOpened ? 'ĐANG CHẨN ĐOÁN' : 'CHỜ PHÂN TÍCH'}</span>
          </div>
        </div>
      `;
      envelopesContainer.appendChild(div);

      // Rebind envelope click
      div.addEventListener("click", () => {
        if (!div.classList.contains("opened")) {
          div.classList.add("opened");
          OS_STATE.envelopesOpened[key] = true;
          const statusText = div.querySelector(".env-patient-status");
          if (statusText) statusText.textContent = "ĐANG CHẨN ĐOÁN";
          playClinicalSound("chime");
          const revealMsg = document.getElementById("envelope-reveal-message");
          if (revealMsg) {
            revealMsg.textContent = `Bác sĩ nhận hồ sơ ca bệnh của bạn: ${patient.toUpperCase()}!`;
            revealMsg.classList.add("text-glow-mint");
          }
        }
      });
    });
  }

  // 5. Render Medical Table in Activity 2 Slide 5
  const tableBody = document.getElementById("consensus-table-body");
  if (tableBody) {
    tableBody.innerHTML = "";
    cfg.patients.forEach((patient, idx) => {
      const cleanKey = patient.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
      const diag = PATIENT_DIAGNOSTICS[cleanKey] || {
        habits: "Thói quen sinh hoạt bất thường cần bác sĩ kiểm tra và hội chẩn",
        cause: "ĐANG PHÂN TÍCH LÂM SÀNG"
      };

      const tr = document.createElement("tr");
      tr.className = "table-row-hover";
      tr.innerHTML = `
        <td class="font-bold teal-text">${idx + 1}. ${patient.toUpperCase()}</td>
        <td>${diag.habits}</td>
        <td><span class="tag-alert">${diag.cause}</span></td>
      `;
      tableBody.appendChild(tr);
    });
  }
}

// APP CONFIGURATION FORM HANDLER
function initGlobalConfig() {
  const configModal = document.getElementById("config-modal");
  const configBtn = document.getElementById("config-btn");
  const closeBtn = document.getElementById("config-close-btn");
  const configForm = document.getElementById("global-config-form");

  if (configBtn && configModal) {
    configBtn.addEventListener("click", () => {
      // Fill values before showing
      const cfgTopic = document.getElementById("cfg-topic");
      const cfgFactorCount = document.getElementById("cfg-factor-count");
      const cfgFactorNames = document.getElementById("cfg-factor-names");
      const cfgCharNames = document.getElementById("cfg-char-names");
      const cfgFilesNames = document.getElementById("cfg-files-names");

      if (cfgTopic) cfgTopic.value = OS_STATE.config.topic;
      if (cfgFactorCount) cfgFactorCount.value = OS_STATE.config.factorsCount;
      if (cfgFactorNames) cfgFactorNames.value = OS_STATE.config.factors.join(" – ");
      if (cfgCharNames) cfgCharNames.value = OS_STATE.config.characters.join(", ");
      if (cfgFilesNames) cfgFilesNames.value = OS_STATE.config.patients.join(", ");

      configModal.classList.add("active");
      playClinicalSound("click");
    });
  }

  if (closeBtn && configModal) {
    closeBtn.addEventListener("click", () => {
      configModal.classList.remove("active");
      playClinicalSound("click");
    });
  }

  if (configForm && configModal) {
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Parse values
      const topicVal = document.getElementById("cfg-topic")?.value.trim() || OS_STATE.config.topic;
      const factorCountVal = parseInt(document.getElementById("cfg-factor-count")?.value || OS_STATE.config.factorsCount);
      
      const factorNamesStr = document.getElementById("cfg-factor-names")?.value || "";
      const factors = factorNamesStr.split(/[–,\-]/).map(s => s.trim()).filter(s => s.length > 0);

      const charNamesStr = document.getElementById("cfg-char-names")?.value || "";
      const characters = charNamesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const filesNamesStr = document.getElementById("cfg-files-names")?.value || "";
      const patients = filesNamesStr.split(',').map(s => s.trim()).filter(s => s.length > 0);

      // Save to global state
      OS_STATE.config.topic = topicVal;
      OS_STATE.config.factorsCount = factorCountVal || factors.length;
      if (factors.length > 0) OS_STATE.config.factors = factors;
      if (characters.length > 0) OS_STATE.config.characters = characters;
      OS_STATE.config.patientsCount = patients.length;
      if (patients.length > 0) OS_STATE.config.patients = patients;

      // Trigger update
      syncConfigToUI();

      // Close modal
      configModal.classList.remove("active");
      playClinicalSound("success");
    });
  }
}

// SLIDES NAVIGATION ENGINE
function initSlidesNavigation() {
  const slideItems = document.querySelectorAll(".slide-item");
  
  slideItems.forEach(item => {
    item.addEventListener("click", () => {
      const slideId = item.getAttribute("data-slide");
      navigateToSlide(slideId);
    });
  });

  const prevBtn = document.getElementById("prev-slide-btn");
  const nextBtn = document.getElementById("next-slide-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const currentIndex = SLIDE_ORDER.indexOf(OS_STATE.activeSlideId);
      if (currentIndex > 0) {
        navigateToSlide(SLIDE_ORDER[currentIndex - 1]);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const currentIndex = SLIDE_ORDER.indexOf(OS_STATE.activeSlideId);
      if (currentIndex !== -1 && currentIndex < SLIDE_ORDER.length - 1) {
        navigateToSlide(SLIDE_ORDER[currentIndex + 1]);
      }
    });
  }

  // Keyboard navigation support
  window.addEventListener("keydown", (e) => {
    // Skip if typing in an input or textarea
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
      return;
    }
    if (e.key === "ArrowLeft") {
      const currentIndex = SLIDE_ORDER.indexOf(OS_STATE.activeSlideId);
      if (currentIndex > 0) {
        navigateToSlide(SLIDE_ORDER[currentIndex - 1]);
      }
    } else if (e.key === "ArrowRight") {
      const currentIndex = SLIDE_ORDER.indexOf(OS_STATE.activeSlideId);
      if (currentIndex !== -1 && currentIndex < SLIDE_ORDER.length - 1) {
        navigateToSlide(SLIDE_ORDER[currentIndex + 1]);
      }
    }
  });
}

function navigateToSlide(slideId) {
  const slides = document.querySelectorAll(".slide");
  const slideItems = document.querySelectorAll(".slide-item");
  
  const targetSlide = document.getElementById(slideId);
  if (!targetSlide) return;

  // Toggle active class on slides
  slides.forEach(s => s.classList.remove("active"));
  targetSlide.classList.add("active");

  // Toggle active class on sidebar items
  slideItems.forEach(item => {
    if (item.getAttribute("data-slide") === slideId) {
      item.classList.add("active");
      // Scroll into view if needed
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      item.classList.remove("active");
    }
  });

  OS_STATE.activeSlideId = slideId;
  playClinicalSound("click");

  // Update Progress Fill and Slide Counter
  const currentIndex = SLIDE_ORDER.indexOf(slideId);
  if (currentIndex !== -1) {
    const progressFill = document.getElementById("slide-progress-fill");
    if (progressFill) {
      const percentage = ((currentIndex + 1) / SLIDE_ORDER.length) * 100;
      progressFill.style.width = `${percentage}%`;
    }

    const counterText = document.getElementById("slide-counter-text");
    if (counterText) {
      counterText.textContent = `${currentIndex + 1} / ${SLIDE_ORDER.length}`;
    }

    // Enable/disable navigation buttons
    const prevBtn = document.getElementById("prev-slide-btn");
    const nextBtn = document.getElementById("next-slide-btn");
    if (prevBtn) prevBtn.disabled = (currentIndex === 0);
    if (nextBtn) nextBtn.disabled = (currentIndex === SLIDE_ORDER.length - 1);
  }

  // Trigger special slide entry animations
  handleSlideEntry(slideId);
}

// SLIDE ENTRY EVENTS (Typing effects, resets, etc.)
let typingInterval = null;
function handleSlideEntry(slideId) {
  // Slide 1.2: Typing effect
  if (slideId === "act1-s2") {
    const textEl = document.getElementById("typing-question");
    if (textEl) {
      const rawText = "Vì sao có những bạn chưa phát triển chiều cao tối ưu và có thể làm gì để cải thiện?";
      textEl.textContent = "";
      
      if (typingInterval) clearInterval(typingInterval);
      
      let index = 0;
      typingInterval = setInterval(() => {
        textEl.textContent += rawText.charAt(index);
        index++;
        if (index >= rawText.length) {
          clearInterval(typingInterval);
        }
      }, 40);
    }
  }
}

// GLOBAL STATEFUL TIMER
function initGlobalTimer() {
  const timeEl = document.getElementById("sidebar-timer-time");
  const statusEl = document.getElementById("global-timer-status");
  const startBtn = document.getElementById("sidebar-timer-start");
  const pauseBtn = document.getElementById("sidebar-timer-pause");
  const resetBtn = document.getElementById("sidebar-timer-reset");
  const presetBtns = document.querySelectorAll(".preset-btn");

  function updateTimerUI() {
    const mins = Math.floor(OS_STATE.timer.remaining / 60);
    const secs = OS_STATE.timer.remaining % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    // Update sidebar clock
    if (timeEl) timeEl.textContent = formatted;

    // Update in-slide countdown clocks if they exist
    const s13Display = document.getElementById("s13-timer-display");
    if (s13Display) s13Display.textContent = formatted;
    
    const s23Display = document.getElementById("s23-timer-display");
    if (s23Display) s23Display.textContent = formatted;

    const s33Display = document.getElementById("s33-timer-display");
    if (s33Display) s33Display.textContent = formatted;

    const s43Display = document.getElementById("s43-timer-display");
    if (s43Display) s43Display.textContent = formatted;

    // Activity 2: Warning check (less than 1 minute remaining)
    const act2Warning = document.getElementById("s23-warning-msg");
    if (act2Warning) {
      if (OS_STATE.timer.remaining <= 60 && OS_STATE.timer.remaining > 0 && OS_STATE.timer.isRunning) {
        act2Warning.classList.remove("hidden");
      } else {
        act2Warning.classList.add("hidden");
      }
    }

    // SVG Ring progress calculation (radius = 80, circumference = 2 * PI * r = 502.65)
    const ring = document.getElementById("act2-timer-ring");
    if (ring) {
      const offset = 502.65 - (OS_STATE.timer.remaining / OS_STATE.timer.duration) * 502.65;
      ring.style.strokeDashoffset = offset;
    }
  }

  function startTimer() {
    if (OS_STATE.timer.isRunning) return;

    OS_STATE.timer.isRunning = true;
    OS_STATE.timer.soundTriggered = false;
    if (statusEl) {
      statusEl.textContent = "RUNNING";
      statusEl.classList.remove("pulse-cyan");
      statusEl.style.color = "var(--mint)";
      statusEl.style.background = "rgba(16, 185, 129, 0.1)";
      statusEl.style.borderColor = "var(--mint)";
    }

    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;

    // Sync button states on slide widgets
    updateSlideTimerButtons(true);

    OS_STATE.timer.intervalId = setInterval(() => {
      if (OS_STATE.timer.remaining > 0) {
        OS_STATE.timer.remaining--;
        
        // Tick sound at 3 seconds remaining
        if (OS_STATE.timer.remaining <= 3 && OS_STATE.timer.remaining > 0) {
          playClinicalSound("click");
        }
        
        updateTimerUI();
      } else {
        clearInterval(OS_STATE.timer.intervalId);
        OS_STATE.timer.isRunning = false;
        updateTimerUI();
        timerFinished();
      }
    }, 1000);

    playClinicalSound("click");
  }

  function pauseTimer() {
    if (!OS_STATE.timer.isRunning) return;

    clearInterval(OS_STATE.timer.intervalId);
    OS_STATE.timer.isRunning = false;
    if (statusEl) {
      statusEl.textContent = "PAUSED";
      statusEl.classList.add("pulse-cyan");
      statusEl.style.color = "var(--amber)";
      statusEl.style.background = "rgba(245, 158, 11, 0.1)";
      statusEl.style.borderColor = "var(--amber)";
    }

    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;

    updateSlideTimerButtons(false);
    playClinicalSound("click");
  }

  function resetTimer() {
    clearInterval(OS_STATE.timer.intervalId);
    OS_STATE.timer.isRunning = false;
    OS_STATE.timer.remaining = OS_STATE.timer.duration;
    
    if (statusEl) {
      statusEl.textContent = "READY";
      statusEl.classList.remove("pulse-cyan");
      statusEl.style.color = "var(--teal)";
      statusEl.style.background = "rgba(6, 182, 212, 0.1)";
      statusEl.style.borderColor = "var(--teal)";
    }

    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;

    updateTimerUI();
    updateSlideTimerButtons(false);
    playClinicalSound("click");
  }

  function timerFinished() {
    if (statusEl) {
      statusEl.textContent = "FINISHED";
      statusEl.classList.add("pulse-cyan");
      statusEl.style.color = "var(--coral)";
      statusEl.style.background = "rgba(244, 63, 94, 0.1)";
      statusEl.style.borderColor = "var(--coral)";
    }

    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;

    updateSlideTimerButtons(false);
    playClinicalSound("warning");
  }

  function updateSlideTimerButtons(isRunning) {
    const s13Start = document.getElementById("s13-start");
    const s23Start = document.getElementById("s23-start");
    const s33Start = document.getElementById("s33-start");
    const s43Start = document.getElementById("s43-start");

    const text = isRunning ? "PAUSE" : "START";
    if (s13Start) s13Start.textContent = text;
    if (s23Start) s23Start.textContent = text;
    if (s33Start) s33Start.textContent = text;
    if (s43Start) s43Start.textContent = text;
  }

  // Preset time selections
  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const seconds = parseInt(btn.getAttribute("data-time"));
      OS_STATE.timer.duration = seconds;
      OS_STATE.timer.remaining = seconds;
      resetTimer();
    });
  });

  // Action listeners
  if (startBtn) startBtn.addEventListener("click", startTimer);
  if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
  if (resetBtn) resetBtn.addEventListener("click", resetTimer);

  // Link in-slide timer buttons to global controls
  function bindLocalTimer(startId, resetId) {
    const localStart = document.getElementById(startId);
    const localReset = document.getElementById(resetId);

    if (localStart) {
      localStart.addEventListener("click", () => {
        if (OS_STATE.timer.isRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      });
    }

    if (localReset) {
      localReset.addEventListener("click", resetTimer);
    }
  }

  bindLocalTimer("s13-start", "s13-reset");
  bindLocalTimer("s23-start", "s23-reset");
  bindLocalTimer("s33-start", "s33-reset");
  bindLocalTimer("s43-start", "s43-reset");

  // Act 2 Preset Timer Button (5 mins)
  const act2Preset = document.getElementById("s23-preset");
  if (act2Preset) {
    act2Preset.addEventListener("click", () => {
      OS_STATE.timer.duration = 300; // 5 mins
      OS_STATE.timer.remaining = 300;
      resetTimer();
      playClinicalSound("click");
    });
  }

  // Run initial sync
  updateTimerUI();
}

// AMBIENT CLINIC MUSIC & SOUNDS (WEB AUDIO API SYNTHESIZERS)
function initAmbientMusic() {
  const musicBtn = document.getElementById("btn-ambient-music");
  const visualizer = document.getElementById("music-visualizer");
  const slide33Toggle = document.getElementById("s33-ambient-toggle");

  function startAmbientMusic() {
    if (!OS_STATE.audio.ctx) {
      OS_STATE.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (OS_STATE.audio.ctx.state === "suspended") {
      OS_STATE.audio.ctx.resume();
    }

    OS_STATE.audio.ambientGain = OS_STATE.audio.ctx.createGain();
    OS_STATE.audio.ambientGain.gain.setValueAtTime(0.08, OS_STATE.audio.ctx.currentTime);
    OS_STATE.audio.ambientGain.connect(OS_STATE.audio.ctx.destination);

    // Create a beautiful, mellow medical lofi pad synth
    // Root base frequency playing soft minor 7th chord (F#m7: F# - A - C# - E)
    const notes = [92.50, 110.00, 138.59, 164.81]; // frequencies in Hz (F#2, A2, C#3, E3)
    OS_STATE.audio.ambientNodes = [];

    notes.forEach((freq, idx) => {
      if (!OS_STATE.audio.ctx) return;
      const osc = OS_STATE.audio.ctx.createOscillator();
      const oscGain = OS_STATE.audio.ctx.createGain();
      const filter = OS_STATE.audio.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, OS_STATE.audio.ctx.currentTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(250, OS_STATE.audio.ctx.currentTime);

      // Low frequency modulation (LFO) for wave sweeps
      const lfo = OS_STATE.audio.ctx.createOscillator();
      const lfoGain = OS_STATE.audio.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + (idx * 0.05), OS_STATE.audio.ctx.currentTime); // slow sweep
      lfoGain.gain.setValueAtTime(80, OS_STATE.audio.ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(OS_STATE.audio.ambientGain);

      // Soft volume pulsing
      oscGain.gain.setValueAtTime(0.2, OS_STATE.audio.ctx.currentTime);
      
      osc.start();

      OS_STATE.audio.ambientNodes.push(osc, lfo);
    });

    // Add a gentle rhythmic pulse (heartbeat clinic pulse)
    const bpmInterval = 60 / 55; // 55 BPM pulse rate
    OS_STATE.audio.pulseIntervalId = setInterval(() => {
      if (!OS_STATE.audio.isMusicPlaying) {
        clearInterval(OS_STATE.audio.pulseIntervalId);
        return;
      }
      playClinicPulse();
    }, bpmInterval * 1000);

    OS_STATE.audio.isMusicPlaying = true;
    
    // Fix: Updated textContent directly instead of searching for inner span
    if (musicBtn) {
      musicBtn.textContent = "Dừng Nhạc Lâm Sàng";
      musicBtn.classList.remove("btn-surface");
      musicBtn.classList.add("btn-mint");
    }
    if (visualizer) {
      visualizer.classList.add("playing");
    }

    if (slide33Toggle) {
      slide33Toggle.textContent = "🛑 DỪNG NHẠC PHÒNG KHÁM";
      slide33Toggle.classList.remove("btn-surface");
      slide33Toggle.classList.add("btn-coral");
    }
  }

  function stopAmbientMusic() {
    OS_STATE.audio.isMusicPlaying = false;
    
    if (OS_STATE.audio.pulseIntervalId) {
      clearInterval(OS_STATE.audio.pulseIntervalId);
      OS_STATE.audio.pulseIntervalId = null;
    }

    // Fix: Updated textContent directly instead of searching for inner span
    if (musicBtn) {
      musicBtn.textContent = "Phát Nhạc Lâm Sàng";
      musicBtn.classList.remove("btn-mint");
      musicBtn.classList.add("btn-surface");
    }
    if (visualizer) {
      visualizer.classList.remove("playing");
    }

    if (slide33Toggle) {
      slide33Toggle.textContent = "🎵 Nhạc Lâm Sàng Tập Trung";
      slide33Toggle.classList.remove("btn-coral");
      slide33Toggle.classList.add("btn-surface");
    }

    if (OS_STATE.audio.ambientGain && OS_STATE.audio.ctx) {
      OS_STATE.audio.ambientGain.gain.exponentialRampToValueAtTime(0.001, OS_STATE.audio.ctx.currentTime + 0.5);
      setTimeout(() => {
        OS_STATE.audio.ambientNodes.forEach(node => {
          try { node.stop(); } catch(e){}
        });
        OS_STATE.audio.ambientNodes = [];
      }, 600);
    }
  }

  function playClinicPulse() {
    if (!OS_STATE.audio.ctx || !OS_STATE.audio.ambientGain) return;
    const osc = OS_STATE.audio.ctx.createOscillator();
    const gain = OS_STATE.audio.ctx.createGain();
    const filter = OS_STATE.audio.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(65.41, OS_STATE.audio.ctx.currentTime); // C2 low pulse

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(90, OS_STATE.audio.ctx.currentTime);

    gain.gain.setValueAtTime(0.3, OS_STATE.audio.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, OS_STATE.audio.ctx.currentTime + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(OS_STATE.audio.ambientGain);

    osc.start();
    osc.stop(OS_STATE.audio.ctx.currentTime + 0.5);
  }

  function toggleAmbientMusic() {
    if (OS_STATE.audio.isMusicPlaying) {
      stopAmbientMusic();
    } else {
      startAmbientMusic();
    }
  }

  if (musicBtn) musicBtn.addEventListener("click", toggleAmbientMusic);
  if (slide33Toggle) {
    slide33Toggle.addEventListener("click", toggleAmbientMusic);
  }
}

// PLAY SPECIFIC SYNTHESIZED SOUND EFFECTS
function playClinicalSound(type) {
  // Lazy init AudioContext
  if (!OS_STATE.audio.ctx) {
    OS_STATE.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (OS_STATE.audio.ctx.state === "suspended") {
    OS_STATE.audio.ctx.resume();
  }

  const ctx = OS_STATE.audio.ctx;
  const now = ctx.currentTime;
  
  if (type === "click") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.07);
  } 
  else if (type === "chime") {
    // Beautiful digital notification chord
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + (idx * 0.04));
      
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + (idx * 0.04) + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.04) + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + (idx * 0.04));
      osc.stop(now + (idx * 0.04) + 0.5);
    });
  } 
  else if (type === "warning") {
    // Medical alert sound beep-beep-beep
    const alarmBeep = (timeOffset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now + timeOffset); // A5 high beep
      gain.gain.setValueAtTime(0.08, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.2);
    };

    alarmBeep(0);
    alarmBeep(0.2);
    alarmBeep(0.4);
  }
  else if (type === "success") {
    // Uplifting digital confirmation arpeggio
    const freqs = [349.23, 440.00, 523.25, 698.46]; // F4, A4, C5, F5
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + (idx * 0.05));
      gain.gain.setValueAtTime(0.05, now + (idx * 0.05));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.05) + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + (idx * 0.05));
      osc.stop(now + (idx * 0.05) + 0.4);
    });
  }
}

// SPINNER WHEEL WIDGET
function initSpinnerWheel() {
  const canvas = document.getElementById("wheel-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spin-wheel-btn");
  const winnerBox = document.getElementById("spinner-winner-box");

  const groups = OS_STATE.spinner.groups;
  const colors = OS_STATE.spinner.colors;
  let startAngle = 0;
  const arc = Math.PI / (groups.length / 2);
  let spinTimeout = null;

  let spinAngleStart = 0;
  let spinTime = 0;
  let spinTimeTotal = 0;

  // Draws wheel centered at (120, 120) to match canvas size (240x240)
  function drawWheel() {
    ctx.clearRect(0, 0, 240, 240);
    const outsideRadius = 100;
    const textRadius = 70;
    const insideRadius = 25;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;

    for (let i = 0; i < groups.length; i++) {
      const angle = startAngle + i * arc;
      ctx.fillStyle = colors[i];

      ctx.beginPath();
      ctx.arc(120, 120, outsideRadius, angle, angle + arc, false);
      ctx.arc(120, 120, insideRadius, angle + arc, angle, true);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 15px 'Montserrat', sans-serif";
      ctx.translate(120 + Math.cos(angle + arc / 2) * textRadius, 120 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      const text = groups[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }

    // Inner clinical center core circle
    ctx.fillStyle = "#0A0F1D";
    ctx.strokeStyle = OS_STATE.spinner.colors[0]; // fallback to first segment color (teal)
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(120, 120, insideRadius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();

    // Small pulsing decorative dot in center
    ctx.fillStyle = OS_STATE.spinner.colors[0];
    ctx.beginPath();
    ctx.arc(120, 120, 5, 0, Math.PI * 2, false);
    ctx.fill();
  }

  function spin() {
    if (OS_STATE.spinner.isSpinning) return;
    OS_STATE.spinner.isSpinning = true;
    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3 + 4 * 1000;
    
    if (winnerBox) {
      winnerBox.textContent = "HỘI CHẨN...";
      winnerBox.style.color = "var(--muted)";
      winnerBox.classList.add("pulse-cyan");
    }
    rotateWheel();
  }

  function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
      stopRotateWheel();
      return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawWheel();
    
    // Play tick sound when passing segments
    if (Math.floor(startAngle * 10) % 6 === 0) {
      playClinicalSound("click");
    }
    
    spinTimeout = setTimeout(rotateWheel, 30);
  }

  function stopRotateWheel() {
    clearTimeout(spinTimeout);
    OS_STATE.spinner.isSpinning = false;
    
    if (winnerBox) {
      winnerBox.classList.remove("pulse-cyan");
    }
    
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    
    // Safety boundaries
    const safeIndex = (index + groups.length) % groups.length;
    const winner = groups[safeIndex];
    
    if (winnerBox) {
      winnerBox.textContent = winner;
      winnerBox.style.color = colors[safeIndex] === "#1E293B" ? "var(--teal)" : colors[safeIndex];
    }
    
    playClinicalSound("chime");
  }

  function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  }

  // Live update groups from inputs
  const editInputs = document.querySelectorAll(".group-edit-input");
  editInputs.forEach(input => {
    input.addEventListener("input", (e) => {
      const idx = parseInt(e.target.getAttribute("data-index"));
      const val = e.target.value.trim().toUpperCase();
      OS_STATE.spinner.groups[idx] = val || `NHÓM ${idx + 1}`;

      // Synchronize all other edit inputs for this group index
      document.querySelectorAll(`.group-edit-input[data-index="${idx}"]`).forEach(inp => {
        if (inp !== e.target) {
          inp.value = e.target.value;
        }
      });

      drawWheel();
      if (window.drawL2Wheel) window.drawL2Wheel();
    });
  });

  if (spinBtn) spinBtn.addEventListener("click", spin);
  drawWheel();
}

// CANVAS CONFETTI ENGINE (NO EXTERNAL DEPENDENCY)
function initConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let confettiParticles = [];
  let isAnimating = false;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Confetti {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -100 - 20;
      this.size = Math.random() * 8 + 6;
      this.color = ["#06B6D4", "#10B981", "#F43F5E", "#F59E0B", "#F8FAFC"][Math.floor(Math.random() * 5)];
      this.speedY = Math.random() * 5 + 3;
      this.speedX = Math.random() * 4 - 2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 10 - 5;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiParticles.forEach((p, idx) => {
      p.update();
      p.draw();
      
      // Remove offscreen particles
      if (p.y > canvas.height) {
        confettiParticles.splice(idx, 1);
      }
    });

    if (confettiParticles.length > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      isAnimating = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function launchConfetti() {
    playClinicalSound("success");
    confettiParticles = [];
    for (let i = 0; i < 180; i++) {
      confettiParticles.push(new Confetti());
    }
    if (!isAnimating) {
      isAnimating = true;
      animateConfetti();
    }
  }

  const confettiBtn = document.getElementById("btn-celebration-confetti");
  if (confettiBtn) {
    confettiBtn.addEventListener("click", launchConfetti);
  }
}

// SPECIFIC SLIDES EVENTS & INTERACTIONS
function initSpecialSlidesInteractions() {
  // Activity 1 Slide 4: Interactive Flip Cards
  const flipCards = document.querySelectorAll(".flip-card");
  flipCards.forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
      playClinicalSound("click");
    });
  });

  // Activity 1 Slide 5: Interactive Skeleton Infographic Nodes & Clickable Factor Boxes
  const nodes = document.querySelectorAll(".skeleton-node");
  const factorBoxes = document.querySelectorAll(".factor-item"); // Corrected: factor-item, not factor-box!

  // Function to activate a factor and its corresponding skeleton node
  function activateFactor(factorKey) {
    factorBoxes.forEach(box => {
      if (box.id === `factor-${factorKey}`) {
        box.classList.add("active");
        box.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        box.classList.remove("active");
      }
    });

    // Make the corresponding skeleton node look active (add class if needed)
    nodes.forEach(node => {
      if (node.getAttribute("data-factor") === factorKey) {
        node.classList.add("active-node");
      } else {
        node.classList.remove("active-node");
      }
    });
  }

  nodes.forEach(node => {
    node.addEventListener("click", () => {
      const factorKey = node.getAttribute("data-factor");
      activateFactor(factorKey);
      playClinicalSound("chime");
    });
  });

  factorBoxes.forEach(box => {
    box.addEventListener("click", () => {
      const factorKey = box.id.replace("factor-", "");
      activateFactor(factorKey);
      playClinicalSound("chime");
    });
  });

  // Activity 3 Slide 4: Medical tabs switcher (Corrected selectors to .tab-pane)
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetContentId = btn.getAttribute("data-tab-content");

      // Deactivate all tab headers & activate target
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Deactivate all tab bodies & activate target
      tabPanes.forEach(pane => {
        if (pane.id === targetContentId) {
          pane.classList.add("active");
        } else {
          pane.classList.remove("active");
        }
      });

      playClinicalSound("click");
    });
  });

  // Activity 4 Slide 3: Origami Popup Modal
  const origamiBtn = document.getElementById("btn-popup-origami");
  const origamiModal = document.getElementById("origami-modal");
  const origamiClose = document.getElementById("origami-close-btn");

  if (origamiBtn && origamiModal) {
    origamiBtn.addEventListener("click", () => {
      origamiModal.classList.add("active");
      playClinicalSound("click");
    });
  }

  if (origamiClose && origamiModal) {
    origamiClose.addEventListener("click", () => {
      origamiModal.classList.remove("active");
      playClinicalSound("click");
    });
  }

  // Activity 4 Slide 4: Random Student Picker
  const randomStudentBtn = document.getElementById("btn-random-student");
  const randomStudentDisplay = document.getElementById("random-student-display");
  let randomSelectorInterval = null;

  if (randomStudentBtn && randomStudentDisplay) {
    randomStudentBtn.addEventListener("click", () => {
      if (randomSelectorInterval) return;
      
      let counter = 0;
      const totalSteps = 12;
      
      randomStudentDisplay.textContent = "...";
      randomStudentDisplay.classList.add("pulse-cyan");

      randomSelectorInterval = setInterval(() => {
        const idx = Math.floor(Math.random() * OS_STATE.spinner.groups.length);
        randomStudentDisplay.textContent = OS_STATE.spinner.groups[idx];
        playClinicalSound("click");
        
        counter++;
        if (counter >= totalSteps) {
          clearInterval(randomSelectorInterval);
          randomSelectorInterval = null;
          randomStudentDisplay.classList.remove("pulse-cyan");
          playClinicalSound("chime");
        }
      }, 100);
    });
  }

  // Activity 4 Slide 4: Fast Travel Button back to Act 1 Slide 5 (Core factors)
  const fastTravelBtn = document.getElementById("btn-fast-travel");
  if (fastTravelBtn) {
    fastTravelBtn.addEventListener("click", () => {
      navigateToSlide("act1-s5");
    });
  }
}

// GENERAL REALTIME SYSTEM TIME HEADER CLOCK & SIDEBAR TAB VIEW SWITCHING
function initUI() {
  const clockEl = document.getElementById("system-time");
  setInterval(() => {
    const d = new Date();
    const formatted = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    if (clockEl) clockEl.textContent = formatted;
  }, 1000);

  // Helper function to show/hide sections based on sidebar tab selections
  function updateSidebarTabVisibility(tabTarget) {
    const slideNav = document.querySelector(".slide-navigation");
    const widgets = document.querySelector(".sidebar-widgets");
    
    if (tabTarget === "slides") {
      if (slideNav) slideNav.style.display = "block";
      if (widgets) widgets.style.display = "none";
    } 
    else if (tabTarget === "vitals") {
      if (slideNav) slideNav.style.display = "none";
      if (widgets) widgets.style.display = "flex";
    }
  }
  
  // Custom sidebar quick access Tab Button (Top Sidebar tabs toggle)
  const tabButtons = document.querySelectorAll(".nav-tab-btn[data-tab]");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabTarget = btn.getAttribute("data-tab");
      
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      updateSidebarTabVisibility(tabTarget);
      playClinicalSound("click");
      
      // If vitals is activated, highlight the countdown timer panel
      if (tabTarget === "vitals") {
        const timerWidget = document.querySelector(".timer-widget");
        if (timerWidget) {
          timerWidget.style.borderColor = "var(--teal)";
          timerWidget.style.boxShadow = "0 0 15px var(--teal)";
          setTimeout(() => {
            timerWidget.style.borderColor = "";
            timerWidget.style.boxShadow = "";
          }, 1500);
        }
      }
    });
  });

  // Default initial view mode is Slide Navigation
  updateSidebarTabVisibility("slides");
}

// MATCHING GAME LOGIC (Slide 1.4)
function initMatchingGame() {
  const leftCards = document.querySelectorAll(".left-card");
  const rightCards = document.querySelectorAll(".right-card");
  const checkBtn = document.getElementById("btn-check-matching");
  const resetBtn = document.getElementById("btn-reset-matching");
  const feedbackEl = document.getElementById("matching-feedback");
  const svg = document.getElementById("matching-svg");
  const container = document.getElementById("matching-game-area");

  if (!container || !svg) return;

  let selectedLeftId = null;
  let selectedRightId = null;
  let connections = {}; // maps leftCard data-id -> rightCard data-id
  let checked = false;

  // Clicking left cards
  leftCards.forEach(card => {
    card.addEventListener("click", () => {
      if (checked) return;
      
      const id = card.getAttribute("data-id");
      
      if (selectedLeftId === id) {
        selectedLeftId = null;
        card.classList.remove("selected");
      } else {
        leftCards.forEach(c => c.classList.remove("selected"));
        selectedLeftId = id;
        card.classList.add("selected");
        playClinicalSound("click");
        
        if (selectedRightId) {
          connect(selectedLeftId, selectedRightId);
        }
      }
    });
  });

  // Clicking right cards
  rightCards.forEach(card => {
    card.addEventListener("click", () => {
      if (checked) return;
      
      const id = card.getAttribute("data-id");
      
      if (selectedRightId === id) {
        selectedRightId = null;
        card.classList.remove("selected");
      } else {
        rightCards.forEach(c => c.classList.remove("selected"));
        selectedRightId = id;
        card.classList.add("selected");
        playClinicalSound("click");
        
        if (selectedLeftId) {
          connect(selectedLeftId, selectedRightId);
        }
      }
    });
  });

  function connect(leftId, rightId) {
    // Check if rightId is already connected to another left card. If so, remove that connection.
    for (let lKey in connections) {
      if (connections[lKey] === rightId) {
        delete connections[lKey];
      }
    }
    
    // Connect leftId to rightId
    connections[leftId] = rightId;
    
    // Reset selection states
    selectedLeftId = null;
    selectedRightId = null;
    leftCards.forEach(c => c.classList.remove("selected"));
    rightCards.forEach(c => c.classList.remove("selected"));
    
    updateConnectedClasses();
    drawConnections();
    playClinicalSound("chime");
  }

  function updateConnectedClasses() {
    // Left cards
    leftCards.forEach(card => {
      const id = card.getAttribute("data-id");
      if (connections[id]) {
        card.classList.add("connected");
      } else {
        card.classList.remove("connected");
      }
    });

    // Right cards
    rightCards.forEach(card => {
      const id = card.getAttribute("data-id");
      let isConnected = false;
      for (let lKey in connections) {
        if (connections[lKey] === id) {
          isConnected = true;
          break;
        }
      }
      if (isConnected) {
        card.classList.add("connected");
      } else {
        card.classList.remove("connected");
      }
    });
  }

  function drawConnections() {
    svg.innerHTML = "";
    const containerRect = container.getBoundingClientRect();

    for (let leftId in connections) {
      const rightId = connections[leftId];
      
      const leftEl = document.getElementById(`m-left-${leftId}`);
      const rightEl = document.getElementById(`m-right-${rightId}`);
      
      if (!leftEl || !rightEl) continue;
      
      const leftDot = leftEl.querySelector(".right-dot");
      const rightDot = rightEl.querySelector(".left-dot");
      
      if (!leftDot || !rightDot) continue;

      const startRect = leftDot.getBoundingClientRect();
      const endRect = rightDot.getBoundingClientRect();

      const x1 = startRect.left + startRect.width / 2 - containerRect.left;
      const y1 = startRect.top + startRect.height / 2 - containerRect.top;
      const x2 = endRect.left + endRect.width / 2 - containerRect.left;
      const y2 = endRect.top + endRect.height / 2 - containerRect.top;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
      
      // Control points for a smooth curve
      const dx = Math.abs(x2 - x1) * 0.4;
      const cp1x = x1 + dx;
      const cp1y = y1;
      const cp2x = x2 - dx;
      const cp2y = y2;
      
      line.setAttribute("d", `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`);
      line.setAttribute("class", "connection-line");
      
      if (checked) {
        if (leftId === rightId) {
          line.classList.add("correct");
        } else {
          line.classList.add("incorrect");
        }
      }
      
      svg.appendChild(line);
    }
  }

  // Redraw lines on resize or slide display
  window.addEventListener("resize", drawConnections);
  
  // Custom observer to redraw when slide becomes active
  const slideObserver = new MutationObserver(() => {
    const act1s4 = document.getElementById("act1-s4");
    if (act1s4 && act1s4.classList.contains("active")) {
      setTimeout(drawConnections, 100);
      setTimeout(drawConnections, 500); // Redraw after transition completes to ensure accurate alignment
    }
  });
  
  const targetNode = document.getElementById("act1-s4");
  if (targetNode) {
    slideObserver.observe(targetNode, { attributes: true, attributeFilter: ["class"] });
  }

  // Check diagnostic
  if (checkBtn) {
    checkBtn.addEventListener("click", () => {
      const keys = Object.keys(connections);
      if (keys.length < 3) {
        if (feedbackEl) {
          feedbackEl.textContent = "⚠️ Hãy nối đầy đủ cả 3 cặp trước khi kiểm tra!";
          feedbackEl.className = "matching-feedback feedback-incorrect";
        }
        playClinicalSound("warning");
        return;
      }

      checked = true;
      let allCorrect = true;
      
      for (let leftId in connections) {
        if (leftId !== connections[leftId]) {
          allCorrect = false;
        }
      }

      drawConnections();

      if (feedbackEl) {
        if (allCorrect) {
          feedbackEl.textContent = "🏆 Chẩn đoán chính xác! Cả 3 phác đồ đã được đồng thuận.";
          feedbackEl.className = "matching-feedback feedback-correct";
          playClinicalSound("success");
          
          // Trigger confetti
          const confettiBtn = document.getElementById("btn-celebration-confetti");
          if (confettiBtn) confettiBtn.click();
        } else {
          feedbackEl.textContent = "❌ Chẩn đoán chưa khớp! Hãy nhấn 'Làm lại' để hội chẩn.";
          feedbackEl.className = "matching-feedback feedback-incorrect";
          playClinicalSound("warning");
        }
      }
    });
  }

  // Reset matching
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      connections = {};
      selectedLeftId = null;
      selectedRightId = null;
      checked = false;
      
      leftCards.forEach(c => {
        c.classList.remove("selected", "connected");
      });
      rightCards.forEach(c => {
        c.classList.remove("selected", "connected");
      });
      
      if (feedbackEl) {
        feedbackEl.textContent = "";
        feedbackEl.className = "matching-feedback";
      }
      
      svg.innerHTML = "";
      playClinicalSound("click");
    });
  }
}

// ============================================================
// TIẾT 2: CHIẾN DỊCH TRUYỀN THÔNG CỘNG ĐỒNG (LESSON 2 HANDLERS)
// ============================================================

function initLessonSwitcher() {
  const btnHome = document.getElementById("btn-home-portal");
  const btn1 = document.getElementById("btn-lesson-1");
  const btn2 = document.getElementById("btn-lesson-2");
  const btn3 = document.getElementById("btn-lesson-3");
  const nav1 = document.getElementById("lesson1-nav-group");
  const nav2 = document.getElementById("lesson2-nav-group");
  const nav3 = document.getElementById("lesson3-nav-group");
  const portal = document.getElementById("portal-screen");
  const portalBtn1 = document.getElementById("portal-btn-l1");
  const portalBtn2 = document.getElementById("portal-btn-l2");
  const portalBtn3 = document.getElementById("portal-btn-l3");

  if (btnHome && portal) {
    btnHome.addEventListener("click", () => {
      portal.classList.remove("hidden");
      playClinicalSound("click");
    });
  }

  if (portalBtn1 && portal) {
    portalBtn1.addEventListener("click", () => {
      switchLesson(1);
      portal.classList.add("hidden");
    });
  }

  if (portalBtn2 && portal) {
    portalBtn2.addEventListener("click", () => {
      switchLesson(2);
      portal.classList.add("hidden");
    });
  }

  if (portalBtn3 && portal) {
    portalBtn3.addEventListener("click", () => {
      switchLesson(3);
      portal.classList.add("hidden");
    });
  }

  if (!btn1 || !btn2 || !btn3) return;

  btn1.addEventListener("click", () => switchLesson(1));
  btn2.addEventListener("click", () => switchLesson(2));
  btn3.addEventListener("click", () => switchLesson(3));

  window.switchLesson = function(num) {
    if (btnHome) btnHome.classList.remove("active");

    if (num === 1) {
      btn1.classList.add("active");
      btn2.classList.remove("active");
      btn3.classList.remove("active");
      if (nav1) nav1.classList.remove("hidden");
      if (nav2) nav2.classList.add("hidden");
      if (nav3) nav3.classList.add("hidden");
      SLIDE_ORDER = LESSON1_SLIDES;
      navigateToSlide("act1-s1");
    } else if (num === 2) {
      btn1.classList.remove("active");
      btn2.classList.add("active");
      btn3.classList.remove("active");
      if (nav1) nav1.classList.add("hidden");
      if (nav2) nav2.classList.remove("hidden");
      if (nav3) nav3.classList.add("hidden");
      SLIDE_ORDER = LESSON2_SLIDES;
      navigateToSlide("l2-s1");
    } else if (num === 3) {
      btn1.classList.remove("active");
      btn2.classList.remove("active");
      btn3.classList.add("active");
      if (nav1) nav1.classList.add("hidden");
      if (nav2) nav2.classList.add("hidden");
      if (nav3) nav3.classList.remove("hidden");
      SLIDE_ORDER = LESSON3_SLIDES;
      navigateToSlide("l3-s1");
    }
  };
}

function initL2Fingerprint() {
  const btn = document.getElementById("fingerprint-btn");
  const status = document.getElementById("fingerprint-status-text");
  if (!btn || !status) return;

  btn.addEventListener("click", () => {
    if (status.classList.contains("success")) return;

    status.textContent = "ĐANG QUÉT VÂN TAY...";
    btn.style.boxShadow = "0 0 30px var(--teal)";
    playClinicalSound("chime");

    setTimeout(() => {
      status.textContent = "ĐĂNG NHẬP THÀNH CÔNG!";
      status.classList.add("success");
      btn.style.boxShadow = "0 0 35px var(--mint)";
      playClinicalSound("success");
      
      setTimeout(() => {
        navigateToSlide("l2-s2");
      }, 1200);
    }, 1500);
  });
}

function initL2HabitsGame() {
  const L2_WARMUP_HABITS = [
    {
      title: "Ngủ lúc 23h30 mỗi ngày",
      good: false,
      info: "Ngủ muộn ➔ Tuyến yên bị ức chế, không giải phóng Hormone tăng trưởng GH, xương không dài ra."
    },
    {
      title: "Ăn nhiều snack thay cơm",
      good: false,
      info: "Ăn snack thay cơm ➔ Thiếu hụt Canxi, chất nền xương, cản trở xương dài ra."
    },
    {
      title: "Không vận động",
      good: false,
      info: "Không vận động ➔ Thiếu lực ép cơ học lên đĩa sụn tiếp hợp, sụn bị cốt hóa sớm."
    },
    {
      title: "Uống sữa đều đặn",
      good: true,
      info: "Uống sữa đều đặn ➔ Cung cấp Canxi và Đạm trực tiếp cho tế bào sụn tiếp hợp giúp xương chắc khỏe."
    },
    {
      title: "Tập thể dục mỗi ngày",
      good: true,
      info: "Tập thể dục mỗi ngày ➔ Kích thích đĩa sụn tiếp hợp sản sinh tế bào mới giúp kéo dài xương tối đa."
    }
  ];

  let warmupIndex = 0;

  const titleEl = document.getElementById("l2-warmup-title");
  const indexEl = document.getElementById("l2-warmup-index");
  const btnGood = document.getElementById("btn-warmup-good");
  const btnBad = document.getElementById("btn-warmup-bad");
  const feedbackEl = document.getElementById("l2-warmup-feedback-box");
  const prevBtn = document.getElementById("btn-warmup-prev");
  const nextBtn = document.getElementById("btn-warmup-next");

  if (!titleEl) return;

  function renderQuestion() {
    const habit = L2_WARMUP_HABITS[warmupIndex];
    titleEl.textContent = habit.title;
    if (indexEl) indexEl.textContent = `THÓI QUEN ${warmupIndex + 1} / 5`;

    // Reset UI state
    if (feedbackEl) {
      feedbackEl.classList.add("hidden");
      feedbackEl.textContent = "";
      feedbackEl.style.borderColor = "";
      feedbackEl.style.background = "";
      feedbackEl.style.color = "";
    }

    if (btnGood) {
      btnGood.disabled = false;
      btnGood.classList.remove("active", "correct", "incorrect");
    }
    if (btnBad) {
      btnBad.disabled = false;
      btnBad.classList.remove("active", "correct", "incorrect");
    }

    if (prevBtn) prevBtn.disabled = (warmupIndex === 0);
    if (nextBtn) nextBtn.disabled = true;
  }

  function handleChoice(chosenGood) {
    const habit = L2_WARMUP_HABITS[warmupIndex];
    const isCorrect = (chosenGood === habit.good);

    // Disable choices
    if (btnGood) btnGood.disabled = true;
    if (btnBad) btnBad.disabled = true;

    // Highlight chosen button
    if (chosenGood) {
      if (btnGood) btnGood.classList.add("active", isCorrect ? "correct" : "incorrect");
    } else {
      if (btnBad) btnBad.classList.add("active", isCorrect ? "correct" : "incorrect");
    }

    // Show feedback
    if (feedbackEl) {
      feedbackEl.classList.remove("hidden");
      feedbackEl.textContent = (isCorrect ? "🏆 CHẨN ĐOÁN CHÍNH XÁC: " : "❌ CHẨN ĐOÁN CHƯA ĐÚNG: ") + habit.info;
      if (isCorrect) {
        feedbackEl.style.borderColor = "var(--mint)";
        feedbackEl.style.background = "rgba(16, 185, 129, 0.1)";
        feedbackEl.style.color = "var(--mint)";
        playClinicalSound("success");
      } else {
        feedbackEl.style.borderColor = "var(--coral)";
        feedbackEl.style.background = "rgba(244, 63, 94, 0.1)";
        feedbackEl.style.color = "var(--coral)";
        playClinicalSound("warning");
      }
    }

    if (nextBtn) nextBtn.disabled = false;
  }

  if (btnGood) {
    btnGood.addEventListener("click", () => handleChoice(true));
  }
  if (btnBad) {
    btnBad.addEventListener("click", () => handleChoice(false));
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (warmupIndex > 0) {
        warmupIndex--;
        renderQuestion();
        playClinicalSound("click");
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (warmupIndex < 4) {
        warmupIndex++;
        renderQuestion();
        playClinicalSound("click");
      } else {
        playClinicalSound("success");
        navigateToSlide("l2-s3");
      }
    });
  }

  // Reset game to question 1 when entering the slide
  const slideObserver = new MutationObserver(() => {
    const l2s2 = document.getElementById("l2-s2");
    if (l2s2 && l2s2.classList.contains("active")) {
      warmupIndex = 0;
      renderQuestion();
    }
  });
  const targetNode = document.getElementById("l2-s2");
  if (targetNode) {
    slideObserver.observe(targetNode, { attributes: true, attributeFilter: ["class"] });
  }

  renderQuestion();
}

function initL2EmailMindmap() {
  const btn = document.getElementById("btn-reveal-mindmap");
  const mindmap = document.getElementById("l2-s3-mindmap");
  if (!btn || !mindmap) return;

  btn.addEventListener("click", () => {
    mindmap.classList.remove("hidden");
    mindmap.classList.add("active");
    playClinicalSound("success");
  });
}

// Timer helper specifically for Lesson 2 slides
function initL2Timer(duration, displayId, startBtnId, resetBtnId, onTick) {
  const display = document.getElementById(displayId);
  const startBtn = document.getElementById(startBtnId);
  const resetBtn = document.getElementById(resetBtnId);

  let remaining = duration;
  let timerId = null;
  let isRunning = false;

  function updateUI() {
    if (display) {
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    if (onTick) {
      onTick(remaining, duration);
    }
  }

  if (startBtn) {
    startBtn.addEventListener("click", () => {
      if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        startBtn.textContent = "▶ START";
        playClinicalSound("click");
      } else {
        isRunning = true;
        startBtn.textContent = "⏸ PAUSE";
        playClinicalSound("click");
        timerId = setInterval(() => {
          if (remaining > 0) {
            remaining--;
            updateUI();
            if (remaining <= 3 && remaining > 0) {
              playClinicalSound("click");
            }
          } else {
            clearInterval(timerId);
            isRunning = false;
            startBtn.textContent = "▶ START";
            playClinicalSound("success");
            const confettiBtn = document.getElementById("btn-celebration-confetti");
            if (confettiBtn) confettiBtn.click();
          }
        }, 1000);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      clearInterval(timerId);
      isRunning = false;
      remaining = duration;
      if (startBtn) startBtn.textContent = "▶ START";
      updateUI();
      playClinicalSound("click");
    });
  }

  updateUI();
}

function initL2HabitMap() {
  const cards = document.querySelectorAll("#cards-deck-l2 .l2-habit-card");
  const listSupportive = document.getElementById("list-supportive");
  const listDisruptive = document.getElementById("list-disruptive");
  const folderSupportive = document.getElementById("folder-supportive");
  const folderDisruptive = document.getElementById("folder-disruptive");
  
  if (!cards.length) return;

  let draggedCard = null;

  cards.forEach(card => {
    // Draggable card events
    card.addEventListener("dragstart", (e) => {
      draggedCard = card;
      e.dataTransfer.setData("text/plain", card.getAttribute("data-id"));
      card.style.opacity = "0.5";
    });

    card.addEventListener("dragend", () => {
      draggedCard = null;
      card.style.opacity = "";
    });

    // Backup click behavior for flexibility/touch screens
    card.addEventListener("click", () => {
      const isGood = card.getAttribute("data-good") === "true";
      const targetFolder = isGood ? listSupportive : listDisruptive;
      
      if (targetFolder && !card.classList.contains("placed")) {
        card.classList.add("placed");
        if (isGood) {
          card.classList.add("supportive-glow");
        } else {
          card.classList.add("disruptive-glow");
        }
        targetFolder.appendChild(card);
        playClinicalSound("chime");
        checkWinState();
      }
    });
  });

  // Folder drop zone events helper
  function setupFolderDropZone(folderEl, listEl, expectedGood) {
    if (!folderEl || !listEl) return;

    folderEl.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    folderEl.addEventListener("dragenter", (e) => {
      e.preventDefault();
      folderEl.classList.add("hovered");
    });

    folderEl.addEventListener("dragleave", () => {
      folderEl.classList.remove("hovered");
    });

    folderEl.addEventListener("drop", (e) => {
      e.preventDefault();
      folderEl.classList.remove("hovered");

      if (!draggedCard) return;

      const isGood = draggedCard.getAttribute("data-good") === "true";

      if (isGood === expectedGood) {
        // Correct classification
        draggedCard.classList.add("placed");
        if (isGood) {
          draggedCard.classList.add("supportive-glow");
        } else {
          draggedCard.classList.add("disruptive-glow");
        }
        listEl.appendChild(draggedCard);
        playClinicalSound("chime");
        checkWinState();
      } else {
        // Incorrect classification - shake and play buzzer sound
        playClinicalSound("warning");
        draggedCard.classList.add("shake-animation");
        setTimeout(() => {
          draggedCard.classList.remove("shake-animation");
        }, 500);
      }
    });
  }

  function checkWinState() {
    const placedCount = document.querySelectorAll("#cards-deck-l2 .l2-habit-card.placed, .folder-items-list .l2-habit-card.placed").length;
    if (placedCount === 12) {
      setTimeout(() => {
        const modal = document.getElementById("congrats-modal-act1");
        if (modal) {
          modal.classList.add("active");
          playClinicalSound("success");
          const confettiBtn = document.getElementById("btn-celebration-confetti");
          if (confettiBtn) confettiBtn.click();
        }
      }, 600);
    }
  }

  setupFolderDropZone(folderSupportive, listSupportive, true);
  setupFolderDropZone(folderDisruptive, listDisruptive, false);

  // Close button logic for Activity 1 congrats modal
  const closeBtnAct1 = document.getElementById("btn-congrats-close-act1");
  if (closeBtnAct1) {
    closeBtnAct1.addEventListener("click", () => {
      const modal = document.getElementById("congrats-modal-act1");
      if (modal) modal.classList.remove("active");
      playClinicalSound("click");
      navigateToSlide("l2-s5");
    });
  }

  // Slide 4 Timer (8 minutes = 480s)
  initL2Timer(480, "l2-s4-timer", "l2-s4-timer-start", "l2-s4-timer-reset");
}

function initL2XRay() {
  const rows = document.querySelectorAll(".xray-row");
  const laser = document.getElementById("xray-laser");
  if (!rows.length) return;

  rows.forEach(row => {
    row.addEventListener("click", () => {
      const targetNodeId = row.getAttribute("data-target");
      const targetNode = document.getElementById(targetNodeId);
      const blurBar = row.querySelector(".blur-security-bar");

      // Scan effect - flash the laser red/coral
      if (laser) {
        laser.style.background = "var(--coral)";
        laser.style.boxShadow = "0 0 25px var(--coral)";
        setTimeout(() => {
          laser.style.background = "";
          laser.style.boxShadow = "";
        }, 1000);
      }

      // Reveal SVG Node
      if (targetNode) {
        targetNode.classList.remove("hidden");
      }

      // Reveal text
      if (blurBar) {
        blurBar.classList.add("scanned");
      }

      playClinicalSound("chime");
    });
  });
}

function initL2Debate() {
  const buttons = document.querySelectorAll(".l2-debate-btn");
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const isCorrect = btn.getAttribute("data-correct") === "true";
      
      // Clear states
      buttons.forEach(b => b.classList.remove("correct", "incorrect"));

      if (isCorrect) {
        btn.classList.add("correct");
        playClinicalSound("success");
        
        // Show congrats modal for Activity 2 after a short delay
        setTimeout(() => {
          const modal = document.getElementById("congrats-modal-act2");
          if (modal) {
            modal.classList.add("active");
            const confettiBtn = document.getElementById("btn-celebration-confetti");
            if (confettiBtn) confettiBtn.click();
          }
        }, 800);
      } else {
        btn.classList.add("incorrect");
        playClinicalSound("warning");
      }
    });
  });

  // Hook up close button for Activity 2 congrats modal
  const closeBtnAct2 = document.getElementById("btn-congrats-close-act2");
  if (closeBtnAct2) {
    closeBtnAct2.addEventListener("click", () => {
      const modal = document.getElementById("congrats-modal-act2");
      if (modal) modal.classList.remove("active");
      playClinicalSound("click");
      navigateToSlide("l2-s7-prep");
    });
  }
}

function initSpinnerWheelL2() {
  const canvas = document.getElementById("wheel-canvas-l2");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spin-wheel-btn-l2");
  const winnerBox = document.getElementById("spinner-winner-box-l2");

  const groups = OS_STATE.spinner.groups;
  const colors = OS_STATE.spinner.colors;
  let startAngle = 0;
  const arc = Math.PI / (groups.length / 2);
  let spinTimeout = null;

  let spinAngleStart = 0;
  let spinTime = 0;
  let spinTimeTotal = 0;

  function drawWheel() {
    ctx.clearRect(0, 0, 200, 200);
    const outsideRadius = 85;
    const textRadius = 60;
    const insideRadius = 20;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;

    for (let i = 0; i < groups.length; i++) {
      const angle = startAngle + i * arc;
      ctx.fillStyle = colors[i];

      ctx.beginPath();
      ctx.arc(100, 100, outsideRadius, angle, angle + arc, false);
      ctx.arc(100, 100, insideRadius, angle + arc, angle, true);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 13px 'Montserrat', sans-serif";
      ctx.translate(100 + Math.cos(angle + arc / 2) * textRadius, 100 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc / 2 + Math.PI / 2);
      const text = groups[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    }

    // Inner clinical center core circle
    ctx.fillStyle = "#0A0F1D";
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(100, 100, insideRadius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.stroke();

    // Center pulsing decorative dot
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.arc(100, 100, 4, 0, Math.PI * 2, false);
    ctx.fill();
  }

  window.drawL2Wheel = drawWheel;

  function spin() {
    if (OS_STATE.spinner.isSpinning) return;
    OS_STATE.spinner.isSpinning = true;
    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3 + 4 * 1000;
    
    if (winnerBox) {
      winnerBox.textContent = "QUAY...";
      winnerBox.style.color = "var(--muted)";
      winnerBox.classList.add("pulse-cyan");
    }
    rotateWheel();
  }

  function rotateWheel() {
    spinTime += 30;
    if (spinTime >= spinTimeTotal) {
      stopRotateWheel();
      return;
    }
    const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
    startAngle += (spinAngle * Math.PI / 180);
    drawWheel();
    
    if (Math.floor(startAngle * 10) % 6 === 0) {
      playClinicalSound("click");
    }
    
    spinTimeout = setTimeout(rotateWheel, 30);
  }

  function stopRotateWheel() {
    clearTimeout(spinTimeout);
    OS_STATE.spinner.isSpinning = false;
    
    if (winnerBox) {
      winnerBox.classList.remove("pulse-cyan");
    }
    
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    const safeIndex = (index + groups.length) % groups.length;
    const winner = groups[safeIndex];
    
    if (winnerBox) {
      winnerBox.textContent = winner;
      winnerBox.style.color = colors[safeIndex] === "#1E293B" ? "var(--teal)" : colors[safeIndex];
    }
    
    playClinicalSound("chime");
  }

  function easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  }

  if (spinBtn) spinBtn.addEventListener("click", spin);
  drawWheel();
}

function initL2PosterMusic() {
  const toggleBtn = document.getElementById("l2-s7-music-btn");
  const sidebarMusicBtn = document.getElementById("btn-ambient-music");

  if (toggleBtn && sidebarMusicBtn) {
    toggleBtn.addEventListener("click", () => {
      sidebarMusicBtn.click();
      setTimeout(updateBtnState, 50);
    });
  }

  function updateBtnState() {
    if (!toggleBtn) return;
    if (OS_STATE.audio.isMusicPlaying) {
      toggleBtn.textContent = "🛑 DỪNG NHẠC LÂM SÀNG";
      toggleBtn.classList.remove("btn-mint");
      toggleBtn.classList.add("btn-coral");
    } else {
      toggleBtn.textContent = "🎵 Bật nhạc lâm sàng tập trung";
      toggleBtn.classList.remove("btn-coral");
      toggleBtn.classList.add("btn-mint");
    }
  }

  if (sidebarMusicBtn) {
    sidebarMusicBtn.addEventListener("click", () => {
      setTimeout(updateBtnState, 50);
    });
  }

  // Slide 7 Timer (9 minutes = 540s)
  initL2Timer(540, "l2-s7-timer", "l2-s7-timer-start", "l2-s7-timer-reset");
}

function initL2Notepad() {
  const qText = document.getElementById("l2-s8-q-text");
  const qNum = document.getElementById("l2-s8-q-num");
  const prevBtn = document.getElementById("l2-s8-prev-q");
  const nextBtn = document.getElementById("l2-s8-next-q");

  if (!qText) return;

  const questions = [
    "1. Xung quanh em có nhiều bạn đang gặp thói quen cản trở chiều cao nào nhất?",
    "2. Nếu được khuyên 1 bạn ngưng ngay 1 thói quen xấu, em sẽ nói gì?",
    "3. Em tự đặt mục tiêu thay đổi thói quen nào của bản thân trong 1 tuần tới?"
  ];
  let currentIdx = 0;

  function updateQuestion() {
    qText.textContent = questions[currentIdx];
    if (qNum) qNum.textContent = `${currentIdx + 1} / 3`;
    if (prevBtn) prevBtn.disabled = (currentIdx === 0);
    if (nextBtn) {
      if (currentIdx === 2) {
        nextBtn.textContent = "Hoàn thành ✓";
      } else {
        nextBtn.textContent = "Sau ▶";
      }
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentIdx > 0) {
        currentIdx--;
        updateQuestion();
        playClinicalSound("click");
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentIdx < 2) {
        currentIdx++;
        updateQuestion();
        playClinicalSound("click");
      } else {
        playClinicalSound("success");
        navigateToSlide("l2-s9");
      }
    });
  }

  updateQuestion();

  // 3-Minute Progress Timer
  const timerStart = document.getElementById("l2-s8-timer-start");
  const timerReset = document.getElementById("l2-s8-timer-reset");
  const progressFill = document.getElementById("l2-s8-progress");

  let remaining = 180;
  let timerId = null;
  let isRunning = false;

  function updateTimerUI() {
    if (progressFill) {
      const pct = (remaining / 180) * 100;
      progressFill.style.width = `${pct}%`;
    }
  }

  if (timerStart) {
    timerStart.addEventListener("click", () => {
      if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        timerStart.textContent = "▶ BẮT ĐẦU 3 PHÚT VIẾT";
        playClinicalSound("click");
      } else {
        isRunning = true;
        timerStart.textContent = "⏸ TẠM DỪNG";
        playClinicalSound("click");
        timerId = setInterval(() => {
          if (remaining > 0) {
            remaining--;
            updateTimerUI();
            if (remaining <= 3 && remaining > 0) {
              playClinicalSound("click");
            }
          } else {
            clearInterval(timerId);
            isRunning = false;
            timerStart.textContent = "▶ BẮT ĐẦU 3 PHÚT VIẾT";
            playClinicalSound("success");
            const confettiBtn = document.getElementById("btn-celebration-confetti");
            if (confettiBtn) confettiBtn.click();
          }
        }, 1000);
      }
    });
  }

  if (timerReset) {
    timerReset.addEventListener("click", () => {
      clearInterval(timerId);
      isRunning = false;
      remaining = 180;
      if (timerStart) timerStart.textContent = "▶ BẮT ĐẦU 3 PHÚT VIẾT";
      updateTimerUI();
      playClinicalSound("click");
    });
  }

  updateTimerUI();
}

function initL2Commitment() {
  const checkItems = document.querySelectorAll(".l2-check-item");
  checkItems.forEach(item => {
    item.addEventListener("click", () => {
      item.classList.toggle("checked");
      playClinicalSound("click");
    });
  });

  const finishBtn = document.getElementById("btn-finish-campaign");
  const congratsModal = document.getElementById("congrats-modal");
  const congratsCloseBtn = document.getElementById("congrats-close-btn");

  if (finishBtn && congratsModal) {
    finishBtn.addEventListener("click", () => {
      congratsModal.classList.add("active");
      const confettiBtn = document.getElementById("btn-celebration-confetti");
      if (confettiBtn) {
        confettiBtn.click();
      }
    });
  }

  if (congratsCloseBtn && congratsModal) {
    congratsCloseBtn.addEventListener("click", () => {
      congratsModal.classList.remove("active");
      playClinicalSound("click");
    });
  }

  const returnBtn = document.getElementById("btn-l2-return");
  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      const btn1 = document.getElementById("btn-lesson-1");
      const btn2 = document.getElementById("btn-lesson-2");
      const nav1 = document.getElementById("lesson1-nav-group");
      const nav2 = document.getElementById("lesson2-nav-group");
      
      if (btn1) btn1.classList.add("active");
      if (btn2) btn2.classList.remove("active");
      if (nav1) nav1.classList.remove("hidden");
      if (nav2) nav2.classList.add("hidden");
      
      SLIDE_ORDER = LESSON1_SLIDES;
      navigateToSlide("act1-s2");
    });
  }
}


// ==========================================================================
// TIẾT 3: CHUYÊN GIA TRUYỀN THÔNG SỨC KHỎE WIDGETS
// ==========================================================================

function initL3RetinaScan() {
  const btn = document.getElementById("btn-retina-scan");
  const laser = document.getElementById("l3-retina-laser");
  const feedback = document.getElementById("retina-feedback");
  if (!btn || !laser || !feedback) return;

  let scanning = false;
  btn.addEventListener("click", () => {
    if (scanning) return;
    scanning = true;
    btn.disabled = true;
    feedback.textContent = "⚙️ Đang quét thông tin võng mạc...";
    feedback.style.color = "var(--teal)";
    laser.style.opacity = "1";
    laser.classList.add("scanning");
    playClinicalSound("click");

    setTimeout(() => {
      feedback.textContent = "✅ Nhận diện Chuyên gia thành công! Khởi động bảng điều khiển.";
      feedback.style.color = "var(--mint)";
      playClinicalSound("success");
      laser.classList.remove("scanning");
      laser.style.opacity = "0";
      
      setTimeout(() => {
        scanning = false;
        btn.disabled = false;
        feedback.textContent = "Hệ thống chờ nhận diện võng mạc chuyên gia...";
        feedback.style.color = "#94a3b8";
        navigateToSlide("l3-s2");
      }, 1000);
    }, 2500);
  });
}

function initL3FactCheck() {
  const cards = document.querySelectorAll(".fact-card");
  if (cards.length === 0) return;

  cards.forEach(card => {
    card.addEventListener("click", () => {
      if (card.classList.contains("correct") || card.classList.contains("incorrect") || card.classList.contains("scanning")) {
        return;
      }

      card.classList.add("scanning");
      playClinicalSound("click");
      const status = card.querySelector(".fact-status");
      if (status) status.textContent = "⚙️ SCAN";

      setTimeout(() => {
        card.classList.remove("scanning");
        const type = card.getAttribute("data-type");
        if (type === "myth") {
          card.classList.add("incorrect");
          if (status) status.textContent = "❌ MYTH";
          playClinicalSound("warning");
        } else {
          card.classList.add("correct");
          if (status) status.textContent = "✅ FACT";
          playClinicalSound("success");
        }
      }, 1500);
    });
  });
}

function initL3RadarGoals() {
  const waveCards = document.querySelectorAll(".wave-card");
  if (waveCards.length === 0) return;

  waveCards.forEach(card => {
    card.addEventListener("click", () => {
      playClinicalSound("click");
      
      if (OS_STATE.audio.ctx) {
        const ctx = OS_STATE.audio.ctx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.18);
      }

      waveCards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
    });
  });
}

function initL3Checklist() {
  const rows = document.querySelectorAll(".check-item-row");
  if (rows.length === 0) return;

  rows.forEach(row => {
    row.addEventListener("click", () => {
      row.classList.toggle("checked");
      if (row.classList.contains("checked")) {
        playClinicalSound("success");
      } else {
        playClinicalSound("click");
      }
    });
  });

  // Checklist Timer: 7 minutes (420 seconds)
  initL2Timer(420, "l3-s4-timer-text", "l3-s4-timer-start", "l3-s4-timer-reset");
}

function initL3SloganUpgrade() {
  const btnUpgrade = document.getElementById("btn-upgrade-slogan");
  const btnNext = document.getElementById("btn-next-slogan-set");
  const rawCard = document.getElementById("slogan-raw-card");
  const rawText = document.getElementById("txt-slogan-raw");
  const innerCard = document.getElementById("slogan-card-inner-el");
  const upgradedText = document.getElementById("txt-slogan-upgraded");
  
  if (!btnUpgrade || !btnNext || !rawCard || !rawText || !innerCard || !upgradedText) return;

  const slogans = [
    {
      raw: "Ngủ đủ giấc giúp cao hơn",
      upgraded: "Ngủ sớm hôm nay — Cao hơn ngày mai!"
    },
    {
      raw: "Ăn uống đủ chất bổ sung canxi",
      upgraded: "Dinh dưỡng chuẩn y khoa — Chiều cao bứt phá!"
    },
    {
      raw: "Chăm chỉ tập thể dục thể thao",
      upgraded: "Vận động mỗi ngày — Vươn tầm vóc Việt!"
    }
  ];

  let currentIndex = 0;
  let isUpgraded = false;
  let isTransitioning = false;

  function loadSloganSet(index) {
    rawText.textContent = slogans[index].raw;
    upgradedText.textContent = slogans[index].upgraded;
    
    innerCard.classList.remove("flipped");
    isUpgraded = false;
    
    const icon = document.getElementById("slogan-right-status-icon");
    const label = document.getElementById("slogan-right-status-text");
    if (icon) icon.textContent = "🔒";
    if (label) label.textContent = "Nhấn nút tia sét để giải mã Slogan";
  }

  btnUpgrade.addEventListener("click", () => {
    if (isUpgraded || isTransitioning) return;
    isTransitioning = true;
    
    playClinicalSound("click");
    rawCard.classList.add("scanning");
    
    const icon = document.getElementById("slogan-right-status-icon");
    const label = document.getElementById("slogan-right-status-text");
    if (icon) icon.textContent = "⚙️";
    if (label) label.textContent = "Đang tối ưu hóa dữ liệu ngôn từ...";

    setTimeout(() => {
      rawCard.classList.remove("scanning");
      innerCard.classList.add("flipped");
      playClinicalSound("success");
      isUpgraded = true;
      isTransitioning = false;
    }, 1500);
  });

  btnNext.addEventListener("click", () => {
    if (isTransitioning) return;
    currentIndex = (currentIndex + 1) % slogans.length;
    playClinicalSound("click");
    loadSloganSet(currentIndex);
  });

  loadSloganSet(0);
}

function initL3Rehearsal() {
  const timerText = document.getElementById("l3-rehearsal-timer-text");
  const startBtn = document.getElementById("btn-rehearsal-start");
  const resetBtn = document.getElementById("btn-rehearsal-reset");
  
  const goBtn = document.getElementById("btn-status-go");
  const nogoBtn = document.getElementById("btn-status-nogo");
  
  if (!timerText || !startBtn || !resetBtn || !goBtn || !nogoBtn) return;

  let remaining = 45.00;
  let timerId = null;
  let isRunning = false;

  function updateUI() {
    timerText.textContent = `${remaining.toFixed(2)}s`;
  }

  startBtn.addEventListener("click", () => {
    if (isRunning) {
      clearInterval(timerId);
      isRunning = false;
      startBtn.textContent = "▶ START";
      playClinicalSound("click");
    } else {
      isRunning = true;
      startBtn.textContent = "⏸ PAUSE";
      playClinicalSound("click");
      const startTime = Date.now();
      const startRemaining = remaining;
      
      timerId = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        remaining = startRemaining - elapsed;
        
        if (remaining <= 0) {
          remaining = 0;
          updateUI();
          clearInterval(timerId);
          isRunning = false;
          startBtn.textContent = "▶ START";
          playClinicalSound("success");
          
          const confettiBtn = document.getElementById("btn-celebration-confetti");
          if (confettiBtn) confettiBtn.click();
        } else {
          updateUI();
        }
      }, 30);
    }
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(timerId);
    isRunning = false;
    remaining = 45.00;
    startBtn.textContent = "▶ START";
    updateUI();
    playClinicalSound("click");
  });

  function playHornSound(isGo) {
    if (!OS_STATE.audio.ctx) {
      OS_STATE.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = OS_STATE.audio.ctx;
    if (ctx.state === "suspended") ctx.resume();
    
    const now = ctx.currentTime;
    
    if (isGo) {
      const playTone = (freq, duration, delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.06, now + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration - 0.05);
        
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, now + delay);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + duration);
      };
      
      playTone(392.00, 0.25, 0); // G4
      playTone(523.25, 0.5, 0.2); // C5
      playTone(659.25, 0.6, 0.2); // E5
    } else {
      const playSiren = (duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(120, now + duration);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gain.gain.linearRampToValueAtTime(0.08, now + duration - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + duration);
      };
      
      playSiren(0.8);
    }
  }

  goBtn.addEventListener("click", () => {
    playHornSound(true);
    goBtn.classList.add("active");
    nogoBtn.classList.remove("active");
    setTimeout(() => goBtn.classList.remove("active"), 1000);
  });

  nogoBtn.addEventListener("click", () => {
    playHornSound(false);
    nogoBtn.classList.add("active");
    goBtn.classList.remove("active");
    setTimeout(() => nogoBtn.classList.remove("active"), 1000);
  });
}

function initL3StarsBroadcast() {
  const canvas = document.getElementById("l3-spinner-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const spinBtn = document.getElementById("btn-l3-spin");

    const groups = OS_STATE.spinner.groups;
    const colors = OS_STATE.spinner.colors;
    let startAngle = 0;
    const arc = Math.PI / (groups.length / 2);
    let spinTimeout = null;

    let spinAngleStart = 0;
    let spinTime = 0;
    let spinTimeTotal = 0;

    function drawWheel() {
      ctx.clearRect(0, 0, 200, 200);
      const outsideRadius = 85;
      const textRadius = 60;
      const insideRadius = 20;

      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 2;

      for (let i = 0; i < groups.length; i++) {
        const angle = startAngle + i * arc;
        ctx.fillStyle = colors[i];

        ctx.beginPath();
        ctx.arc(100, 100, outsideRadius, angle, angle + arc, false);
        ctx.arc(100, 100, insideRadius, angle + arc, angle, true);
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 13px 'Montserrat', sans-serif";
        ctx.translate(100 + Math.cos(angle + arc / 2) * textRadius, 100 + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2 + Math.PI / 2);
        const text = groups[i];
        ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
        ctx.restore();
      }

      ctx.fillStyle = "#0A0F1D";
      ctx.strokeStyle = colors[0];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(100, 100, insideRadius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors[0];
      ctx.beginPath();
      ctx.arc(100, 100, 4, 0, Math.PI * 2, false);
      ctx.fill();
    }

    function spin() {
      if (OS_STATE.spinner.isSpinning) return;
      OS_STATE.spinner.isSpinning = true;
      spinAngleStart = Math.random() * 10 + 10;
      spinTime = 0;
      spinTimeTotal = Math.random() * 3 + 4 * 1000;
      rotateWheel();
    }

    function rotateWheel() {
      spinTime += 30;
      if (spinTime >= spinTimeTotal) {
        stopRotateWheel();
        return;
      }
      const spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
      startAngle += (spinAngle * Math.PI / 180);
      drawWheel();
      
      if (Math.floor(startAngle * 10) % 6 === 0) {
        playClinicalSound("click");
      }
      
      spinTimeout = setTimeout(rotateWheel, 30);
    }

    function stopRotateWheel() {
      clearTimeout(spinTimeout);
      OS_STATE.spinner.isSpinning = false;
      
      const degrees = startAngle * 180 / Math.PI + 90;
      const arcd = arc * 180 / Math.PI;
      const index = Math.floor((360 - degrees % 360) / arcd);
      const safeIndex = (index + groups.length) % groups.length;
      const winner = groups[safeIndex];
      
      playClinicalSound("chime");
      alert("🎉 Nhóm được chọn thuyết trình: " + winner + "!");
      const confettiBtn = document.getElementById("btn-celebration-confetti");
      if (confettiBtn) confettiBtn.click();
    }

    function easeOut(t, b, c, d) {
      const ts = (t /= d) * t;
      const tc = ts * t;
      return b + c * (tc + -3 * ts + 3 * t);
    }

    if (spinBtn) spinBtn.addEventListener("click", spin);
    drawWheel();
  }

  OS_STATE.l3Winners = {
    trophy1: "",
    trophy2: "",
    trophy3: ""
  };

  const trophy1 = document.getElementById("trophy-vote-1");
  const trophy2 = document.getElementById("trophy-vote-2");
  const trophy3 = document.getElementById("trophy-vote-3");
  
  const label1 = document.getElementById("txt-winner-trophy-1");
  const label2 = document.getElementById("txt-winner-trophy-2");
  const label3 = document.getElementById("txt-winner-trophy-3");

  const final1 = document.getElementById("final-winner-1");
  const final2 = document.getElementById("final-winner-2");
  const final3 = document.getElementById("final-winner-3");

  function setupTrophyVote(trophyEl, labelEl, finalEl, key, title) {
    if (!trophyEl || !labelEl) return;
    
    trophyEl.addEventListener("click", () => {
      const winner = prompt("Nhập tên nhóm đạt giải \"" + title + "\":");
      if (winner && winner.trim() !== "") {
        const val = winner.trim();
        OS_STATE.l3Winners[key] = val;
        labelEl.textContent = val;
        trophyEl.classList.add("checked");
        playClinicalSound("success");
        
        if (finalEl) {
          finalEl.textContent = val;
        }
      }
    });
  }

  setupTrophyVote(trophy1, label1, final1, "trophy1", "Poster dễ hiểu nhất");
  setupTrophyVote(trophy2, label2, final2, "trophy2", "Thông điệp thuyết phục nhất");
  setupTrophyVote(trophy3, label3, final3, "trophy3", "Nhóm trình bày tốt nhất");
}

function initL3ReflectionTimer() {
  const displayString = document.getElementById("l3-reflection-time-string");
  const progressBar = document.getElementById("l3-reflection-progress-bar");
  
  if (!displayString || !progressBar) return;

  let duration = 180;
  let remaining = duration;
  let timerId = null;

  function updateUI() {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    displayString.textContent = String(mins).padStart(2, '0') + ":" + String(secs).padStart(2, '0');
    
    const percentage = (remaining / duration) * 100;
    progressBar.style.width = percentage + "%";
  }

  function startReflectionTimer() {
    clearInterval(timerId);
    remaining = duration;
    updateUI();
    
    timerId = setInterval(() => {
      if (remaining > 0) {
        remaining--;
        updateUI();
        if (remaining <= 3 && remaining > 0) {
          playClinicalSound("click");
        }
      } else {
        clearInterval(timerId);
        playClinicalSound("success");
        const confettiBtn = document.getElementById("btn-celebration-confetti");
        if (confettiBtn) confettiBtn.click();
      }
    }, 1000);
  }

  function stopReflectionTimer() {
    clearInterval(timerId);
  }

  const slideObserver = new MutationObserver(() => {
    const slide = document.getElementById("l3-s8");
    if (slide && slide.classList.contains("active")) {
      startReflectionTimer();
    } else {
      stopReflectionTimer();
    }
  });

  const targetNode = document.getElementById("l3-s8");
  if (targetNode) {
    slideObserver.observe(targetNode, { attributes: true, attributeFilter: ["class"] });
  }

  updateUI();
}

function initL3Closing() {
  const finishBtn = document.getElementById("btn-l3-finish-mission");
  const returnBtn = document.getElementById("btn-l3-return-question");

  if (finishBtn) {
    finishBtn.addEventListener("click", () => {
      playClinicalSound("success");
      const confettiBtn = document.getElementById("btn-celebration-confetti");
      if (confettiBtn) {
        confettiBtn.click();
        setTimeout(() => confettiBtn.click(), 250);
        setTimeout(() => confettiBtn.click(), 500);
      }
    });
  }

  if (returnBtn) {
    returnBtn.addEventListener("click", () => {
      playClinicalSound("click");
      navigateToSlide("act1-s2");
    });
  }
}
