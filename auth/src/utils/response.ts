import { Response } from "express";

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
export function sendSuccess<T>(
  res: Response,
  data?: T,
  message: string = "Success",
  statusCode: number = 200
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    requestId: res.getHeader("X-Request-ID"),
  } as ApiResponse<T>);
}

/**
 * Envoie une réponse d'erreur
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  data?: unknown
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(data && { data }),
    timestamp: new Date().toISOString(),
    requestId: res.getHeader("X-Request-ID"),
  } as ApiResponse);
}

/**
 * Envoie une réponse de validation
 */
export function sendValidationError(
  res: Response,
  errors: Record<string, string | string[]>
): Response {
  return res.status(400).json({
    success: false,
    message: "Validation error",
    data: { errors },
    timestamp: new Date().toISOString(),
    requestId: res.getHeader("X-Request-ID"),
  });
}

/**
 * Envoie une réponse paginée
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = "Success",
  statusCode: number = 200
): Response {
  const totalPages = Math.ceil(total / limit);

  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
    requestId: res.getHeader("X-Request-ID"),
  });
}
