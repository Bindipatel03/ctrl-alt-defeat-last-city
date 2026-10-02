/* global LAST_CITY_CLOUD_CONFIG */
(() => {
    "use strict";
    const GUEST_KEY = "lastCitySaveV2";
    const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.102.0/dist/umd/supabase.js";
    const el = id => document.getElementById(id);
    const game = window.LastCityGame;
    let client, owner = null, ready = false, switching = false, uploading = null;
    let generation = 0, sequence = 0, conflict = null, recovering = false;
    let baseRevision = 0, tabStale = false;
    let authBusy = false, queue = Promise.resolve();
    const key = () => owner ? `${GUEST_KEY}:account:${owner}` : GUEST_KEY;
    const metaKey = () => `${key()}:sync`;
    const read = storageKey => { try { return localStorage.getItem(storageKey); } catch (_) { return null; } };
    function write(storageKey, value) {
        try { localStorage.setItem(storageKey, value); return true; }
        catch (_) { status("Browser storage unavailable; keep this page open until cloud sync succeeds.", "error"); return false; }
    }
    function meta() {
        try { return { revision: 0, pending: false, ...JSON.parse(read(metaKey()) || "{}") }; }
        catch (_) { return { revision: 0, pending: true }; }
    }
    function status(message, state = "idle") {
        el("cloudSaveStatus").textContent = message;
        el("cloudSaveStatus").dataset.state = state;
        el("accountSyncDetail").textContent = message;
    }
    function message(text) { el("accountMessage").textContent = text; }
    function openAccount() { if (!el("accountModal").open) el("accountModal").showModal(); }
    function render() {
        el("accountForm").hidden = !!owner || recovering;
        el("signedInPanel").hidden = !owner || recovering;
        el("recoveryForm").hidden = !recovering;
        el("accountIdentity").textContent = clientUserEmail || "Player";
        el("saveConflictPanel").hidden = !conflict || recovering;
        el("cloudSyncButton").disabled = switching || !!uploading || !!conflict;
        el("importGuestButton").disabled = !ready || switching || !!uploading || !!conflict || !read(GUEST_KEY);
        el("logoutButton").disabled = switching || !!uploading;
    }
    let clientUserEmail = "";
    function pause(value) {
        switching = value;
        document.querySelector("main").inert = value;
        for (const id of ["saveButton", "resetButton", "soundButton"]) el(id).disabled = value;
        render();
    }
    function markPending() {
        sequence++;
        write(metaKey(), JSON.stringify({ ...meta(), pending: true }));
    }
    function backup(label, snapshot = game.snapshot()) {
        return write(`${key()}:backup:${Date.now()}:${label}`, JSON.stringify(snapshot));
    }
    function validate(snapshot) {
        const parsed = JSON.parse(snapshot);
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object" ||
            !parsed.buildings || typeof parsed.buildings !== "object" ||
            Array.isArray(parsed.buildings) ||
            !Number.isFinite(parsed.lastSeen)) throw new Error("This save is invalid. Your device city has been kept.");
        return snapshot;
    }
    function apply(snapshot, persist = true) {
        if (snapshot) validate(snapshot);
        document.querySelector(".offline-modal")?.remove();
        game.load(snapshot);
        if (persist) game.saveLocal();
    }
    async function fetchCloud() {
        const { data, error } = await client.from("city_saves")
            .select("state, schema_version, revision, updated_at").eq("user_id", owner).maybeSingle();
        if (error) throw error;
        if (data && data.schema_version !== 2) throw new Error("This cloud save needs a newer game version.");
        if (data) validate(JSON.stringify(data.state));
        return data;
    }
    function showConflict(row) {
        conflict = row;
        ready = false;
        const time = new Date(row.updated_at).toLocaleString();
        el("saveConflictDetail").textContent = `The cloud city was saved on ${time}. This browser also has progress. Choose which city to continue; the cities cannot be combined.`;
        status("Different saves found · choose a city in Account", "conflict");
        render();
        openAccount();
    }
    async function reconcile() {
        const version = generation;
        const localMeta = meta();
        const local = read(key());
        const row = await fetchCloud();
        if (version !== generation) return;
        if (row && (tabStale || (local && localMeta.pending && row.revision !== baseRevision))) {
            showConflict(row);
            return;
        }
        if (row && (!local || !localMeta.pending)) {
            if (local) backup("before-cloud-load", JSON.parse(local));
            write(metaKey(), JSON.stringify({ revision: row.revision, pending: false }));
            apply(JSON.stringify(row.state));
        } else {
            write(metaKey(), JSON.stringify({ revision: row?.revision || 0, pending: true }));
        }
        baseRevision = row?.revision || 0;
        tabStale = false;
        game.saveLocal();
        ready = true;
        status("Account connected · cloud sync ready");
        if (!row && read(GUEST_KEY)) message("Your account has a new city. You can bring over your guest city with “Use guest city for this account”.");
    }
    async function activate(session) {
        const nextOwner = session?.user?.id || null;
        clientUserEmail = session?.user?.email || "";
        if (nextOwner === owner) { render(); return; }
        pause(true);
        game.saveLocal(); // Finish saving under the previous identity.
        generation++;
        if (uploading) await uploading;
        owner = nextOwner;
        ready = false;
        conflict = null;
        sequence = 0;
        baseRevision = meta().revision;
        tabStale = false;
        try {
            let cached = read(key());
            // Clear the old identity before parsing a cache, including a damaged cache.
            apply(null, false);
            if (cached) {
                try { validate(cached); }
                catch (error) {
                    write(`${key()}:backup:${Date.now()}:invalid-cache`, cached);
                    write(key(), JSON.stringify(game.snapshot()));
                    write(metaKey(), JSON.stringify({ revision: 0, pending: false }));
                    baseRevision = 0;
                    cached = null;
                    message("A damaged browser save was backed up. Checking your account’s cloud city.");
                }
                if (cached) apply(cached, false);
            }
            if (owner) {
                status("Loading your cloud city…");
                await reconcile();
            } else {
                recovering = false;
                status("Guest play · saved on this browser");
            }
        } catch (error) {
            status("Cloud unavailable · device progress kept; press Sync now to retry", "error");
            message(error.message || "Could not load the cloud save.");
        } finally { pause(false); }
        if (owner && ready) await sync();
    }
    async function upload() {
        const version = generation;
        const before = sequence;
        const snapshot = game.snapshot();
        snapshot.lastSeen = Date.now();
        const expected = baseRevision;
        status("Saving to cloud…");
        try {
            const { data, error } = await client.rpc("save_city", {
                p_state: snapshot, p_expected_revision: expected, p_user_id: owner
            });
            if (version !== generation) return;
            if (error) {
                if (error.code === "40001") { showConflict(await fetchCloud()); return; }
                throw error;
            }
            if (!data?.[0]) throw new Error("The cloud did not confirm your save.");
            baseRevision = data[0].revision;
            write(metaKey(), JSON.stringify({ revision: baseRevision, pending: before !== sequence }));
            status(`Cloud saved · ${new Date(data[0].updated_at).toLocaleTimeString()}`, "saved");
        } catch (error) {
            if (version !== generation) return;
            status("Cloud save failed · device progress kept; will retry", "error");
            message(error.message || "Cloud connection unavailable.");
        }
    }
    async function sync() {
        if (!owner || switching || conflict) return;
        if (uploading) return uploading;
        if (!ready) {
            pause(true);
            try { await reconcile(); }
            catch (error) {
                message(error.message || "Cloud connection unavailable.");
                status("Cloud unavailable · device progress kept; press Sync now to retry", "error");
                return;
            } finally { pause(false); }
        }
        if (!ready || conflict) return;
        uploading = upload();
        render();
        try { await uploading; }
        finally { uploading = null; render(); }
    }
    window.LastCityCloud = {
        getSaveKey: key,
        isSwitching: () => switching,
        onSave(manual) {
            if (!owner) return;
            markPending();
            if (manual) void sync();
        }
    };

    async function resolveConflict(useCloud) {
        if (!conflict || switching || uploading) return;
        pause(true);
        try {
            if (!backup("before-conflict-choice")) throw new Error("Free some browser storage before replacing your city.");
            if (useCloud) {
                // Read again: another device may have saved since the conflict appeared.
                const row = await fetchCloud();
                if (!row) throw new Error("Cloud city no longer exists. Retry sync.");
                apply(JSON.stringify(row.state));
                baseRevision = row.revision;
                write(metaKey(), JSON.stringify({ revision: row.revision, pending: true }));
            } else {
                if (!backup("replaced-cloud", conflict.state)) throw new Error("Could not back up the cloud city.");
                baseRevision = conflict.revision;
                write(metaKey(), JSON.stringify({ revision: conflict.revision, pending: true }));
            }
            conflict = null;
            ready = true;
            tabStale = false;
            message("City selected. Syncing your progress…");
        } catch (error) { message(error.message); }
        finally { pause(false); }
        await sync();
    }
    async function authAction(action) {
        if (!client) { message("Cloud accounts are not connected yet. See CLOUD_SETUP.md."); return; }
        if (authBusy) return;
        if (action === "forgot") {
            if (!el("accountEmail").reportValidity()) return;
        } else if (action === "recover") {
            if (!el("recoveryForm").reportValidity()) return;
        } else if (!el("accountForm").reportValidity()) return;
        authBusy = true;
        for (const id of ["loginButton", "signupButton", "forgotPasswordButton"]) el(id).disabled = true;
        message("Connecting…");
        const email = el("accountEmail").value.trim();
        const password = el("accountPassword").value;
        const redirectTo = new URL(window.location.pathname, window.location.origin).href;
        try {
            let result;
            if (action === "signup") result = await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
            if (action === "login") result = await client.auth.signInWithPassword({ email, password });
            if (action === "forgot") result = await client.auth.resetPasswordForEmail(email, { redirectTo });
            if (action === "recover") result = await client.auth.updateUser({ password: el("newAccountPassword").value });
            if (result.error) throw result.error;
            el("accountPassword").value = "";
            el("newAccountPassword").value = "";
            if (action === "signup" && !result.data.session) message("Check your email to confirm your account, then log in here.");
            else if (action === "forgot") message("If an account exists for that email, a password reset link will arrive shortly.");
            else if (action === "recover") { recovering = false; render(); message("Password updated."); }
            else message("Signed in. Loading your city…");
        } catch (error) { message(error.message || "Account request failed. Please try again."); }
        finally {
            authBusy = false;
            for (const id of ["loginButton", "signupButton", "forgotPasswordButton"]) el(id).disabled = false;
        }
    }
    el("accountButton").addEventListener("click", openAccount);
    el("accountClose").addEventListener("click", () => el("accountModal").close());
    el("accountForm").addEventListener("submit", event => { event.preventDefault(); void authAction("login"); });
    el("signupButton").addEventListener("click", () => void authAction("signup"));
    el("forgotPasswordButton").addEventListener("click", () => void authAction("forgot"));
    el("recoveryForm").addEventListener("submit", event => { event.preventDefault(); void authAction("recover"); });
    el("cloudSyncButton").addEventListener("click", () => { game.saveLocal(); void sync(); });
    el("useCloudSaveButton").addEventListener("click", () => void resolveConflict(true));
    el("useDeviceSaveButton").addEventListener("click", () => void resolveConflict(false));
    el("importGuestButton").addEventListener("click", async () => {
        if (!ready || uploading || conflict || switching || !read(GUEST_KEY)) return;
        if (!window.confirm("Replace this account’s city with your guest city? Your current city will be backed up on this browser.")) return;
        try {
            validate(read(GUEST_KEY));
            if (!backup("before-guest-import")) throw new Error("Could not back up your account city.");
            apply(read(GUEST_KEY));
            await sync();
        } catch (error) { message(error.message); }
    });
    el("logoutButton").addEventListener("click", async () => {
        if (switching || uploading) return;
        game.saveLocal();
        await sync();
        const { error } = await client.auth.signOut({ scope: "local" });
        if (error) message(error.message);
        else message("Logged out. Your account city is kept separately from guest progress.");
    });
    window.addEventListener("online", () => void sync());
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") { game.saveLocal(); void sync(); }
    });
    window.addEventListener("pagehide", () => game.saveLocal());
    // Other tabs using this same account must reconcile before another upload.
    window.addEventListener("storage", event => {
        if (owner && (event.key === key() || event.key === metaKey())) {
            ready = false;
            tabStale = true;
            status("Another tab changed this account · press Sync now to choose a city", "error");
        }
    });

    function loadSDK() {
        if (window.supabase) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = SDK_URL;
            script.onload = resolve;
            script.onerror = () => reject(new Error("Could not load the account service. Check your connection and reload."));
            document.head.appendChild(script);
        });
    }
    async function init() {
        const config = window.LAST_CITY_CLOUD_CONFIG || {};
        if (!config.supabaseUrl || !config.supabasePublishableKey) {
            message("Accounts are awaiting setup. Guest progress still saves on this browser.");
            return;
        }
        try {
            await loadSDK();
            client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
                global: {
                    fetch: async (input, options = {}) => {
                        const controller = new AbortController();
                        const abort = () => controller.abort();
                        options.signal?.addEventListener("abort", abort, { once: true });
                        if (options.signal?.aborted) abort();
                        const timeout = setTimeout(abort, 15000);
                        try { return await fetch(input, { ...options, signal: controller.signal }); }
                        finally { clearTimeout(timeout); options.signal?.removeEventListener("abort", abort); }
                    }
                }
            });
            // Never await Supabase operations inside an auth callback (its session lock is held).
            client.auth.onAuthStateChange((event, session) => {
                setTimeout(() => {
                    queue = queue.then(async () => {
                        await activate(session);
                        if (event === "PASSWORD_RECOVERY") { recovering = true; render(); message("Choose a new password."); openAccount(); }
                    }).catch(error => { message(error.message); pause(false); });
                }, 0);
            });
            const { data, error } = await client.auth.getSession();
            if (error) throw error;
            queue = queue.then(() => activate(data.session));
            await queue;
            setInterval(() => { if (owner && ready && !conflict) { game.saveLocal(); void sync(); } }, 30000);
        } catch (error) {
            message(error.message || "Cloud accounts could not start.");
            status("Accounts unavailable · guest progress saves on this browser", "error");
        }
    }
    void init();
})();
