const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const multer = require("multer");

const userRouter = require("./routes/userroute");
const postRouter = require("./routes/postroute");
const categoryRouter = require("./routes/categoryroute");
const app = express();
dotenv.config();
app.use(cors());

const port = 7000;

app.get("/", async (req, res) => {
  res.send({ "status:": "server connected" });
});

//database connection

mongoose
  .connect("mongodb://localhost:27017/Project2", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((data) => {
    console.log("database connected successfully");
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });

//multer

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, req.body.name);
//   },
// });

// const upload = multer({ storage: storage });

// app.post("/api/upload/", upload.single("file"), (req, res) => {
//   return res
//     .status(200)
//     .json({ status: "success", message: "file has been uploaded" });
// });

//routes
app.use(express.json());
app.use("/v1/user", userRouter);
app.use("/v2/postApi", postRouter);
app.use("/v3/category", categoryRouter);

app.listen(port, () => {
  console.log(`server started at:http://localhost:${port}`);
});
