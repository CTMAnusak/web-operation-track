import { getCurrentDateTime } from '../config/mockDateTime';
import { toThailandISOString, formatHmThailand } from '../config/thailandTime';

/**
 * หัตถการสถานะ "กำลังทำ" เกิน estimatedHours จาก createdAt → ถือว่าเสร็จอัตโนมัติ
 * (ใช้ให้ตรงกับ useEffect บน OpdDetailPage และการ์ดรายการ OPD)
 */
export function shouldAutoCompleteProcedure(proc, now = getCurrentDateTime()) {
  if (!proc || proc.status !== 'กำลังทำ' || !proc.createdAt) return false;
  const nowMs = now.getTime();
  const createdAtMs = new Date(proc.createdAt).getTime();
  const estimateHours = Number(proc.estimatedHours || 2);
  const dueMs = createdAtMs + estimateHours * 60 * 60 * 1000;
  return nowMs >= dueMs;
}

export function applyAutoCompleteToProcedure(proc, now = getCurrentDateTime()) {
  if (!shouldAutoCompleteProcedure(proc, now)) return proc;
  const createdAtMs = new Date(proc.createdAt).getTime();
  const estimateHours = Number(proc.estimatedHours || 2);
  const dueMs = createdAtMs + estimateHours * 60 * 60 * 1000;
  const endDateObj = new Date(dueMs);
  return {
    ...proc,
    status: 'เสร็จสิ้น',
    endDate: toThailandISOString(endDateObj),
    endTime: formatHmThailand(endDateObj),
  };
}

/** โหลดรายการหัตถการจากข้อมูลคนไข้ + ใช้กฎ auto เสร็จทันที (ไม่รอ useEffect ชุดหลัง) */
export function normalizeProceduresFromCustomer(customer, now = getCurrentDateTime()) {
  const list = customer?.procedures || [];
  return list.map((p) =>
    applyAutoCompleteToProcedure(
      { ...p, status: p.status || 'รอดำเนินการ' },
      now
    )
  );
}

/** สถานะที่ควรแสดง (รวม auto เสร็จ) — ไม่ mutate object ต้นฉบับ */
export function getEffectiveProcedureStatus(proc, now = getCurrentDateTime()) {
  if (!proc) return 'รอดำเนินการ';
  if (shouldAutoCompleteProcedure(proc, now)) return 'เสร็จสิ้น';
  return proc.status || 'รอดำเนินการ';
}

/**
 * รายการหัตถการสำหรับคำนวณเวลารวมบนการ์ด OPD (รวม auto เสร็จ → มี endDate/endTime ชั่วคราว)
 * ให้ตรงกับสิ่งที่แสดงบนหน้ารายละเอียดหลัง useEffect
 */
export function getEffectiveProceduresForMetrics(customer, now = getCurrentDateTime()) {
  const procs = customer?.procedures || [];
  return procs.map((p) => applyAutoCompleteToProcedure(p, now));
}

/** สถานะ OPD บนการ์ดรายการ — สรุปจากหัตถการหลังใช้กฎ auto เดียวกับหน้ารายละเอียด */
export function deriveCustomerDisplayStatus(customer, now = getCurrentDateTime()) {
  if (!customer) return 'รอดำเนินการ';
  const procs = customer.procedures || [];
  if (procs.length === 0) return customer.status ?? 'รอดำเนินการ';
  const effective = procs.map((p) => getEffectiveProcedureStatus(p, now));
  if (effective.some((s) => s === 'กำลังทำ')) return 'กำลังทำ';
  if (effective.some((s) => s === 'รอดำเนินการ')) return 'รอดำเนินการ';
  if (effective.every((s) => s === 'เสร็จสิ้น')) return 'เสร็จสิ้น';
  return customer.status ?? 'รอดำเนินการ';
}
