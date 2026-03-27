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
      const data = await response.json();

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
          branchId: user.branchId,
          branch: resolveBranchName(user.branchId),
          roleId: user.roleId,
          role: resolveRoleName(user.roleId),
        },
      };
    } catch {
      return {
        success: false,
        errors: { general: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' },
      };
    }
  },
};
