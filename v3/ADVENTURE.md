# Zones and companions

The stage tabs now unlock through quests. Rebirths and stage resets still grant
permanent upgrade currency, but are not required to unlock zones.

| Zone | Active mechanic | Next-zone objective |
| --- | --- | --- |
| Ashfall Outpost | City building and a three-part beacon project | Own 4 City Centers and install modules costing 100k, 400k and 1.2M Salvage |
| Overgrown Depot | Search three sites; invest in a camp, mill, tools and crew | Recover 5 keys, upgrade Depot Camp to level 2 and spend 500 Scrap on the gate |
| Copperworks Foundry | Follow changing recipes, process engines and deliver completed orders | Deliver 18 engines, upgrade Assembly Line to level 2 and spend 800 Parts on the gate |
| Neon Relay | Collect spawning energy in a persistent field and upgrade harvesting equipment | Collect 80 pickups and build three relay towers |
| Celestial Citadel | Disable three shields and fire a Core-powered cannon | Defeat the Guardian to enable the final Last City upgrade |

Use the **Companions** tab and select a stage to buy that zone's egg with its
own earned currency. Each zone has five pets and three equipment slots.
Equipped pets boost that zone's income and activity rewards; Outpost pets also
boost Salvage clicks. Pets and quest progress survive all rebirths and resets.

Normal hatch odds: Common 50%, Uncommon 28%, Rare 15%, Epic 6%, Legendary 1%.
After nine consecutive Common/Uncommon hatches, the next hatch guarantees Rare
or better (Rare 68.18%, Epic 27.27%, Legendary 4.55%). Rare+ resets the counter.
Each zone tracks its own pity counter.
Each pet type uses only one equipment slot. Extra copies are now merge materials,
not automatic strength boosts; all previously collected copies are retained.

Each zone also sells a 60-second ×2 resource booster. Active boosters cannot be
bought again until they expire. There are no real-money purchases.

Egg hatches show a four-second illustrated pet reel that slows toward the selected
companion, then reveals its rarity, name, strength and duplicate status. Skip
reveals the same reward immediately; Continue closes the result. The dialog also
offers a saved "Skip future hatch animations" setting. Escape skips during the
roll and closes after the reveal. Reduced-motion players get an instant result.
Currency, pity and the companion are saved before animation starts, so refresh,
skipping or double-pressing cannot lose a reward, redraw it or charge twice.

The Companions menu has separate Eggs and Inventory views. Inventory shows only
owned pets, with quantities, equipment status, normal/gold filters and an all-zone
filter. Each zone has three equipment slots. Its normal and gold versions count
as separate pet types. Gold adds 1.25 times the standard pet's base bonus (for
example, an 8% standard bonus becomes 10%). It must be equipped from Inventory.

Gold merging requires 2–6 identical NORMAL copies. Success chances are
2: 10%, 3: 25%, 4: 50%, 5: 75%, 6: 100%. ALL selected copies are consumed on
success OR failure. Success grants one gold copy; failure grants nothing. There
is no currency fee. A confirmation dialog explains the loss and lets players
choose their copy count. If the last normal copy is consumed, that type is removed
from equipment. Gold cannot be merged again. Inventory, equipment and merge
counters persist through saves and rebirths.

Generated portrait atlases cover all 25 pets in `assets/pets/`. Each atlas has a
3-column by 2-row grid; the final cell is empty. Gold artwork uses a gold-tinted
CSS variant. Generation prompts and file mapping are recorded alongside the art.

Old saves retain previously unlocked stages and receive an empty companion
inventory. Subsequent unlocks use the new quest objectives.

## Progression and rendering

Stage 1 adds six intermediate city buildings: Water Well, Community Clinic,
Recycling Station, Small Foundry, Trade Market and Observatory. Beacon modules
each add a permanent 15% Salvage bonus. Rebirth still requires only four City
Centers; it does not require the beacon or an income waiting period.

Stage 2 guarantees a key at eight searches per site and a second key at fourteen
Camp/Train searches. Searches take 4.5 seconds; crew upgrades reduce that to 2.5.
Existing earned keys are preserved. Stage 3 recipes change every six deliveries.
Processing takes eight seconds, reduced to three with cooling upgrades. Starting
an engine consumes Parts; delivering returns the input plus a profit. Production
jobs, infrastructure and quest milestones survive saves and resets.

Stage 4 starts with five pickups and spawns another every 2.8 seconds while its
field is visible. Up to ten pickups occupy distinct grid cells; they never expire.
Every eighth pickup is charged: 15 base Circuits instead of five. Collector
upgrades increase rewards, frequency upgrades speed spawning, and an optional
drone collects one pickup every six seconds. Towers need 20/45/80 lifetime
pickups and cost 150/450/900 Circuits. Extractors and capacitor banks supply
passive income so currency spending never permanently blocks the gate.

The field renderer keeps existing pickup elements and positions intact during
HUD updates. It supports keyboard focus, touch-sized targets, mobile layouts
and reduced motion. Hidden tabs and other menus do not spawn field energy.
There are thirteen zone infrastructure purchases with increasing level costs.

The dark cyberpunk interface is defined in `cyberpunk.css`, loaded after the
original stylesheet. Desktop navigation uses a left rail; the Upgrades view
pairs a scrollable shop sidebar with the resource dashboard. On small screens
the balance and next-investment card appear above the shop. Purchase meters
show actual currency funding, clamp to 0–100%, and distinguish maxed upgrades
and boss locks. All accents, button press effects and meter visuals are CSS;
JavaScript only supplies existing gameplay values. No new UI dependencies.

Run gameplay regressions with `node tests/game-regression.cjs`.
