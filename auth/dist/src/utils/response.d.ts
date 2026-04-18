import type { Response } from "express";
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    timestamp?: string;
    requestId?: string;
}
/**
 * Envoie une réponse de succès
 */
export declare function sendSuccess<T>(res: Response, data?: T, message?: string, statusCode?: number): Response;
/**
 * Envoie une réponse d'erreur
 */
export declare function sendError(res: Response, message: string, statusCode?: number, data?: unknown): Response;
/**
 * Envoie une réponse de validation
 */
export declare function sendValidationError(res: Response, errors: Record<string, string | string[]>): Response;
/**
 * Envoie une réponse paginée
 */
export declare function sendPaginated<T>(res: Response, data: T[], total: number, page: number, limit: number, message?: string, statusCode?: number): Response;
//# sourceMappingURL=response.d.ts.map