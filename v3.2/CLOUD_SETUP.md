# Last City accounts and cloud saves

The integration is prepared in this local `v1` folder. It is inactive until you create a Supabase project and fill in `cloud-config.js`. Guest saves keep using the existing `lastCitySaveV2` key. No backend server needs to run on GitHub Pages.

## 1. Create your Supabase project

Open [the Supabase dashboard](https://supabase.com/dashboard), create a project, and wait for it to finish provisioning. Keep its database password private.

Find the **Project URL** and **publishable key** in the project's Connect dialog or API settings. You can send those two values to Codex to complete the browser configuration. A legacy **anon** key also works. Never send or put a **secret**, **service_role**, database password, or SMTP password in the game repository.

## 2. Create the save database

Open **SQL Editor**, create a query, paste the contents of `supabase/setup.sql`, and run it. This creates:

- One `city_saves` row per account, with the game's save as JSON.
- Row Level Security policies restricting reads and writes to that player.
- A `save_city` function that checks save revisions atomically.
- Server-controlled revision numbers and update timestamps.

This script is for a new integration. If you already have a `city_saves` table with a different structure, review its schema before running it.

## 3. Configure email login and return URLs

Under **Authentication → Providers / Sign In**, enable **Email**, keep email confirmation enabled, and set a minimum password length of 8 or greater (the game requires 8).

Under **Authentication → URL Configuration**, set **Site URL** to your supplied playable URL:

```text
https://ctrl-alt-defeat-last-city.github.io/ctrl-alt-defeat-last-city/
```

Add that exact URL to **Redirect URLs**. Also add this if players can open the HTML filename directly:

```text
https://ctrl-alt-defeat-last-city.github.io/ctrl-alt-defeat-last-city/index.html
```

The game sends players back to the exact path they used for signup or password reset. If the deployed game actually lives under `/v1/`, use that game URL and add the `/v1/` return paths instead. For local testing, allow your local HTTP server URL too. Use an HTTP server rather than double-clicking `index.html` for authentication tests.

## 4. Configure signup and recovery email delivery

For public players, configure **Authentication → Email / SMTP Settings** with a custom SMTP provider and a verified sender. Configure its host, port, username, and password directly in Supabase. These credentials do not belong in `cloud-config.js` or GitHub.

Supabase's default email service is restricted to project team addresses and has a low email limit. It can be used for initial team tests; public signup confirmations and password resets require custom SMTP. See [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

## 5. Connect and publish the game files

Set your public values in `cloud-config.js`:

```js
window.LAST_CITY_CLOUD_CONFIG = {
    supabaseUrl: "https://YOUR_PROJECT.supabase.co",
    supabasePublishableKey: "sb_publishable_YOUR_KEY"
};
```

Upload the modified `index.html` and `game.js`, and the new `cloud-config.js`, `cloud-save.js`, and `cloud-save.css`, together to the directory that serves your game. Keep the existing assets and other scripts. The SQL script and this guide can also be committed for maintainers, but the SQL must be run in Supabase, not in the browser.

Your supplied repository is [Bindipatel03/ctrl-alt-defeat-last-city](https://github.com/Bindipatel03/ctrl-alt-defeat-last-city). This downloaded folder has no `.git` checkout, so changes here cannot be pushed directly. Use GitHub's file upload/editor or apply these files to an actual clone. Verify the repository/branch deployed by **Settings → Pages**, since your playable URL uses a different GitHub owner than the supplied repository URL. The remote repository and published site's contents could not be verified in this session.

## How saves behave

- Guests keep their existing browser save. Signing in selects a separate per-account city.
- An account with a cloud city loads it on a new device. A new account starts fresh; **Use guest city for this account** explicitly migrates guest progress.
- Local progress saves every 5 seconds. Cloud uploads run every 30 seconds, on **Save**, and on **Sync now**. A tab going into the background also attempts a sync. Closing a browser cannot guarantee a final network upload, so use Save and wait for **Cloud saved** before changing devices.
- If the network fails, account progress stays in its own browser cache. Failed uploads retry. A failed initial download requires **Sync now** so the game checks the existing cloud city before uploading.
- If another device has advanced the cloud revision while this browser has pending progress, uploads pause and Account offers **Use cloud city** or **Keep this device's city**. These saves cannot be merged automatically. Other tabs also require reconciliation.
- Replaced cities are backed up to browser storage under keys containing `:backup:`. These are local recovery copies, not additional cloud slots. Clearing site data removes them. To recover one, copy its JSON to that account's save key in browser developer tools, mark that account's `:sync` metadata as `{"revision":-1,"pending":true}`, and reload; choose the device city at the conflict prompt.
- **Reset** while signed in resets that account city and queues the reset for cloud sync. It does not reset the separate guest city.
- Logging out returns to the separate guest city; account caches stay on the browser. On a shared device, log out and clear site data when finished.

Saves are still generated by the browser. Access rules protect account ownership; this implementation does not make resource totals cheat-proof for competitive leaderboards or paid currency.

## Verify before inviting players

1. Sign up, confirm the email, and log in. Import a guest city if desired; click Save and wait for **Cloud saved**.
2. Log into the same account in a different browser/device. Check buildings, currency, pets, quests, and offline earnings.
3. Log out and sign into a second account. Check that guest and account cities remain separate.
4. Play offline, reconnect, and press Sync now. Test differing progress on two devices and both conflict choices.
5. Use Forgot password, open the reset email, and set a new password.
6. With two real authenticated users, verify that one cannot SELECT or UPDATE the other's row through the API, and that unauthenticated access is denied. Test that saving with an older revision returns `40001`. These database checks require the actual Supabase project.

Local automated checks:

```text
node tests/game-regression.cjs
node tests/cloud-save-regression.cjs
```

The cloud regression tests use a simulated Supabase client. Real email delivery, database policies, and cross-device browser behavior still need testing after your project is connected.

Reference: [password authentication](https://supabase.com/docs/guides/auth/passwords), [public API keys](https://supabase.com/docs/guides/api/api-keys), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
