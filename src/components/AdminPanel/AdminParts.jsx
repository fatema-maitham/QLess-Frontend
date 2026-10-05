import { Icon } from './AdminLayout';

// The small search box on the right of the page title
export function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="search am-search">
      <Icon name="search" size={17} />
      <input type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

// Tabs with a number: [{ key, label, count }]
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button key={t.key} type="button" role="tab" aria-selected={active === t.key}
          className={active === t.key ? 'tab on' : 'tab'} onClick={() => onChange(t.key)}>
          {t.label} <span className="n">{t.count}</span>
        </button>
      ))}
    </div>
  );
}

// true when the text contains the search (case does not matter)
export const matches = (text, q) => !q.trim() || (text || '').toLowerCase().includes(q.trim().toLowerCase());

// "2 hours ago", "yesterday", "3 days ago", "12 Sep"
export function ago(value) {
  if (!value) return '';
  const date = new Date(value);
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return shortDate(value);
}

// "12 Sep"
export const shortDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

// true while a customer is still blocked from joining queues
export const isRestricted = (u) => !!u.restricted_until && new Date(u.restricted_until) > new Date();