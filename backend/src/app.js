const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require("./models/User");
require("./models/Resource");
require("./models/Reservation");

const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

const reservationRouter = require("./routes/reservation");
app.use("/api/reservations", reservationRouter);

const userRouter = require("./routes/users");
app.use("/api/users", userRouter);

const resourceRouter = require("./routes/resources");
app.use("/api/resources", resourceRouter);

const containerRouter = require("./routes/containers");
app.use("/api/containers", containerRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.originalUrl} not found` }
  });
});

app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.error("MongoDB 연결 실패:", err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});