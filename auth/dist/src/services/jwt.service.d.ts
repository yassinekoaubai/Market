import type { TokenPayload } from "../types/auth.types";
export declare class JwtService {
    /**
     * Generate access token
     */
    static generateAccessToken(payload: TokenPayload): string;
    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload: TokenPayload): string;
    /**
     * Verify and decode token
     */
    static verifyToken(token: string): TokenPayload;
    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token: string): TokenPayload | null;
}
//# sourceMappingURL=jwt.service.d.ts.map