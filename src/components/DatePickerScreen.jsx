import { useState } from 'react';
import { getCurrentDate } from '../config/mockDateTime';
import { formatThaiDateDmY, formatBangkokYmd } from '../config/thailandTime';
import '../assets/css/components/DatePickerScreen.css';

/* ---- Icons (Heroicons v2 outline) ---- */
function IconArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 19-7-7 7-7" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconCalendarSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

/* ---- Constants ---- */
const DOW_LABELS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

/* ---- Helpers ---- */
function toDateOnly(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function buildCalendarCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const cells = [];

  for (let i = 0; i < startDow; i++) {
    const d = new Date(year, month, 1 - (startDow - i));
    cells.push({ date: d, outside: true });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({ date: new Date(year, month, d), outside: false });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      cells.push({ date: new Date(year, month + 1, i), outside: true });
    }
  }
  return cells;
}

/* ---- DatePickerScreen ---- */
function DatePickerScreen({ onBack, onSave, initialStart = null, initialEnd = null }) {
  const today = toDateOnly(getCurrentDate());
  const todayBangkokYmd = formatBangkokYmd(getCurrentDate());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);

  const cells = buildCalendarCells(viewYear, viewMonth);
  const thaiYear = viewYear + 543;
  const monthLabel = `${THAI_MONTHS[viewMonth]} ${thaiYear}`;

  function handlePrevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function handleNextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function handleDayClick(cell) {
    if (cell.outside) return;
    const d = toDateOnly(cell.date);
    if (!startDate || (startDate && endDate)) {
      setStartDate(d);
      setEndDate(null);
    } else {
      if (d < startDate) {
        setEndDate(startDate);
        setStartDate(d);
      } else {
        setEndDate(d);
      }
    }
  }

  function getCellModifier(cell) {
    const d = toDateOnly(cell.date);
    if (isSameDay(d, startDate) && endDate) return 'range-start';
    if (isSameDay(d, endDate)) return 'range-end';
    if (isSameDay(d, startDate) && !endDate) return 'selected-single';
    if (startDate && endDate && d > startDate && d < endDate) return 'in-range';
    return null;
  }

  function handleSave() {
    if (!startDate) return;
    onSave({ start: startDate, end: endDate ?? startDate });
  }

  return (
    <div className="date-picker-screen">
      {/* Top bar */}
      <div className="date-picker-screen__topbar">
        <button className="date-picker-screen__back-btn" aria-label="ย้อนกลับ" onClick={onBack}>
          <IconArrowLeft />
        </button>
        <span className="date-picker-screen__back-label">กลับหน้ากรองข้อมูล</span>
      </div>

      {/* Card */}
      <div className="date-picker-screen__card">
        {/* Date range inputs */}
        <div className="date-picker-screen__range-row">
          <div>
            <div className="date-picker-screen__range-col-label">วันที่เริ่มต้น</div>
            <div className="date-picker-screen__range-input-wrap">
              <input
                className="date-picker-screen__range-input"
                readOnly
                value={formatThaiDateDmY(startDate)}
                placeholder="วว/ดด/ปปปป"
              />
              <span className="date-picker-screen__range-icon"><IconCalendarSmall /></span>
            </div>
          </div>
          <div>
            <div className="date-picker-screen__range-col-label">วันที่เสร็จสิ้น</div>
            <div className="date-picker-screen__range-input-wrap">
              <input
                className="date-picker-screen__range-input"
                readOnly
                value={formatThaiDateDmY(endDate)}
                placeholder="วว/ดด/ปปปป"
              />
              <span className="date-picker-screen__range-icon"><IconCalendarSmall /></span>
            </div>
          </div>
        </div>

        {/* Month navigation */}
        <div className="date-picker-screen__month-nav">
          <button className="date-picker-screen__month-nav-btn" onClick={handlePrevMonth}>
            <IconChevronLeft />
          </button>
          <span className="date-picker-screen__month-label">{monthLabel}</span>
          <button className="date-picker-screen__month-nav-btn" onClick={handleNextMonth}>
            <IconChevronRight />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="date-picker-screen__cal-grid">
          <div className="date-picker-screen__cal-header">
            {DOW_LABELS.map((d) => (
              <div key={d} className="date-picker-screen__cal-dow">{d}</div>
            ))}
          </div>
          <div className="date-picker-screen__cal-days">
            {cells.map((cell, idx) => {
              const modifier = getCellModifier(cell);
              const isOutside = cell.outside;
              const isToday = !isOutside && formatBangkokYmd(cell.date) === todayBangkokYmd;
              let cellClass = 'date-picker-screen__cal-cell';
              if (isOutside) cellClass += ' date-picker-screen__cal-cell--outside';
              if (modifier) cellClass += ` date-picker-screen__cal-cell--${modifier}`;
              if (isToday && !modifier) cellClass += ' date-picker-screen__cal-cell--today';

              return (
                <div key={idx} className={cellClass} onClick={() => handleDayClick(cell)}>
                  <span className="date-picker-screen__cal-day">
                    {cell.date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          className="date-picker-screen__save-btn"
          onClick={handleSave}
          disabled={!startDate}
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}

export default DatePickerScreen;
