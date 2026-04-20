import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class PasswordService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      return hashedPassword;
    } catch (error) {
      throw new Error("Error hashing password");
    }
  }

  /**
   * Compare a plain password with a hashed password
   */
  static async comparePassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error("Error comparing passwords");
    }
  }
}
