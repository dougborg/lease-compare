interface StatProps {
  label: string;
  value: string;
  color?: string;
  sub?: string;
}

export default function Stat({ label, value, color, sub }: StatProps) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || "#ddd" }}>
        {value}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
