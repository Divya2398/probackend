const router = require("express").Router();
const CategorySchema = require("../models/categorymodel");

router.post("/createcat", async (req, res) => {
  const newcat = new CategorySchema(req.body);
  try {
    const savedcat = await newcat.save();
    return res.status(200).json({
      status: "success",
      message: "category is added",
      result: savedcat,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

router.get("/all-cat", async (req, res) => {
  const newcat = new CategorySchema(req.body);
  try {
    const cat = await CategorySchema.find();
    return res.status(200).json({
      status: "success",
      result: cat,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
});
module.exports = router;
