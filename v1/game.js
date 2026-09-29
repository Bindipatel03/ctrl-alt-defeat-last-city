// =============================================
// LAST CITY
// CTRL + ALT + DEFEAT
// IT 485 CAPSTONE
// =============================================

const SAVE_KEY = "lastCitySaveV2";

// =============================================
// DEFAULT GAME
// =============================================

const defaultGame = {
    // Offline progress
    lastSeen: Date.now(),
    offlineEarnings: { salvage: 0, scrap: 0, parts: 0, circuits: 0, cores: 0 },
    offlineTimeAway: 0,
    showOfflineModal: false,

    // Stage 1
    salvage: 0,
    clickPower: 1,
    totalClicks: 0,
    totalSalvage: 0,
    buildings: {
        scavenger: 0,
        yard: 0,
        shelter: 0,
        workshop: 0,
        farm: 0,
        power: 0,
        factory: 0,
        citycenter: 0
    },

    // Rebirth
    shards: 0,
    rebirths: 0,
    rebirthUpgrades: {
        efficient: 0,
        fastHands: 0,
        headStart: 0,
        autoClicker: 0,
        cheapBuild: 0,
        legacy: 0
    },

    // Stage 2
    stage2Unlocked: false,
    scrap: 0,
    scrapTokens: 0,
    stage2Resets: 0,
    stage2Upgrades: {
        scrapRate: 0,
        salvageBoost: 0,
        survivorSpeed: 0,
        scrapStorage: 0,
        deepSalvage: 0
    },
    stage2ResetUpgrades: {
        scrapIncome: 0,
        salvageBoost2: 0,
        survivorSpeed2: 0,
        scrapStorage2: 0,
        autoScavenge: 0,
        settlementLegacy: 0
    },

    // Stage 3
    stage3Unlocked: false,
    parts: 0,
    partTokens: 0,
    stage3Resets: 0,
    stage3Upgrades: {
        partRate: 0,
        scrapBoost: 0,
        salvageBoost3: 0,
        assemblySpeed: 0,
        autoAssembly: 0
    },
    stage3ResetUpgrades: {
        partIncome: 0,
        scrapBoost3: 0,
        salvageBoost3b: 0,
        assemblySpeed2: 0,
        autoAssembly2: 0,
        industryLegacy: 0
    },

    // Stage 4
    stage4Unlocked: false,
    circuits: 0,
    networkTokens: 0,
    stage4Resets: 0,
    stage4Upgrades: {
        circuitRate: 0,
        partBoost: 0,
        scrapBoost4: 0,
        salvageBoost4: 0,
        autoNetwork: 0
    },
    stage4ResetUpgrades: {
        circuitIncome: 0,
        partBoost4: 0,
        scrapBoost4b: 0,
        salvageBoost4b: 0,
        autoNetwork2: 0,
        networkLegacy: 0
    },

    // Stage 5
    stage5Unlocked: false,
    cores: 0,
    ascensionTokens: 0,
    stage5Resets: 0,
    stage5Upgrades: {
        coreRate: 0,
        totalSalvage: 0,
        totalScrap: 0,
        totalPart: 0,
        totalCircuit: 0,
        ascension: 0
    },
    stage5ResetUpgrades: {
        coreIncome: 0,
        circuitBoost: 0,
        partBoost5: 0,
        scrapBoost5: 0,
        salvageBoost5: 0,
        autoAscension: 0,
        ascensionLegacy: 0,
        lastCity: 0
    },

    // Milestones
    wallReached: false,
    gameCompleted: false
};

let game = JSON.parse(JSON.stringify(defaultGame));

// =============================================
// BUILDING DEFINITIONS
// =============================================

const BUILDINGS = {
    scavenger:  { name: "Scavenger Camp",  baseCost: 15,     output: 0.2,  icon: "🏕️" },
    yard:       { name: "Salvage Yard",    baseCost: 120,    output: 1.5,  icon: "🏚️" },
    shelter:    { name: "Shelter",         baseCost: 700,    output: 1,    icon: "🏠" },
    workshop:   { name: "Workshop",        baseCost: 3500,   output: 12,   icon: "🔧" },
    farm:       { name: "Hydro Farm",      baseCost: 18000,  output: 25,   icon: "🌾" },
    power:      { name: "Power Plant",     baseCost: 90000,  output: 1.25, icon: "⚡" },
    factory:    { name: "Factory",         baseCost: 500000, output: 180,  icon: "🏭" },
    citycenter: { name: "City Center",     baseCost: 3000000,output: 1200, icon: "🏙️" }
};

// =============================================
// UPGRADE TABLES
// =============================================

const REBIRTH_UPGRADES = {
    efficient:  { name: "Efficient Salvage", cost: 2,  max: 10, desc: "+25% Salvage income" },
    fastHands:  { name: "Fast Hands",        cost: 3,  max: 10, desc: "+1 click power" },
    headStart:  { name: "Head Start",        cost: 8,  max: 1,  desc: "Start with 1,000 Salvage" },
    autoClicker:{ name: "Auto-Clicker",      cost: 10, max: 5,  desc: "Auto-click 1x/sec" },
    cheapBuild: { name: "Cheap Construction",cost: 12, max: 5,  desc: "-10% building costs" },
    legacy:     { name: "Legacy",            cost: 50, max: 1,  desc: "x2 all income" }
};

const STAGE2_UPGRADES = {
    scrapRate:     { name: "Scrap Rate",      cost: 100,   max: 20, desc: "+1 Scrap/sec" },
    salvageBoost:  { name: "Salvage Boost",   cost: 250,   max: 10, desc: "+10% Salvage gain" },
    survivorSpeed: { name: "Survivor Speed",  cost: 500,   max: 10, desc: "+25% Scrap gain" },
    scrapStorage:  { name: "Scrap Storage",   cost: 1000,  max: 10, desc: "+50% max Scrap" },
    deepSalvage:   { name: "Deep Salvage",    cost: 2500,  max: 5,  desc: "x1.5 Salvage multiplier" }
};

