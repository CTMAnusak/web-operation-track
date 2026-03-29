/**
 * Mock DateTime Configuration
 * 
 * ใช้สำหรับ override วันที่และเวลาปัจจุบันในระบบ
 * เพื่อการทดสอบหรือสาธิต
 * 
 * การใช้งาน:
 * - เพื่อเซ็ตวันที่และเวลา: ให้ uncomment บรรทัด MOCK_DATE_TIME และกำหนดค่า
 * - เพื่อใช้วันที่-เวลาปัจจุบัน: ให้ comment บรรทัด MOCK_DATE_TIME หรือลบไฟล์นี้ออก
 */

// Uncomment บรรทัดด้านล่างเพื่อเซ็ตวันที่และเวลาคงที่
export const MOCK_DATE_TIME = new Date(2026, 2, 27, 13, 30, 0); // 26/11/2026 เวลา 11:00:00

// Comment บรรทัดด้านบนและ uncomment บรรทัดด้านล่างเพื่อใช้วันที่-เวลาปัจจุบัน
// export const MOCK_DATE_TIME = null;

/**
 * ฟังก์ชันสำหรับดึงวันที่-เวลาปัจจุบัน
 * จะใช้ MOCK_DATE_TIME ถ้ามีการกำหนด ไม่งั้นจะใช้วันที่-เวลาจริง
 */
export function getCurrentDateTime() {
  return MOCK_DATE_TIME || new Date();
}

/**
 * ฟังก์ชันสำหรับดึงวันที่ปัจจุบัน (เวลา 00:00:00)
 */
export function getCurrentDate() {
  const now = getCurrentDateTime();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
