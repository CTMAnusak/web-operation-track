function IconSearch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function IconQR() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5ZM6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function IconUserSmall() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

export default function DashboardHeader({
  logoSrc,
  avatarSrc,
  selectedCustomer,
  onSearchClick,
  onQRClick,
  onClearSearch,
  onAvatarClick,
}) {
  const hasAvatar = avatarSrc && avatarSrc !== '';

  return (
    <header className="dashboard__header">
      <div className="dashboard__header-logo">
        <img src={logoSrc} alt="V Track" className="dashboard__header-logo-img" />
      </div>

      {selectedCustomer ? (
        <div className="dashboard__header-search-pill">
          <span className="dashboard__header-search-pill-text">{selectedCustomer.hn}</span>
          <button
            type="button"
            className="dashboard__header-search-clear"
            aria-label="ล้างการค้นหา"
            onClick={onClearSearch}
          >
            <IconClose />
          </button>
        </div>
      ) : null}

      <div className="dashboard__header-actions">
        {!selectedCustomer && (
          <button
            type="button"
            className="dashboard__header-icon-btn"
            aria-label="ค้นหา"
            onClick={onSearchClick}
          >
            <IconSearch />
          </button>
        )}
        <button type="button" className="dashboard__header-icon-btn" aria-label="QR Code" onClick={onQRClick}>
          <IconQR />
        </button>
        <button
          type="button"
          className={`dashboard__header-avatar${!hasAvatar ? ' dashboard__header-avatar--no-image' : ''}`}
          onClick={onAvatarClick}
          aria-label="โปรไฟล์"
        >
          {hasAvatar ? (
            <img src={avatarSrc} alt="โปรไฟล์ผู้ใช้" />
          ) : (
            <IconUserSmall />
          )}
        </button>
      </div>
    </header>
  );
}
