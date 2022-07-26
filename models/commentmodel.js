const mongoose = require("mongoose");
const crypto = require("crypto");
const userSchema = require("../models/usermodel");
Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: false },
    Blogger: { type: String, required: true },
    Sender: { type: Schema.Types.ObjectId, ref: userSchema, required: true },
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    post_id: { type: String, required: true },
    user_profile: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);
commentSchema.pre("save", function (next) {
  this.uuid =
    "COM-" + crypto.pseudoRandomBytes(6).toString("hex").toUpperCase();
  console.log(this.uuid);
  next();
});

module.exports = mongoose.model("comment", commentSchema);
