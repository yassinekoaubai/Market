import type { AuthResponse, Tokens } from "../types/auth.types";
export declare class AuthService {
    /**
     * Register a new user
     */
    static register(email: string, password: string, name: string, phone: string): Promise<AuthResponse>;
    /**
     * Login user
     */
    static login(email: string, password: string): Promise<AuthResponse>;
    /**
     * Refresh access token
     */
    static refreshAccessToken(refreshToken: string): Promise<Tokens>;
    /**
     * Logout user
     */
    static logout(refreshToken: string): Promise<void>;
    /**
     * Logout from all devices
     */
    static logoutFromAllDevices(userId: number): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map