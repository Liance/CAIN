const characterSheet = {
  name: 'Nyx "Ghostline" Voss',
  role: "Netrunner",
  rank: 5,
  city: "Night City",
  threatLevel: "Orange",
  syncStatus: "Local Cache",
  vitals: {
    hp: { current: 34, max: 40 },
    stun: { current: 11, max: 14 },
    armor: 7,
    humanity: 58
  },
  combat: {
    initiative: 14,
    evasion: 8,
    deckLoad: 72,
    conditions: ["Wired Reflexes", "Data Ghost", "Low Profile"]
  },
  identity: [
    ["Alias", "Ghostline"],
    ["Crew", "Null Meridian"],
    ["Origin", "Corporate Defector"],
    ["Cred", "8,200 eb"],
    ["Lifestyle", "Container Safehouse"]
  ],
  skills: [
    { name: "Interface", level: 9 },
    { name: "Stealth", level: 8 },
    { name: "Electronic Security", level: 8 },
    { name: "Handgun", level: 6 },
    { name: "Persuasion", level: 5 }
  ],
  weapons: [
    { name: "M-76 Rail Pistol", damage: "3d6", ammo: "11/12", tags: ["Smart", "Concealable"] },
    { name: "Monowire", damage: "2d6 + bleed", ammo: "N/A", tags: ["Melee", "Silent"] },
    { name: "Neuroflash Grenade", damage: "Stun + blind", ammo: "x2", tags: ["Area", "Disposable"] }
  ],
  tactics: [
    "Open with jammer pulse, then breach camera loop.",
    "Prioritize enemy netrunner before line troops.",
    "Use monowire only when cover break is guaranteed."
  ],
  cyberware: [
    "Kiroshi Optics Mk4 (Threat tagging)",
    "Sandevistan Booster (Burst movement)",
    "Subdermal Mesh (Tier II plating)",
    "Neural Coprocessor (Dual daemon slot)"
  ],
  heatmap: [
    { label: "Neural", heat: 3, value: "88%" },
    { label: "Optic", heat: 2, value: "61%" },
    { label: "Arms", heat: 2, value: "54%" },
    { label: "Torso", heat: 3, value: "79%" },
    { label: "Spine", heat: 2, value: "67%" },
    { label: "Legs", heat: 1, value: "43%" },
    { label: "Immune", heat: 1, value: "39%" },
    { label: "Biomonitor", heat: 2, value: "58%" }
  ],
  sessionNotes:
    "Session 12:\n- Stole shard fragment from Arasaka courier.\n- Burned one false identity at Harbor 9.\n- Need to source fresh ICEbreaker daemon before next run."
};

const FX_CLASS = {
  none: "",
  static: "fx-static",
  scanlines: "fx-scanlines",
  glitch: "fx-glitch",
  distort: "fx-distort"
};

const statusEl = document.getElementById("status");
const installBtn = document.getElementById("installBtn");
const tabButtons = Array.from(document.querySelectorAll("[data-tab-btn]"));
const tabPanels = Array.from(document.querySelectorAll("[data-tab-panel]"));
const fxTargets = Array.from(document.querySelectorAll(".fx-target"));
const fxTargetSelect = document.getElementById("fxTarget");
const fxTypeSelect = document.getElementById("fxType");
const fxIntensity = document.getElementById("fxIntensity");
const fxIntensityValue = document.getElementById("fxIntensityValue");
const applyFxBtn = document.getElementById("applyFxBtn");
const clearFxBtn = document.getElementById("clearFxBtn");
const fxDistortTurbulence = document.getElementById("fxDistortTurbulence");
const fxDistortDisplace = document.getElementById("fxDistortDisplace");
const fxDistortColor = document.getElementById("fxDistortColor");

let deferredInstallPrompt = null;
let distortionFrameId = null;
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

function activateTab(tabId) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabBtn === tabId;
    button.classList.toggle("is-active", isActive);
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.dataset.tabPanel === tabId;
    panel.classList.toggle("is-active", isActive);
  });
}

