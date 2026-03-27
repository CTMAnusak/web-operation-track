import branches from './branches.json';
import roles from './roles.json';
import users from '../../db.json';

/** หา branch name จาก branchId */
export function getBranchName(branchId) {
  return branches.find((b) => b.id === branchId)?.name ?? branchId;
}

/** หา role name จาก roleId */
export function getRoleName(roleId) {
  return roles.find((r) => r.id === roleId)?.name ?? roleId;
}

/** หา user จาก userId */
export function getUserById(userId) {
  return users.users.find((u) => u.id === userId) ?? null;
}

/** รายการแพทย์ทั้งหมด (roleId === 'r1') */
export function getDoctorUsers() {
  return users.users.filter((u) => u.roleId === 'r1');
}

/** รายการผู้ร่วมทำหัตถการ (roleId r2=พยาบาล, r3=ผู้ช่วยแพทย์, r4=นักกายภาพ) */
export function getParticipantUsers() {
  return users.users.filter((u) => ['r2', 'r3', 'r4'].includes(u.roleId));
}

/** ชื่อแพทย์จาก doctorId */
export function getDoctorName(doctorId) {
  const u = getUserById(doctorId);
  return u ? u.fullName : doctorId;
}

/** ชื่อเล่นแพทย์จาก doctorId (นำหน้าด้วย "หมอ") */
export function getDoctorNickname(doctorId) {
  const u = getUserById(doctorId);
  return u ? `หมอ${u.nickname}` : doctorId;
}

/** รายการ user objects จาก array ของ id */
export function getUsersByIds(ids = []) {
  return ids.map((id) => getUserById(id)).filter(Boolean);
}

/**
 * คำนวณเวลารวม (นาที) จาก procedures array
 * นับเฉพาะ procedure ที่มีทั้ง startTime และ endTime
 * คืนค่าเป็น { hours, minutes, hasAny }
 * hasAny = true หมายความว่ามีอย่างน้อย 1 procedure ที่ครบทั้ง startTime + endTime
 */
export function calcTotalDuration(procedures = []) {
  if (!procedures || procedures.length === 0) return { hours: 0, minutes: 0, hasAny: false };

  const parseTime = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  let totalMinutes = 0;
  let hasAny = false;

  for (const p of procedures) {
    const start = parseTime(p.startTime);
    const end = parseTime(p.endTime);
    if (start !== null && end !== null) {
      totalMinutes += end - start;
      hasAny = true;
    }
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, hasAny };
}

export { branches, roles };
