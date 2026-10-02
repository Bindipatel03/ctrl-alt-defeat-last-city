const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const GUEST = "lastCitySaveV2";
const accountKey = id => `${GUEST}:account:${id}`;
const city = salvage => ({ salvage, buildings: { scavenger: 0 }, lastSeen: Date.now() });
const row = (salvage, revision) => ({ state: city(salvage), schema_version: 2, revision, updated_at: new Date().toISOString() });
const session = id => ({ user: { id, email: `${id}@example.com` } });
const clone = value => JSON.parse(JSON.stringify(value));

async function harness({ user = null, cloud = [], cache = [], configured = true } = {}) {
    const storage = new Map(cache);
    const rows = new Map(cloud);
    const nodes = new Map();
    const timers = [];
    const intervals = [];
    const windowEvents = new Map();
    let state = city(0), authCallback, currentSession = user ? session(user) : null;
    const controls = { offline: false, uploads: 0, afterUpload: null, reads: 0, requests: [] };
    function node(id) {
        if (!nodes.has(id)) nodes.set(id, {
            hidden: false, open: false, value: "", disabled: false, dataset: {}, textContent: "",
            listeners: new Map(),
            addEventListener(name, fn) { this.listeners.set(name, fn); },
            showModal() { this.open = true; }, close() { this.open = false; },
            reportValidity() { return true; }
        });
        return nodes.get(id);
    }
    const main = { inert: false };
    const client = {
        auth: {
            onAuthStateChange(fn) { authCallback = fn; },
            async getSession() { return { data: { session: currentSession }, error: null }; },
            async signOut() { currentSession = null; authCallback("SIGNED_OUT", null); return { error: null }; },
            async resetPasswordForEmail() { return { error: null }; },
            async updateUser() { return { error: null }; },
            async signUp() { return { data: { session: null }, error: null }; }
        },
        from(table) {
            assert.equal(table, "city_saves");
            return { select() { return { eq(column, id) {
                assert.equal(column, "user_id");
                assert.equal(id, currentSession.user.id);
                return { async maybeSingle() {
                    controls.reads++;
                    if (controls.offline) throw new Error("Network offline");
                    return { data: rows.has(id) ? clone(rows.get(id)) : null, error: null };
                } };
            } }; } };
        },
        async rpc(name, args) {
            assert.equal(name, "save_city");
            const id = currentSession.user.id;
            assert.equal(args.p_user_id, id, "Every upload specifies its owning player, checked against the session in SQL");
            controls.requests.push({ id, ...clone(args) });
            if (controls.offline) throw new Error("Network offline");
            const existing = rows.get(id);
            if ((existing?.revision || 0) !== args.p_expected_revision) return { data: null, error: { code: "40001" } };
            const next = row(args.p_state.salvage, (existing?.revision || 0) + 1);
            next.state = clone(args.p_state);
            rows.set(id, next);
            controls.uploads++;
            if (controls.afterUpload) { const callback = controls.afterUpload; controls.afterUpload = null; callback(); }
            return { data: [{ revision: next.revision, updated_at: next.updated_at }], error: null };
        }
    };
    const window = {
        LAST_CITY_CLOUD_CONFIG: configured ? { supabaseUrl: "https://test.supabase.co", supabasePublishableKey: "sb_publishable_test" } : {},
        supabase: { createClient: () => client },
        location: { pathname: "/ctrl-alt-defeat-last-city/", origin: "https://ctrl-alt-defeat-last-city.github.io" },
        confirm: () => true,
        addEventListener(name, fn) { windowEvents.set(name, fn); },
        LastCityGame: {
            snapshot: () => clone(state),
            load(snapshot) { state = snapshot ? JSON.parse(snapshot) : city(0); },
            saveLocal() {
                state.lastSeen = Date.now();
                storage.set(window.LastCityCloud?.getSaveKey() || GUEST, JSON.stringify(state));
                window.LastCityCloud?.onSave(false);
            }
        }
    };
    if (storage.has(GUEST)) state = JSON.parse(storage.get(GUEST));
    const context = vm.createContext({
        window, console, Date, URL,
        setTimeout(fn, delay) { if (delay === 0) timers.push(fn); },
        setInterval(fn) { intervals.push(fn); },
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
        document: { getElementById: node, querySelector: selector => selector === "main" ? main : null, addEventListener() {} }
    });
    vm.runInContext(fs.readFileSync(path.join(root, "cloud-save.js"), "utf8"), context);
    async function flush() {
        for (let i = 0; i < 35; i++) {
            while (timers.length) timers.shift()();
            await new Promise(resolve => setImmediate(resolve));
        }
    }
    await flush();
    return {
        window, storage, rows, controls, nodes, flush, city: () => state,
        savedMeta: id => JSON.parse(storage.get(`${accountKey(id)}:sync`) || "{}"),
        async click(id) { await node(id).listeners.get("click")?.(); await flush(); },
        async changeUser(id, event = "SIGNED_IN") { currentSession = id ? session(id) : null; authCallback(event, currentSession); await flush(); },
        async save(salvage, manual = true) { state.salvage = salvage; window.LastCityGame.saveLocal(); window.LastCityCloud.onSave(manual); await flush(); },
        async interval() { intervals.forEach(fn => fn()); await flush(); },
        async storageEvent(key) { windowEvents.get("storage")({ key }); await flush(); }
    };
}