function setMeter(el, current, max) {
  const safeMax = Math.max(max, 1);
  const percent = Math.max(0, Math.min(100, (current / safeMax) * 100));
  el.style.width = `${percent}%`;
}

function renderIdentity() {
  const list = document.getElementById("identityList");
  list.textContent = "";

  characterSheet.identity.forEach(([label, value]) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value;
    row.append(term, detail);
    list.append(row);
  });
}

function renderSkills() {
  const list = document.getElementById("skillsList");
  list.textContent = "";

  characterSheet.skills.forEach((skill) => {
    const item = document.createElement("li");
    const head = document.createElement("div");
    const meter = document.createElement("span");
    const fill = document.createElement("i");

    head.className = "skill-head";
    head.innerHTML = `<span>${skill.name}</span><strong>${skill.level}</strong>`;

    meter.className = "skill-meter";
    fill.style.width = `${Math.min(100, skill.level * 10)}%`;
    meter.append(fill);
    item.append(head, meter);
    list.append(item);
  });
}

function renderWeapons() {
  const list = document.getElementById("weaponsList");
  list.textContent = "";

  characterSheet.weapons.forEach((weapon) => {
    const item = document.createElement("li");
    const title = document.createElement("p");
    const meta = document.createElement("div");

    title.className = "weapon-title";
    title.textContent = weapon.name;

    meta.className = "weapon-meta";
    [weapon.damage, weapon.ammo, ...weapon.tags].forEach((entry) => {
      const tag = document.createElement("span");
      tag.textContent = entry;
      meta.append(tag);
    });

    item.append(title, meta);
    list.append(item);
  });
}

function renderSimpleList(elementId, values) {
  const list = document.getElementById(elementId);
  list.textContent = "";

  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    list.append(item);
  });
}

function renderHeatmap() {
  const grid = document.getElementById("heatmapGrid");
  grid.textContent = "";

  characterSheet.heatmap.forEach((cell) => {
    const item = document.createElement("div");
    item.className = `heat-cell heat-${Math.min(3, Math.max(1, cell.heat))}`;
    item.innerHTML = `<span>${cell.label}</span><em>${cell.value}</em>`;
    grid.append(item);
  });
}

function renderSheet() {
  document.getElementById("characterName").textContent = characterSheet.name;
  document.getElementById("characterMeta").textContent =
    `${characterSheet.role} // Street Rank ${characterSheet.rank} // ${characterSheet.city}`;
  document.getElementById("threatLevel").textContent = `Threat: ${characterSheet.threatLevel}`;
  document.getElementById("sheetStatus").textContent = `Sync: ${characterSheet.syncStatus}`;

  document.getElementById("hpValue").textContent =
    `${characterSheet.vitals.hp.current} / ${characterSheet.vitals.hp.max}`;
  document.getElementById("stunValue").textContent =
    `${characterSheet.vitals.stun.current} / ${characterSheet.vitals.stun.max}`;
  document.getElementById("armorValue").textContent = `Armor ${characterSheet.vitals.armor}`;
  document.getElementById("humanityValue").textContent = `Humanity ${characterSheet.vitals.humanity}`;
  setMeter(
    document.getElementById("hpMeter"),
    characterSheet.vitals.hp.current,
    characterSheet.vitals.hp.max
  );
  setMeter(
    document.getElementById("stunMeter"),
    characterSheet.vitals.stun.current,
    characterSheet.vitals.stun.max
  );

  document.getElementById("initiativeValue").textContent = String(characterSheet.combat.initiative);
  document.getElementById("evasionValue").textContent = String(characterSheet.combat.evasion);
  document.getElementById("deckLoadValue").textContent = `${characterSheet.combat.deckLoad}%`;

  const conditionTags = document.getElementById("conditionTags");
  conditionTags.textContent = "";
  characterSheet.combat.conditions.forEach((condition) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = condition;
    conditionTags.append(tag);
  });

  renderIdentity();
  renderSkills();
  renderWeapons();
  renderSimpleList("tacticsList", characterSheet.tactics);
  renderSimpleList("cyberwareList", characterSheet.cyberware);
  renderHeatmap();

  document.getElementById("sessionNotes").value = characterSheet.sessionNotes;
}

