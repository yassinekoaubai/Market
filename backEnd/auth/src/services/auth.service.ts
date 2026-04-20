import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PasswordService } from "./password.service.js";
import { JwtService } from "./jwt.service.js";
import type { AuthResponse, Tokens, TokenPayload } from "../types/auth.types.js";
import { ERROR_MESSAGES } from "../config/constants.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export class AuthService {
  /**
   * Register a new user
   */
  static async register(
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    // Hash password
    const passwordHash = await PasswordService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password_hash: passwordHash,
        name,
        phone,
      },
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        expires_at: expiresAt,
        revoked: false,
        userId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  static async login(
    email: string,
    password: string
  ): Promise<AuthResponse> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Compare passwords
    const isPasswordValid = await PasswordService.comparePassword(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = JwtService.generateAccessToken(tokenPayload);
    const refreshToken = JwtService.generateRefreshToken(tokenPayload);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshTokens.create({
      data: {
        token: refreshToken,
        expires_at: expiresAt,
        revoked: false,
        userId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<Tokens> {
    // Verify refresh token
    let decoded;
    try {
      decoded = JwtService.verifyToken(refreshToken);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
    }

    // Check if refresh token exists in database and is not revoked
    const storedToken = await prisma.refreshTokens.findFirst({
      where: {
        token: refreshToken,
        revoked: false,
      },
    });

    if (!storedToken) {
      throw new Error(ERROR_MESSAGES.REFRESH_TOKEN_REVOKED);
    }

    // Check if token is expired
    if (new Date() > storedToken.expires_at) {
      throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = JwtService.generateAccessToken(tokenPayload);
    const newRefreshToken = JwtService.generateRefreshToken(tokenPayload);

    // Update refresh token in database
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.refreshTokens.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expires_at: newExpiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user
   */
  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshTokens.updateMany({
      where: {
        token: refreshToken,
      },
      data: {
        revoked: true,
      },
    });
  }

  /**
   * Logout from all devices
   */
  static async logoutFromAllDevices(userId: number): Promise<void> {
    await prisma.refreshTokens.updateMany({
      where: {
        userId,
      },
      data: {
        revoked: true,
      },
    });
  }
}
