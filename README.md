[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559/kokorotomo51/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559/kokorotomo51/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

# Halcyon Vault — A Midnight Heist

An original top-down heist game. You are the thief crossing the Halcyon Vault floor at night: read the guards' patrols and vision cones, dodge the sweeping security cameras, grab the loot cases, crack the vault safe, and reach the getaway van before lockdown closes in.

[Play it in the make.fun bounty: Make the best heist game](https://make.fun/bounty/best-heist-game-20261122-0559)

## How to play

Serve `game/` with any static server (or run `node serve.ts`) and open it in a desktop browser. No network requests; everything is local.

- **Move:** WASD / arrow keys, or click the floor to walk there. Hold **Shift** to sneak (slower, spotted more slowly).
- **Crack the vault:** stand beside the gold safe in the vault room and hold **E**.
- **Tools (limited uses):** `1` smoke pellet (hide inside the cloud), `2` EMP (cameras off for a few seconds, but it raises the alarm), `3` decoy coin (click where to throw it; the nearest guard investigates). Tool boxes in the HUD are clickable too.
- **Alarm:** the meter rises while any guard or camera can see you and falls when you break line of sight behind cover. At 100% you are caught.
- **Getaway:** cracking the vault triggers lockdown and a countdown — reach the green getaway van with the loot to win.

## Routes

Three ways across the floor: the north route past the planters, the middle route between the pillars and rugs, and the south route along the crates and gallery. Cover (teal) blocks sight; amber cones are guards, red cones are cameras, gold is loot.

## Files

- `game/index.html` + `game/src/*.js` — the game, ES modules, no build step, no external assets
- `main.ts` — copies `game/` and `screenshots/` to the output directory and writes `dossier.json`
- `serve.ts` — local static server for play-testing
- `screenshots/` — renders of the game itself
