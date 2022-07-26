const PostSchema = require("../models/postmodel");
const userSchema = require("../models/usermodel");
const router = require("express").Router();
const multer = require("multer");
const { Admin, authverify } = require("../middleware/auth");
const { mail_to_customer, sendEmail } = require("../middleware/email");

///image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
// app.post("/image-upload", async (req, res) => {
//   const upload = await multer({ storage: storage }).single("file");
//   upload(req, res, (err) => {
//     if (!req.file) {
//       res.send({ message: "please select a file to upload" });
//     } else if (err instanceof multer.MulterError) {
//       res.send(err);
//     } else if (err) {
//       res.send(err);
//     } else {
//       console.log(req.file.filename);
//       res.send({
//         status: "success",
//         message: "file uploaded",
//         imagedat: req.file.filename,
//         // imagedata: req.files, --->for multiple images  ###(!req.files)
//       });
//     }
//   });
// });

//create post with images
router.post("/create-post-with-image", async (req, res) => {
  try {
    const upload = multer({ storage: storage }).single("file");
    upload(req, res, (err) => {
      if (!req.file) {
        res.send({ message: "please select a file to upload" });
      } else if (err instanceof multer.MulterError) {
        res.send(err);
      } else if (err) {
        res.send(err);
      } else {
        console.log(req.file.filename);
      }
      const newpostdata = {
        title: req.body.title,
        desc: req.body.desc,
        photo: req.file.filename,
        UserName: req.body.UserName,
        category: req.body.category,
      };
      const newpost = new PostSchema(newpostdata);
      newpost.save();
      return res.status(200).json({
        message: "post created successfully",
        status: "success",
        result: newpost,
      });
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "failure", error: err });
  }
});

//create post

router.post("/create-post-without-image", async (req, res) => {
  // console.log(req);
  try {
    const newpost = new PostSchema(req.body);
    const post = await newpost.save();
    return res.status(200).json({
      status: "success",
      message: "post created successfully",
      result: post,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ message: "failure", error: err });
  }
});

//update post

router.put("/update-post/:id", async (req, res) => {
  try {
    const find = await PostSchema.findById(req.params.id);
    if (find.UserName === req.body.UserName) {
      try {
        const updatepost = await PostSchema.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        return res.status(200).json({
          status: "success",
          messgae: "your post is updated",
          result: updatepost,
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else {
      return res
        .status(401)
        .json({ status: "failure", message: "you can only update your post" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//delete post

router.delete("/delete-post/:id", async (req, res) => {
  try {
    const findpost = await PostSchema.findById(req.params.id);
    if (findpost.UserName === req.body.UserName) {
      try {
        await findpost.delete();
        return res.status(200).json({
          status: "success",
          messgae: "your post has been deleted",
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    } else {
      return res
        .status(401)
        .json({ status: "failure", message: "you can only delete your post" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//get single post
router.get("/single-post/:id", async (req, res) => {
  try {
    const post = await PostSchema.findOne({ _id: req.params.id });
    return res.status(200).json({ status: "success", result: post });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//report post
router.put("/post-report/:uuid/:UserName", async (req, res) => {
  try {
    const find = await PostSchema.findOneAndUpdate(
      { uuid: req.params.uuid },
      { reported: 1 },
      { new: true }
    );
    const date = new Date(find.createdAt).toDateString();
    const mailData = {
      from: "divya.platosys@gmail.com",
      to: "divya.platosys@gmail.com",
      subject: "post Report request",
      fileName: "reportreq.ejs",
      details: {
        title: find.title,
        postedBy: find.UserName,
        date: date,
        user: req.params.UserName,
      },
    };
    let verifymail = mail_to_customer(mailData);
    return res.status(200).json({
      status: "success",
      result: verifymail,
      message: "post reported , admin will take action",
    });
  } catch (error) {
    console.log(error.message);
  }
});

//get reported post
router.get("/reported-post", async (req, res) => {
  try {
    const posts = await PostSchema.find({ reported: 1 });
    return res.status(200).json({
      status: "success",
      message: "reported posts are fetched",
      result: posts,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//post inactivation

router.put("/post-status/:uuid", async (req, res) => {
  console.log(req.params);
  const find = await PostSchema.findOne({ uuid: req.params.uuid });
  if (find) {
    try {
      const inactivate = await PostSchema.findOneAndUpdate(
        { uuid: req.params.uuid },
        { poststatus: false },
        { new: true }
      );
      const user = await userSchema.findOne({ UserName: find.UserName });
      const date = new Date(inactivate.createdAt).toDateString();
      const mailData = {
        from: "divya.platosys@gmail.com",
        to: user.Email,
        subject: "post inactivation",
        fileName: "report.ejs",
        details: {
          title: inactivate.title,
          date: date,
        },
      };
      let verifymail = mail_to_customer(mailData);
      return res.status(200).json({
        status: "success",
        result: inactivate,
        message: "post inactivated",
      });
    } catch (error) {
      console.log(error.message);
      return res.send({ error: error.message });
    }
  } else {
    return res.status(200).json({
      status: "failure",
      message: "post is nolonger",
    });
  }
});

//post activation
router.put("/no-violation/:uuid", async (req, res) => {
  const find = await PostSchema.findOne({ uuid: req.params.uuid });
  if (find) {
    try {
      const activate = await PostSchema.findOneAndUpdate(
        { uuid: req.params.uuid },
        {
          $set: { poststatus: true, reported: 0 },
        },
        { new: true }
      );
      const user = await userSchema.findOne({ UserName: find.UserName });
      const date = new Date(activate.createdAt).toDateString();
      const mailData = {
        from: "divya.platosys@gmail.com",
        to: user.Email,
        subject: "post Activation ",
        fileName: "activate.ejs",
        details: {
          title: activate.title,
        },
      };
      let verifymail = mail_to_customer(mailData);
      return res.status(200).json({
        status: "success",
        result: activate,
        message: "post activated",
      });
    } catch (error) {
      console.log(error.message);
      return res.send({ error: error.message });
    }
  } else {
    return res.status(200).json({
      status: "failure",
      message: "post is nolonger",
    });
  }
});

//get all post
router.get("/all-post", async (req, res) => {
  const UserName = req.query.UserName;
  const category = req.query.cat;
  try {
    let posts;
    if (UserName) {
      posts = await PostSchema.find({ UserName: UserName, poststatus: true });
    } else if (category) {
      posts = await PostSchema.find({ category: category, poststatus: true });
    } else {
      posts = await PostSchema.find({ poststatus: true });
    }
    return res.status(200).json({
      status: "success",
      message: "all posts are fetched",
      result: posts,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//post by author
router.get("/post-user/:UserName", async (req, res) => {
  try {
    const posts = await PostSchema.find({ UserName: req.params.UserName });
    if (posts) {
      return res.status(200).json({
        status: "success",
        message: "reported posts are fetched",
        result: posts,
      });
    } else {
      return res.status(200).json({
        status: "failure",
        message: "No post yet, get started with new post",
      });
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
});
// //contact us
// router.post("/contact", async (req, res) => {
//   try {
//     console.log(req.body);
//     const subject = "User query";
//     let email = await sendEmail(req.body.to, subject, req.body.text);
//     return res.send({
//       status: "success",
//       message: "your query is sent to admin",
//       data: email,
//     });
//   } catch (error) {
//     console.log(error.message);
//     return res.send(error.message);
//   }
// });

module.exports = router;
