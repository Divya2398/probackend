const mongoose = require("mongoose");
const crypto = require("crypto");
// const { usertestSchema } = require("../validation/joi");
const userSchema = require("../models/usermodel");
Schema = mongoose.Schema;

const PostSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: false },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    photo: { type: String, required: false },
    UserName: { type: String, required: true, trim: true },
    poststatus: { type: Boolean, required: false, default: true },
    category: { type: String, required: true, trim: true },
    reported: {
      type: Number,
      enum: [0, 1],
      default: 0,
      required: false,
    },
    // comments: [
    //   {
    //     text: String,
    //     created: { type: Date, default: Date.now },
    //     postedby: {
    //       type: Schema.Types.ObjectId,
    //       ref: userSchema,
    //       required: true,
    //     },
    //   },
    // ],
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
