const exorcistSheet = {
  name: "Sister Miriam Vale",
  order: "Order of Saint Cyprian",
  rank: "Field Exorcist III",
  diocese: "Ruin District Diocese",
  threatLevel: "Manifest Class IV",
  syncStatus: "Vigil Channel Secure",
  vitals: {
    health: { current: 31, max: 38 },
    corruption: { current: 9, max: 14 },
    wards: 6,
    sanctity: 67
  },
  response: {
    reflex: 12,
    resolve: 10,
    risk: 34,
    conditions: ["Stigmata Echo", "Nocturnal Watch", "Sanctioned Blade"]
  },
  identity: [
    ["Call Sign", "Ash Psalter"],
    ["License", "X-77-031"],
    ["Bloodline", "Vale"],
    ["Parish", "Saint Corrine Annex"],
    ["Confessor", "Fr. Calder"]
  ],
  traits: [
    "Speaks liturgy in dead radio frequencies.",
    "Avoids mirrors after sundown.",
    "Records every exorcism in graphite, never ink."
  ],
  rites: [
    { name: "Rite of Severance", potency: 86, cost: "2 strain" },
    { name: "Psalm of Iron Sleep", potency: 71, cost: "3 strain" },
    { name: "Mercy Circuit", potency: 63, cost: "1 strain" },
    { name: "Bell of Cinders", potency: 58, cost: "4 strain" }
  ],
  sanctions: [
    "Forbidden to invoke Ninth Litany without witness.",
    "No solo entry into Cathedral Catacombs Wing B.",
    "Confession interval mandatory every 48 hours."
  ],
  arsenal: [
    {
      name: "Consecrated Revolver",
      detail: "2d8 radiant",
      capacity: "5/6",
      tags: ["Silvered", "Relic", "Loud"]
    },
    {
      name: "Thorn Rosary Chain",
      detail: "2d6 bind",
      capacity: "N/A",
      tags: ["Melee", "Holy", "Bleed"]
    },
    {
      name: "Votive Salt Ampoule",
      detail: "Area ward",
      capacity: "x3",
      tags: ["Thrown", "Barrier", "Single Use"]
    }
  ],
  wardGrid: [
    { label: "Skull Seal", heat: 2, value: "64%" },
    { label: "Throat Sigil", heat: 1, value: "42%" },
    { label: "Chest Cross", heat: 3, value: "82%" },
    { label: "Right Palm", heat: 2, value: "59%" },
    { label: "Left Palm", heat: 2, value: "57%" },
    { label: "Spine Mark", heat: 3, value: "88%" },
    { label: "Knee Nails", heat: 1, value: "34%" },
    { label: "Ankle Thread", heat: 1, value: "31%" }
  ],
  journal:
    "Case 14 - St. Brigid Rail Chapel:\n- Entity answered to three names and none were human.\n- Seal held for 17 minutes, then cracked at the east transept.\n- Need two more witnesses before second attempt.",
  idCard: {
    photo: "Character Art/Carve.png",
    name: "SISTER MIRIAM VALE",
    xid: "X77031",
    blsp: "VALE",
    agdn: "HUMAN",
    sex: "F",
    height: "5'9\"",
    weight: "142",
    eyes: "GRAY",
    hair: "BLACK",
    rating: "I"
  }
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

  exorcistSheet.identity.forEach(([label, value]) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = value;
    row.append(term, detail);
    list.append(row);
  });
}

function renderRites() {
  const list = document.getElementById("ritesList");
  list.textContent = "";

  exorcistSheet.rites.forEach((rite) => {
    const item = document.createElement("li");
    const head = document.createElement("div");
    const meter = document.createElement("span");
    const fill = document.createElement("i");
    const cost = document.createElement("small");

    head.className = "skill-head";
    head.innerHTML = `<span>${rite.name}</span><strong>${rite.potency}%</strong>`;

    meter.className = "skill-meter";
    fill.style.width = `${Math.max(0, Math.min(100, rite.potency))}%`;
    meter.append(fill);

    cost.textContent = `Cost: ${rite.cost}`;
    cost.style.color = "var(--muted)";
    cost.style.display = "block";
    cost.style.marginTop = "0.3rem";
    cost.style.fontSize = "0.72rem";

    item.append(head, meter, cost);
    list.append(item);
  });
}