const STAGE2_RESET_UPGRADES = {
    scrapIncome:   { name: "Scrap Income +",  cost: 2,  max: 10, desc: "+25% Scrap/sec (perm)" },
    salvageBoost2: { name: "Salvage Boost +", cost: 3,  max: 10, desc: "+50% Salvage (perm)" },
    survivorSpeed2:{ name: "Survivor Speed +",cost: 5,  max: 5,  desc: "+25% Scrap (perm)" },
    scrapStorage2: { name: "Scrap Storage +", cost: 8,  max: 5,  desc: "+100% max Scrap (perm)" },
    autoScavenge:  { name: "Auto-Scavenge",   cost: 12, max: 1,  desc: "Passive Scrap gen (perm)" },
    settlementLegacy:{ name: "Settlement Legacy", cost: 25, max: 1, desc: "x2 Stage 2 output (perm)" }
};

const STAGE3_UPGRADES = {
    partRate:      { name: "Part Rate",       cost: 500,   max: 20, desc: "+1 Part/sec" },
    scrapBoost:    { name: "Scrap Boost",     cost: 1500,  max: 10, desc: "+15% Scrap gain" },
    salvageBoost3: { name: "Salvage Boost",   cost: 5000,  max: 10, desc: "+15% Salvage gain" },
    assemblySpeed: { name: "Assembly Speed",  cost: 15000, max: 10, desc: "+25% Part rate" },
    autoAssembly:  { name: "Auto-Assembly",   cost: 50000, max: 1,  desc: "Passive Part gen" }
};

const STAGE3_RESET_UPGRADES = {
    partIncome:    { name: "Part Income +",   cost: 2,  max: 10, desc: "+25% Parts/sec (perm)" },
    scrapBoost3:   { name: "Scrap Boost +",   cost: 3,  max: 10, desc: "+50% Scrap (perm)" },
    salvageBoost3b:{ name: "Salvage Boost +", cost: 5,  max: 10, desc: "+75% Salvage (perm)" },
    assemblySpeed2:{ name: "Assembly Speed +",cost: 8,  max: 5,  desc: "+30% Part rate (perm)" },
    autoAssembly2: { name: "Auto-Assembly",   cost: 12, max: 1,  desc: "Passive Part gen (perm)" },
    industryLegacy:{ name: "Industrial Legacy",cost: 30,max: 1,  desc: "x2 Stage 3 output (perm)" }
};

const STAGE4_UPGRADES = {
    circuitRate:  { name: "Circuit Rate",  cost: 5000,   max: 20, desc: "+1 Circuit/sec" },
    partBoost:    { name: "Part Boost",    cost: 15000,  max: 10, desc: "+20% Part gain" },
    scrapBoost4:  { name: "Scrap Boost",   cost: 50000,  max: 10, desc: "+20% Scrap gain" },
    salvageBoost4:{ name: "Salvage Boost", cost: 150000, max: 10, desc: "+20% Salvage gain" },
    autoNetwork:  { name: "Auto-Network",  cost: 500000, max: 1,  desc: "Passive Circuit gen" }
};

const STAGE4_RESET_UPGRADES = {
    circuitIncome:{ name: "Circuit Income +",cost: 2,  max: 10, desc: "+25% Circuits/sec (perm)" },
    partBoost4:   { name: "Part Boost +",    cost: 3,  max: 10, desc: "+50% Parts (perm)" },
    scrapBoost4b: { name: "Scrap Boost +",   cost: 5,  max: 10, desc: "+75% Scrap (perm)" },
    salvageBoost4b:{ name: "Salvage Boost +",cost: 8,  max: 10, desc: "+100% Salvage (perm)" },
    autoNetwork2: { name: "Auto-Network",    cost: 15, max: 1,  desc: "Passive Circuit gen (perm)" },
    networkLegacy:{ name: "Network Legacy",  cost: 35, max: 1,  desc: "x2 Stage 4 output (perm)" }
};

const STAGE5_UPGRADES = {
    coreRate:     { name: "Core Rate",      cost: 50000,   max: 20, desc: "+1 Core/sec" },
    totalSalvage: { name: "Total Salvage",  cost: 50000,   max: 10, desc: "+50% Salvage" },
    totalScrap:   { name: "Total Scrap",    cost: 150000,  max: 10, desc: "+50% Scrap" },
    totalPart:    { name: "Total Part",     cost: 500000,  max: 10, desc: "+50% Parts" },
    totalCircuit: { name: "Total Circuit",  cost: 1500000, max: 10, desc: "+50% Circuits" },
    ascension:    { name: "Ascension",      cost: 50000000,max: 1,  desc: "x2 ALL currencies" }
};

const STAGE5_RESET_UPGRADES = {
    coreIncome:    { name: "Core Income +",   cost: 2,  max: 10, desc: "+25% Cores/sec (perm)" },
    circuitBoost:  { name: "Circuit Boost +", cost: 3,  max: 10, desc: "+50% Circuits (perm)" },
    partBoost5:    { name: "Part Boost +",    cost: 5,  max: 10, desc: "+75% Parts (perm)" },
    scrapBoost5:   { name: "Scrap Boost +",   cost: 8,  max: 10, desc: "+100% Scrap (perm)" },
    salvageBoost5: { name: "Salvage Boost +", cost: 12, max: 10, desc: "+150% Salvage (perm)" },
    autoAscension: { name: "Auto-Ascension",  cost: 20, max: 1,  desc: "Passive Core gen (perm)" },
    ascensionLegacy:{ name: "Ascension Legacy",cost: 50, max: 1, desc: "x2 Stage 5 output (perm)" },
    lastCity:      { name: "The Last City",   cost: 200,max: 1,  desc: "GAME COMPLETE — x10 everything" }
};

