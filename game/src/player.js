// The thief: movement, sneaking, loot pickup, vault cracking, and tools.
// Tools cost kit uses; the EMP also costs alarm. Smoke hides the thief
// inside its cloud; the decoy pulls the nearest guard off patrol.

import { PLAYER_START, TOOLS, VAULT_SAFE, VAULT_LOOT, LOOT_CASES, GETAWAY, CRACK_SECONDS } from './config.js';
import { moveCircle, distance } from './level.js';

export function createThief() {
  return {
    x: PLAYER_START.x,
    y: PLAYER_START.y,
    radius: 13,
    facing: -Math.PI / 2,
    loot: 0,
    lootCases: new Set(),
    vaultCracked: false,
    crackProgress: 0,
    cracking: false,
    tools: { smoke: TOOLS.smoke.uses, emp: TOOLS.emp.uses, decoy: TOOLS.decoy.uses },
    smokeClouds: [],
    decoys: [],
    moveTarget: null,
    sneaking: false,
  };
}

export function updateThief(thief, input, dt) {
  thief.sneaking = !!input.sneak;
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  if (mx !== 0 || my !== 0) {
    thief.moveTarget = null;
    const len = Math.hypot(mx, my);
    mx /= len;
    my /= len;
  } else if (thief.moveTarget) {
    const d = distance(thief.x, thief.y, thief.moveTarget.x, thief.moveTarget.y);
    if (d < 8) {
      thief.moveTarget = null;
    } else {
      mx = (thief.moveTarget.x - thief.x) / d;
      my = (thief.moveTarget.y - thief.y) / d;
    }
  }
  const speed = thief.sneaking ? 88 : 168;
  if (mx !== 0 || my !== 0) {
    thief.facing = Math.atan2(my, mx);
    const moved = moveCircle(thief, mx * speed * dt, my * speed * dt, thief.radius);
    thief.x = moved.x;
    thief.y = moved.y;
  }
  // Loot cases: touch to collect.
  for (const c of LOOT_CASES) {
    if (!thief.lootCases.has(c.id) && distance(thief.x, thief.y, c.x, c.y) < 34) {
      thief.lootCases.add(c.id);
      thief.loot += c.value;
      thief.justCollected = c;
    }
  }
  // Vault cracking: hold E beside the safe.
  const nearSafe = distance(thief.x, thief.y, VAULT_SAFE.x, VAULT_SAFE.y) < 78;
  thief.cracking = false;
  if (nearSafe && !thief.vaultCracked && input.action) {
    thief.cracking = true;
    thief.crackProgress += dt;
    if (thief.crackProgress >= CRACK_SECONDS) {
      thief.vaultCracked = true;
      thief.loot += VAULT_LOOT;
      thief.justCracked = true;
    }
  } else if (!nearSafe) {
    thief.crackProgress = Math.max(0, thief.crackProgress - dt * 2);
  }
  // Smoke clouds fade.
  thief.smokeClouds = thief.smokeClouds.filter((s) => s.until > performance.now() / 1000);
  thief.decoys = thief.decoys.filter((d) => d.until > performance.now() / 1000);
  return thief;
}

export function useSmoke(thief, now) {
  if (thief.tools.smoke <= 0) return false;
  thief.tools.smoke -= 1;
  thief.smokeClouds.push({ x: thief.x, y: thief.y, radius: TOOLS.smoke.radius, until: now + TOOLS.smoke.seconds });
  return true;
}

export function useEmp(thief, now) {
  if (thief.tools.emp <= 0) return false;
  thief.tools.emp -= 1;
  return true;
}

export function useDecoy(thief, x, y, now) {
  if (thief.tools.decoy <= 0) return false;
  thief.tools.decoy -= 1;
  thief.decoys.push({ x, y, until: now + 9 });
  return { x, y };
}

export function thiefAtGetaway(thief) {
  return (
    thief.x > GETAWAY.x &&
    thief.x < GETAWAY.x + GETAWAY.w &&
    thief.y > GETAWAY.y &&
    thief.y < GETAWAY.y + GETAWAY.h
  );
}
