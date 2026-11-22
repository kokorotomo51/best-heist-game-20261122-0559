// Deterministic ?shot= states for screenshots: start / play / alarm / end.
// Each state places the thief, guards, cameras, loot and alarm so the frame
// shows the complete heist at its best, with no randomness involved.

import { PLAYER_START } from './config.js';

export const SHOT_STATES = ['start', 'play', 'alarm', 'end'];

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  return SHOT_STATES.includes(shot) ? shot : null;
}

export function applyShot(state, shot) {
  const { thief, guards, cameras } = state;
  if (shot === 'start') {
    state.phase = 'title';
    thief.x = PLAYER_START.x;
    thief.y = PLAYER_START.y;
    state.alarm = 0;
    return;
  }
  if (shot === 'play') {
    state.phase = 'playing';
    // Mid-hall, reading the patrol: one cone sweeping just past the thief.
    thief.x = 620;
    thief.y = 480;
    thief.facing = Math.PI / 2;
    thief.loot = 1200;
    thief.lootCases.add('case-west');
    thief.lootCases.add('case-gallery');
    thief.lootCases.add('jewels');
    state.alarm = 34;
    guards[0].x = 480;
    guards[0].y = 420;
    guards[0].facing = 0.35;
    guards[1].x = 850;
    guards[1].y = 500;
    guards[1].facing = Math.PI;
    guards[2].x = 1050;
    guards[2].y = 430;
    guards[2].facing = Math.PI / 2;
    cameras[0].facing = Math.PI / 2 + 0.5;
    cameras[1].facing = Math.PI / 2 - 0.4;
    cameras[2].facing = Math.PI - 0.5;
    return;
  }
  if (shot === 'alarm') {
    state.phase = 'playing';
    // The fair caught moment, one breath before it: SPOTTED, alarm 86,
    // thief at the vault door with the guard closing in.
    thief.x = 1080;
    thief.y = 430;
    thief.facing = -Math.PI / 2;
    thief.loot = 1600;
    thief.lootCases.add('case-west');
    thief.lootCases.add('case-gallery');
    thief.lootCases.add('jewels');
    thief.lootCases.add('case-hall');
    thief.crackProgress = 1.4;
    state.alarm = 86;
    state.spotted = true;
    guards[0].x = 820;
    guards[0].y = 420;
    guards[0].facing = 0;
    guards[0].seeing = true;
    guards[1].x = 900;
    guards[1].y = 470;
    guards[1].facing = -Math.PI / 2;
    guards[2].x = 1120;
    guards[2].y = 470;
    guards[2].facing = Math.PI;
    cameras[0].facing = Math.PI / 2;
    cameras[1].facing = Math.PI / 2 + 0.35;
    cameras[1].disabledUntil = 0;
    cameras[2].facing = Math.PI - 0.3;
    return;
  }
  if (shot === 'end') {
    state.phase = 'won';
    state.objective = 'Escaped with the loot!';
    thief.x = 232;
    thief.y = 720;
    thief.facing = Math.PI;
    thief.loot = 7400;
    thief.vaultCracked = true;
    thief.lootCases.add('case-west');
    thief.lootCases.add('case-gallery');
    thief.lootCases.add('jewels');
    thief.lootCases.add('case-hall');
    thief.lootCases.add('case-east');
    state.alarm = 58;
    state.peakAlarm = 72;
    state.elapsed = 96.4;
    guards[0].x = 480;
    guards[0].y = 420;
    guards[0].facing = Math.PI;
    guards[1].x = 1000;
    guards[1].y = 560;
    guards[1].facing = 0;
    guards[2].x = 1150;
    guards[2].y = 430;
    guards[2].facing = -Math.PI / 2;
    cameras[0].facing = Math.PI / 2 - 0.5;
    cameras[1].facing = Math.PI / 2;
    cameras[2].facing = Math.PI + 0.4;
  }
}