// =============================================
// DOM REFS
// =============================================

const el = (id) => document.getElementById(id);

const salvageDisplay = el("salvage");
const scrapDisplay = el("scrap");
const partsDisplay = el("parts");
const circuitsDisplay = el("circuits");
const coresDisplay = el("cores");

const salvageRateDisplay = el("salvageRate");
const scrapRateDisplay = el("scrapRate");
const partsRateDisplay = el("partsRate");
const circuitsRateDisplay = el("circuitsRate");
const coresRateDisplay = el("coresRate");

const clickPowerDisplay = el("clickPower");
const clickPowerStat = el("clickPowerStat");
const totalClicksDisplay = el("totalClicks");

const shardsDisplay = el("shards");
const rebirthsDisplay = el("rebirths");
const stage2TokensDisplay = el("stage2Tokens");
const stage2ResetsDisplay = el("stage2Resets");

const energyButton = el("energyButton");
const rebirthButton = el("rebirthButton");
const stageResetButton = el("stageResetButton");

const saveButton = el("saveButton");
const resetButton = el("resetButton");
const saveStatus = el("saveStatus");
const notification = el("notification");

const stageTabs = document.querySelectorAll(".stage-tab");
const stagePanels = document.querySelectorAll(".stage-panel");

let currentStageView = 1;

// =============================================
// COST & PRODUCTION
// =============================================

function getBuildingCost(type) {
    const def = BUILDINGS[type];
    const owned = game.buildings[type] || 0;
    const discount = 1 - (game.rebirthUpgrades.cheapBuild * 0.10);
    return Math.floor(def.baseCost * Math.pow(1.15, owned) * discount);
}

function getSalvageMultiplier() {
    let mult = 1;
    mult *= 1 + (game.rebirthUpgrades.efficient * 0.25);
    mult *= 1 + (game.stage2Upgrades.salvageBoost * 0.10);
    mult *= 1 + (game.stage2Upgrades.deepSalvage * 0.50);
    mult *= 1 + (game.stage3Upgrades.salvageBoost3 * 0.15);
    mult *= 1 + (game.stage4Upgrades.salvageBoost4 * 0.20);
    mult *= 1 + (game.stage5Upgrades.totalSalvage * 0.50);
    mult *= 1 + (game.stage2ResetUpgrades.salvageBoost2 * 0.50);
    mult *= 1 + (game.stage3ResetUpgrades.salvageBoost3b * 0.75);
    mult *= 1 + (game.stage4ResetUpgrades.salvageBoost4b * 1.00);
    mult *= 1 + (game.stage5ResetUpgrades.salvageBoost5 * 1.50);
    if (game.rebirthUpgrades.legacy > 0) mult *= 2;
    if (game.stage5ResetUpgrades.lastCity > 0) mult *= 10;
    return mult;
}

function getSalvagePerSecond() {
    let base = 0;
    base += game.buildings.scavenger  * BUILDINGS.scavenger.output;
    base += game.buildings.yard       * BUILDINGS.yard.output;
    base += game.buildings.workshop   * BUILDINGS.workshop.output;
    base += game.buildings.farm       * BUILDINGS.farm.output;
    base += game.buildings.factory    * BUILDINGS.factory.output;
    base += game.buildings.citycenter * BUILDINGS.citycenter.output;
    base *= Math.pow(1.25, game.buildings.power);
    return base * getSalvageMultiplier();
}

function getScrapPerSecond() {
    if (!game.stage2Unlocked) return 0;
    let base = game.stage2Upgrades.scrapRate * 1;
    base *= 1 + (game.stage2Upgrades.survivorSpeed * 0.25);
    base *= 1 + (game.stage2ResetUpgrades.scrapIncome * 0.25);
    base *= 1 + (game.stage2ResetUpgrades.survivorSpeed2 * 0.25);
    if (game.stage2ResetUpgrades.autoScavenge > 0) base += 1;
    if (game.stage2ResetUpgrades.settlementLegacy > 0) base *= 2;
    base *= 1 + (game.stage3Upgrades.scrapBoost * 0.15);
    base *= 1 + (game.stage4Upgrades.scrapBoost4 * 0.20);
    base *= 1 + (game.stage5Upgrades.totalScrap * 0.50);
    base *= 1 + (game.stage3ResetUpgrades.scrapBoost3 * 0.50);
    base *= 1 + (game.stage4ResetUpgrades.scrapBoost4b * 0.75);
    base *= 1 + (game.stage5ResetUpgrades.scrapBoost5 * 1.00);
    if (game.stage5ResetUpgrades.lastCity > 0) base *= 10;
    return base;
}

function getPartsPerSecond() {
    if (!game.stage3Unlocked) return 0;
    let base = game.stage3Upgrades.partRate * 1;
    base *= 1 + (game.stage3Upgrades.assemblySpeed * 0.25);
    base *= 1 + (game.stage3ResetUpgrades.partIncome * 0.25);
    if (game.stage3ResetUpgrades.autoAssembly2 > 0) base += 1;
    if (game.stage3ResetUpgrades.industryLegacy > 0) base *= 2;
    base *= 1 + (game.stage4Upgrades.partBoost * 0.20);
    base *= 1 + (game.stage5Upgrades.totalPart * 0.50);
    base *= 1 + (game.stage4ResetUpgrades.partBoost4 * 0.50);
    base *= 1 + (game.stage5ResetUpgrades.partBoost5 * 0.75);
    if (game.stage5ResetUpgrades.lastCity > 0) base *= 10;
    return base;
}

