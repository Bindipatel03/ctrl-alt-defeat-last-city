// Companion inventory, artwork and explicitly confirmed gold merges.
const PET_ATLASES = { 1: "ember", 2: "moss", 3: "clockwork", 4: "prism", 5: "astral" };
const MERGE_CHANCES = { 2: 10, 3: 25, 4: 50, 5: 75, 6: 100 };
let companionView = "eggs", inventoryScope = "zone", inventoryKind = "all";
let mergeSelection = null;

function petInfo(id) {
    const match = typeof id === "string" && /^([1-5])-([0-4])(-gold)?$/.exec(id);
    if (!match) return null;
    const stage = Number(match[1]), rarity = Number(match[2]), gold = !!match[3];
    const [name, icon] = ZONE_PETS[stage][rarity];
    return { stage, rarity, gold, name: (gold ? "Gold " : "") + name, icon, baseId: stage + "-" + rarity };
}
function petBasePower(id) {
    const pet = petInfo(id);
    return pet ? RARITIES[pet.rarity].bonus * (pet.gold ? 1.25 : 1) : 0;
}
function petPowerText(id) { return (petBasePower(id) * 100).toLocaleString("en-US", { maximumFractionDigits: 2 }); }
function petArtMarkup(id) {
    const pet = petInfo(id);
    if (!pet) return "";
    return `<span class="pet-art${pet.gold ? " gold-art" : ""}" role="img" aria-label="${pet.name}" style="--pet-atlas:url('assets/pets/${PET_ATLASES[pet.stage]}.png');--pet-x:${pet.rarity % 3 * 50}%;--pet-y:${Math.floor(pet.rarity / 3) * 100}%"></span>`;
}
function equippedPetsMarkup(stage) {
    const slots = game.adventure.equipped[stage] || [];
    return '<section class="inventory-equipped"><p class="eyebrow">EQUIPPED · THIS ZONE</p><div class="pet-slots">' +
        Array.from({ length: 3 }, (_, i) => {
            const id = slots[i], pet = petInfo(id);
            return pet ? `<button data-pet-action="equip" data-id="${id}" title="Unequip ${pet.name}">${petArtMarkup(id)}<strong>${pet.name}</strong><small>+${petPowerText(id)}% · Unequip</small></button>`
                : '<div class="pet-slot-empty"><span>＋</span><small>Empty slot</small></div>';
        }).join("") + `</div><p>×${getCompanionMultiplier(stage).toFixed(2)} ${ZONES[stage].label} power · Three pet types per zone. Normal and gold versions use separate slots.</p></section>`;
}
function petInventoryMarkup(stage) {
    const entries = Object.entries(game.adventure.collection).filter(([id, count]) => {
        const pet = petInfo(id);
        return count > 0 && pet && (inventoryScope === "all" || pet.stage === stage)
            && (inventoryKind === "all" || (inventoryKind === "gold") === pet.gold);
    }).sort(([a], [b]) => petBasePower(b) - petBasePower(a));
    const total = Object.values(game.adventure.collection).reduce((sum, count) => sum + count, 0);
    return `<div class="inventory-heading"><h3>Pet inventory</h3><span>${total} pets owned</span></div><div class="inventory-filters" aria-label="Inventory filters">` +
        [["scope", "zone", "This zone"], ["scope", "all", "All zones"], ["kind", "all", "All pets"], ["kind", "normal", "Normal"], ["kind", "gold", "Gold"]].map(([filter, value, label]) =>
            `<button data-pet-action="filter" data-filter="${filter}" data-value="${value}" aria-pressed="${(filter === "scope" ? inventoryScope : inventoryKind) === value}">${label}</button>`).join("") +
        '</div><p class="activity-tip">Choose pets to equip. Copies are merge materials, not automatic power boosts. Gold pets have ×1.25 normal base power.</p><div class="pet-grid inventory-grid">' +
        (entries.length ? entries.map(([id, count]) => {
            const pet = petInfo(id), equipped = (game.adventure.equipped[pet.stage] || []).includes(id);
            const full = (game.adventure.equipped[pet.stage] || []).length >= 3;
            return `<article class="pet-card inventory-pet${pet.gold ? " gold-pet" : ""}${equipped ? " equipped-pet" : ""}" style="--rarity:${pet.gold ? "#ffd46a" : RARITIES[pet.rarity].color}"><span class="pet-quantity">×${count}</span>${petArtMarkup(id)}<h3>${pet.name}</h3><small>${RARITIES[pet.rarity].name}${pet.gold ? " · GOLD" : ""} · Zone ${pet.stage}</small><p>+${petPowerText(id)}% ${ZONES[pet.stage].label}</p><button data-pet-action="equip" data-id="${id}" ${!equipped && full ? "disabled" : ""}>${equipped ? "✓ Equipped · Unequip" : full ? "Unequip a pet first" : "Equip"}</button>` +
                (!pet.gold ? `<button class="pet-merge-button" data-pet-action="merge" data-id="${id}" ${count < 2 ? "disabled" : ""}>${count < 2 ? "Need 2 copies to merge" : "Merge to Gold"}</button>` : '<span class="gold-label">GOLD · ×1.25 power</span>') + '</article>';
        }).join("") : '<p class="inventory-empty">No pets match this filter. Hatch an egg to start your collection.</p>') + '</div>';
}
function eggShopMarkup(stage) {
    const zone = ZONES[stage], a = game.adventure;
    const boostTime = Math.max(0, Math.ceil(((a.boosts[stage] || 0) - Date.now()) / 1000));
    return `<div class="egg-controls"><button data-pet-action="hatch" ${activeHatch || game[zone.currency] < zone.cost ? "disabled" : ""}>Hatch · ${formatNumber(zone.cost)} ${zone.label}</button><button data-pet-action="boost" ${boostTime || game[zone.currency] < zone.boostCost ? "disabled" : ""}>${boostTime ? "×2 Booster · " + boostTime + "s left" : "×2 " + zone.label + " · 60s · " + zone.boostCost + " " + zone.label}</button></div><div class="egg-odds">` +
        RARITIES.map(r => `<span style="color:${r.color}">${r.name} ${r.weight}%</span>`).join("") +
        `</div><p class="activity-tip">Guaranteed Rare or better after 9 consecutive Common/Uncommon hatches. Pity: ${a.pity[stage] || 0}/9. Guaranteed odds: Rare 68.18%, Epic 27.27%, Legendary 4.55%. The reel previews possible pets; it does not change these odds.</p><div class="pet-grid egg-pet-list">` +
        ZONE_PETS[stage].map(([name], rarity) => `<article class="pet-card" style="--rarity:${RARITIES[rarity].color}">${petArtMarkup(stage + "-" + rarity)}<h3>${name}</h3><small>${RARITIES[rarity].name} · ${RARITIES[rarity].weight}%</small><p>+${petPowerText(stage + "-" + rarity)}% ${zone.label}</p><small>${a.collection[stage + "-" + rarity] || 0} owned</small></article>`).join("") + '</div>';
}
function companionContentMarkup(stage) {
    const zone = ZONES[stage];
    return `<div class="companion-heading"><div><p class="eyebrow">ZONE ${stage} · COMPANIONS</p><h2>${companionView === "eggs" ? zone.egg : "Companion Inventory"}</h2><p>${formatNumber(game[zone.currency])} ${zone.label} available · ${game.adventure.eggsHatched} eggs hatched</p></div><span class="egg-display">🥚</span></div><nav class="companion-tabs" aria-label="Companion sections"><button data-pet-action="view" data-view="eggs" aria-pressed="${companionView === "eggs"}">Eggs & hatch odds</button><button data-pet-action="view" data-view="inventory" aria-pressed="${companionView === "inventory"}">Inventory & Gold merges</button></nav>` +
        equippedPetsMarkup(stage) + (companionView === "inventory" ? petInventoryMarkup(stage) : eggShopMarkup(stage));
}

