const PostSchema = require("../models/postmodel");
const userSchema = require("../models/usermodel");
const router = require("express").Router();
const multer = require("multer");
const { Admin, authverify } = require("../middleware/auth");

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

//create post

router.post("/create-post", async (req, res) => {
  // console.log(req);
  try {
    if (req.file) {
      const upload = multer({ storage: storage }).single("file");
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          res.send(err);
        } else if (err) {
          res.send(err);
        } else {
          console.log(req.file.filename);
          res.send({
            status: "success",
            message: "file uploaded",
            imagedat: req.file.filename,
          });
        }
      });
      const newUserData = {
        title: req.body.title,
        desc: req.body.desc,

        photo: req.file.filename,
        UserName: req.body.UserName,
        category: req.body.category,
      };
      const newUser = new PostSchema(newUserData);
      newUser.save();
      return res.status(200).json({
        message: "post created successfully",
        status: "success",
        result: newUser,
      });
    } else {
      const newpost = new PostSchema(req.body);
      const post = await newpost.save();
      return res.status(200).json({
        status: "success",
        message: "post created successfully",
        result: post,
      });
    }
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

router.delete("/delete-post/:id", authverify, async (req, res) => {
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
router.get("/single-post/:uuid", async (req, res) => {
  try {
    const post = await PostSchema.findOne({ uuid: req.params.uuid });
    return res.status(200).json({ status: "success", result: post });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

//post status

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

module.exports = router;
