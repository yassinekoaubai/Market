import type { Request, Response } from "express";
export declare class AuthController {
    /**
     * Register a new user
     */
    static register(req: Request, res: Response): Promise<void>;
    /**
     * Login user
     */
    static login(req: Request, res: Response): Promise<void>;
    /**
     * Refresh access token
     */
    static refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * Logout user
     */
    static logout(req: Request, res: Response): Promise<void>;
    /**
     * Logout from all devices
     */
    static logoutAll(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map