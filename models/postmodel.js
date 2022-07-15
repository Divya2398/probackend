const mongoose = require("mongoose");
const crypto = require("crypto");

const PostSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: false },
    title: { type: String, required: false },
    desc: { type: String, required: false },
    photo: { type: String, required: false },
    UserName: { type: String, required: false, trim: true },
    poststatus: { type: Boolean, required: false, default: true },
    category: { type: String, required: false, trim: true },
  },
  {
    timestamps: true,
  }
);
PostSchema.pre("save", function (next) {
  this.uuid =
    "post-" + crypto.pseudoRandomBytes(6).toString("hex").toUpperCase();
  console.log(this.uuid);
  next();
});

module.exports = mongoose.model("post", PostSchema);
