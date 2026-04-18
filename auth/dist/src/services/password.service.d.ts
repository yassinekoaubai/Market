export declare class PasswordService {
    /**
     * Hash a password using bcrypt
     */
    static hashPassword(password: string): Promise<string>;
    /**
     * Compare a plain password with a hashed password
     */
    static comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
//# sourceMappingURL=password.service.d.ts.map