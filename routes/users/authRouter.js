const express = require("express");
const registerController = require("../../controller/User/registerController");
const { body, validationResult } = require("express-validator");
const router = express.Router();

router
  .route("/register", [
    body("email", "Enter a valaid email").isEmail(),
    body("phone", "enter a valid phone number").isLength({ min: 10 }),
  ])
  .post(registerController.createUser);

router
  .route("/register/email", [
    body("email", "Enter a valaid email").isEmail(),
    body("phone", "enter a valid phone number").isLength({ min: 10 }),
  ])
  .post(registerController.registerByEmail);

router.route("/verify").post(registerController.registerVerify);

router.route("/login").post(registerController.login);
router.route("/loginEmail").post(registerController.loginEmail);
module.exports = router;
