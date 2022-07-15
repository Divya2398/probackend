const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: false },
    Name: { type: String, required: true },
    UserName: { type: String, required: true, trim: true },
    Email: { type: String, required: true, trim: true },
    Mobilenumber: { type: String, required: false, trim: true },
    password: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["Admin", "user"],
      required: false,
      default: "user",
    },
    VerifiedUser: { type: Boolean, required: false, default: false },
    loginStatus: { type: Boolean, required: false, default: false },
    logintype: {
      type: String,
      enum: ["google", "facebook", "normal"],
      required: false,
      default: "normal",
    },
    profilepic: {
      type: String,
      default: "",
    },
    firstloginstatus: { type: Boolean, required: false, default: true },
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", function (next) {
  this.uuid =
    "USER-" + crypto.pseudoRandomBytes(6).toString("hex").toUpperCase();
  console.log(this.uuid);
  next();
});

module.exports = mongoose.model("user", userSchema);
