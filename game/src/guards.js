// Guard patrols, camera sweeps, and the alarm's rise and fall.
// A guard walks its waypoints and pauses at each end to look around;
// a camera sweeps a sine arc. Both report whether they can see the thief.

import { GUARDS, CAMERAS } from './config.js';
import { angleTo, seenByCone, distance } from './level.js';

export function createGuards() {
  return GUARDS.map((def, i) => ({
    def,
    name: def.name,
    x: def.waypoints[0].x,
    y: def.waypoints[0].y,
    target: 1,
    facing: angleTo(def.waypoints[0].x, def.waypoints[0].y, def.waypoints[1].x, def.waypoints[1].y),
    pause: 0,
    distracted: null,
    seeing: false,
    index: i,
  }));
}

export function createCameras() {
  return CAMERAS.map((def) => ({
    def,
    name: def.name,
    time: Math.random() * 6,
    facing: def.baseAngle,
    disabledUntil: 0,
    seeing: false,
  }));
}

export function updateGuards(guards, dt, now, lockdown) {
  for (const g of guards) {
    g.seeing = false;
    if (g.distracted) {
      const d = distance(g.x, g.y, g.distracted.x, g.distracted.y);
      const speed = g.def.speed * (lockdown ? 1.5 : 1);
      if (d < 10) {
        g.distracted = null;
        g.pause = 1.2;
      } else {
        g.facing = angleTo(g.x, g.y, g.distracted.x, g.distracted.y);
        g.x += Math.cos(g.facing) * speed * dt;
        g.y += Math.sin(g.facing) * speed * dt;
      }
      continue;
    }
    if (g.pause > 0) {
      g.pause -= dt;
      g.facing += dt * 0.9; // look around while paused: the cone sweeps
      continue;
    }
    const target = g.def.waypoints[g.target];
    const d = distance(g.x, g.y, target.x, target.y);
    const speed = g.def.speed * (lockdown ? 1.5 : 1);
    if (d < 6) {
      g.target = (g.target + 1) % g.def.waypoints.length;
      g.pause = 0.8;
      continue;
    }
    g.facing = angleTo(g.x, g.y, target.x, target.y);
    g.x += Math.cos(g.facing) * speed * dt;
    g.y += Math.sin(g.facing) * speed * dt;
  }
  return guards;
}

export function updateCameras(cameras, dt, now) {
  for (const c of cameras) {
    c.time += dt;
    c.facing = c.def.baseAngle + Math.sin(c.time * c.def.speed) * c.def.sweep;
    c.seeing = false;
  }
  return cameras;
}

export function guardSeesThief(guard, px, py, smokeClouds, now) {
  if (smokeClouds.some((s) => distance(px, py, s.x, s.y) < s.radius)) return false;
  const range = guard.def.coneRange;
  return seenByCone(guard.x, guard.y, guard.facing, range, guard.def.coneHalfAngle, px, py);
}

export function cameraSeesThief(camera, px, py, smokeClouds, now) {
  if (now < camera.disabledUntil) return false;
  if (smokeClouds.some((s) => distance(px, py, s.x, s.y) < s.radius)) return false;
  return seenByCone(camera.def.x, camera.def.y, camera.facing, camera.def.range, camera.def.halfAngle, px, py);
}
