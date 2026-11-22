// Halcyon Vault floor plan: every wall, cover object, guard patrol, camera
// sweep, loot case and doorway of the heist, in canvas coordinates.
// Canvas: 1280 x 800. Play floor: x 24..1256, y 108..772. HUD: y 0..96.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;
export const FLOOR = { x: 24, y: 108, w: 1232, h: 664 };

export const PLAYER_START = { x: 120, y: 664 };
export const GETAWAY = { x: 60, y: 690, w: 130, h: 66 };
export const VAULT_SAFE = { x: 1148, y: 196, r: 34 };
export const VAULT_DOOR = { x: 1006, y: 352, w: 88, h: 18 };
export const CRACK_SECONDS = 2.5;
export const GETAWAY_SECONDS = 60;
export const CAUGHT_ALARM = 100;

// Walls block movement and block sight. Cover blocks movement and sight too,
// but is low: the thief can hide behind it, guards cannot see through it.
export const WALLS = [
  // Outer shell (thick frame, drawn as border; kept for collision/sight)
  { x: 24, y: 108, w: 1232, h: 14 },
  { x: 24, y: 758, w: 1232, h: 14 },
  { x: 24, y: 108, w: 14, h: 664 },
  { x: 1242, y: 108, w: 14, h: 664 },
  // Vault room: top-right, entered through the door gap in its south wall
  { x: 880, y: 108, w: 14, h: 252 },
  { x: 894, y: 346, w: 112, h: 14 },
  { x: 1094, y: 346, w: 148, h: 14 },
  // Vault room inner strongbox wall (forces a loop around the safe)
  { x: 1010, y: 122, w: 14, h: 90 },
  // West gallery divider with two gaps (north vent route / south rug route)
  { x: 330, y: 108, w: 14, h: 150 },
  { x: 330, y: 330, w: 14, h: 180 },
  { x: 330, y: 582, w: 14, h: 190 },
  // Central hall pillars (cover + sight blockers, several routes around)
  { x: 560, y: 300, w: 26, h: 120 },
  { x: 760, y: 300, w: 26, h: 120 },
  { x: 560, y: 560, w: 120, h: 22 },
  // South corridor divider with a gap near the getaway
  { x: 430, y: 640, w: 330, h: 14 },
  { x: 850, y: 640, w: 250, h: 14 },
];

export const COVER = [
  // Teal rugs / sofas / planters: SAFE cover, drawn in deep teal
  { x: 90, y: 250, w: 120, h: 56, kind: 'sofa', label: 'SOFA' },
  { x: 90, y: 430, w: 120, h: 56, kind: 'sofa', label: 'SOFA' },
  { x: 400, y: 180, w: 90, h: 60, kind: 'planter', label: 'PLANTER' },
  { x: 620, y: 180, w: 90, h: 60, kind: 'planter', label: 'PLANTER' },
  { x: 420, y: 470, w: 100, h: 54, kind: 'rug', label: 'RUG' },
  { x: 700, y: 470, w: 100, h: 54, kind: 'rug', label: 'RUG' },
  { x: 950, y: 470, w: 100, h: 54, kind: 'crate', label: 'CRATES' },
  { x: 950, y: 580, w: 60, h: 44, kind: 'crate', label: 'CRATES' },
  { x: 250, y: 640, w: 110, h: 52, kind: 'rug', label: 'RUG' },
  { x: 1060, y: 250, w: 60, h: 60, kind: 'planter', label: 'PLANTER' },
];

// Guards patrol waypoints; speed in px/s. Facing follows movement.
export const GUARDS = [
  {
    name: 'MARLOW',
    color: '#3b5bdb',
    waypoints: [
      { x: 400, y: 420 },
      { x: 820, y: 420 },
    ],
    speed: 62,
    coneRange: 175,
    coneHalfAngle: 0.56,
  },
  {
    name: 'PETRA',
    color: '#2f9e44',
    waypoints: [
      { x: 850, y: 400 },
      { x: 850, y: 610 },
      { x: 1150, y: 610 },
      { x: 1150, y: 400 },
    ],
    speed: 55,
    coneRange: 165,
    coneHalfAngle: 0.56,
  },
  {
    name: 'OKAFOR',
    color: '#e8590c',
    waypoints: [
      { x: 920, y: 420 },
      { x: 1180, y: 420 },
      { x: 1180, y: 540 },
      { x: 920, y: 540 },
    ],
    speed: 70,
    coneRange: 180,
    coneHalfAngle: 0.6,
  },
];

// Cameras are fixed to walls and sweep. Sweep is a sine oscillation.
export const CAMERAS = [
  { name: 'CAM 1', x: 640, y: 122, baseAngle: Math.PI / 2, sweep: 0.85, speed: 0.55, range: 195, halfAngle: 0.42 },
  { name: 'CAM 2', x: 912, y: 122, baseAngle: Math.PI / 2, sweep: 0.7, speed: 0.7, range: 185, halfAngle: 0.4 },
  { name: 'CAM 3', x: 1242, y: 620, baseAngle: Math.PI, sweep: 0.8, speed: 0.5, range: 195, halfAngle: 0.42 },
];

export const LOOT_CASES = [
  { id: 'case-west', x: 180, y: 160, value: 400, label: 'CASH CASE' },
  { id: 'case-gallery', x: 295, y: 560, value: 400, label: 'CASH CASE' },
  { id: 'case-hall', x: 660, y: 330, value: 400, label: 'CASH CASE' },
  { id: 'case-east', x: 1180, y: 700, value: 400, label: 'CASH CASE' },
  { id: 'jewels', x: 150, y: 560, value: 800, label: 'JEWELS' },
];

export const VAULT_LOOT = 5000;

export const TOOLS = {
  smoke: { key: '1', name: 'SMOKE', uses: 2, radius: 95, seconds: 5, costText: '2 USES' },
  emp: { key: '2', name: 'EMP', uses: 1, seconds: 6, alarmCost: 12, costText: '1 USE · +ALARM' },
  decoy: { key: '3', name: 'DECOY', uses: 3, radius: 16, costText: '3 USES' },
};

export const PALETTE = {
  floorA: '#1c2438',
  floorB: '#202941',
  wall: '#0d1322',
  wallEdge: '#c9a227',
  cover: '#14524a',
  coverEdge: '#2dd4bf',
  coneGuard: 'rgba(255, 176, 32, 0.30)',
  coneGuardEdge: 'rgba(255, 176, 32, 0.75)',
  coneCamera: 'rgba(255, 77, 77, 0.28)',
  coneCameraEdge: 'rgba(255, 77, 77, 0.8)',
  loot: '#ffd43b',
  player: '#f8f9fa',
  getaway: '#51cf66',
  text: '#f1f3f5',
  dim: '#adb5bd',
};
