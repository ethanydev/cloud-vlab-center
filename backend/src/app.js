const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Rate limiting (100 requests per 15 minutes per IP)
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message:  { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } }
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 모델 등록
require("./models/User");
require("./models/Resource");
require("./models/Reservation");

// 라우터 연결
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

const reservationRouter = require("./routes/reservation");
app.use("/api/reservations", reservationRouter);

const containerRouter = require("./routes/containers");
app.use("/api/containers", containerRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.originalUrl} not found` }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.error("MongoDB 연결 실패:", err));

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