function getCircuitsPerSecond() {
    if (!game.stage4Unlocked) return 0;
    let base = game.stage4Upgrades.circuitRate * 1;
    base *= 1 + (game.stage4ResetUpgrades.circuitIncome * 0.25);
    if (game.stage4ResetUpgrades.autoNetwork2 > 0) base += 1;
    if (game.stage4ResetUpgrades.networkLegacy > 0) base *= 2;
    base *= 1 + (game.stage5Upgrades.totalCircuit * 0.50);
    base *= 1 + (game.stage5ResetUpgrades.circuitBoost * 0.50);
    if (game.stage5ResetUpgrades.lastCity > 0) base *= 10;
    return base;
}

function getCoresPerSecond() {
    if (!game.stage5Unlocked) return 0;
    let base = game.stage5Upgrades.coreRate * 1;
    base *= 1 + (game.stage5ResetUpgrades.coreIncome * 0.25);
    if (game.stage5ResetUpgrades.autoAscension > 0) base += 1;
    if (game.stage5ResetUpgrades.ascensionLegacy > 0) base *= 2;
    if (game.stage5Upgrades.ascension > 0) base *= 2;
    if (game.stage5ResetUpgrades.lastCity > 0) base *= 10;
    return base;
}

// =============================================
// WALL DETECTION
// =============================================

function isWallReached() {
    if (game.buildings.citycenter < 8) return false;
    const nextCost = getBuildingCost("citycenter");
    const income = getSalvagePerSecond();
    if (income === 0) return true;
    return (nextCost / income) > 60;
}

// =============================================
// REBIRTH REQUIREMENTS (per-rebirth gating)
// =============================================

function getRebirthRequirement() {
    const r = game.rebirths;

    // Rebirth 1: just hit the wall
    if (r === 0) {
        return {
            name: "Reach the Progress Wall",
            check: () => isWallReached(),
            display: () => isWallReached() ? "✅ Wall reached" : "❌ Wall not reached (8 City Centers + 60s income wait)"
        };
    }

    // Rebirth 2: wall + 1 Factory
    if (r === 1) {
        return {
            name: "Rebirth 2 — Build 1 Factory",
            check: () => isWallReached() && game.buildings.factory >= 1,
            display: () => {
                const wall = isWallReached() ? "✅" : "❌";
                const fac = game.buildings.factory >= 1 ? "✅" : "❌";
                return `${wall} Wall  |  ${fac} Factory (${game.buildings.factory}/1)`;
            }
        };
    }

    // Rebirth 3: wall + 1 Power Plant + 100K total Salvage
    if (r === 2) {
        return {
            name: "Rebirth 3 — Power Plant + 100K Salvage",
            check: () => isWallReached() && game.buildings.power >= 1 && game.totalSalvage >= 100000,
            display: () => {
                const wall = isWallReached() ? "✅" : "❌";
                const pow = game.buildings.power >= 1 ? "✅" : "❌";
                const sal = game.totalSalvage >= 100000 ? "✅" : "❌";
                return `${wall} Wall  |  ${pow} Power Plant  |  ${sal} 100K Salvage`;
            }
        };
    }

    // Rebirth 4: wall + 3 Factories + 500K total Salvage
    if (r === 3) {
        return {
            name: "Rebirth 4 — 3 Factories + 500K Salvage",
            check: () => isWallReached() && game.buildings.factory >= 3 && game.totalSalvage >= 500000,
            display: () => {
                const wall = isWallReached() ? "✅" : "❌";
                const fac = game.buildings.factory >= 3 ? "✅" : "❌";
                const sal = game.totalSalvage >= 500000 ? "✅" : "❌";
                return `${wall} Wall  |  ${fac} Factory (${game.buildings.factory}/3)  |  ${sal} 500K Salvage`;
            }
        };
    }

    // Rebirth 5+: scale Salvage requirement ×2 each rebirth
    const requiredSalvage = 500000 * Math.pow(2, r - 3);
    return {
        name: `Rebirth ${r + 1} — 3 Factories + ${(requiredSalvage / 1000).toFixed(0)}K Salvage`,
        check: () => isWallReached() && game.buildings.factory >= 3 && game.totalSalvage >= requiredSalvage,
        display: () => {
            const wall = isWallReached() ? "✅" : "❌";
            const fac = game.buildings.factory >= 3 ? "✅" : "❌";
            const sal = game.totalSalvage >= requiredSalvage ? "✅" : "❌";
            return `${wall} Wall  |  ${fac} Factory (${game.buildings.factory}/3)  |  ${sal} ${(requiredSalvage / 1000).toFixed(0)}K Salvage`;
        }
    };
}

// =============================================
// BUY BUILDING
// =============================================

function buyBuilding(type) {
    const cost = getBuildingCost(type);
    if (game.salvage < cost) {
        showNotification("Not enough Salvage!");
        return;
    }
    game.salvage -= cost;
    game.buildings[type]++;
    showNotification(BUILDINGS[type].name + " constructed!");
    updateGame();
    saveGame(false);
}

// =============================================
// WIRE UP BUILDING BUTTONS
// =============================================

function setupBuildingButtons() {
    Object.keys(BUILDINGS).forEach(type => {
        const btnId = "buy" + type.charAt(0).toUpperCase() + type.slice(1);
        const btn = document.getElementById(btnId);
        if (!btn) {
            console.warn("Missing buy button:", btnId);
            return;
        }
        btn.addEventListener("click", () => buyBuilding(type));
    });
}

// =============================================
// REBIRTH
// =============================================

function calculateRebirthShards() {
    let highestTier = 0;
    if (game.buildings.citycenter > 0) highestTier = 8;
    else if (game.buildings.factory > 0) highestTier = 7;
    else if (game.buildings.power > 0) highestTier = 6;
    else if (game.buildings.farm > 0) highestTier = 5;
    else if (game.buildings.workshop > 0) highestTier = 4;
    else if (game.buildings.shelter > 0) highestTier = 3;
    else if (game.buildings.yard > 0) highestTier = 2;
    else if (game.buildings.scavenger > 0) highestTier = 1;

    // Base 2 + tier bonus + depth bonus
    let shards = 2 + Math.floor(highestTier / 2);
    shards += Math.floor(game.rebirths / 5);

    return Math.min(shards, 50);
}

