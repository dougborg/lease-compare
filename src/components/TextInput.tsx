interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextInput({ label, value, onChange }: TextInputProps) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-input"
      />
    </label>
  );
}
