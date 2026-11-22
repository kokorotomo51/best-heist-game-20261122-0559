// Halcyon Vault: game loop, phases, alarm rules, tool use and win/lose.
// The alarm rises while any guard or camera sees the thief and falls when
// hidden; hitting 100% ends the heist. Cracking the vault starts lockdown:
// reach the getaway van before the escape timer runs out.

import { CANVAS_WIDTH, CANVAS_HEIGHT, TOOLS } from './config.js';
import { createThief, updateThief, useSmoke, useEmp, useDecoy, thiefAtGetaway } from './player.js';
import { createGuards, createCameras, updateGuards, updateCameras, guardSeesThief, cameraSeesThief } from './guards.js';
import { createInput, consumeClick, consumeToolClick, consumeStart } from './input.js';
import { renderGame } from './render.js';
import { shotFromUrl, applyShot } from './shots.js';
import {
  ensureAudio,
  soundPickup,
  soundCrackTick,
  soundSmoke,
  soundEmp,
  soundDecoy,
  soundSpotted,
  soundWin,
  soundCaught,
  soundClick,
  startAlarmPulse,
  stopAlarmPulse,
} from './audio.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
const ctx = canvas.getContext('2d');
const input = createInput(canvas);

const state = {
  phase: 'title',
  thief: createThief(),
  guards: createGuards(),
  cameras: createCameras(),
  alarm: 0,
  peakAlarm: 0,
  spotted: false,
  wasSpotted: false,
  lockdown: false,
  escapeLeft: 0,
  elapsed: 0,
  now: 0,
  objective: 'Crack the vault safe, then escape.',
  crackTickAt: 0,
};

// Exposed for play-testing and debugging in the browser console.
window.__heistState = state;

const shot = shotFromUrl();
if (shot) {
  applyShot(state, shot);
  if (shot === 'alarm') state.wasSpotted = true;
}

function resetGame() {
  state.thief = createThief();
  state.guards = createGuards();
  state.cameras = createCameras();
  state.alarm = 0;
  state.peakAlarm = 0;
  state.spotted = false;
  state.wasSpotted = false;
  state.lockdown = false;
  state.escapeLeft = 0;
  state.elapsed = 0;
  state.objective = 'Crack the vault safe, then escape.';
  state.phase = 'playing';
  stopAlarmPulse();
}

function fireTool(kind, clickPoint) {
  const now = state.now;
  const thief = state.thief;
  if (kind === 'smoke') {
    if (useSmoke(thief, now)) soundSmoke();
  } else if (kind === 'emp') {
    if (useEmp(thief, now)) {
      for (const c of state.cameras) c.disabledUntil = now + TOOLS.emp.seconds;
      state.alarm = Math.min(100, state.alarm + TOOLS.emp.alarmCost);
      soundEmp();
    }
  } else if (kind === 'decoy') {
    const point = clickPoint && clickPoint.y > 96 ? clickPoint : { x: thief.x + Math.cos(thief.facing) * 90, y: thief.y + Math.sin(thief.facing) * 90 };
    const decoy = useDecoy(thief, point.x, point.y, now);
    if (decoy) {
      let nearest = null;
      let best = Infinity;
      for (const g of state.guards) {
        const d = Math.hypot(g.x - decoy.x, g.y - decoy.y);
        if (d < best) {
          best = d;
          nearest = g;
        }
      }
      if (nearest && best < 420) nearest.distracted = decoy;
      soundDecoy();
    }
  }
}

// HUD tool boxes: same geometry as render.js draws them.
function toolBoxAt(x, y) {
  if (y < 18 || y > 78) return null;
  const boxes = [
    { kind: 'smoke', x0: 1010 },
    { kind: 'emp', x0: 1096 },
    { kind: 'decoy', x0: 1182 },
  ];
  for (const b of boxes) {
    if (x >= b.x0 && x <= b.x0 + 78) return b.kind;
  }
  return null;
}

