interface LineProps {
  label: string;
  value: string;
  indent?: boolean;
  bold?: boolean;
  color?: string;
}

export default function Line({ label, value, indent, bold, color }: LineProps) {
  return (
    <div className={`line ${indent ? "line--indent" : ""}`}>
      <span
        className={`line-label ${indent ? "line-label--indent" : ""}`}
        style={{ fontWeight: bold ? 700 : 400 }}
      >
        {label}
      </span>
      <span
        className="line-value"
        style={{
          color: color || (bold ? "#ddd" : "#bbb"),
          fontWeight: bold ? 700 : 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}
