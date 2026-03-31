import branches from '../mock/branches.json';
import roles from '../mock/roles.json';

function resolveBranchName(branchId) {
  return branches.find((b) => b.id === branchId)?.name ?? branchId;
}

function resolveRoleName(roleId) {
  return roles.find((r) => r.id === roleId)?.name ?? roleId;
}

export const authService = {
  async login(username, password) {
    try {
      const response = await fetch('/db.json');

      if (!response.ok) {
        return {
          success: false,
          errors: {
            general: `ไม่สามารถโหลดข้อมูลผู้ใช้ได้ (รหัส ${response.status})`,
          },
        };
      }

      let data;
      try {
        data = await response.json();
      } catch {
        console.error('Error parsing JSON:', error);
        return {
          success: false,
          errors: { general: 'รูปแบบข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง' },
        };
      }

      if (!Array.isArray(data?.users)) {
        return {
          success: false,
          errors: { general: 'ไม่พบรายการผู้ใช้ในระบบ' },
        };
      }

      const user = data.users.find((u) => u.username === username);
      const errors = {};

      if (!user) {
        errors.username = 'Username ไม่ถูกต้อง';
        errors.password = 'Password ไม่ถูกต้อง';
      } else if (user.password !== password) {
        errors.password = 'Password ไม่ถูกต้อง';
      }

      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          nickname: user.nickname,
          branchId: user.branchId,
          branch: resolveBranchName(user.branchId),
          roleId: user.roleId,
          role: resolveRoleName(user.roleId),
          avatarUrl: user.avatarUrl || null,
        },
      };
    } catch {
      console.error('Error connecting to server:', error);
      return {
        success: false,
        errors: {
          general:
            'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง',
        },
      };
    }
  },
};
