import mongoose from "mongoose";

const officeSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Office", officeSchema);
