import branches from './branches.json';
import { combineBangkokYmdWithClock, diffBangkokDisplayedMinutes } from '../config/thailandTime';
import roles from './roles.json';
import users from '../../db.json';

/** หา branch name จาก branchId */
export function getBranchName(branchId) {
  return branches.find((b) => b.id === branchId)?.name ?? branchId;
}

/** หา branch full name จาก branchId */
export function getBranchFullName(branchId) {
  return branches.find((b) => b.id === branchId)?.fullName ?? branchId;
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
 * รวม id ผู้ร่วมทำจากทุกหัตถการ (ไม่ซ้ำ เรียงตามลำดับที่พบในรายการ)
 * ใช้ทั้ง participantIds และ participants ที่บันทึกไว้ในหัตถการ
 */
export function getAggregatedParticipantIdsFromProcedures(procedures = []) {
  const seen = new Set();
  const ordered = [];
  for (const proc of procedures) {
    const fromIds = proc.participantIds || [];
    const fromParticipants = (proc.participants || []).map((u) => u?.id).filter(Boolean);
    for (const id of [...fromIds, ...fromParticipants]) {
      if (id && !seen.has(id)) {
        seen.add(id);
        ordered.push(id);
      }
    }
  }
  return ordered;
}

/**
 * คำนวณเวลารวม (นาที) จาก procedures array
 * นับเฉพาะ procedure สถานะเสร็จสิ้น โดยใช้ createdAt เป็นเวลาเริ่ม และ endDate หรือ endTime เป็นเวลาจบ
 */
export function calcTotalDuration(procedures = []) {
  if (!procedures || procedures.length === 0) return { hours: 0, minutes: 0, hasAny: false };

  let totalMinutes = 0;
  let hasAny = false;

  for (const p of procedures) {
    if (p.status !== 'เสร็จสิ้น' || !p.createdAt) continue;
    let endRef = null;
    if (p.endDate) {
      endRef = p.endDate;
    } else if (p.endTime) {
      const iso = combineBangkokYmdWithClock(p.createdAt, p.endTime);
      if (iso) endRef = iso;
    }
    if (endRef) {
      const mins = diffBangkokDisplayedMinutes(p.createdAt, endRef);
      if (mins >= 0) {
        totalMinutes += mins;
        hasAny = true;
      }
    }
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes, hasAny };
}

export { branches, roles };
