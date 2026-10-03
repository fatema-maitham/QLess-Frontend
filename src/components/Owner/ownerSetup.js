/* Setup rules shared by the owner pages.
   A branch is ready when it has opening hours, at least one service and at least one staff member. */

export const NEEDS = [
  { tab: 'hours', label: 'Set opening hours', done: (b) => b.hours.length > 0 },
  { tab: 'services', label: 'Add a service', done: (b) => b.services.length > 0 },
  { tab: 'staff', label: 'Add staff', done: (b) => b.staff.length > 0 },
];

export const isReady = (b) => NEEDS.every((n) => n.done(b));
export const nextNeed = (b) => NEEDS.find((n) => !n.done(b)) || null;
/* step 1 is "add the branch", so a new branch already has 1 of 4 done */
export const stepsDone = (b) => (b ? 1 + NEEDS.filter((n) => n.done(b)).length : 0);
export const firstUnready = (branches) => branches.find((b) => !isReady(b)) || null;

/* day_of_week numbers used by the backend: 0 = Monday … 6 = Sunday */
export const DAYS = [
  { n: 'sunday', name: 'Sunday' },
  { n: 'monday', name: 'Monday' },
  { n: 'tuesday', name: 'Tuesday' },
  { n: 'wednesday', name: 'Wednesday' },
  { n: 'thursday', name: 'Thursday' },
  { n: 'friday', name: 'Friday' },
  { n: 'saturday', name: 'Saturday' },
];

export const DEFAULT_HOURS = {
  Sunday: ['08:00', '20:00', false],
  Monday: ['08:00', '20:00', false],
  Tuesday: ['08:00', '20:00', false],
  Wednesday: ['08:00', '20:00', false],
  Thursday: ['08:00', '18:00', false],
  Friday: ['08:00', '20:00', true],
  Saturday: ['09:00', '14:00', false],
};

export const hhmm = (t) => (t ? String(t).slice(0, 5) : '');
export const initial = (name) => (name || '?').trim()[0]?.toUpperCase() || '?';
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;