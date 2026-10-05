import { Icon } from "../AdminPanel/AdminLayout";

// A number card, same look as the cards on the admin Overview
export function Kpi({ icon, value, label, note }) {
  return (
    <div className="am-kpi am-kpi--static">
      <span className="ic">
        <Icon name={icon} />
      </span>
      <b>{value}</b>
      <span>{label}</span>
      {note && <small>{note}</small>}
    </div>
  );
}

// One bar in a chart card. "shown" is the text on the right (defaults to the value)
export function Meter({ label, value, total, color, shown }) {
  const width = total ? `${Math.max(value ? 2 : 0, Math.round((value / total) * 100))}%` : "0%";
  return (
    <div>
      <span className="am-meter__label" title={label}>
        {label}
      </span>
      <i style={{ "--w": width, "--c": color }} />
      <em>{shown ?? value}</em>
    </div>
  );
}

// A chart card: title + bars. rows = [{ label, value, color, shown }]
export function MeterCard({ title, rows, total, empty = "Nothing to show yet." }) {
  return (
    <div className="am-card">
      <h3>{title}</h3>
      {rows.length ? (
        <div className="am-meter">
          {rows.map((row) => (
            <Meter key={row.label} total={total} {...row} />
          ))}
        </div>
      ) : (
        <p className="am-card__empty">{empty}</p>
      )}
    </div>
  );
}

// ★★★★☆
export function Stars({ rating }) {
  return (
    <span className="am-stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" className={n <= rating ? "on" : ""}>
          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
        </svg>
      ))}
    </span>
  );
}