const router = require("express").Router();
const commentSchema = require("../models/commentmodel");

router.post("/post-comment", async (req, res) => {
  try {
    const content = await new commentSchema(req.body);
    content.save();
    return res.status(200).json({
      message: "commented successfully",
      status: "success",
      result: content,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", error: error.message });
  }
});

//get-comment

router.get("/get-cmt/:postid", async (req, res) => {
  try {
    const comments = await commentSchema.find({
      post_id: req.params.postid,
    });
    try {
      if (comments) {
        return res.status(200).json({
          status: "success",
          message: "comments fetched",
          result: comments,
        });
      } else {
        return res.status(400).json({
          status: "failure",
          message: "no comments yet",
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ status: "failure", error: error.message });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", error: error.message });
  }
});

//edit comment
router.put("/update-comment/:uuid", async (req, res) => {
  try {
    const update = await commentSchema.findOneAndUpdate({
      uuid: req.params.uuid,
    });
    return res.status(200).json({
      message: "comment edited",
      status: "success",
      result: update,
    });
  } catch (error) {
    // console.log(error.message);
    return res.status(500).json({ status: "failure", error: error.message });
  }
});

module.exports = router;
