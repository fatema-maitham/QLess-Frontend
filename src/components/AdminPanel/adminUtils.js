export const matches = (text, q) =>
  !q.trim() ||
  (text || '').toLowerCase().includes(q.trim().toLowerCase());

export const shortDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })
    : '';

export function ago(value) {
  if (!value) return '';

  const date = new Date(value);
  const mins = Math.round((Date.now() - date.getTime()) / 60000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.round(mins / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;

  return shortDate(value);
}

export const isRestricted = (user) =>
  !!user.restricted_until &&
  new Date(user.restricted_until) > new Date();