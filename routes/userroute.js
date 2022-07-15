// "use strict";
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = require("../models/usermodel");
const { usertestSchema } = require("../validation/joi");
const { mail_to_customer, sendEmail } = require("../middleware/email");
const PostSchema = require("../models/postmodel");
// const sendEmail = require("../middleware/email");
const Token = require("../models/tokenmodel");
const { Admin, authverify } = require("../middleware/auth");

router.post("/user-signup", async (req, res) => {
  try {
    // const test = await userte}stSchema.validateAsync(req.body);
    const UserName = req.body.UserName;
    const Email = req.body.Email;
    const Mobilenumber = req.body.Mobilenumber;
    console.log(req.body);
    if (UserName && Email && Mobilenumber) {
      let name = await userSchema.findOne({ UserName: UserName });
      let mailid = await userSchema.findOne({ Email: Email });
      let phonenumber = await userSchema.findOne({
        Mobilenumber: Mobilenumber,
      });
      if (name) {
        return res.json({
          status: "failure",
          message: "username already exist ,try new username",
        });
      } else if (mailid) {
        return res.json({
          status: "failure",
          message: "email already exist ,try new Email",
        });
      } else if (phonenumber) {
        return res.json({
          status: "failure",
          message: "mobileNumber already exist ,try new Mobilenumber",
        });
      }
    } else {
      return res.status(400).json({
        status: "failure",
        message: "Must enter the username , emailid and Mobilenumber",
      });
    }
    const mailData = {
      from: "divya.platosys@gmail.com",
      to: Email,
      subject: "email verification",
      fileName: "verifymail.ejs",
      details: {
        Email: Email,
      },
    };
    let verifymail = mail_to_customer(mailData);
    // const test = await usertestSchema.validateAsync(req.body);
    let userdetail = new userSchema(req.body);
    let password = req.body.password;
    console.log("before hashing:" + password);
    let salt = await bcrypt.genSalt(10);
    userdetail.password = bcrypt.hashSync(password, salt);
    let result = await userdetail.save();
    console.log("after hashing:" + userdetail.password);
    return res.status(200).json({
      status: "success",
      message: "user details are added successfully",
      result: result,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", message: error.message });
  }
});

//email- verification
router.get("/email-verification/:Email", async (req, res) => {
  try {
    const detail = await userSchema.findOne({ Email: req.params.Email }).exec();
    if (detail) {
      userSchema
        .updateOne(
          { Email: req.params.Email },
          { VerifiedUser: true },
          { new: true }
        )
        .exec();

      return res.status(200).json("account verified successfully");
    } else {
      return res.status(200).json("account verification failed");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", message: error.message });
  }
});

//login
router.post("/user-login", async (req, res) => {
  try {
    let UserName = req.body.UserName;
    let password = req.body.password;
    let userdetails;
    let finddetails = await userSchema.findOne({ UserName: UserName }).exec();
    if (UserName) {
      userdetails = await userSchema.findOne({ UserName: UserName }).exec();
      if (!userdetails) {
        return res
          .status(400)
          .json({ status: "failure", message: "please signup first" });
      }
    } else {
      return res
        .status(400)
        .json({ status: "failure", message: "Please enter  username" });
    }
    if (userdetails) {
      console.log(userdetails.password);
      let isMatch = await bcrypt.compare(password, userdetails.password);
      if (isMatch) {
        console.log("uuid is", userdetails.uuid);

        let payload = {
          uuid: userdetails.uuid,
          role: userdetails.role,
          _id: userdetails._id,
        };
        const update = await userSchema
          .findOneAndUpdate(
            { uuid: finddetails.uuid },
            { loginStatus: true },
            { new: true }
          )
          .exec();
        console.log("update status", update);
        var Data = update.toObject();
        console.log("dataresult", Data);
        let secrectKey = "processkey_123";
        let jwttoken = jwt.sign(payload, secrectKey);
        Data.jwttoken = jwttoken;

        return res.status(200).json({
          status: "success",
          message: "Logged in successfully",
          data: Data,
        });
      } else {
        return res
          .status(200)
          .json({ status: "failure", message: "Incorrect password" });
      }
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", message: error.message });
  }
});
//forget-password
router.post("/forget-password", async (req, res) => {
  try {
    const user = await userSchema.findOne({ Email: req.body.Email });
    if (!user) {
      return res
        .status(409)
        .send({ message: "user with given email doesn't exist" });
    }
    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }
    const link = `http://localhost:7000/v1/user/password-reset/${user._id}/${token.token}`;
    let email = await sendEmail(user.Email, "Password reset", link);
    res
      .status(200)
      .send({ message: "password reset link is sent to your email account" });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});

//verify Url

router.get("/password-reset/:id/:token", async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid Link" });
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });
    res.status(200).send({ message: "Valid Url" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Internal server Error", error: error.message });
  }
});

//reset-password

router.post("/password-reset/:id/:token", async (req, res) => {
  try {
    const user = await userSchema.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });
    // user.password = req.body.password;
    if (!user.VerifiedUser === true) {
      user.VerifiedUser = true;
    }
    let Salt = await bcrypt.genSalt(10);
    const newpassword = bcrypt.hashSync(req.body.password, Salt);
    console.log(newpassword);
    user.password = newpassword;
    await user.save();
    await token.remove();
    return res.status(200).send({ message: "password reset sucessfully." });
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});

//logout
router.post("/user-logout", async (req, res) => {
  try {
    const result = await userSchema
      .findOneAndUpdate(
        { uuid: req.query.uuid },
        { loginStatus: false },
        { new: true }
      )
      .exec();
    return res.status(200).json({
      status: "success",
      message: "Logout successfully",
      result: result,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", message: error.message });
  }
});

//update user

router.put("/update/:uuid", async (req, res) => {
  if (req.body.uuid === req.params.uuid) {
    try {
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = bcrypt.hash(req.body.password, salt);
      }
      const update = await userSchema.findOneAndUpdate(
        { uuid: req.params.uuid },
        {
          $set: req.body,
        },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "user updated successfully", result: update });
    } catch (error) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("you can only update your account");
  }
});
// $2b$10$bnZFHXDtB1017raZ3c4AXezkgPydW/FFRP.7ImCfEY9M8VJZd4zxa

//delete user
router.delete("/delete/account/:uuid", async (req, res) => {
  if (req.body.uuid === req.params.uuid) {
    try {
      const user = await userSchema.findOne({ uuid: req.params.uuid });
      try {
        await PostSchema.deleteMany({ UserName: user.UserName });
        await userSchema.findOneAndDelete({ uuid: req.params.uuid });
        res.status(200).json({
          status: "success",
          message: "your account has been deleted",
        });
      } catch (error) {
        res.status(500).json(err);
      }
    } catch (error) {
      res.status(500).json("User not found");
    }
  } else {
    res.status(401).json("you can only delete your account");
  }
});

//get user
router.get("/getuser/:uuid", async (req, res) => {
  try {
    const user = await userSchema.findOne({ uuid: req.params.uuid });
    const { password, ...others } = user._doc;
    return res
      .status(200)
      .json({ status: "success", message: "fetched user", result: others });
  } catch (error) {
    res.status(500).json(error.message);
  }
});
//social signin

router.post("/social-signup", async (req, res) => {
  try {
    let userdetail = new userSchema(req.body);
    let password = req.body.password;
    console.log("before hashing:" + password);
    let salt = await bcrypt.genSalt(10);
    userdetail.password = bcrypt.hashSync(password, salt);
    let result = await userdetail.save();
    console.log("after hashing:" + userdetail.password);
    return res.status(200).json({
      status: "success",
      message: "user details are added successfully",
      result: result,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "failure", error: error.message });
  }
});

//get all user
router.get("/all-user", async (req, res) => {
  try {
    const users = await userSchema.find();
    return res
      .status(200)
      .json({ status: "success", message: "user fetched", result: users });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});
module.exports = router;
