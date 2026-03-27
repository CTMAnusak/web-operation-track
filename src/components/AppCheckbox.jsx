import '../assets/css/components/AppCheckbox.css';

function AppCheckbox({ label, checked, onChange }) {
  return (
    <label className="app-checkbox">
      <input
        type="checkbox"
        className="app-checkbox__input"
        checked={checked}
        onChange={onChange}
      />
      <span className="app-checkbox__checkmark">
        {checked && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path 
              d="M1 5L4.5 8.5L11 1" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="app-checkbox__label">{label}</span>
    </label>
  );
}

export default AppCheckbox;
