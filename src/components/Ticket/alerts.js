// Ways to get the customer's attention when it's their turn

// A short "ding-dong" made in the browser, so no sound file is needed
export function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    [880, 660].forEach((frequency, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.35;

      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.65);
    });

    setTimeout(() => ctx.close(), 1500);
  } catch {
    // the browser blocked the sound, the pop-up still shows
  }
}

// Buzz on phones that support it
export function vibrate() {
  navigator.vibrate?.([300, 150, 300]);
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
  playChime();
  vibrate();
  showSystemNotification(
    `It's your turn! Number ${ticket.queue_number}`,
    `Please go to the front desk at ${ticket.business_name} now.`
  );
}