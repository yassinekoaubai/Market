import type { Request, Response, NextFunction } from "express";
/**
 * Middleware to verify JWT token
 */
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user is admin
 */
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware for error handling
 */
export declare const errorHandler: (error: Error, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=auth.middleware.d.ts.map