function doRebirth() {
    const req = getRebirthRequirement();

    if (!req.check()) {
        showNotification("❌ " + req.name + " — requirements not met!");
        return;
    }

    const gained = calculateRebirthShards();
    game.shards += gained;
    game.rebirths++;

    // Reset Stage 1
    game.salvage = 0;
    game.buildings = { scavenger: 0, yard: 0, shelter: 0, workshop: 0, farm: 0, power: 0, factory: 0, citycenter: 0 };
    game.totalSalvage = 0;

    if (game.rebirthUpgrades.headStart > 0) game.salvage = 1000;

    // Unlock Stage 2 at 3 rebirths
    if (game.rebirths >= 3 && !game.stage2Unlocked) {
        game.stage2Unlocked = true;
        showNotification("STAGE 2 UNLOCKED: The Settlement!");
    } else {
        showNotification(`Rebirth! +${gained} Salvage Shards`);
    }

    game.wallReached = false;
    updateGame();
    saveGame(false);
}

// =============================================
// STAGE RESETS
// =============================================

function doStage2Reset() {
    game.scrapTokens += 2;
    game.stage2Resets++;
    game.scrap = 0;
    game.stage2Upgrades = { scrapRate: 0, salvageBoost: 0, survivorSpeed: 0, scrapStorage: 0, deepSalvage: 0 };
    if (game.stage2Resets >= 5 && !game.stage3Unlocked) {
        game.stage3Unlocked = true;
        showNotification("STAGE 3 UNLOCKED: The Industry!");
    } else {
        showNotification("Stage 2 Reset! +2 Settlement Tokens");
    }
    updateGame();
    saveGame(false);
}

function doStage3Reset() {
    game.partTokens += 2;
    game.stage3Resets++;
    game.parts = 0;
    game.stage3Upgrades = { partRate: 0, scrapBoost: 0, salvageBoost3: 0, assemblySpeed: 0, autoAssembly: 0 };
    if (game.stage3Resets >= 7 && !game.stage4Unlocked) {
        game.stage4Unlocked = true;
        showNotification("STAGE 4 UNLOCKED: The Network!");
    } else {
        showNotification("Stage 3 Reset! +2 Industry Tokens");
    }
    updateGame();
    saveGame(false);
}

function doStage4Reset() {
    game.networkTokens += 2;
    game.stage4Resets++;
    game.circuits = 0;
    game.stage4Upgrades = { circuitRate: 0, partBoost: 0, scrapBoost4: 0, salvageBoost4: 0, autoNetwork: 0 };
    if (game.stage4Resets >= 10 && !game.stage5Unlocked) {
        game.stage5Unlocked = true;
        showNotification("STAGE 5 UNLOCKED: The Ascension!");
    } else {
        showNotification("Stage 4 Reset! +2 Network Tokens");
    }
    updateGame();
    saveGame(false);
}

function doStage5Reset() {
    game.ascensionTokens += 2;
    game.stage5Resets++;
    game.cores = 0;
    game.stage5Upgrades = { coreRate: 0, totalSalvage: 0, totalScrap: 0, totalPart: 0, totalCircuit: 0, ascension: 0 };
    showNotification("Stage 5 Reset! +2 Ascension Tokens");
    updateGame();
    saveGame(false);
}

// =============================================
// UPGRADE PURCHASES
// =============================================

function buyRebirthUpgrade(key) {
    const def = REBIRTH_UPGRADES[key];
    if (game.rebirthUpgrades[key] >= def.max) return;
    if (game.shards < def.cost) {
        showNotification("Not enough Shards!");
        return;
    }
    game.shards -= def.cost;
    game.rebirthUpgrades[key]++;
    showNotification(`${def.name} upgraded!`);
    updateGame();
    saveGame(false);
}

function buyUpgrade(stage, key) {
    const tables = {
        2: { up: STAGE2_UPGRADES, cur: game.scrap, currency: "Scrap", state: game.stage2Upgrades },
        3: { up: STAGE3_UPGRADES, cur: game.parts, currency: "Parts", state: game.stage3Upgrades },
        4: { up: STAGE4_UPGRADES, cur: game.circuits, currency: "Circuits", state: game.stage4Upgrades },
        5: { up: STAGE5_UPGRADES, cur: game.cores, currency: "Cores", state: game.stage5Upgrades }
    };
    const t = tables[stage];
    const def = t.up[key];
    if (t.state[key] >= def.max) return;
    if (t.cur < def.cost) {
        showNotification(`Not enough ${t.currency}!`);
        return;
    }
    if (stage === 2) game.scrap -= def.cost;
    if (stage === 3) game.parts -= def.cost;
    if (stage === 4) game.circuits -= def.cost;
    if (stage === 5) game.cores -= def.cost;
    t.state[key]++;
    showNotification(`${def.name} upgraded!`);
    updateGame();
    saveGame(false);
}

