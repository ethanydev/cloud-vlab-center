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
    os_preset: { type: String, default: null },
    container_id: { type: String, default: null },
    container_info: {
      host: { type: String, default: null },
      ports: { type: mongoose.Schema.Types.Mixed, default: null },
      ssh_command: { type: String, default: null },
      preset_name: { type: String, default: null },
      started_at: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);