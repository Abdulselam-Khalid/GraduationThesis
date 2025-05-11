const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a group name"],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", GroupSchema);
