import { AuthService } from "../services/auth.service";
import { registerSchema, loginSchema, refreshTokenSchema, } from "../schemas/auth.schemas";
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "../config/constants";
export class AuthController {
    /**
     * Register a new user
     */
    static async register(req, res) {
        try {
            // Validate input
            const validatedData = registerSchema.parse(req.body);
            // Register user
            const result = await AuthService.register(validatedData.email, validatedData.password, validatedData.name, validatedData.phone);
            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
                data: result,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("Invalid") || error.message.includes("must")) {
                    res.status(HTTP_STATUS.BAD_REQUEST).json({
                        success: false,
                        message: error.message,
                    });
                }
                else if (error.message === ERROR_MESSAGES.USER_ALREADY_EXISTS) {
                    res.status(HTTP_STATUS.CONFLICT).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: ERROR_MESSAGES.INTERNAL_ERROR,
                    });
                }
            }
            else {
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ERROR_MESSAGES.INTERNAL_ERROR,
                });
            }
        }
    }
    /**
     * Login user
     */
    static async login(req, res) {
        try {
            // Validate input
            const validatedData = loginSchema.parse(req.body);
            // Login user
            const result = await AuthService.login(validatedData.email, validatedData.password);
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
                data: result,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.INVALID_CREDENTIALS) {
                    res.status(HTTP_STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: ERROR_MESSAGES.INTERNAL_ERROR,
                    });
                }
            }
            else {
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ERROR_MESSAGES.INTERNAL_ERROR,
                });
            }
        }
    }
    /**
     * Refresh access token
     */
    static async refreshToken(req, res) {
        try {
            // Validate input
            const validatedData = refreshTokenSchema.parse(req.body);
            // Refresh token
            const result = await AuthService.refreshAccessToken(validatedData.refreshToken);
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
                data: result,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message === ERROR_MESSAGES.INVALID_TOKEN ||
                    error.message === ERROR_MESSAGES.TOKEN_EXPIRED ||
                    error.message === ERROR_MESSAGES.REFRESH_TOKEN_REVOKED) {
                    res.status(HTTP_STATUS.UNAUTHORIZED).json({
                        success: false,
                        message: error.message,
                    });
                }
                else {
                    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        message: ERROR_MESSAGES.INTERNAL_ERROR,
                    });
                }
            }
            else {
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: ERROR_MESSAGES.INTERNAL_ERROR,
                });
            }
        }
    }
    /**
     * Logout user
     */
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: "Refresh token is required",
                });
                return;
            }
            await AuthService.logout(refreshToken);
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
            });
        }
        catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ERROR_MESSAGES.INTERNAL_ERROR,
            });
        }
    }
    /**
     * Logout from all devices
     */
    static async logoutAll(req, res) {
        try {
            if (!req.user) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: ERROR_MESSAGES.UNAUTHORIZED,
                });
                return;
            }
            await AuthService.logoutFromAllDevices(req.user.id);
            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
            });
        }
        catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: ERROR_MESSAGES.INTERNAL_ERROR,
            });
        }
    }
}
//# sourceMappingURL=auth.controller.js.map