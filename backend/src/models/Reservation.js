const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resource_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    purpose: { type: String, required: true },
    status: {
      type: String,
      enum: ["waiting", "reserved", "using", "cancelled", "completed"],
      default: "waiting",
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    cancel_reason: { type: String, default: null },
    actual_start_time: { type: Date, default: null },
    actual_end_time: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);