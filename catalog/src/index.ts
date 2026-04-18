import express, { Request, Response } from "express";
import cors from "cors";
import { ENV, isDevelopment } from "./config/env";
import { errorHandler } from "./middlewares/errors.middleware";
import catalogRoutes from "./routes/catalog.routes";
import { HTTP_STATUS } from "./config/constants";

const app = express();

// Middleware
app.use(cors({
  origin: ENV.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging
if (isDevelopment) {
  app.use((req: Request, res: Response, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use("/catalog", catalogRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Catalog service is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = ENV.PORT;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║              🚀 CATALOG SERVICE STARTED                       ║
╚═══════════════════════════════════════════════════════════════╝

📍 Server is running on port: ${PORT}
🌍 API available at: http://localhost:${PORT}
📚 Catalog routes at: http://localhost:${PORT}/catalog
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received, shutting down...");
  server.close(() => {
    console.log("✅ Server shut down successfully");
    process.exit(0);
  });
});

export default app;
