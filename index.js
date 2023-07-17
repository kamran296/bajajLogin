const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

// APP.js ////
const registerRouter = require("./routes/users/authRouter");

app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", registerRouter);

const db = process.env.db;
mongoose
  .connect(db, {
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log("Database connected successfully!!");
  })
  .catch((err) => {
    console.log("error connecting database", err);
  });

const port = process.env.PORT || 8000;
app.listen(5000, () => {
  console.log(`App running on port ${port}...`);
});