function buyResetUpgrade(stage, key) {
    const tables = {
        2: { up: STAGE2_RESET_UPGRADES, cur: game.scrapTokens, state: game.stage2ResetUpgrades, name: "Settlement Tokens" },
        3: { up: STAGE3_RESET_UPGRADES, cur: game.partTokens, state: game.stage3ResetUpgrades, name: "Industry Tokens" },
        4: { up: STAGE4_RESET_UPGRADES, cur: game.networkTokens, state: game.stage4ResetUpgrades, name: "Network Tokens" },
        5: { up: STAGE5_RESET_UPGRADES, cur: game.ascensionTokens, state: game.stage5ResetUpgrades, name: "Ascension Tokens" }
    };
    const t = tables[stage];
    const def = t.up[key];
    if (t.state[key] >= def.max) return;
    if (t.cur < def.cost) {
        showNotification(`Not enough ${t.name}!`);
        return;
    }
    if (stage === 2) game.scrapTokens -= def.cost;
    if (stage === 3) game.partTokens -= def.cost;
    if (stage === 4) game.networkTokens -= def.cost;
    if (stage === 5) game.ascensionTokens -= def.cost;
    t.state[key]++;

    if (stage === 5 && key === "lastCity") {
        game.gameCompleted = true;
        showNotification("🏆 THE LAST CITY IS REBUILT! YOU WIN!");
    } else {
        showNotification(`${def.name} upgraded!`);
    }
    updateGame();
    saveGame(false);
}

// =============================================
// CLICK HANDLERS
// =============================================

energyButton.addEventListener("click", function () {
    let click = game.clickPower + game.rebirthUpgrades.fastHands;
    click *= getSalvageMultiplier();
    game.salvage += click;
    game.totalSalvage += click;
    game.totalClicks++;
    energyButton.style.transform = "scale(0.95)";
    setTimeout(() => energyButton.style.transform = "", 80);
    updateGame();
});

rebirthButton.addEventListener("click", doRebirth);
stageResetButton.addEventListener("click", function () {
    if (currentStageView === 2) doStage2Reset();
    else if (currentStageView === 3) doStage3Reset();
    else if (currentStageView === 4) doStage4Reset();
    else if (currentStageView === 5) doStage5Reset();
});

// =============================================
// TAB SWITCHING
// =============================================

stageTabs.forEach(tab => {
    tab.addEventListener("click", function () {
        const stage = parseInt(tab.dataset.stage);
        if (stage === 2 && !game.stage2Unlocked) return showNotification("Locked! Rebirth 3 times.");
        if (stage === 3 && !game.stage3Unlocked) return showNotification("Locked! Reset Stage 2 five times.");
        if (stage === 4 && !game.stage4Unlocked) return showNotification("Locked! Reset Stage 3 seven times.");
        if (stage === 5 && !game.stage5Unlocked) return showNotification("Locked! Reset Stage 4 ten times.");

        currentStageView = stage;
        stageTabs.forEach(t => t.classList.remove("active"));
        stagePanels.forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        el(`stage${stage}Panel`).classList.add("active");
        updateGame();
    });
});

// =============================================
// OFFLINE PROGRESS
// =============================================

const MAX_OFFLINE_HOURS = 8;

function applyOfflineProgress() {
    const now = Date.now();
    const lastSeen = game.lastSeen || now;
    const elapsedSeconds = Math.floor((now - lastSeen) / 1000);
    const cappedSeconds = Math.min(elapsedSeconds, MAX_OFFLINE_HOURS * 3600);

    if (cappedSeconds < 60) {
        game.lastSeen = now;
        game.showOfflineModal = false;
        return;
    }

    const rate = 0.5;
    const s = getSalvagePerSecond() * cappedSeconds * rate;
    const sc = getScrapPerSecond() * cappedSeconds * rate;
    const p = getPartsPerSecond() * cappedSeconds * rate;
    const ci = getCircuitsPerSecond() * cappedSeconds * rate;
    const co = getCoresPerSecond() * cappedSeconds * rate;

    game.salvage += s;
    game.scrap += sc;
    game.parts += p;
    game.circuits += ci;
    game.cores += co;

    game.offlineEarnings = { salvage: s, scrap: sc, parts: p, circuits: ci, cores: co };
    game.offlineTimeAway = cappedSeconds;
    game.showOfflineModal = true;
    game.lastSeen = now;
}

function formatTimeAway(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
}

function showOfflineModal() {
    if (!game.showOfflineModal) return;
    const e = game.offlineEarnings;
    const timeAway = formatTimeAway(game.offlineTimeAway);
    const modal = document.createElement("div");
    modal.className = "offline-modal";
    modal.innerHTML = `
        <div class="offline-modal-content">
            <h2>⏰ Welcome Back!</h2>
            <p>You were away for <strong>${timeAway}</strong></p>
            <p class="offline-subtitle">Your city kept working (50% efficiency)</p>
            <div class="offline-earnings">
                ${e.salvage > 0 ? `<div class="offline-item">⚙️ +${Math.floor(e.salvage).toLocaleString()} Salvage</div>` : ""}
                ${e.scrap > 0 ? `<div class="offline-item">🔩 +${Math.floor(e.scrap).toLocaleString()} Scrap</div>` : ""}
                ${e.parts > 0 ? `<div class="offline-item">⚙️ +${Math.floor(e.parts).toLocaleString()} Parts</div>` : ""}
                ${e.circuits > 0 ? `<div class="offline-item">🔌 +${Math.floor(e.circuits).toLocaleString()} Circuits</div>` : ""}
                ${e.cores > 0 ? `<div class="offline-item">🔮 +${Math.floor(e.cores).toLocaleString()} Cores</div>` : ""}
            </div>
            <button onclick="closeOfflineModal()" class="offline-close-btn">Collect & Continue</button>
        </div>
    `;
    document.body.appendChild(modal);
    game.showOfflineModal = false;
}

function closeOfflineModal() {
    const modal = document.querySelector(".offline-modal");
    if (modal) modal.remove();
    saveGame(false);
}

window.closeOfflineModal = closeOfflineModal;

// =============================================
// GAME LOOP
// =============================================