function updateOnlineStatus() {
  statusEl.textContent = navigator.onLine
    ? "Online. Sheet data cached for offline use."
    : "Offline mode. Using local cache.";
}

function supportsDistortionFilter() {
  return Boolean(fxDistortTurbulence && fxDistortDisplace && fxDistortColor);
}

function getActiveDistortionIntensity() {
  const active = fxTargets
    .filter((target) => target.classList.contains("fx-distort"))
    .map((target) => Number(target.dataset.fxIntensity || "2"))
    .filter((value) => Number.isFinite(value));
  if (!active.length) {
    return 0;
  }
  return Math.max(...active);
}

function resetDistortionFilter() {
  if (!supportsDistortionFilter()) {
    return;
  }
  fxDistortTurbulence.setAttribute("baseFrequency", "0.010 0.028");
  fxDistortTurbulence.setAttribute("numOctaves", "2");
  fxDistortTurbulence.setAttribute("seed", "11");
  fxDistortDisplace.setAttribute("scale", "10");
  fxDistortColor.setAttribute("values", "1 0 0 0 0.02 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0");
}

function runDistortionFrame(timestamp) {
  const intensity = getActiveDistortionIntensity();
  const shouldRun =
    supportsDistortionFilter() &&
    intensity > 0 &&
    !motionPreference.matches &&
    !document.hidden;

  if (!shouldRun) {
    distortionFrameId = null;
    resetDistortionFilter();
    return;
  }

  const time = timestamp / 1000;
  const baseX = 0.005 + intensity * 0.0011 + Math.abs(Math.sin(time * 1.7)) * 0.0018;
  const baseY = 0.017 + intensity * 0.003 + Math.abs(Math.cos(time * 1.2)) * 0.0032;
  fxDistortTurbulence.setAttribute("baseFrequency", `${baseX.toFixed(4)} ${baseY.toFixed(4)}`);
  fxDistortTurbulence.setAttribute("numOctaves", String(Math.min(4, 2 + Math.round(intensity / 2))));
  fxDistortTurbulence.setAttribute("seed", String((Math.floor(timestamp / 120) % 97) + 3));

  const displaceScale = 6 + intensity * 6 + Math.abs(Math.sin(time * 6.1)) * 8;
  fxDistortDisplace.setAttribute("scale", displaceScale.toFixed(2));

  const redOffset = (Math.sin(time * 7.3) * 0.03).toFixed(3);
  const blueOffset = (Math.cos(time * 5.1) * -0.03).toFixed(3);
  fxDistortColor.setAttribute(
    "values",
    `1 0 0 0 ${redOffset} 0 1 0 0 0 0 0 1 0 ${blueOffset} 0 0 0 1 0`
  );

  distortionFrameId = window.requestAnimationFrame(runDistortionFrame);
}

function updateDistortionLoop() {
  const shouldRun =
    supportsDistortionFilter() &&
    getActiveDistortionIntensity() > 0 &&
    !motionPreference.matches &&
    !document.hidden;

  if (shouldRun && distortionFrameId === null) {
    distortionFrameId = window.requestAnimationFrame(runDistortionFrame);
    return;
  }

  if (!shouldRun && distortionFrameId !== null) {
    window.cancelAnimationFrame(distortionFrameId);
    distortionFrameId = null;
    resetDistortionFilter();
  }
}

function normalizeEffectType(effectType) {
  if (!Object.prototype.hasOwnProperty.call(FX_CLASS, effectType)) {
    return "none";
  }
  if (effectType === "distort" && !supportsDistortionFilter()) {
    return "glitch";
  }
  return effectType;
}

function clearFxClasses(target) {
  target.classList.remove("fx-static", "fx-scanlines", "fx-glitch", "fx-distort");
}

function getTargetById(targetId) {
  return fxTargets.find((target) => target.dataset.fxTarget === targetId) || null;
}

