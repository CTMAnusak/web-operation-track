/**
 * เวลาไทย (Asia/Bangkok, UTC+7) — ใช้บันทึกและแสดงผลให้สอดคล้องทั้งโปรเจกต์
 */

export const THAILAND_TIMEZONE = 'Asia/Bangkok';
const BANGKOK_OFFSET = '+07:00';

function pad2(n) {
  return String(n).padStart(2, '0');
}

/** ส่วนประกอบปฏิทิน/นาฬิกาในโซนไทย */
export function getThailandParts(dateInput) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: THAILAND_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  };
}

/** YYYY-MM-DD ตามปฏิทินไทย */
export function formatBangkokYmd(dateInput) {
  const { year, month, day } = getThailandParts(dateInput);
  return `${year}-${month}-${day}`;
}

/** แสดงเวลา HH:mm ตามเวลาไทย (ไม่ขึ้นกับ timezone เครื่อง) */
export function formatClockThailand(dateInput) {
  if (dateInput === undefined || dateInput === null || dateInput === '') return '--:--';
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '--:--';
  const { hour, minute } = getThailandParts(d);
  return `${hour}:${minute}`;
}

/** HH:mm สำหรับบันทึก endTime ฯลฯ */
export function formatHmThailand(dateInput) {
  return formatClockThailand(dateInput);
}

/**
 * บันทึกเป็น ISO 8601 แบบ offset ไทย +07:00
 * ตัวอย่าง: 2026-03-27T13:30:00+07:00
 */
export function toThailandISOString(dateInput) {
  const { year, month, day, hour, minute, second } = getThailandParts(dateInput);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}${BANGKOK_OFFSET}`;
}

/**
 * ผูกเวลา HH:mm กับวันที่ปฏิทินไทยของจุดอ้างอิง (เช่น วันที่สร้างการ์ด)
 */
export function combineBangkokYmdWithClock(referenceDateInput, hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  const ymd = formatBangkokYmd(referenceDateInput);
  return `${ymd}T${pad2(h)}:${pad2(Number.isNaN(m) ? 0 : m)}:00${BANGKOK_OFFSET}`;
}

/**
 * "วันนี้" ตามปฏิทินไทย — คืน Date ที่แทนวันนั้น (เที่ยงวัน UTC+7) เพื่อใช้เปรียบเทียบช่วงวันที่
 */
export function getBangkokCalendarDate(dateInput) {
  const { year, month, day } = getThailandParts(dateInput);
  return new Date(`${year}-${month}-${day}T12:00:00${BANGKOK_OFFSET}`);
}

/** เปรียบเทียบว่าเป็นวันเดียวกันตามปฏิทินไทย */
export function isSameBangkokCalendarDay(a, b) {
  if (!a || !b) return false;
  return formatBangkokYmd(a) === formatBangkokYmd(b);
}

/** แสดงวันที่ dd/mm/yyyy ตามปฏิทินไทยของ instant นั้น */
export function formatThaiDateDmY(dateInput) {
  if (!dateInput) return '';
  const { day, month, year } = getThailandParts(dateInput);
  return `${day}/${month}/${year}`;
}

/** แปลง appointmentDate แบบ dd/mm/yyyy เป็น sort key yyyy-mm-dd */
export function appointmentDmYToSortKey(str) {
  if (!str) return '';
  const parts = str.split('/');
  if (parts.length !== 3) return '';
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}
