import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
export class JwtService {
    /**
     * Generate access token
     */
    static generateAccessToken(payload) {
        try {
            const token = jwt.sign(payload, ENV.JWT_SECRET, {
                expiresIn: ENV.JWT_EXPIRES_IN,
            });
            return token;
        }
        catch (error) {
            throw new Error("Error generating access token");
        }
    }
    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload) {
        try {
            const token = jwt.sign(payload, ENV.JWT_SECRET, {
                expiresIn: ENV.JWT_REFRESH_EXPIRE_IN,
            });
            return token;
        }
        catch (error) {
            throw new Error("Error generating refresh token");
        }
    }
    /**
     * Verify and decode token
     */
    static verifyToken(token) {
        try {
            const decoded = jwt.verify(token, ENV.JWT_SECRET);
            return decoded;
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error("Token has expired");
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error("Invalid token");
            }
            throw new Error("Error verifying token");
        }
    }
    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token) {
        try {
            const decoded = jwt.decode(token);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
}
//# sourceMappingURL=jwt.service.js.map