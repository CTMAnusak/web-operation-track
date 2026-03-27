import '../assets/css/layouts/MobileLayout.css';

function MobileLayout({ children }) {
  return (
    <div className="mobile-layout">
      <div className="mobile-layout__container">
        {children}
      </div>
    </div>
  );
}

export default MobileLayout;
