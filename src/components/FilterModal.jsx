import { useEffect, useRef, useState } from 'react';
import DatePickerScreen from './DatePickerScreen';
import branches from '../mock/branches.json';
import { formatThaiDateDmY } from '../config/thailandTime';
import { getDoctorUsers, getParticipantUsers } from '../mock/dataHelpers';
import '../assets/css/components/FilterModal.css';

/* ---- Icons (Heroicons v2 outline) ---- */
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function IconCheckmark() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 9-7 7-7-7" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function IconXSmall() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

/* ---- Static full lists (sorted once at module level) ---- */
const ALL_DOCTOR_USERS = getDoctorUsers()
  .slice()
  .sort((a, b) => (a.nickname ?? a.fullName).localeCompare((b.nickname ?? b.fullName), 'th'));
const ALL_PARTICIPANT_USERS = getParticipantUsers()
  .slice()
  .sort((a, b) => a.fullName.localeCompare(b.fullName, 'th'));

const DOCTOR_SHOW_DEFAULT = 5;
const BRANCHES_SORTED = branches
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

/** สร้าง initials จาก fullName (ตัวแรกของแต่ละคำ) */
function getInitials(fullName) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

function getDoctorDisplayName(doctor) {
  const baseName = doctor.nickname ?? doctor.fullName;
  return baseName.startsWith('หมอ') ? baseName : `หมอ${baseName}`;
}

