/**
 * Envoie une réponse de succès
 */
export function sendSuccess(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
        requestId: res.getHeader("X-Request-ID"),
    });
}
/**
 * Envoie une réponse d'erreur
 */
export function sendError(res, message, statusCode = 500, data) {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        requestId: res.getHeader("X-Request-ID"),
    };
    if (data) {
        response.data = data;
    }
    return res.status(statusCode).json(response);
}
/**
 * Envoie une réponse de validation
 */
export function sendValidationError(res, errors) {
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
export function sendPaginated(res, data, total, page, limit, message = "Success", statusCode = 200) {
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
//# sourceMappingURL=response.js.map