// Procedural WebAudio: every sound is synthesized, no audio files.
// A tiny synth so the heist has tension (alarm pulse), feedback (pickup,
// crack ticks, tool pops) and payoff (getaway arpeggio, caught fall).

let ctx = null;
let alarmNodes = null;

export function ensureAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, seconds, type = 'sine', gain = 0.12, when = 0, slideTo = null) {
  const audio = ensureAudio();
  if (!audio) return;
  const t0 = audio.currentTime + when;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + seconds);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
  osc.connect(g).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + seconds + 0.05);
}

export function soundPickup() {
  tone(880, 0.12, 'triangle', 0.14);
  tone(1320, 0.16, 'triangle', 0.1, 0.07);
}

export function soundCrackTick() {
  tone(1900, 0.05, 'square', 0.05);
}

export function soundSmoke() {
  tone(300, 0.35, 'sine', 0.1, 0, 90);
}

export function soundEmp() {
  tone(1400, 0.25, 'sawtooth', 0.08, 0, 120);
}

export function soundDecoy() {
  tone(2400, 0.08, 'square', 0.07);
  tone(1800, 0.08, 'square', 0.06, 0.1);
}

export function soundSpotted() {
  tone(660, 0.14, 'square', 0.1);
  tone(660, 0.14, 'square', 0.1, 0.18);
}

export function soundWin() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.3, 'triangle', 0.14, i * 0.13));
}

export function soundCaught() {
  tone(420, 0.7, 'sawtooth', 0.12, 0, 90);
  tone(210, 0.7, 'sawtooth', 0.1, 0.25, 60);
}

export function soundClick() {
  tone(700, 0.06, 'triangle', 0.08);
}

export function startAlarmPulse() {
  const audio = ensureAudio();
  if (!audio || alarmNodes) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  const lfo = audio.createOscillator();
  const lfoGain = audio.createGain();
  osc.type = 'sine';
  osc.frequency.value = 520;
  lfo.frequency.value = 2.4;
  lfoGain.gain.value = 0.05;
  g.gain.value = 0.05;
  lfo.connect(lfoGain).connect(g.gain);
  osc.connect(g).connect(audio.destination);
  osc.start();
  lfo.start();
  alarmNodes = { osc, lfo, g };
}

export function stopAlarmPulse() {
  if (!alarmNodes) return;
  try {
    alarmNodes.osc.stop();
    alarmNodes.lfo.stop();
  } catch (e) {
    /* already stopped */
  }
  alarmNodes = null;
}
