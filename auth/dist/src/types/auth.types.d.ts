import type { Role } from "@prisma/client";
export interface AuthUser {
    id: number;
    email: string;
    name: string;
    role: Role;
}
export interface TokenPayload {
    id: number;
    email: string;
    role: Role;
}
export interface AuthResponse {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
}
export interface Tokens {
    accessToken: string;
    refreshToken: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
//# sourceMappingURL=auth.types.d.ts.map