import mongoose from "mongoose";

const timeSchema = new mongoose.Schema(
  {
    dateTime: { type: Date, required: true },
  },
  { timestamps: true }
);

const Time = mongoose.model("Time", timeSchema);
export default Time;
