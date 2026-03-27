import '../assets/css/components/AppButton.css';

function AppButton({ children, onClick, type = 'button', variant = 'primary', disabled = false, isActive = false }) {
  return (
    <button
      type={type}
      className={`app-button app-button--${variant} ${isActive ? 'app-button--active' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default AppButton;
