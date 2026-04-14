interface FieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  wide?: boolean;
}

export default function Field({
  label,
  value,
  onChange,
  prefix = "$",
  suffix,
  wide,
}: FieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input-wrap">
        {prefix && <span className="field-affix">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="field-input"
          style={{ width: wide ? 90 : 70 }}
        />
        {suffix && <span className="field-affix field-suffix">{suffix}</span>}
      </div>
    </label>
  );
}
