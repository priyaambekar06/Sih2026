import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { connectDB } from "./config/db";
import { notFound, errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import tenderRoutes from "./routes/tenderRoutes";
import bidderRoutes from "./routes/bidderRoutes";
import bidRoutes from "./routes/bidRoutes";
import documentRoutes from "./routes/documentRoutes";
import complianceRoutes from "./routes/complianceRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import reverificationRoutes from "./routes/reverificationRoutes";
import reportRoutes from "./routes/reportRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import auditRoutes from "./routes/auditRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "complygem-backend", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tenders", tenderRoutes);
app.use("/api/bidders", bidderRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/reverification", reverificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] ComplyGeM API running on http://localhost:${PORT}`);
  });
}

start();
