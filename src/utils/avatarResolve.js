import avatarDefault from '../assets/images/avatar-default.png';

/** ใช้ URL รูปจริง หรือรูป default เมื่อไม่มีค่า */
export function resolveAvatarUrl(avatarUrl) {
  if (avatarUrl == null) return avatarDefault;
  const s = String(avatarUrl).trim();
  if (s === '') return avatarDefault;
  return s;
}