function gameLoop() {
    game.salvage += getSalvagePerSecond();
    game.scrap += getScrapPerSecond();
    game.parts += getPartsPerSecond();
    game.circuits += getCircuitsPerSecond();
    game.cores += getCoresPerSecond();
    game.totalSalvage += getSalvagePerSecond();

    if (game.rebirthUpgrades.autoClicker > 0) {
        game.salvage += game.rebirthUpgrades.autoClicker * game.clickPower * getSalvageMultiplier();
    }

    if (isWallReached() && !game.wallReached) {
        game.wallReached = true;
        showNotification("⚠️ PROGRESS WALL REACHED — Rebirth available!");
    }

    updateGame();
}

setInterval(gameLoop, 1000);
setInterval(() => saveGame(false), 5000);

// =============================================
// UPDATE UI
// =============================================

function updateGame() {
    salvageDisplay.textContent  = Math.floor(game.salvage).toLocaleString();
    scrapDisplay.textContent    = Math.floor(game.scrap).toLocaleString();
    partsDisplay.textContent    = Math.floor(game.parts).toLocaleString();
    circuitsDisplay.textContent = Math.floor(game.circuits).toLocaleString();
    coresDisplay.textContent    = Math.floor(game.cores).toLocaleString();

    salvageRateDisplay.textContent  = Math.floor(getSalvagePerSecond()).toLocaleString();
    scrapRateDisplay.textContent    = Math.floor(getScrapPerSecond()).toLocaleString();
    partsRateDisplay.textContent    = Math.floor(getPartsPerSecond()).toLocaleString();
    circuitsRateDisplay.textContent = Math.floor(getCircuitsPerSecond()).toLocaleString();
    coresRateDisplay.textContent    = Math.floor(getCoresPerSecond()).toLocaleString();

    const cp = game.clickPower + game.rebirthUpgrades.fastHands;
    if (clickPowerDisplay) clickPowerDisplay.textContent = cp;
    if (clickPowerStat)    clickPowerStat.textContent = cp;
    if (totalClicksDisplay) totalClicksDisplay.textContent = game.totalClicks.toLocaleString();

    const totalClicks2 = el("totalClicks2");
    if (totalClicks2) totalClicks2.textContent = game.totalClicks.toLocaleString();

    const totalSalvageEl = el("totalSalvage");
    if (totalSalvageEl) totalSalvageEl.textContent = Math.floor(game.totalSalvage).toLocaleString();

    const salvageRateTop = el("salvageRateTop");
    if (salvageRateTop) salvageRateTop.textContent = Math.floor(getSalvagePerSecond()).toLocaleString();

    if (shardsDisplay) shardsDisplay.textContent = game.shards;
    if (rebirthsDisplay) rebirthsDisplay.textContent = game.rebirths;
    if (stage2TokensDisplay) stage2TokensDisplay.textContent = game.scrapTokens;
    if (stage2ResetsDisplay) stage2ResetsDisplay.textContent = game.stage2Resets;

    // Buildings
    Object.keys(BUILDINGS).forEach(type => {
        const cost = getBuildingCost(type);
        const owned = game.buildings[type];

        const ownedEl = el(type + "Owned");
        if (ownedEl) ownedEl.textContent = owned;

        const costEl1 = el(type + "Cost");
        const costEl2 = el(type + "Cost2");
        if (costEl1) costEl1.textContent = cost.toLocaleString();
        if (costEl2) costEl2.textContent = cost.toLocaleString();

        const btnId = "buy" + type.charAt(0).toUpperCase() + type.slice(1);
        const btn = el(btnId);
        if (btn) btn.disabled = game.salvage < cost;
    });

    // Rebirth button + requirement display
    if (rebirthButton) {
        const req = getRebirthRequirement();
        const canRebirth = req.check();

        rebirthButton.disabled = !canRebirth;
        rebirthButton.textContent = canRebirth
            ? `🌅 REBIRTH (+${calculateRebirthShards()} Shards)`
            : `🔒 ${req.name}`;
    }

    const reqDisplay = el("rebirthRequirement");
    if (reqDisplay) {
        const req = getRebirthRequirement();
        reqDisplay.innerHTML = `
            <span class="req-title">Next Rebirth Requirement</span>
            ${req.display()}
        `;
    }

    // Stage reset button
    if (stageResetButton) {
        stageResetButton.style.display = currentStageView >= 2 ? "block" : "none";
    }

    // Upgrade shops
    renderRebirthUpgrades();
    if (currentStageView === 2) renderStageUpgrades(2, STAGE2_UPGRADES, game.stage2Upgrades, "scrap");
    if (currentStageView === 3) renderStageUpgrades(3, STAGE3_UPGRADES, game.stage3Upgrades, "parts");
    if (currentStageView === 4) renderStageUpgrades(4, STAGE4_UPGRADES, game.stage4Upgrades, "circuits");
    if (currentStageView === 5) renderStageUpgrades(5, STAGE5_UPGRADES, game.stage5Upgrades, "cores");
    renderResetUpgrades();

    // Tab locks
    stageTabs.forEach(tab => {
        const s = parseInt(tab.dataset.stage);
        tab.classList.toggle("locked",
            (s === 2 && !game.stage2Unlocked) ||
            (s === 3 && !game.stage3Unlocked) ||
            (s === 4 && !game.stage4Unlocked) ||
            (s === 5 && !game.stage5Unlocked)
        );
    });

    if (saveStatus) {
        saveStatus.textContent = `Rebirths: ${game.rebirths} | Stage 2 Resets: ${game.stage2Resets}`;
    }
}

// =============================================
// RENDER UPGRADES
// =============================================

