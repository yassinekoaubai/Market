export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const ERROR_MESSAGES: {
    readonly INVALID_CREDENTIALS: "Invalid email or password";
    readonly USER_ALREADY_EXISTS: "User already exists with this email";
    readonly USER_NOT_FOUND: "User not found";
    readonly INVALID_TOKEN: "Invalid or expired token";
    readonly TOKEN_EXPIRED: "Token has expired";
    readonly UNAUTHORIZED: "Unauthorized access";
    readonly INTERNAL_ERROR: "Internal server error";
    readonly REFRESH_TOKEN_EXPIRED: "Refresh token has expired";
    readonly REFRESH_TOKEN_REVOKED: "Refresh token has been revoked";
};
export declare const SUCCESS_MESSAGES: {
    readonly LOGIN_SUCCESS: "Login successful";
    readonly REGISTER_SUCCESS: "User registered successfully";
    readonly LOGOUT_SUCCESS: "Logout successful";
    readonly TOKEN_REFRESHED: "Token refreshed successfully";
};
//# sourceMappingURL=constants.d.ts.map