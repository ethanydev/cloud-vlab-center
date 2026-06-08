const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    lab_id: { type: String, required: true },
    name: { type: String, required: true },
    spec: {
      cpu: { type: String },
      memory: { type: String },
      storage: { type: String },
      gpu: { type: String },
      description: { type: String },
    },
    status: {
      type: String,
      enum: ["active", "maintenance", "retired"],
      default: "active",
    },
    operating_hours: {
      days: { type: [String] },
      start_time: { type: String },
      end_time: { type: String },
      max_concurrent: { type: Number, default: 1 },
    },
    equipment: { type: [String] },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);