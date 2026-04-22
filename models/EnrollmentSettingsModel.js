import mongoose from "mongoose";

// Singleton — only one document ever exists in this collection.
// Use EnrollmentSettings.getSingleton() to read/write it.
const EnrollmentSettingsSchema = new mongoose.Schema({
  enrollmentOpen: { type: Boolean, default: true },
  updatedAt:      { type: Date,    default: Date.now },
});

// Helper: get the single settings doc, creating it if it doesn't exist yet
EnrollmentSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ enrollmentOpen: true });
  return doc;
};

export default mongoose.model("EnrollmentSettings", EnrollmentSettingsSchema);
