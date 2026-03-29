import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileLayout from '../layouts/MobileLayout';
import { routePaths } from '../routes/routePaths';
import FilterModal from '../components/FilterModal';
import ProfileModal from '../components/ProfileModal';
import logoImg from '../assets/images/logo-vtrack.png';
import avatarImg from '../assets/images/avatar-user.png';
import illustrationImg from '../assets/images/illustration-opd-empty.png';
import customers from '../mock/customers.json';
import { getBranchName, getDoctorNickname, getUsersByIds, calcTotalDuration, getRoleName, getBranchFullName } from '../mock/dataHelpers';
import '../assets/css/pages/dashboard.css';
import '../assets/css/pages/OpdDetailPage.css';

/* ---- Icons (Heroicons v2 outline) ---- */
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

function IconCalendar() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
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

function IconUser() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
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

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function IconArrowUpLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 9 6.196 6.196M15 9H9v6" />
    </svg>
  );
}

/* ---- Search history helpers ---- */
const HISTORY_KEY = 'searchHistory';

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(hn) {
  const prev = getHistory().filter((h) => h !== hn);
  const next = [hn, ...prev].slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function removeHistory(hn) {
  const next = getHistory().filter((h) => h !== hn);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

/* ---- SearchOverlay ---- */
function SearchOverlay({ onClose, onSelect }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState(getHistory);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();
  const results = q
    ? customers.filter((c) =>
        c.hn.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
      )
    : [];

  const isTyping = query.trim().length > 0;

  function handleSelectResult(customer) {
    saveHistory(customer.hn);
    onSelect(customer);
  }

  function handleFillFromHistory(hn) {
    const found = customers.find((c) => c.hn === hn);
    if (found) {
      handleSelectResult(found);
    } else {
      setQuery(hn);
      inputRef.current?.focus();
    }
  }

  function handleRemoveHistory(e, hn) {
    e.stopPropagation();
    removeHistory(hn);
    setHistory(getHistory());
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay__topbar">
        <button
          className="search-overlay__back-btn"
          aria-label="ย้อนกลับ"
          onClick={onClose}
        >
          <IconBack />
        </button>
        <div className="search-overlay__input-wrap">
          <input
            ref={inputRef}
            className="search-overlay__input"
            type="text"
            placeholder="ค้นหาข้อมูลลูกค้า ใน V Track"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="search-overlay__list">
        {!isTyping &&
          history.map((hn) => {
            const histCustomer = customers.find((c) => c.hn === hn);
            return (
              <button
                key={hn}
                className="search-overlay__item"
                onClick={() => handleFillFromHistory(hn)}
              >
                <span className="search-overlay__item-icon"><IconClock /></span>
                {histCustomer ? (
                  <span className="search-overlay__item-label-wrap">
                    <span className="search-overlay__item-label">{histCustomer.name}</span>
                    <span className="search-overlay__item-sublabel">HN {hn}</span>
                  </span>
                ) : (
                  <span className="search-overlay__item-label">{hn}</span>
                )}
                <span
                  className="search-overlay__item-action"
                  role="button"
                  tabIndex={0}
                  aria-label="ลบประวัติ"
                  onClick={(e) => handleRemoveHistory(e, hn)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRemoveHistory(e, hn); }}
                >
                  <IconClose />
                </span>
              </button>
            );
          })}

        {isTyping &&
          results.map((customer) => (
            <button
              key={customer.hn}
              className="search-overlay__item"
              onClick={() => handleSelectResult(customer)}
            >
              <span className="search-overlay__item-icon"><IconSearch /></span>
              <span className="search-overlay__item-label-wrap">
                <span className="search-overlay__item-label">{customer.name}</span>
                <span className="search-overlay__item-sublabel">HN {customer.hn}</span>
              </span>
              <span className="search-overlay__item-action"><IconArrowUpLeft /></span>
            </button>
          ))}
      </div>
    </div>
  );
}

/* ---- QR Scanner Overlay ---- */
function QRScannerOverlay({ onClose, onScan }) {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [cameraError, setCameraError] = useState('');

  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setCameraError('ไม่สามารถเข้าถึงกล้องได้');
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!scanning) return;
    const timer = setTimeout(() => {
      setScanning(false);
      const mockHN = '62173489';
      const customer = customers.find(c => c.hn === mockHN);
      if (customer) {
        setTimeout(() => {
          onScan(customer);
        }, 500);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [scanning, onScan]);

  return (
    <div className="qr-scanner-fullscreen-overlay">
      <div className="qr-modal">
        <div className="qr-modal__topnav">
          <button className="opd-detail__back-btn" onClick={onClose}>
            <IconBack />
            <span>กลับหน้าหลัก</span>
          </button>
        </div>
        <div className="qr-modal__body">
          <h2 className="qr-modal__title">ค้นหาผู้ร่วมทำหัตถการ</h2>
          <div className="qr-modal__frame">
            <div className="qr-corner qr-corner--tl" />
            <div className="qr-corner qr-corner--tr" />
            <div className="qr-corner qr-corner--bl" />
            <div className="qr-corner qr-corner--br" />
            {scanning ? (
              <div className="qr-modal__placeholder">
                <video ref={videoRef} className="qr-modal__video" autoPlay playsInline muted />
                <div className="qr-modal__scan-line" />
                {cameraError && <div className="qr-modal__camera-error">{cameraError}</div>}
              </div>
            ) : (
              <div className="qr-modal__found">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#3F8CFF" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
                <p>พบผู้ใช้แล้ว</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Date helpers ---- */
function parseThaiDate(str) {
  if (!str) return null;
  const [dd, mm, yyyy] = str.split('/');
  if (!dd || !mm || !yyyy) return null;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

function formatThai(date) {
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildDateLabel(dateStart, dateEnd) {
  if (!dateStart) return null;
  const today = new Date();
  const end = dateEnd ?? dateStart;
  if (isSameDay(dateStart, end)) {
    if (isSameDay(dateStart, today)) return 'วันนี้';
    return formatThai(dateStart);
  }
  return `${formatThai(dateStart)} - ${formatThai(end)}`;
}

/* ---- Filter logic ---- */
function applyFilters(list, filterState) {
  if (!filterState) return [];
  let result = [...list];

  if (filterState.dateStart) {
    const start = filterState.dateStart;
    const end = filterState.dateEnd ?? filterState.dateStart;
    result = result.filter((c) => {
      const d = parseThaiDate(c.appointmentDate);
      if (!d) return false;
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return dDay >= startDay && dDay <= endDay;
    });
  }

  if (filterState.branchId) {
    result = result.filter((c) => c.branchId === filterState.branchId);
  }

  if (filterState.doctorIds && filterState.doctorIds.length > 0) {
    result = result.filter((c) => filterState.doctorIds.includes(c.doctorId));
  }

  return result;
}

/* ---- Summary helpers ---- */
function computeSummaryFromList(list) {
  const base = { all: 0, pending: 0, inProgress: 0, done: 0 };
  if (!list || list.length === 0) return base;
  const statusMap = {
    'รอดำเนินการ': 'pending',
    'กำลังทำ': 'inProgress',
    'เสร็จสิ้น': 'done',
  };
  return list.reduce((acc, c) => {
    const key = statusMap[c.status] || 'pending';
    acc.all += 1;
    acc[key] += 1;
    return acc;
  }, { ...base });
}

function statusBadgeModifier(status) {
  if (status === 'เสร็จสิ้น') return 'done';
  if (status === 'กำลังทำ') return 'in-progress';
  return 'pending';
}

/* ---- Sub-components ---- */
function DashboardHeader({ logoSrc, avatarSrc, selectedCustomer, onSearchClick, onQRClick, onClearSearch, onAvatarClick }) {
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
            className="dashboard__header-icon-btn"
            aria-label="ค้นหา"
            onClick={onSearchClick}
          >
            <IconSearch />
          </button>
        )}
        <button className="dashboard__header-icon-btn" aria-label="QR Code" onClick={onQRClick}>
          <IconQR />
        </button>
        <button 
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

function DatePickerCard({ label }) {
  return (
    <div className="dashboard__date-card">
      <span className="dashboard__date-card-icon">
        <IconCalendar />
      </span>
      <span className="dashboard__date-card-label">{label || 'วันนี้'}</span>
    </div>
  );
}

function SummaryCards({ summary }) {
  const cards = [
    { id: 'all', modifier: 'all', label: 'ทั้งหมด', value: summary.all },
    { id: 'pending', modifier: 'pending', label: 'รอดำเนินการ', value: summary.pending },
    { id: 'in-progress', modifier: 'in-progress', label: 'กำลังทำ', value: summary.inProgress },
    { id: 'done', modifier: 'done', label: 'เสร็จสิ้น', value: summary.done },
  ];

  return (
    <div className="dashboard__summary-grid">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`dashboard__summary-card dashboard__summary-card--${card.modifier}`}
        >
          <span className="dashboard__summary-card-label">{card.label}</span>
          <span className="dashboard__summary-card-value">{card.value}</span>
        </div>
      ))}
    </div>
  );
}

function OpdEmptyState({ illustrationSrc }) {
  return (
    <div className="dashboard__empty-state">
      <img
        src={illustrationSrc}
        alt="ไม่มีรายการ OPD"
        className="dashboard__empty-illustration"
      />
      <div className="dashboard__empty-text">
        <p>ยังไม่มีรายการ OPD</p>
        <p>กรุณาเพิ่มชื่อลูกค้าในระบบ</p>
      </div>
    </div>
  );
}

function OpdCard({ customer, onClick }) {
  const modifier = statusBadgeModifier(customer.status);
  const collaborators = getUsersByIds(customer.collaboratorIds || []);
  const { hours, minutes, hasAny } = calcTotalDuration(customer.procedures || []);

  const durationLabel = hasAny && (hours > 0 || minutes > 0)
    ? `${hours > 0 ? `${hours}.${String(minutes).padStart(2, '0')}` : `0.${String(minutes).padStart(2, '0')}`} ชม.`
    : '-';

  return (
    <div className="opd-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Top: avatar + info + branch/doctor */}
      <div className="opd-card__top">
        <div className="opd-card__avatar">
          <IconUser />
        </div>
        <div className="opd-card__info">
          <div className="opd-card__hn-row">เลขที่ {customer.hn}</div>
          <div className="opd-card__name">{customer.name}</div>
          <div className="opd-card__sub">{customer.subLabel}</div>
        </div>
        <div className="opd-card__branch-col">
          <span className="opd-card__branch-label">สาขา {getBranchName(customer.branchId)}</span>
          <span className="opd-card__doctor-label">{getDoctorNickname(customer.doctorId)}</span>
        </div>
      </div>

      {/* Mid: date / time / participants */}
      <div className="opd-card__mid">
        <div>
          <div className="opd-card__field-label">วันที่</div>
          <div className="opd-card__field-value">{customer.appointmentDate}</div>
        </div>
        <div>
          <div className="opd-card__field-label">นัดหมาย</div>
          <div className="opd-card__field-value">{customer.appointmentTime} น.</div>
        </div>
        <div>
          <div className="opd-card__field-label">ผู้ร่วมทำ</div>
          <div className="opd-card__field-avatars">
            {collaborators.length > 0 ? (
              collaborators.map((u) => (
                <div key={u.id} className="opd-card__participant-avatar" title={u.fullName}>
                  {u.nickname.charAt(0).toUpperCase()}
                </div>
              ))
            ) : (
              <span className="opd-card__field-value">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: duration / procedures / status */}
      <div className="opd-card__bottom">
        <div>
          <div className="opd-card__field-label">เวลารวม</div>
          <div className="opd-card__duration-value">{durationLabel}</div>
        </div>
        <div>
          <div className="opd-card__field-label">หัตถการ</div>
          <div className="opd-card__procedures-value">
            {(customer.procedures || []).length} รายการ
          </div>
        </div>
        <div>
          <span className={`opd-card__status-badge opd-card__status-badge--${modifier}`}>
            {customer.status}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---- Default filter builder ---- */
function buildDefaultFilter(user) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return {
    dateStart: todayStart,
    dateEnd: todayStart,
    branchId: user?.branchId ?? '',
    doctorIds: [],
    participantIds: [],
  };
}

/* ---- DashboardPage ---- */
function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  /* search: HN ที่ผู้ใช้เลือกจากหน้า CustomerSearchPage */
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  /* filter: เริ่มต้น null แล้วจะถูก set เป็น default filter เมื่อรู้ว่า user เป็นใคร */
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [qrOpen, setQROpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate(routePaths.login);
    } else {
      const parsed = JSON.parse(currentUser);
      setUser(parsed);
      setActiveFilter((prev) => prev ?? buildDefaultFilter(parsed));
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.selectedCustomer) {
      setSelectedCustomer(location.state.selectedCustomer);
      window.history.replaceState({}, '');
    }
    if (location.state?.returnState) {
      const { selectedCustomer: sc, activeFilter: af } = location.state.returnState;
      if (sc !== undefined) setSelectedCustomer(sc);
      if (af !== undefined) setActiveFilter(af);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  if (!user) return null;

  const defaultFilter = buildDefaultFilter(user);

  /* ---- ตรรกะแสดงผล ---- */
  const hasSearch = selectedCustomer !== null;
  const effectiveFilter = activeFilter ?? defaultFilter;

  /* ไอคอน filter จะเปลี่ยนสีเมื่อ user แก้ไข filter ให้ต่างจาก default */
  const isDefaultFilter = !activeFilter || (
    isSameDay(activeFilter.dateStart, defaultFilter.dateStart) &&
    isSameDay(activeFilter.dateEnd ?? activeFilter.dateStart, defaultFilter.dateEnd) &&
    activeFilter.branchId === defaultFilter.branchId &&
    activeFilter.doctorIds.length === 0 &&
    activeFilter.participantIds.length === 0
  );

  const baseList = hasSearch ? [selectedCustomer] : customers;
  const displayList = applyFilters(baseList, effectiveFilter);

  const summary = computeSummaryFromList(displayList);
  const dateLabel = buildDateLabel(effectiveFilter.dateStart, effectiveFilter.dateEnd);

  function handleSearchClick() {
    setSearchOpen(true);
  }

  function handleSearchSelect(customer) {
    setSelectedCustomer(customer);
    setSearchOpen(false);
  }

  function handleClearSearch() {
    setSelectedCustomer(null);
  }

  function handleFilterConfirm(filterState) {
    setActiveFilter(filterState);
  }

  function handleFilterClear() {
    setActiveFilter(buildDefaultFilter(user));
    setFilterOpen(false);
  }

  function handleQRClick() {
    setQROpen(true);
  }

  function handleQRClose() {
    setQROpen(false);
  }

  function handleQRScan(customer) {
    setSelectedCustomer(customer);
    saveHistory(customer.hn);
    setQROpen(false);
  }

  function handleAvatarClick() {
    setProfileOpen(true);
  }

  function handleProfileClose() {
    setProfileOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    navigate(routePaths.login);
  }

  return (
    <MobileLayout>
      <div className="dashboard">
        <DashboardHeader
          logoSrc={logoImg}
          avatarSrc={user.avatarUrl || avatarImg}
          selectedCustomer={selectedCustomer}
          onSearchClick={handleSearchClick}
          onQRClick={handleQRClick}
          onClearSearch={handleClearSearch}
          onAvatarClick={handleAvatarClick}
        />

        <main className="dashboard__body">
          <div className="dashboard__title-row">
            <h1 className="dashboard__title">สรุปรายงาน</h1>
            <button
              className={`dashboard__filter-btn${!isDefaultFilter ? ' dashboard__filter-btn--active' : ''}`}
              aria-label="กรองข้อมูล"
              onClick={() => setFilterOpen(true)}
            >
              <IconFilter />
            </button>
          </div>

          <DatePickerCard label={dateLabel} />

          <SummaryCards summary={summary} />

          <div className="dashboard__opd-list">
            <h2 className="dashboard__section-title">รายการ OPD</h2>
            {displayList.length > 0 ? (
              displayList.map((c) => (
                <OpdCard
                  key={c.hn}
                  customer={c}
                  onClick={() => navigate(`/opd/${c.hn}`, {
                    state: {
                      customer: c,
                      returnState: { selectedCustomer, activeFilter },
                    },
                  })}
                />
              ))
            ) : (
              <OpdEmptyState illustrationSrc={illustrationImg} />
            )}
          </div>
        </main>
      </div>

      {filterOpen && (
        <FilterModal
          initialFilter={effectiveFilter}
          onClose={() => setFilterOpen(false)}
          onConfirm={handleFilterConfirm}
          onClear={handleFilterClear}
        />
      )}

      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onSelect={handleSearchSelect}
        />
      )}

      {qrOpen && (
        <QRScannerOverlay onClose={handleQRClose} onScan={handleQRScan} />
      )}

      {profileOpen && (
        <ProfileModal
          user={{
            fullName: user.fullName,
            nickname: user.nickname,
            role: user.role || getRoleName(user.roleId),
            branchName: `สาขา${user.branch ? getBranchFullName(user.branchId) : getBranchFullName(user.branchId)} (${getBranchName(user.branchId)})`
          }}
          avatarUrl={user.avatarUrl}
          onClose={handleProfileClose}
          onLogout={handleLogout}
        />
      )}
    </MobileLayout>
  );
}

export default DashboardPage;