function mergePets(id, amount) {
    const pet = petInfo(id), collection = game.adventure.collection;
    if (!pet || pet.gold || activeHatch || !isZoneUnlocked(pet.stage) || !Number.isInteger(amount)
        || !MERGE_CHANCES[amount] || (collection[id] || 0) < amount) return null;
    const success = amount === 6 || Math.random() * 100 < MERGE_CHANCES[amount];
    // Both outcomes consume ALL selected copies. No additional currency fee.
    collection[id] -= amount;
    if (!collection[id]) {
        delete collection[id];
        game.adventure.equipped[pet.stage] = (game.adventure.equipped[pet.stage] || []).filter(slot => slot !== id);
    }
    const goldId = pet.baseId + "-gold";
    if (success) collection[goldId] = (collection[goldId] || 0) + 1;
    game.adventure.mergesAttempted = (game.adventure.mergesAttempted || 0) + 1;
    if (success) game.adventure.goldPetsCreated = (game.adventure.goldPetsCreated || 0) + 1;
    updateGame();
    saveGame(false);
    return { success, id, goldId, amount };
}
function openPetMerge(id) {
    const pet = petInfo(id), owned = game.adventure.collection[id] || 0;
    if (!pet || pet.gold || activeHatch || mergeSelection || !isZoneUnlocked(pet.stage) || owned < 2) return;
    mergeSelection = { id, amount: Math.min(6, owned), result: null };
    document.body.classList.add("pet-merge-open");
    renderPetMerge();
    el("petMergeModal").showModal();
}
function renderPetMerge() {
    if (!mergeSelection) return;
    const { id, amount, result } = mergeSelection, pet = petInfo(id), owned = game.adventure.collection[id] || 0;
    el("mergeTitle").textContent = "Gold " + ZONE_PETS[pet.stage][pet.rarity][0];
    el("mergePreview").innerHTML = petArtMarkup(id) + '<span>→</span>' + petArtMarkup(pet.baseId + "-gold");
    el("mergeChoices").innerHTML = result ? "" : [2, 3, 4, 5, 6].map(count => `<button data-merge-count="${count}" aria-pressed="${count === amount}" ${count > owned ? "disabled" : ""}>${count} pets<small>${MERGE_CHANCES[count]}%</small></button>`).join("");
    el("mergeOdds").textContent = result ? (result.success ? "Gold merge successful!" : "Merge failed") : MERGE_CHANCES[amount] + "% success chance · " + amount + " of " + owned + " copies selected";
    el("mergeWarning").textContent = result ? (result.success ? amount + " normal copies consumed. Your gold pet is in Inventory—equip it to use its power." : "All " + amount + " selected copies were lost. No gold pet was created.")
        : "WARNING: All " + amount + " selected copies will be consumed, even if the merge fails. Gold has ×1.25 normal base power. No currency fee.";
    el("mergePower").textContent = "+" + petPowerText(id) + "% → +" + petPowerText(pet.baseId + "-gold") + "% " + ZONES[pet.stage].label;
    el("mergeConfirmButton").hidden = !!result;
    el("mergeConfirmButton").textContent = "Consume " + amount + " copies · Merge " + MERGE_CHANCES[amount] + "%";
    el("mergeCloseButton").textContent = result ? "Back to inventory" : "Cancel";
}
function confirmPetMerge() {
    if (!mergeSelection || mergeSelection.result) return;
    const result = mergePets(mergeSelection.id, mergeSelection.amount);
    if (!result) return;
    mergeSelection.result = result;
    renderPetMerge();
    playSfx(result.success ? "upgrade" : "build");
}
function closePetMerge() {
    mergeSelection = null;
    el("petMergeModal").close();
    document.body.classList.remove("pet-merge-open");
    companionView = "inventory";
    renderCompanions();
    el("companionPanel")?.querySelector('button[data-view="inventory"]')?.focus?.();
}
function initPetUI() {
    el("mergeChoices")?.addEventListener("click", event => {
        const button = event.target.closest("button[data-merge-count]");
        if (!button || button.disabled || !mergeSelection || mergeSelection.result) return;
        const count = Number(button.dataset.mergeCount);
        if (!MERGE_CHANCES[count] || count > (game.adventure.collection[mergeSelection.id] || 0)) return;
        mergeSelection.amount = count;
        renderPetMerge();
    });
    el("mergeConfirmButton")?.addEventListener("click", confirmPetMerge);
    el("mergeCloseButton")?.addEventListener("click", closePetMerge);
    el("petMergeModal")?.addEventListener("cancel", event => { event.preventDefault(); closePetMerge(); });
    el("petMergeModal")?.addEventListener("close", () => { mergeSelection = null; document.body.classList.remove("pet-merge-open"); });
}