function applyEffect(target, effectType, intensity) {
  const safeIntensity = Math.min(5, Math.max(1, Number(intensity) || 2));
  const normalizedType = normalizeEffectType(effectType);

  clearFxClasses(target);
  target.style.setProperty("--fx-intensity", String(safeIntensity));

  const fxClass = FX_CLASS[normalizedType];
  if (fxClass) {
    target.classList.add(fxClass);
  }

  target.dataset.fxType = normalizedType;
  target.dataset.fxIntensity = String(safeIntensity);
  updateDistortionLoop();
}

function syncFxControls(target) {
  if (!target) {
    return;
  }
  const currentType = target.dataset.fxType || "none";
  const currentIntensity = target.dataset.fxIntensity || "2";
  fxTypeSelect.value = currentType;
  fxIntensity.value = currentIntensity;
  fxIntensityValue.value = currentIntensity;
}

function setupEffectsLab() {
  const supportsDistort = supportsDistortionFilter();
  const distortOption = fxTypeSelect.querySelector('option[value="distort"]');
  if (!supportsDistort && distortOption) {
    distortOption.disabled = true;
    distortOption.textContent = "Signal Warp (Not Supported)";
  }

  fxTargetSelect.textContent = "";
  fxTargets.forEach((target) => {
    if (!target.dataset.fxTarget) {
      return;
    }

    const option = document.createElement("option");
    option.value = target.dataset.fxTarget;
    option.textContent = target.dataset.fxLabel || target.dataset.fxTarget;
    fxTargetSelect.append(option);

    if (!target.dataset.fxType) {
      target.dataset.fxType = "none";
      target.dataset.fxIntensity = "2";
    }
  });

  fxIntensityValue.value = fxIntensity.value;
  if (fxTargetSelect.value) {
    syncFxControls(getTargetById(fxTargetSelect.value));
  }

  fxTargetSelect.addEventListener("change", () => {
    const target = getTargetById(fxTargetSelect.value);
    if (target) {
      syncFxControls(target);
    }
  });

  fxIntensity.addEventListener("input", () => {
    fxIntensityValue.value = fxIntensity.value;
  });

  applyFxBtn.addEventListener("click", () => {
    const target = getTargetById(fxTargetSelect.value);
    if (!target) {
      return;
    }
    applyEffect(target, fxTypeSelect.value, Number(fxIntensity.value));
  });

  clearFxBtn.addEventListener("click", () => {
    const target = getTargetById(fxTargetSelect.value);
    if (!target) {
      return;
    }
    applyEffect(target, "none", 2);
    syncFxControls(target);
  });

  window.CAINFx = {
    listTargets() {
      return fxTargets.map((target) => ({
        id: target.dataset.fxTarget,
        label: target.dataset.fxLabel,
        effect: target.dataset.fxType || "none",
        intensity: Number(target.dataset.fxIntensity || "2")
      }));
    },
    apply(targetId, effectType = "static", intensity = 2) {
      const target = getTargetById(targetId);
      if (!target || !Object.prototype.hasOwnProperty.call(FX_CLASS, effectType)) {
        return false;
      }
      applyEffect(target, effectType, intensity);
      return true;
    },
    clear(targetId) {
      const target = getTargetById(targetId);
      if (!target) {
        return false;
      }
      applyEffect(target, "none", 2);
      return true;
    }
  };
}

function setupTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.tabBtn);
    });
  });
}

function setupPwaInstall() {
  installBtn.disabled = true;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installBtn.disabled = false;
  });

  installBtn.addEventListener("click", async () => {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installBtn.disabled = true;
      return;
    }
    alert("Open browser menu and choose 'Install app' or 'Add to Home Screen'.");
  });

  window.addEventListener("appinstalled", () => {
    installBtn.disabled = true;
    statusEl.textContent = "App installed. Launch from your device app drawer.";
  });
}

if (typeof motionPreference.addEventListener === "function") {
  motionPreference.addEventListener("change", updateDistortionLoop);
} else if (typeof motionPreference.addListener === "function") {
  motionPreference.addListener(updateDistortionLoop);
}

document.addEventListener("visibilitychange", updateDistortionLoop);

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      console.error("Service worker registration failed:", error);
    }
  });
}

renderSheet();
setupTabs();
setupEffectsLab();
setupPwaInstall();
updateOnlineStatus();
activateTab("overview");