function renderRebirthUpgrades() {
    const container = el("rebirthUpgrades");
    if (!container) return;
    container.innerHTML = "";
    Object.entries(REBIRTH_UPGRADES).forEach(([key, def]) => {
        const level = game.rebirthUpgrades[key];
        const maxed = level >= def.max;
        const canAfford = game.shards >= def.cost;
        const btn = document.createElement("button");
        btn.className = "upgrade-card" + (maxed ? " maxed" : "");
        btn.disabled = maxed || !canAfford;
        btn.innerHTML = `
            <div class="upgrade-name">${def.name}</div>
            <div class="upgrade-desc">${def.desc}</div>
            <div class="upgrade-meta">
                <span>Lv ${level}/${def.max}</span>
                <span>${maxed ? "MAXED" : def.cost + " 💎"}</span>
            </div>
        `;
        if (!maxed) btn.onclick = () => buyRebirthUpgrade(key);
        container.appendChild(btn);
    });
}

function renderStageUpgrades(stage, table, state, currency) {
    const container = el(`stage${stage}Upgrades`);
    if (!container) return;
    container.innerHTML = "";
    const current = stage === 2 ? game.scrap : stage === 3 ? game.parts : stage === 4 ? game.circuits : game.cores;
    Object.entries(table).forEach(([key, def]) => {
        const level = state[key];
        const maxed = level >= def.max;
        const canAfford = current >= def.cost;
        const btn = document.createElement("button");
        btn.className = "upgrade-card" + (maxed ? " maxed" : "");
        btn.disabled = maxed || !canAfford;
        btn.innerHTML = `
            <div class="upgrade-name">${def.name}</div>
            <div class="upgrade-desc">${def.desc}</div>
            <div class="upgrade-meta">
                <span>Lv ${level}/${def.max}</span>
                <span>${maxed ? "MAXED" : def.cost + " " + currency}</span>
            </div>
        `;
        if (!maxed) btn.onclick = () => buyUpgrade(stage, key);
        container.appendChild(btn);
    });
}

function renderResetUpgrades() {
    const map = {
        2: { container: "stage2ResetUpgrades", table: STAGE2_RESET_UPGRADES, state: game.stage2ResetUpgrades, tokens: game.scrapTokens },
        3: { container: "stage3ResetUpgrades", table: STAGE3_RESET_UPGRADES, state: game.stage3ResetUpgrades, tokens: game.partTokens },
        4: { container: "stage4ResetUpgrades", table: STAGE4_RESET_UPGRADES, state: game.stage4ResetUpgrades, tokens: game.networkTokens },
        5: { container: "stage5ResetUpgrades", table: STAGE5_RESET_UPGRADES, state: game.stage5ResetUpgrades, tokens: game.ascensionTokens }
    };
    Object.entries(map).forEach(([stage, cfg]) => {
        const container = el(cfg.container);
        if (!container) return;
        container.innerHTML = "";
        Object.entries(cfg.table).forEach(([key, def]) => {
            const level = cfg.state[key];
            const maxed = level >= def.max;
            const canAfford = cfg.tokens >= def.cost;
            const btn = document.createElement("button");
            btn.className = "upgrade-card" + (maxed ? " maxed" : "");
            btn.disabled = maxed || !canAfford;
            btn.innerHTML = `
                <div class="upgrade-name">${def.name}</div>
                <div class="upgrade-desc">${def.desc}</div>
                <div class="upgrade-meta">
                    <span>Lv ${level}/${def.max}</span>
                    <span>${maxed ? "MAXED" : def.cost + " 🪙"}</span>
                </div>
            `;
            if (!maxed) btn.onclick = () => buyResetUpgrade(parseInt(stage), key);
            container.appendChild(btn);
        });
    });
}

// =============================================
// SAVE / LOAD
// =============================================

function saveGame(showMsg = true) {
    game.lastSeen = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    if (showMsg) showNotification("Game saved!");
}

function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) {
        updateGame();
        return;
    }
    try {
        const loaded = JSON.parse(saved);
        game = {
            ...defaultGame,
            ...loaded,
            buildings: { ...defaultGame.buildings, ...(loaded.buildings || {}) },
            rebirthUpgrades: { ...defaultGame.rebirthUpgrades, ...(loaded.rebirthUpgrades || {}) },
            stage2Upgrades: { ...defaultGame.stage2Upgrades, ...(loaded.stage2Upgrades || {}) },
            stage2ResetUpgrades: { ...defaultGame.stage2ResetUpgrades, ...(loaded.stage2ResetUpgrades || {}) },
            stage3Upgrades: { ...defaultGame.stage3Upgrades, ...(loaded.stage3Upgrades || {}) },
            stage3ResetUpgrades: { ...defaultGame.stage3ResetUpgrades, ...(loaded.stage3ResetUpgrades || {}) },
            stage4Upgrades: { ...defaultGame.stage4Upgrades, ...(loaded.stage4Upgrades || {}) },
            stage4ResetUpgrades: { ...defaultGame.stage4ResetUpgrades, ...(loaded.stage4ResetUpgrades || {}) },
            stage5Upgrades: { ...defaultGame.stage5Upgrades, ...(loaded.stage5Upgrades || {}) },
            stage5ResetUpgrades: { ...defaultGame.stage5ResetUpgrades, ...(loaded.stage5ResetUpgrades || {}) }
        };
        applyOfflineProgress();
    } catch (e) {
        console.error(e);
        game = JSON.parse(JSON.stringify(defaultGame));
    }
    updateGame();
    setTimeout(showOfflineModal, 500);
}

saveButton.addEventListener("click", () => saveGame(true));
resetButton.addEventListener("click", () => {
    if (!confirm("Reset EVERYTHING? This cannot be undone.")) return;
    localStorage.removeItem(SAVE_KEY);
    game = JSON.parse(JSON.stringify(defaultGame));
    updateGame();
    showNotification("Full reset.");
});

// =============================================
// NOTIFICATION
// =============================================

function showNotification(msg) {
    notification.textContent = msg;
    notification.classList.add("show");
    setTimeout(() => notification.classList.remove("show"), 2000);
}

// =============================================
// START
// =============================================

setupBuildingButtons();
loadGame();