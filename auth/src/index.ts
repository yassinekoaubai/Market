import express from "express";
import type { Request, Response } from "express";
import { ENV, isDevelopment } from "./config/env";
import { configureMiddleware } from "./config/middleware";
import { errorHandler } from "./middlewares/auth.middleware";
import authRoutes from "./routes/auth.routes";
import { HTTP_STATUS } from "./config/constants";

const app = express();

// Configure all middleware
configureMiddleware(app);

// Routes
app.use("/auth", authRoutes);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Route not found",
    path: req.path,
    method: req.method,
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = ENV.PORT;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                 🚀 AUTH SERVICE STARTED                       ║
╚═══════════════════════════════════════════════════════════════╝

📍 Server is running on port: ${PORT}
🌍 API available at: http://localhost:${PORT}
📚 Health check at: http://localhost:${PORT}/health
🔐 Auth routes at: http://localhost:${PORT}/auth

📊 Environment: ${ENV.NODE_ENV}
${isDevelopment ? "💾 Database: " + ENV.DATABASE_URL.substring(0, 30) + "..." : ""}

${isDevelopment ? "📖 Documentation: See README.md, TESTING.md, QUICKSTART.md" : ""}
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received, starting graceful shutdown...");
  server.close(() => {
    console.log("✅ Server shut down successfully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("📴 SIGINT received, starting graceful shutdown...");
  server.close(() => {
    console.log("✅ Server shut down successfully");
    process.exit(0);
  });
});

export default app;
