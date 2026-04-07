interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const ToggleSwitch = ({ checked, onChange, label }: ToggleSwitchProps) => (
  <label className="flex items-center justify-between cursor-pointer gap-2">
    {label && <span className="text-xs select-none">{label}</span>}
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-neutral-900' : 'bg-neutral-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-background shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  </label>
);

export default ToggleSwitch;
