export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_ALREADY_EXISTS: "User already exists with this email",
  USER_NOT_FOUND: "User not found",
  INVALID_TOKEN: "Invalid or expired token",
  TOKEN_EXPIRED: "Token has expired",
  UNAUTHORIZED: "Unauthorized access",
  INTERNAL_ERROR: "Internal server error",
  REFRESH_TOKEN_EXPIRED: "Refresh token has expired",
  REFRESH_TOKEN_REVOKED: "Refresh token has been revoked",
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  REGISTER_SUCCESS: "User registered successfully",
  LOGOUT_SUCCESS: "Logout successful",
  TOKEN_REFRESHED: "Token refreshed successfully",
} as const;
