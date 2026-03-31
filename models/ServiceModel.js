import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    serviceId: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    defaultSelected: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Service = mongoose.model('Service', serviceSchema);

export default Service;