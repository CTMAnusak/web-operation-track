/**
 * Mock DateTime Configuration
 *
 * ใช้สำหรับ override วันที่และเวลาปัจจุบันในระบบ
 * เพื่อการทดสอบหรือสาธิต
 *
 * การใช้งาน:
 * - เพื่อเซ็ตวันที่และเวลา: ให้ uncomment บรรทัด MOCK_DATE_TIME และกำหนดค่าเป็นเวลาไทย (+07:00)
 * - เพื่อใช้วันที่-เวลาปัจจุบัน: ให้ comment บรรทัด MOCK_DATE_TIME หรือลบไฟล์นี้ออก
 */

import { getBangkokCalendarDate } from './thailandTime';

// Uncomment บรรทัดด้านล่างเพื่อ mock "วันที่" แต่ใช้ "เวลา" ปัจจุบัน (เวลาไทย +07:00)
export const MOCK_DATE_ONLY_BANGKOK_YMD = '2026-03-27'; // 27/03/2026

// Uncomment บรรทัดด้านล่างเพื่อเซ็ต "วันที่และเวลา" คงที่ (เวลาไทย +07:00)
// export const MOCK_DATE_TIME = new Date('2026-03-27T13:30:00+07:00'); // 27/03/2026 เวลา 13:30 น. (ไทย)

// Comment บรรทัดด้านบนและใช้ null เพื่อใช้วันที่-เวลาปัจจุบัน
export const MOCK_DATE_TIME = null;

function pad2(n) {
  return String(n).padStart(2, '0');
}

function getBangkokClockParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const hour = Number(map.hour);
  const minute = Number(map.minute);
  const second = Number(map.second);
  return {
    hour: Number.isFinite(hour) ? hour : 0,
    minute: Number.isFinite(minute) ? minute : 0,
    second: Number.isFinite(second) ? second : 0,
  };
}

/**
 * ฟังก์ชันสำหรับดึงวันที่-เวลาปัจจุบัน
 * จะใช้ MOCK_DATE_TIME ถ้ามีการกำหนด ไม่งั้นจะใช้วันที่-เวลาจริง
 */
export function getCurrentDateTime() {
  if (MOCK_DATE_TIME) return MOCK_DATE_TIME;

  if (MOCK_DATE_ONLY_BANGKOK_YMD) {
    const now = new Date();
    const { hour, minute, second } = getBangkokClockParts(now);
    // ผูกวันที่ตาม MOCK_DATE_ONLY_BANGKOK_YMD แต่เวลาใช้เวลาปัจจุบันของไทย (+07:00)
    return new Date(
      `${MOCK_DATE_ONLY_BANGKOK_YMD}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}+07:00`
    );
  }

  return new Date();
}

/**
 * วันที่ปัจจุบันตามปฏิทินไทย (ใช้กรอง Dashboard / DatePicker)
 */
export function getCurrentDate() {
  return getBangkokCalendarDate(getCurrentDateTime());
}