/* ---- FilterModal ---- */
function FilterModal({ onClose, onConfirm, onClear, initialFilter }) {
  const [dateStart, setDateStart] = useState(initialFilter?.dateStart ?? null);
  const [dateEnd, setDateEnd] = useState(initialFilter?.dateEnd ?? null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [branchOpen, setBranchOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(initialFilter?.branchId ?? '');
  const branchRef = useRef(null);

  const [checkedDoctorIds, setCheckedDoctorIds] = useState(initialFilter?.doctorIds ?? []);
  const [showAllDoctors, setShowAllDoctors] = useState(false);

  const [participantSearch, setParticipantSearch] = useState('');
  const [participantDropdownOpen, setParticipantDropdownOpen] = useState(false);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState(initialFilter?.participantIds ?? []);
  const participantRef = useRef(null);

  /* ---- Lists filtered by selected branch ---- */
  const doctorPool = selectedBranchId
    ? ALL_DOCTOR_USERS.filter((u) => u.branchId === selectedBranchId)
    : ALL_DOCTOR_USERS;

  const participantPool = selectedBranchId
    ? ALL_PARTICIPANT_USERS.filter((u) => u.branchId === selectedBranchId)
    : ALL_PARTICIPANT_USERS;

  const visibleDoctors = showAllDoctors
    ? doctorPool
    : doctorPool.slice(0, DOCTOR_SHOW_DEFAULT);

  const selectedBranch = BRANCHES_SORTED.find((b) => b.id === selectedBranchId);
  const dateDisplayValue = dateStart
    ? `${formatThaiDateDmY(dateStart)} - ${formatThaiDateDmY(dateEnd ?? dateStart)}`
    : '';

  /* reset doctor/participant selections when branch changes */
  useEffect(() => {
    setCheckedDoctorIds([]);
    setSelectedParticipantIds([]);
    setShowAllDoctors(false);
    setParticipantSearch('');
    setParticipantDropdownOpen(false);
  }, [selectedBranchId]);

  /* close dropdowns on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (branchRef.current && !branchRef.current.contains(e.target)) {
        setBranchOpen(false);
      }
      if (participantRef.current && !participantRef.current.contains(e.target)) {
        setParticipantDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleDoctor(id) {
    setCheckedDoctorIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function handleClear() {
    setDateStart(null);
    setDateEnd(null);
    setSelectedBranchId('');
    setCheckedDoctorIds([]);
    setParticipantSearch('');
    setSelectedParticipantIds([]);
    setParticipantDropdownOpen(false);
    onClear?.();
  }

  function handleConfirm() {
    onConfirm?.({
      dateStart,
      dateEnd,
      branchId: selectedBranchId,
      doctorIds: checkedDoctorIds,
      participantIds: selectedParticipantIds,
    });
    onClose();
  }

  function toggleParticipant(id) {
    setSelectedParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function removeParticipant(id) {
    setSelectedParticipantIds((prev) => prev.filter((p) => p !== id));
  }

  const filteredParticipants = participantPool.filter((u) =>
    u.fullName.toLowerCase().includes(participantSearch.toLowerCase())
  );

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleDateSave({ start, end }) {
    setDateStart(start);
    setDateEnd(end);
    setShowDatePicker(false);
  }

  if (showDatePicker) {
    return (
      <DatePickerScreen
        initialStart={dateStart}
        initialEnd={dateEnd}
        onBack={() => setShowDatePicker(false)}
        onSave={handleDateSave}
      />
    );
  }

  return (
    <div className="filter-modal-overlay" onClick={handleOverlayClick}>
      <div className="filter-modal">
        {/* Header */}
        <div className="filter-modal__header">
          <h2 className="filter-modal__title">กรองข้อมูล</h2>
          <button className="filter-modal__close-btn" aria-label="ปิด" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="filter-modal__scroll">
          <div className="filter-modal__body">

            {/* วันที่ */}
            <div>
              <p className="filter-modal__section-label">วันที่</p>
              <div
                className="filter-modal__date-input-wrap"
                onClick={() => setShowDatePicker(true)}
              >
                <input
                  type="text"
                  className="filter-modal__date-input"
                  placeholder="เลือกวันที่ดูข้อมูล"
                  value={dateDisplayValue}
                  readOnly
                />
                <span className="filter-modal__date-icon">
                  <IconCalendar />
                </span>
              </div>
            </div>

            {/* สาขา — dropdown */}
            <div>
              <p className="filter-modal__section-label">สาขา</p>
              <div className="filter-modal__branch-wrap" ref={branchRef}>
                <button
                  type="button"
                  className={`filter-modal__branch-trigger${!selectedBranch ? ' filter-modal__branch-trigger--placeholder' : ''}`}
                  onClick={() => setBranchOpen((v) => !v)}
                >
                  {selectedBranch ? selectedBranch.name : 'เลือกสาขา'}
                </button>
                <span className={`filter-modal__branch-chevron${branchOpen ? ' filter-modal__branch-chevron--open' : ''}`}>
                  <IconChevronDown />
                </span>

                {branchOpen && (
                  <div className="filter-modal__branch-dropdown">
                    {BRANCHES_SORTED.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={`filter-modal__branch-option${selectedBranchId === b.id ? ' filter-modal__branch-option--selected' : ''}`}
                        onClick={() => {
                          setSelectedBranchId(b.id);
                          setBranchOpen(false);
                        }}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* แพทย์ — จาก users ที่มี roleId === 'r1' */}
            <div>
              <p className="filter-modal__section-label">แพทย์</p>
              <div className="filter-modal__checkbox-list">
                {visibleDoctors.map((doctor) => {
                  const checked = checkedDoctorIds.includes(doctor.id);
                  return (
                    <label
                      key={doctor.id}
                      className={`filter-modal__checkbox-item${checked ? ' filter-modal__checkbox-item--checked' : ''}`}
                      onClick={() => toggleDoctor(doctor.id)}
                    >
                      <span className="filter-modal__checkbox-box">
                        {checked && <IconCheckmark />}
                      </span>
                      <span className="filter-modal__checkbox-label">{getDoctorDisplayName(doctor)}</span>
                    </label>
                  );
                })}
              </div>
              {doctorPool.length > DOCTOR_SHOW_DEFAULT && (
                <button
                  className="filter-modal__view-more-btn"
                  onClick={() => setShowAllDoctors((v) => !v)}
                >
                  {showAllDoctors ? 'ซ่อนเพิ่มเติม' : 'View more'}
                  <IconChevronDown />
                </button>
              )}
            </div>

            {/* ผู้ร่วมทำหัตถการ */}
            <div>
              <p className="filter-modal__section-label">ผู้ร่วมทำหัตถการ</p>
              <div className="filter-modal__participant-wrap" ref={participantRef}>
                <div className="filter-modal__participant-search-wrap">
                  <span className="filter-modal__participant-search-icon">
                    <IconSearch />
                  </span>
                  <input
                    type="text"
                    className="filter-modal__participant-search-input"
                    placeholder="ค้นหาผู้ร่วมทำหัตถการ"
                    value={participantSearch}
                    onChange={(e) => {
                      setParticipantSearch(e.target.value);
                      setParticipantDropdownOpen(true);
                    }}
                    onFocus={() => setParticipantDropdownOpen(true)}
                  />
                </div>

                {participantDropdownOpen && filteredParticipants.length > 0 && (
                  <div className="filter-modal__participant-dropdown">
                    {filteredParticipants.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        className={`filter-modal__participant-option${selectedParticipantIds.includes(u.id) ? ' filter-modal__participant-option--selected' : ''}`}
                        onClick={() => {
                          toggleParticipant(u.id);
                          setParticipantSearch('');
                          setParticipantDropdownOpen(false);
                        }}
                      >
                        {u.fullName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedParticipantIds.length > 0 && (
                <div className="filter-modal__participant-chips">
                  {selectedParticipantIds.map((id) => {
                    const u = ALL_PARTICIPANT_USERS.find((p) => p.id === id);
                    if (!u) return null;
                    return (
                      <div key={id} className="filter-modal__participant-chip">
                        <div className="filter-modal__participant-chip-avatar">
                          {getInitials(u.fullName)}
                        </div>
                        <span className="filter-modal__participant-chip-name">{u.fullName}</span>
                        <button
                          type="button"
                          className="filter-modal__participant-chip-remove"
                          onClick={() => removeParticipant(id)}
                          aria-label="ลบ"
                        >
                          <IconXSmall />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="filter-modal__footer">
          <button className="filter-modal__btn-clear" onClick={handleClear}>
            ล้างการค้นหา
          </button>
          <button className="filter-modal__btn-confirm" onClick={handleConfirm}>
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;
