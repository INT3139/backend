import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const hashPassword = async (p: string): Promise<string> => {
  return await bcrypt.hash(p, 12);
};

export const comparePassword = async (p: string, h: string): Promise<boolean> => {
  try {
    // Nếu hash có độ dài 32 ký tự, khả năng cao là MD5
    if (h.length === 32) {
      return hashMd5(p) === h;
    }
    // Ngược lại dùng bcrypt
    return await bcrypt.compare(p, h);
  } catch (error) {
    console.error("Lỗi khi so sánh password:", error);
    return false;
  }
};

export const hashMd5 = (s: string): string => {
  return crypto.createHash('md5').update(s).digest('hex');
};

export function generateTempPassword(len = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefghjkmnpqrstwxyz23456789!@#$';
  const bytes = crypto.randomBytes(len);
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}