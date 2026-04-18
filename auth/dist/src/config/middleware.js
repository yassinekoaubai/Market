import express from "express";
import cors from "cors";
import { isDevelopment } from "./env";
/**
 * Configure tous les middlewares de l'application
 */
export function configureMiddleware(app) {
    // CORS middleware
    app.use(cors({
        origin: (process.env.CORS_ORIGIN || "*").split(",").map((origin) => origin.trim()),
        credentials: true,
        optionsSuccessStatus: 200,
    }));
    // Body parser middleware
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ limit: "10mb", extended: true }));
    // Request ID middleware (for tracking)
    app.use((req, res, next) => {
        const requestId = req.headers["x-request-id"] || generateRequestId();
        req.headers["x-request-id"] = requestId;
        res.setHeader("X-Request-ID", requestId);
        next();
    });
    // Request logging middleware (development only)
    if (isDevelopment) {
        app.use((req, res, next) => {
            const timestamp = new Date().toISOString();
            const method = req.method;
            const path = req.path;
            const requestId = req.headers["x-request-id"];
            console.log(`[${timestamp}] ${method} ${path} - Request ID: ${requestId}`);
            res.on("finish", () => {
                const statusCode = res.statusCode;
                console.log(`[${timestamp}] ${method} ${path} - Status: ${statusCode}`);
            });
            next();
        });
    }
    // Request timeout middleware
    app.use((req, res, next) => {
        req.setTimeout(30000); // 30 seconds
        res.setTimeout(30000);
        next();
    });
}
/**
 * Génère un ID de requête unique
 */
function generateRequestId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
//# sourceMappingURL=middleware.js.map