function renderArsenal() {
  const list = document.getElementById("arsenalList");
  list.textContent = "";

  exorcistSheet.arsenal.forEach((entry) => {
    const item = document.createElement("li");
    const title = document.createElement("p");
    const meta = document.createElement("div");

    title.className = "weapon-title";
    title.textContent = entry.name;

    meta.className = "weapon-meta";
    [entry.detail, entry.capacity, ...entry.tags].forEach((value) => {
      const tag = document.createElement("span");
      tag.textContent = value;
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

  exorcistSheet.wardGrid.forEach((cell) => {
    const item = document.createElement("div");
    const level = Math.max(1, Math.min(3, Number(cell.heat) || 1));
    item.className = `heat-cell heat-${level}`;
    item.innerHTML = `<span>${cell.label}</span><em>${cell.value}</em>`;
    grid.append(item);
  });
}

function renderIdCard() {
  const card = exorcistSheet.idCard;
  document.getElementById("idPhoto").src = card.photo;
  document.getElementById("idName").textContent = card.name;
  document.getElementById("idXid").textContent = card.xid;
  document.getElementById("idBlsp").textContent = card.blsp;
  document.getElementById("idAgdn").textContent = card.agdn;
  document.getElementById("idSex").textContent = card.sex;
  document.getElementById("idHeight").textContent = card.height;
  document.getElementById("idWeight").textContent = card.weight;
  document.getElementById("idEyes").textContent = card.eyes;
  document.getElementById("idHair").textContent = card.hair;
  document.getElementById("idRating").textContent = card.rating;
}

function renderSheet() {
  document.getElementById("characterName").textContent = exorcistSheet.name;
  document.getElementById("characterMeta").textContent =
    `${exorcistSheet.rank} // ${exorcistSheet.diocese}`;
  document.getElementById("threatLevel").textContent = exorcistSheet.threatLevel;
  document.getElementById("sheetStatus").textContent = exorcistSheet.syncStatus;

  document.getElementById("healthValue").textContent =
    `${exorcistSheet.vitals.health.current} / ${exorcistSheet.vitals.health.max}`;
  document.getElementById("corruptionValue").textContent =
    `${exorcistSheet.vitals.corruption.current} / ${exorcistSheet.vitals.corruption.max}`;
  document.getElementById("wardsValue").textContent = `Wards ${exorcistSheet.vitals.wards}`;
  document.getElementById("sanctityValue").textContent = `Sanctity ${exorcistSheet.vitals.sanctity}`;
  setMeter(
    document.getElementById("healthMeter"),
    exorcistSheet.vitals.health.current,
    exorcistSheet.vitals.health.max
  );
  setMeter(
    document.getElementById("corruptionMeter"),
    exorcistSheet.vitals.corruption.current,
    exorcistSheet.vitals.corruption.max
  );

  document.getElementById("reflexValue").textContent = String(exorcistSheet.response.reflex);
  document.getElementById("resolveValue").textContent = String(exorcistSheet.response.resolve);
  document.getElementById("riskValue").textContent = `${exorcistSheet.response.risk}%`;

  const conditionTags = document.getElementById("conditionTags");
  conditionTags.textContent = "";
  exorcistSheet.response.conditions.forEach((condition) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = condition;
    conditionTags.append(tag);
  });

  renderIdCard();
  renderIdentity();
  renderSimpleList("traitsList", exorcistSheet.traits);
  renderRites();
  renderSimpleList("sanctionList", exorcistSheet.sanctions);
  renderArsenal();
  renderHeatmap();

  document.getElementById("sessionNotes").value = exorcistSheet.journal;
}

function updateOnlineStatus() {
  statusEl.textContent = navigator.onLine
    ? "Online. Relic logs synced to local cache."
    : "Offline mode active. Operating from cached dossier.";
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
    statusEl.textContent = "PWA installed. Field dossier available on your home screen.";
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
