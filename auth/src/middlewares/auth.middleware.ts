import type { Request, Response, NextFunction } from "express";
import { JwtService } from "../services/jwt.service";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants";

/**
 * Middleware to verify JWT token
 */
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = JwtService.verifyToken(token);

      // Add user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: "", // Name will be fetched separately if needed
      };

      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Token has expired") {
          res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.TOKEN_EXPIRED,
          });
        } else {
          res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: ERROR_MESSAGES.INVALID_TOKEN,
          });
        }
      } else {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
      }
    }
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: "Only administrators can access this resource",
    });
    return;
  }

  next();
};

/**
 * Middleware for error handling
 */
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(error);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_ERROR,
  });
};