let last = performance.now();
let lastCrackSecond = -1;

function frame(nowMs) {
  const dt = Math.min(0.05, (nowMs - last) / 1000);
  last = nowMs;
  state.now += dt;
  const now = state.now;

  if (consumeStart(input)) {
    ensureAudio();
    soundClick();
    if (state.phase !== 'playing') resetGame();
  }

  const click = consumeClick(input);
  if (click) {
    ensureAudio();
    if (state.phase !== 'playing') {
      resetGame();
    } else {
      const tool = toolBoxAt(click.x, click.y);
      if (tool) {
        fireTool(tool, click);
      } else if (click.y > 96) {
        const pendingDecoy = state.pendingDecoy;
        if (pendingDecoy) {
          state.pendingDecoy = false;
          fireTool('decoy', click);
        } else {
          state.thief.moveTarget = { x: click.x, y: click.y };
        }
      }
    }
  }

  const toolKey = consumeToolClick(input);
  if (toolKey && state.phase === 'playing') {
    if (toolKey === 'decoy' && state.thief.tools.decoy > 0) {
      state.pendingDecoy = true;
    } else {
      fireTool(toolKey, null);
    }
  }

  if (state.phase === 'playing' && !shot) {
    state.elapsed += dt;
    updateThief(state.thief, input, dt);
    updateGuards(state.guards, dt, now, state.lockdown);
    updateCameras(state.cameras, dt, now);

    if (state.thief.justCollected) {
      soundPickup();
      state.thief.justCollected = null;
    }
    if (state.thief.justCracked) {
      state.thief.justCracked = false;
      state.lockdown = true;
      state.escapeLeft = 60;
      state.objective = 'LOCKDOWN! Reach the getaway van!';
      soundWin();
    }
    if (state.thief.cracking) {
      const whole = Math.floor(state.thief.crackProgress * 2);
      if (whole !== lastCrackSecond) {
        lastCrackSecond = whole;
        soundCrackTick();
      }
    }

    // Alarm: seen = rising fast (slower while sneaking), hidden = falling.
    let seen = false;
    for (const g of state.guards) {
      g.seeing = guardSeesThief(g, state.thief.x, state.thief.y, state.thief.smokeClouds, now);
      if (g.seeing) seen = true;
    }
    for (const c of state.cameras) {
      c.seeing = cameraSeesThief(c, state.thief.x, state.thief.y, state.thief.smokeClouds, now);
      if (c.seeing) seen = true;
    }
    state.spotted = seen;
    if (seen && !state.wasSpotted) {
      soundSpotted();
      startAlarmPulse();
    }
    if (!seen && state.wasSpotted) stopAlarmPulse();
    state.wasSpotted = seen;
    const sneakFactor = state.thief.sneaking ? 0.55 : 1;
    if (seen) {
      state.alarm = Math.min(100, state.alarm + 48 * sneakFactor * dt);
    } else {
      state.alarm = Math.max(0, state.alarm - 24 * dt);
    }
    state.peakAlarm = Math.max(state.peakAlarm, state.alarm);

    if (state.lockdown) {
      state.escapeLeft -= dt;
      if (state.escapeLeft <= 0) {
        state.phase = 'caught';
        soundCaught();
        stopAlarmPulse();
      }
    }
    if (state.alarm >= 100) {
      state.phase = 'caught';
      soundCaught();
      stopAlarmPulse();
    }
    if (state.thief.vaultCracked && thiefAtGetaway(state.thief)) {
      state.phase = 'won';
      state.objective = 'Escaped with the loot!';
      soundWin();
      stopAlarmPulse();
    }
    if (!state.thief.vaultCracked) {
      state.objective = 'Crack the vault safe, then escape.';
    }
  } else if (shot && state.phase === 'playing') {
    // Screenshot states stay frozen: guards/cameras hold their posed facing.
    state.spotted = state.spotted || state.alarm > 60;
  }

  renderGame(ctx, state);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
