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

// Uncomment บรรทัดด้านล่างเพื่อเซ็ตวันที่และเวลาคงที่ (เวลาไทย)
export const MOCK_DATE_TIME = new Date('2026-03-27T13:30:00+07:00'); // 27/03/2026 เวลา 13:30 น. (ไทย)

// Comment บรรทัดด้านบนและ uncomment บรรทัดด้านล่างเพื่อใช้วันที่-เวลาปัจจุบัน
// export const MOCK_DATE_TIME = null;

/**
 * ฟังก์ชันสำหรับดึงวันที่-เวลาปัจจุบัน
 * จะใช้ MOCK_DATE_TIME ถ้ามีการกำหนด ไม่งั้นจะใช้วันที่-เวลาจริง
 */
export function getCurrentDateTime() {
  //return MOCK_DATE_TIME || new Date();
  return getBangkokCalendarDate(getCurrentDateTime());
}

/**
 * วันที่ปัจจุบันตามปฏิทินไทย (ใช้กรอง Dashboard / DatePicker)
 */
export function getCurrentDate() {
  
}
