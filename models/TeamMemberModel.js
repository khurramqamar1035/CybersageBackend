import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    teamid: {
        type: String,
        required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      required: true
    },
    expertise: {
      type: [String],
      default: []
    },
    education: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("TeamMember", teamMemberSchema);
