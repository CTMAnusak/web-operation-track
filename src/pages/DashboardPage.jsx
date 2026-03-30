import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileLayout from '../layouts/MobileLayout';
import { routePaths } from '../routes/routePaths';
import FilterModal from '../components/FilterModal';
import ProfileModal from '../components/ProfileModal';
import DashboardHeader from '../components/DashboardHeader';
import { SearchOverlay, QRScannerOverlay, saveHistory } from '../components/SearchQrOverlays';
import logoImg from '../assets/images/logo-vtrack.png';
import { resolveAvatarUrl } from '../utils/avatarResolve';
import illustrationImg from '../assets/images/illustration-opd-empty.png';
import customers from '../mock/customers.json';
import {
  getBranchName,
  getDoctorNickname,
  getUsersByIds,
  calcTotalDuration,
  getRoleName,
  getBranchFullName,
  getAggregatedParticipantIdsFromProcedures,
} from '../mock/dataHelpers';
import { deriveCustomerDisplayStatus, getEffectiveProceduresForMetrics } from '../mock/procedureEffectiveStatus';
import { getCurrentDate } from '../config/mockDateTime';
import {
  isSameBangkokCalendarDay,
  formatThaiDateDmY,
  formatBangkokYmd,
  appointmentDmYToSortKey,
} from '../config/thailandTime';
import '../assets/css/pages/dashboard.css';
import '../assets/css/pages/OpdDetailPage.css';

/* ---- Icons (Heroicons v2 outline) ---- */
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

function IconUser() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

/* ---- Date helpers (ปฏิทินไทย / Asia/Bangkok) ---- */
function buildDateLabel(dateStart, dateEnd) {
  if (!dateStart) return null;
  const today = getCurrentDate();
  const end = dateEnd ?? dateStart;
  if (isSameBangkokCalendarDay(dateStart, end)) {
    if (isSameBangkokCalendarDay(dateStart, today)) return 'วันนี้';
    return formatThaiDateDmY(dateStart);
  }
  return `${formatThaiDateDmY(dateStart)} - ${formatThaiDateDmY(end)}`;
}

/* ---- Filter logic ---- */
function applyFilters(list, filterState) {
  if (!filterState) return [];
  let result = [...list];

  if (filterState.dateStart) {
    const start = filterState.dateStart;
    const end = filterState.dateEnd ?? filterState.dateStart;
    result = result.filter((c) => {
      const key = appointmentDmYToSortKey(c.appointmentDate);
      if (!key) return false;
      const startKey = formatBangkokYmd(start);
      const endKey = formatBangkokYmd(end);
      return key >= startKey && key <= endKey;
    });
  }

  if (filterState.branchId) {
    result = result.filter((c) => c.branchId === filterState.branchId);
  }

  if (filterState.doctorIds && filterState.doctorIds.length > 0) {
    result = result.filter((c) => filterState.doctorIds.includes(c.doctorId));
  }

  if (filterState.participantIds && filterState.participantIds.length > 0) {
    const wanted = new Set(filterState.participantIds);
    result = result.filter((c) => {
      const agg = getAggregatedParticipantIdsFromProcedures(c.procedures || []);
      return agg.some((id) => wanted.has(id));
    });
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
    const key = statusMap[deriveCustomerDisplayStatus(c)] || 'pending';
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
  const displayStatus = deriveCustomerDisplayStatus(customer);
  const modifier = statusBadgeModifier(displayStatus);
  const collaboratorIds = getAggregatedParticipantIdsFromProcedures(customer.procedures || []);
  const collaborators = getUsersByIds(collaboratorIds);
  const { hours, minutes, hasAny } = calcTotalDuration(getEffectiveProceduresForMetrics(customer));

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
                  <img src={resolveAvatarUrl(u.avatarUrl)} alt={u.nickname} />
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
            {displayStatus}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---- Default filter builder ---- */
function buildDefaultFilter(user) {
  const today = getCurrentDate();
  return {
    dateStart: today,
    dateEnd: today,
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
    isSameBangkokCalendarDay(activeFilter.dateStart, defaultFilter.dateStart) &&
    isSameBangkokCalendarDay(activeFilter.dateEnd ?? activeFilter.dateStart, defaultFilter.dateEnd) &&
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
          avatarSrc={resolveAvatarUrl(user.avatarUrl)}
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
