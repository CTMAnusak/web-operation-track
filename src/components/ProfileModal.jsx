import '../assets/css/components/ProfileModal.css';

function IconLogout() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function IconUserDefault() {
  return (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function ProfileModal({ user, avatarUrl, onClose, onLogout }) {
  return (
    <>
      <div className="profile-modal-overlay" onClick={onClose} />
      <div className="profile-modal">
        <button className="profile-modal__close-btn" onClick={onClose} aria-label="ปิด">
          <IconClose />
        </button>
        
        <h2 className="profile-modal__title">Profile</h2>
        
        <div className="profile-modal__content">
          <div className={`profile-modal__avatar${!avatarUrl ? ' profile-modal__avatar--no-image' : ''}`}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.fullName || 'โปรไฟล์'} />
            ) : (
              <IconUserDefault />
            )}
          </div>
          
          <div className="profile-modal__user-info">
            <div className="profile-modal__name">{user?.fullName} ({user?.nickname}) | {user?.role}</div>
            <div className="profile-modal__branch">{user?.branchName}</div>
          </div>
        </div>
        
        <button className="profile-modal__logout-btn" onClick={onLogout}>
          <IconLogout />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}

export default ProfileModal;
