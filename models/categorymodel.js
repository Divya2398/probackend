const mongoose = require("mongoose");
const crypto = require("crypto");

const CategorySchema = new mongoose.Schema(
  {
    uuid: { type: String, required: false },
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);
CategorySchema.pre("save", function (next) {
  this.uuid =
    "CAT-" + crypto.pseudoRandomBytes(6).toString("hex").toUpperCase();
  console.log(this.uuid);
  next();
});

module.exports = mongoose.model("category", CategorySchema);
