import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";
const router = Router();
/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", AuthController.register);
/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", AuthController.login);
/**
 * @route   POST /auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post("/refresh-token", AuthController.refreshToken);
/**
 * @route   POST /auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", verifyToken, AuthController.logout);
/**
 * @route   POST /auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post("/logout-all", verifyToken, AuthController.logoutAll);
export default router;
//# sourceMappingURL=auth.routes.js.map