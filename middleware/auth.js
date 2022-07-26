const jwt = require("jsonwebtoken");
const userSchema = require("../models/usermodel");
let secrectKey = "processkey_123";

function Admin(req, res, next) {
  try {
    console.log("token verification");
    let token = req.header("token");
    if (!token) {
      return res
        .status(401)
        .json({ status: "failure", message: "Unauthorised access" });
    }
    const decode = jwt.verify(token, secrectKey);
    console.log(decode.uuid);
    if (decode.role === "Admin") {
      console.log(" Admin ");
      next();
    } else {
      return res
        .status(401)
        .json({ status: "failure", message: "Unauthorised access" });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ status: "failure", message: "Invalid token" });
  }
}

function authverify(req, res, next) {
  try {
    console.log("token verification");
    let token = req.header("token");
    if (!token) {
      return res
        .status(401)
        .json({ status: "failure", message: "Unauthorised access" });
    }
    const decode = jwt.verify(token, secrectKey);
    console.log(decode.uuid);
    if (decode.role === "user" || role === "Admin") {
      console.log(" user ,admin");
      next();
    } else {
      return res
        .status(401)
        .json({ status: "failure", message: "Unauthorised access" });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ status: "failure", message: "Invalid token" });
  }
}

module.exports = {
  Admin: Admin,
  authverify: authverify,
};