(async () => {
    let h = await harness({ configured: false, cache: [[GUEST, JSON.stringify(city(77))]] });
    assert.equal(h.window.LastCityCloud.getSaveKey(), GUEST);
    await h.save(88);
    assert.equal(JSON.parse(h.storage.get(GUEST)).salvage, 88);
    assert.equal(h.controls.uploads, 0);

    h = await harness({ user: "alice", cloud: [["alice", row(500, 4)]], cache: [[GUEST, JSON.stringify(city(77))]] });
    assert.equal(h.city().salvage, 500, "A fresh device loads the cloud without a false conflict");
    assert.equal(h.nodes.get("saveConflictPanel").hidden, true);
    assert.equal(JSON.parse(h.storage.get(GUEST)).salvage, 77, "Signing in keeps guest progress");
    await h.save(600);
    assert.equal(h.rows.get("alice").state.salvage, 600);
    await h.click("logoutButton");
    assert.equal(h.city().salvage, 77, "Logging out restores the separate guest city");
    await h.changeUser("bob");
    assert.equal(h.city().salvage, 0, "A new account cannot inherit the previous player's save");
    await h.click("importGuestButton");
    assert.equal(h.rows.get("bob").state.salvage, 77);
    assert.equal(h.rows.get("alice").state.salvage, 600);

    h = await harness({ user: "alice", cloud: [["alice", row(900, 5)]], cache: [
        [accountKey("alice"), JSON.stringify(city(800))],
        [`${accountKey("alice")}:sync`, JSON.stringify({ revision: 4, pending: true })]
    ] });
    assert.equal(h.controls.uploads, 0, "Divergent pending saves never auto overwrite the cloud");
    assert.equal(h.city().salvage, 800);
    await h.click("useCloudSaveButton");
    assert.equal(h.city().salvage, 900);
    assert.ok([...h.storage.keys()].some(key => key.includes(":backup:")));

    await h.save(950, false);
    h.rows.set("alice", row(1200, h.rows.get("alice").revision + 1));
    await h.click("cloudSyncButton");
    assert.equal(h.rows.get("alice").state.salvage, 1200, "Atomic revision checks protect another device's city");
    await h.click("useDeviceSaveButton");
    assert.equal(h.rows.get("alice").state.salvage, 950, "Explicit conflict choice can keep device progress");

    h.controls.offline = true;
    await h.save(1000);
    assert.equal(h.savedMeta("alice").pending, true);
    assert.equal(h.rows.get("alice").state.salvage, 950);
    h.controls.offline = false;
    await h.click("cloudSyncButton");
    assert.equal(h.rows.get("alice").state.salvage, 1000);
    assert.equal(h.savedMeta("alice").pending, false);

    h.controls.afterUpload = () => { h.city().salvage = 1100; h.window.LastCityGame.saveLocal(); };
    await h.save(1050);
    assert.equal(h.savedMeta("alice").pending, true, "Progress during an upload remains pending");
    await h.interval();
    assert.equal(h.rows.get("alice").state.salvage, 1100);

    const before = h.controls.uploads;
    await h.storageEvent(accountKey("alice"));
    await h.interval();
    assert.equal(h.controls.uploads, before, "Other-tab changes pause autosync");
    await h.click("cloudSyncButton");
    assert.equal(h.nodes.get("saveConflictPanel").hidden, false);
    await h.click("useDeviceSaveButton");
    assert.equal(h.savedMeta("alice").pending, false);

    await h.changeUser("alice", "PASSWORD_RECOVERY");
    assert.equal(h.nodes.get("recoveryForm").hidden, false);
    assert.equal(h.nodes.get("accountModal").open, true);
    h = await harness({ user: "alice", cloud: [["alice", row(200, 2)]], cache: [
        [GUEST, JSON.stringify(city(777))], [accountKey("alice"), "broken JSON"]
    ] });
    assert.equal(h.city().salvage, 200, "A corrupt account cache must never keep the guest player's city in memory");
    assert.ok([...h.storage.keys()].some(key => key.includes(":invalid-cache")));
    await h.click("cloudSyncButton");
    assert.equal(h.city().salvage, 200, "A damaged cache can be replaced by its account's cloud city");
    console.log("Passed: guest fallback, cloud restore on new devices, account isolation, guest import, conflict choices/backups, atomic revisions, offline retry, in-flight progress, other-tab protection and password recovery routing.");
})().catch(error => { console.error(error); process.exitCode = 1; });
