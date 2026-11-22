// Keyboard + mouse input for the heist.
// WASD / arrows move, Shift sneaks, E cracks the vault, 1/2/3 use tools,
// Enter starts / restarts, M mutes. Clicking the floor sets a move target;
// clicking a HUD tool button uses that tool; clicking a decoy spot throws it.

export function createInput(canvas) {
  const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    sneak: false,
    action: false,
    muted: false,
    click: null,
    toolClick: null,
    startPressed: false,
  };

  const keyMap = {
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    ShiftLeft: 'sneak',
    ShiftRight: 'sneak',
    KeyE: 'action',
  };

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') input.startPressed = true;
    if (e.code === 'KeyM') input.muted = !input.muted;
    const field = keyMap[e.code];
    if (field) {
      input[field] = true;
      e.preventDefault();
    }
    if (e.code === 'Digit1') input.toolClick = 'smoke';
    if (e.code === 'Digit2') input.toolClick = 'emp';
    if (e.code === 'Digit3') input.toolClick = 'decoy';
  });

  window.addEventListener('keyup', (e) => {
    const field = keyMap[e.code];
    if (field) input[field] = false;
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    input.click = { x, y, button: e.button };
  });

  return input;
}

export function consumeClick(input) {
  const c = input.click;
  input.click = null;
  return c;
}

export function consumeToolClick(input) {
  const t = input.toolClick;
  input.toolClick = null;
  return t;
}

export function consumeStart(input) {
  const s = input.startPressed;
  input.startPressed = false;
  return s;
}
