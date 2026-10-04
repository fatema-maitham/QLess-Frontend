// Ways to get the customer's attention when it's their turn

// Pick the sound: "chime" = ding-dong-ding (bank / airport style)
//                 "desk"  = reception desk bell, ding... ding
const SOUND = "chime";

const RING_EVERY_MS = 4000; // play the sound every 4 seconds
const RING_FOR_MS = 30000; // stop by itself after 30 seconds
const VOLUME = 0.14; // 0 = silent, keep below 0.3

// A bell is one main note plus quieter higher notes that fade faster
const BELL_PARTIALS = [
  { ratio: 1, level: 1, decay: 2.4 },
  { ratio: 2, level: 0.45, decay: 1.6 },
  { ratio: 3, level: 0.22, decay: 1.0 },
  { ratio: 4.2, level: 0.12, decay: 0.6 },
  { ratio: 5.4, level: 0.06, decay: 0.35 },
];

// Notes for each sound: [frequency in Hz, start time in seconds]
const SOUNDS = {
  chime: [
    [659.25, 0], // E5
    [783.99, 0.45], // G5
    [1046.5, 0.9], // C6
  ],
  desk: [
    [1318.5, 0], // E6
    [1318.5, 0.9],
  ],
};

let audioCtx = null;
let output = null;
let ringTimer = null;
let ringStop = null;

// One shared sound engine for the whole page
function getAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!audioCtx) {
    audioCtx = new AudioCtx();
    // Keeps overlapping notes smooth instead of crackly
    output = audioCtx.createDynamicsCompressor();
    output.connect(audioCtx.destination);
  }
  return audioCtx;
}

// Browsers block sound until the user taps the page once.
// Call this from a click or key press so the bell can play later.
export function unlockSound() {
  const ctx = getAudio();
  if (ctx && ctx.state === "suspended") ctx.resume().catch(() => { });
}

// One bell strike at a given note
function strikeBell(ctx, frequency, start) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(VOLUME, start + 0.008);
  master.gain.exponentialRampToValueAtTime(0.0001, start + 2.6);
  master.connect(output);

  BELL_PARTIALS.forEach(({ ratio, level, decay }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = frequency * ratio;
    gain.gain.setValueAtTime(level, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);

    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + decay + 0.05);
  });
}

// Play the chosen sound once
function playBell() {
  const ctx = getAudio();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => { });

  const now = ctx.currentTime + 0.05;
  (SOUNDS[SOUND] || SOUNDS.chime).forEach(([frequency, offset]) => {
    strikeBell(ctx, frequency, now + offset);
  });
}

// Play now, then repeat until stopRinging() or 30 seconds pass
export function startRinging() {
  stopRinging();
  try {
    playBell();
    ringTimer = setInterval(playBell, RING_EVERY_MS);
    ringStop = setTimeout(stopRinging, RING_FOR_MS);
  } catch {
    // the browser blocked the sound, the pop-up still shows
  }
}

export function stopRinging() {
  clearInterval(ringTimer);
  clearTimeout(ringStop);
  ringTimer = null;
  ringStop = null;
}

// Buzz on phones that support it
export function vibrate() {
  navigator.vibrate?.([300, 150, 300, 150, 300]);
}

// True when we haven't asked for notification permission yet
export function canAskForNotifications() {
  return "Notification" in window && Notification.permission === "default";
}

export function askForNotifications() {
  return Notification.requestPermission();
}

// A system notification, only when the tab is hidden (the page shows its own pop-up)
export function showSystemNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;

  try {
    new Notification(title, { body, tag: "qless-called" });
  } catch {
    // some phones only allow notifications from a service worker
  }
}

// Everything at once
export function alertCalled(ticket) {
  startRinging();
  vibrate();
  showSystemNotification(
    `It's your turn! Number ${ticket.queue_number}`,
    `Please go to ${ticket.counter_number ? `counter ${ticket.counter_number}` : "the front desk"} at ${ticket.business_name} now.`);
}