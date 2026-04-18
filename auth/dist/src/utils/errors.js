export class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export class ValidationError extends AppError {
    constructor(message) {
        super(400, message);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
export class AuthenticationError extends AppError {
    constructor(message) {
        super(401, message);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}
export class AuthorizationError extends AppError {
    constructor(message) {
        super(403, message);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}
export class NotFoundError extends AppError {
    constructor(message) {
        super(404, message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
export class ConflictError extends AppError {
    constructor(message) {
        super(409, message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
//# sourceMappingURL=errors.js.map