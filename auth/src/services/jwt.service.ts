import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import type { TokenPayload } from "../types/auth.types";

export class JwtService {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    try {
      const token = jwt.sign(payload, ENV.JWT_SECRET as string, {
        expiresIn: ENV.JWT_EXPIRES_IN,
      } as any);
      return token;
    } catch (error) {
      throw new Error("Error generating access token");
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: TokenPayload): string {
    try {
      const token = jwt.sign(payload, ENV.JWT_SECRET as string, {
        expiresIn: ENV.JWT_REFRESH_EXPIRE_IN,
      } as any);
      return token;
    } catch (error) {
      throw new Error("Error generating refresh token");
    }
  }

  /**
   * Verify and decode token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
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
  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload | null;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
