// Collision and line-of-sight for the Halcyon Vault floor.
// Walls and cover are axis-aligned rectangles; sight is a segment test
// against every rectangle edge, so cones stop honestly at cover.

import { WALLS, COVER, FLOOR } from './config.js';

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function allBlockers() {
  return WALLS.concat(COVER);
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  // Slab test: does segment (x1,y1)-(x2,y2) cross rectangle r?
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  const axes = [
    [dx, x1, r.x, r.x + r.w],
    [dy, y1, r.y, r.y + r.h],
  ];
  for (const [d, o, lo, hi] of axes) {
    if (Math.abs(d) < 1e-9) {
      if (o < lo || o > hi) return false;
    } else {
      let t1 = (lo - o) / d;
      let t2 = (hi - o) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }
  }
  return true;
}

export function lineOfSightClear(x1, y1, x2, y2) {
  for (const r of allBlockers()) {
    if (segmentHitsRect(x1, y1, x2, y2, r)) return false;
  }
  return true;
}

// Move a circle (the thief) axis by axis so it slides along walls.
export function moveCircle(pos, dx, dy, radius) {
  const next = { x: pos.x, y: pos.y };
  const tryAxis = (axis, delta) => {
    const candidate = { x: next.x, y: next.y };
    candidate[axis] += delta;
    const box = { x: candidate.x - radius, y: candidate.y - radius, w: radius * 2, h: radius * 2 };
    const insideFloor =
      candidate.x - radius >= FLOOR.x &&
      candidate.x + radius <= FLOOR.x + FLOOR.w &&
      candidate.y - radius >= FLOOR.y &&
      candidate.y + radius <= FLOOR.y + FLOOR.h;
    if (!insideFloor) return;
    for (const r of allBlockers()) {
      if (rectsOverlap(box, r)) return;
    }
    next[axis] = candidate[axis];
  };
  tryAxis('x', dx);
  tryAxis('y', dy);
  return next;
}

export function distance(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Is point (px,py) inside a vision cone from (ox,oy) facing `facing`?
export function insideCone(ox, oy, facing, range, halfAngle, px, py) {
  const d = distance(ox, oy, px, py);
  if (d > range) return false;
  if (d < 8) return true;
  return Math.abs(angleDifference(angleTo(ox, oy, px, py), facing)) <= halfAngle;
}

export function seenByCone(ox, oy, facing, range, halfAngle, px, py) {
  return insideCone(ox, oy, facing, range, halfAngle, px, py) && lineOfSightClear(ox, oy, px, py);
}
