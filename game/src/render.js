// All canvas drawing: marble floor, walls, cover, vision cones, cameras,
// loot, the thief and guards, the HUD, and the title / win / caught screens.
// Colour code: teal = safe cover, amber = guard sight, red = camera sight,
// gold = loot. Labels stay large so the frame reads at a glance.

import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FLOOR,
  WALLS,
  COVER,
  GETAWAY,
  VAULT_SAFE,
  VAULT_DOOR,
  LOOT_CASES,
  PALETTE,
  TOOLS,
  CRACK_SECONDS,
} from './config.js';
import { angleDifference } from './level.js';

function conePath(ctx, ox, oy, facing, range, halfAngle) {
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const a = facing - halfAngle + (2 * halfAngle * i) / steps;
    ctx.lineTo(ox + Math.cos(a) * range, oy + Math.sin(a) * range);
  }
  ctx.closePath();
}

export function drawCone(ctx, ox, oy, facing, range, halfAngle, fill, edge) {
  ctx.save();
  conePath(ctx, ox, oy, facing, range, halfAngle);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function label(ctx, text, x, y, size = 16, color = PALETTE.text, align = 'center') {
  ctx.save();
  ctx.font = `bold ${size}px Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawFloor(ctx) {
  ctx.fillStyle = '#0a0e18';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  // Marble checker
  const tile = 62;
  for (let y = FLOOR.y; y < FLOOR.y + FLOOR.h; y += tile) {
    for (let x = FLOOR.x; x < FLOOR.x + FLOOR.w; x += tile) {
      const even = (Math.floor((x - FLOOR.x) / tile) + Math.floor((y - FLOOR.y) / tile)) % 2 === 0;
      ctx.fillStyle = even ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  // Gold route dashes: the planned path from getaway to vault
  ctx.save();
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.5)';
  ctx.lineWidth = 3;
  ctx.setLineDash([14, 12]);
  ctx.beginPath();
  ctx.moveTo(125, 690);
  ctx.lineTo(300, 690);
  ctx.lineTo(300, 470);
  ctx.lineTo(700, 470);
  ctx.lineTo(700, 250);
  ctx.lineTo(940, 250);
  ctx.lineTo(940, 380);
  ctx.lineTo(1050, 380);
  ctx.restore();
  // Room names (kept clear of loot labels and the safe label)
  label(ctx, 'WEST GALLERY', 180, 208, 18, 'rgba(241,243,245,0.55)');
  label(ctx, 'GRAND HALL', 640, 640 - 34, 18, 'rgba(241,243,245,0.55)');
}

function drawWallsAndCover(ctx) {
  for (const w of WALLS) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.strokeStyle = PALETTE.wallEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
  }
  for (const c of COVER) {
    ctx.fillStyle = PALETTE.cover;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = PALETTE.coverEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    label(ctx, c.label, c.x + c.w / 2, c.y + c.h / 2, 13, '#a7f3d0');
  }
}

function drawGetaway(ctx, locked) {
  ctx.fillStyle = locked ? '#2b3a2e' : '#1e4d2b';
  ctx.fillRect(GETAWAY.x, GETAWAY.y, GETAWAY.w, GETAWAY.h);
  ctx.strokeStyle = PALETTE.getaway;
  ctx.lineWidth = 3;
  ctx.strokeRect(GETAWAY.x, GETAWAY.y, GETAWAY.w, GETAWAY.h);
  label(ctx, 'GETAWAY', GETAWAY.x + GETAWAY.w / 2, GETAWAY.y + 20, 16, PALETTE.getaway);
  label(ctx, locked ? 'LOCKED' : 'VAN — GO!', GETAWAY.x + GETAWAY.w / 2, GETAWAY.y + 44, 14, '#ffffff');
}

function drawVault(ctx, cracked, crackProgress) {
  // The safe: a big gold-ringed strongbox in the vault room.
  ctx.save();
  ctx.fillStyle = '#3a2f10';
  ctx.beginPath();
  ctx.arc(VAULT_SAFE.x, VAULT_SAFE.y, VAULT_SAFE.r + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.loot;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#6b5518';
  ctx.beginPath();
  ctx.arc(VAULT_SAFE.x, VAULT_SAFE.y, VAULT_SAFE.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.loot;
  ctx.beginPath();
  ctx.arc(VAULT_SAFE.x, VAULT_SAFE.y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  label(ctx, cracked ? 'VAULT OPEN' : 'SAFE — HOLD E', VAULT_SAFE.x, VAULT_SAFE.y - 62, 17, PALETTE.loot);
  if (crackProgress > 0 && !cracked) {
    ctx.fillStyle = '#111';
    ctx.fillRect(VAULT_SAFE.x - 50, VAULT_SAFE.y + 48, 100, 12);
    ctx.fillStyle = PALETTE.loot;
    ctx.fillRect(VAULT_SAFE.x - 50, VAULT_SAFE.y + 48, 100 * (crackProgress / CRACK_SECONDS), 12);
  }
  // Vault door gap marker
  ctx.fillStyle = PALETTE.loot;
  ctx.fillRect(VAULT_DOOR.x, VAULT_DOOR.y, VAULT_DOOR.w, VAULT_DOOR.h);
  label(ctx, 'DOOR', VAULT_DOOR.x + VAULT_DOOR.w / 2, VAULT_DOOR.y + 28, 13, PALETTE.loot);
}

function drawLoot(ctx, taken) {
  for (const c of LOOT_CASES) {
    if (taken.has(c.id)) continue;
    const pulse = 1 + Math.sin(performance.now() / 300 + c.x) * 0.12;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(Math.PI / 4);
    const s = 13 * pulse;
    ctx.fillStyle = PALETTE.loot;
    ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = '#fff3bf';
    ctx.lineWidth = 2;
    ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.restore();
    label(ctx, c.label, c.x, c.y - 30, 13, PALETTE.loot);
  }
}

function drawCameras(ctx, cameras, now) {
  for (const c of cameras) {
    const disabled = now < c.disabledUntil;
    drawCone(
      ctx,
      c.def.x,
      c.def.y,
      c.facing,
      c.def.range,
      c.def.halfAngle,
      disabled ? 'rgba(120,120,120,0.12)' : PALETTE.coneCamera,
      disabled ? 'rgba(160,160,160,0.4)' : PALETTE.coneCameraEdge,
    );
    ctx.fillStyle = disabled ? '#555' : '#e03131';
    ctx.fillRect(c.def.x - 11, c.def.y - 8, 22, 16);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(c.def.x + Math.cos(c.facing) * 8, c.def.y + Math.sin(c.facing) * 8, 4, 0, Math.PI * 2);
    ctx.fill();
    // Labels stay inside the frame: top cameras label below the body,
    // the east camera labels to the left of its wall mount.
    const labelX = c.def.x > 1200 ? c.def.x - 62 : c.def.x;
    const labelY = c.def.y < 200 ? c.def.y + 32 : c.def.y - 24;
    label(ctx, disabled ? 'CAM OFF' : c.name, labelX, labelY, 13, disabled ? '#999' : '#ff8787');
  }
}

function drawGuardCones(ctx, guards) {
  for (const g of guards) {
    drawCone(ctx, g.x, g.y, g.facing, g.def.coneRange, g.def.coneHalfAngle, PALETTE.coneGuard, PALETTE.coneGuardEdge);
  }
}

function drawGuardBodies(ctx, guards) {
  for (const g of guards) {
    ctx.save();
    ctx.fillStyle = g.def.color;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Facing tick + cap brim
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(g.x, g.y);
    ctx.lineTo(g.x + Math.cos(g.facing) * 20, g.y + Math.sin(g.facing) * 20);
    ctx.stroke();
    ctx.restore();
    label(ctx, g.name, g.x, g.y - 28, 13, '#ffffff');
    if (g.seeing) {
      label(ctx, '!', g.x, g.y - 46, 26, '#ff6b6b');
    }
  }
}

function drawThief(ctx, thief) {
  // Smoke clouds
  for (const s of thief.smokeClouds) {
    ctx.save();
    ctx.fillStyle = 'rgba(206, 212, 218, 0.55)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  for (const d of thief.decoys) {
    ctx.fillStyle = '#ffd43b';
    ctx.beginPath();
    ctx.arc(d.x, d.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    label(ctx, 'COIN', d.x, d.y - 18, 12, PALETTE.loot);
  }
  // Move target marker
  if (thief.moveTarget) {
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(thief.moveTarget.x, thief.moveTarget.y, 8, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.save();
  ctx.fillStyle = thief.sneaking ? '#dee2e6' : PALETTE.player;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, thief.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 3;
  ctx.stroke();
  // Hat brim + facing tick: the thief reads instantly
  ctx.strokeStyle = '#212529';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(thief.x, thief.y);
  ctx.lineTo(thief.x + Math.cos(thief.facing) * 19, thief.y + Math.sin(thief.facing) * 19);
  ctx.stroke();
  ctx.restore();
  label(ctx, 'YOU', thief.x, thief.y - 28, 13, '#ffffff');
  if (thief.cracking) label(ctx, 'CRACKING…', thief.x, thief.y + 30, 14, PALETTE.loot);
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#0d1322';
  ctx.fillRect(0, 0, CANVAS_WIDTH, 96);
  ctx.strokeStyle = PALETTE.wallEdge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 96);
  ctx.lineTo(CANVAS_WIDTH, 96);
  ctx.stroke();
  label(ctx, 'HALCYON VAULT', 130, 30, 24, PALETTE.loot, 'center');
  label(ctx, 'A MIDNIGHT HEIST', 130, 58, 13, PALETTE.dim, 'center');
  // Alarm meter
  label(ctx, 'ALARM', 290, 26, 15, '#ffffff', 'left');
  const ax = 290;
  const aw = 300;
  ctx.fillStyle = '#222';
  ctx.fillRect(ax, 38, aw, 22);
  const frac = Math.max(0, Math.min(1, state.alarm / 100));
  ctx.fillStyle = state.alarm > 70 ? '#fa5252' : state.alarm > 35 ? '#fab005' : '#51cf66';
  ctx.fillRect(ax, 38, aw * frac, 22);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(ax, 38, aw, 22);
  label(ctx, `${Math.round(state.alarm)}%`, ax + aw + 12, 49, 17, '#ffffff', 'left');
  // Loot + objective
  label(ctx, `LOOT  $${state.thief.loot}`, 700, 30, 20, PALETTE.loot, 'left');
  label(ctx, state.objective, 700, 58, 14, '#ffffff', 'left');
  // Tools
  let tx = 1010;
  const toolDefs = [
    { key: '1', name: TOOLS.smoke.name, left: state.thief.tools.smoke },
    { key: '2', name: TOOLS.emp.name, left: state.thief.tools.emp },
    { key: '3', name: TOOLS.decoy.name, left: state.thief.tools.decoy },
  ];
  for (const t of toolDefs) {
    ctx.fillStyle = t.left > 0 ? '#1c2b4a' : '#2b2b2b';
    ctx.fillRect(tx, 18, 78, 60);
    ctx.strokeStyle = '#74c0fc';
    ctx.strokeRect(tx, 18, 78, 60);
    label(ctx, `[${t.key}] ${t.name}`, tx + 39, 36, 13, '#ffffff');
    label(ctx, `x${t.left}`, tx + 39, 60, 14, t.left > 0 ? '#74c0fc' : '#888');
    tx += 86;
  }
  if (state.lockdown) {
    label(ctx, `ESCAPE! ${Math.ceil(state.escapeLeft)}s`, 640, 88, 16, '#ff6b6b');
  }
}

function drawHintBar(ctx, text) {
  label(ctx, text, CANVAS_WIDTH / 2, 790, 14, PALETTE.dim);
}

function overlay(ctx, title, lines, accent) {
  // Light dim plus a centred panel: the floor, cones and loot stay visible
  // around the panel so the frame still reads as the game itself.
  ctx.fillStyle = 'rgba(5, 8, 16, 0.45)';
  ctx.fillRect(0, 96, CANVAS_WIDTH, CANVAS_HEIGHT - 96);
  const px = 250;
  const py = 235;
  const pw = CANVAS_WIDTH - 2 * px;
  const ph = 285;
  ctx.fillStyle = 'rgba(13, 19, 34, 0.94)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(px, py, pw, ph);
  label(ctx, title, CANVAS_WIDTH / 2, py + 52, 50, accent);
  lines.forEach((line, i) => label(ctx, line, CANVAS_WIDTH / 2, py + 118 + i * 36, 19, '#ffffff'));
}

export function renderGame(ctx, state) {
  const { thief, guards, cameras, alarm, now } = state;
  drawFloor(ctx);
  drawGuardCones(ctx, guards);
  drawCameras(ctx, cameras, now);
  drawWallsAndCover(ctx);
  drawGetaway(ctx, !thief.vaultCracked);
  drawVault(ctx, thief.vaultCracked, thief.crackProgress);
  drawLoot(ctx, thief.lootCases);
  drawGuardBodies(ctx, guards);
  drawThief(ctx, thief);
  drawHud(ctx, state);
  if (state.spotted) {
    // Pill behind the warning so it never collides with camera labels.
    ctx.save();
    ctx.fillStyle = 'rgba(40, 4, 4, 0.88)';
    ctx.fillRect(CANVAS_WIDTH / 2 - 250, 108, 500, 34);
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.strokeRect(CANVAS_WIDTH / 2 - 250, 108, 500, 34);
    ctx.restore();
    label(ctx, 'SPOTTED!  BREAK LINE OF SIGHT!', CANVAS_WIDTH / 2, 126, 22, '#ff6b6b');
  }
  if (state.phase === 'title') {
    overlay(
      ctx,
      'HALCYON VAULT',
      [
        'Steal the vault loot, then reach the getaway van.',
        'WASD / arrows move · Shift sneak · E crack the safe · 1 smoke · 2 EMP · 3 decoy coin',
        'Click the floor to walk there · click a tool box to use it · avoid amber and red cones.',
        'Press ENTER or click to begin the heist.',
      ],
      PALETTE.loot,
    );
  } else if (state.phase === 'won') {
    overlay(
      ctx,
      'CLEAN GETAWAY!',
      [
        `Loot escaped with: $${thief.loot}   ·   Peak alarm: ${Math.round(state.peakAlarm)}%`,
        `Time: ${state.elapsed.toFixed(1)}s — the planning paid off.`,
        'Press ENTER to plan the next heist.',
      ],
      PALETTE.getaway,
    );
  } else if (state.phase === 'caught') {
    overlay(
      ctx,
      'CAUGHT!',
      [
        'The alarm hit 100% — the guards closed in.',
        'Watch the cones, use cover and tools, and break line of sight early.',
        'Press ENTER to try the heist again.',
      ],
      '#ff6b6b',
    );
  } else {
    drawHintBar(
      ctx,
      'WASD/arrows move · Shift sneak · E crack safe · 1 smoke · 2 EMP · 3 decoy · click floor to walk · M mute',
    );
  }
  void angleDifference;
}
