import { Icon } from './AdminLayout';

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="search am-search">
      <Icon name="search" size={17} />
      <input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          className={active === tab.key ? 'tab on' : 'tab'}
          onClick={() => onChange(tab.key)}
        >
          {tab.label} <span className="n">{tab.count}</span>
        </button>
      ))}
    </div>
  );
}