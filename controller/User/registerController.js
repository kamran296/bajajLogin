const User = require("./../../model/Users");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const twilio = require("twilio");
const accountSid = process.env.twilioAuthSid;
const authToken = process.env.twilioAuthToken;
const twilioClient = twilio(accountSid, authToken);
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "fidel19@ethereal.email",
    pass: "VzSk3TpftTdE6Qrfzc",
  },
});

let otp, user;
function otpGenerator() {
  return Math.floor(1000 + Math.random() * 9000);
}
otp = otpGenerator();

// Registration using email and phone number and verification using phone number
module.exports.createUser = async (req, res) => {
  try {
    const { email, phone, password, dob } = req.body;
    const emailExist = await User.findOne({
      email: req.body.email,
    });
    const phoneExist = await User.findOne({ phone: req.body.phone });
    console.log(emailExist);
    if (emailExist || phoneExist) {
      res.status(404).json("User already exists");
    } else {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = new User({
        email,
        phone,
        password: secPass,
        dob,
      });
    }
    //   now sending an otp to user as he is registering
    console.log(otp);
    await twilioClient.messages
      .create({
        body: `Your OTP: ${otp}`,
        from: "+18575671913",
        to: "+91".concat(phone),
      })
      .then((message) => console.log(message.sid))
      .catch((error) => console.log(error));
    res.status(200).json("otp sent!!");
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// registeration and verification using email
module.exports.registerByEmail = async (req, res) => {
  try {
    const { email, phone, password, dob } = req.body;
    const emailExist = await User.findOne({
      email: req.body.email,
    });
    const phoneExist = await User.findOne({ phone: req.body.phone });

    if (emailExist || phoneExist) {
      res.status(404).json("User already exists");
    } else {
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = new User({
        email,
        phone,
        password: secPass,
        dob,
      });
    }
    //   now sending an otp to user as he is registering
    console.log(otp, email);
    const info = await transporter.sendMail({
      from: '"Kavach" <kavach.com>', // sender address
      to: email, // list of receivers
      subject: "OTP verification from Kavach ✔", // Subject line
      text: `Your OTP is ${otp}`, // plain text body
      // html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);

    res.status(200).json("otp sent!!");
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// verificaation of otp t registeration

module.exports.registerVerify = async (req, res) => {
  try {
    let votp = req.body.otp;
    if (otp !== votp) {
      res.status(404).json("wrong otp entered");
    } else {
      user = await user.save();
    }
    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ authtoken });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// login through phone Number

module.exports.login = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(req.body.password, salt);
  console.log(secPass);

  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    const pass = user.password;

    if (!user) {
      return res.status(400).json({ error: "invalid login credential" });
    }

    const passwordCompare = await bcrypt.compare(password, pass);
    if (!passwordCompare) {
      success = false;
      return res.status(400).json({ error: "invalid login credential" });
    }

    const data = {
      user: {
        id: user.id,
      },
    };
    const authToken = jwt.sign(data, JWT_SECRET, { expiresIn: "1h" });
    success = true;
    res.status(200).json({
      success,
      authToken,
    });
  } catch (err) {
    res.status(400).json({
      status: "error from login side",
      message: err,
    });
  }
};

// login through email
module.exports.loginEmail = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(req.body.password, salt);
  console.log(secPass);

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    const pass = user.password;

    if (!user) {
      return res.status(400).json({ error: "invalid login credential" });
    }

    const passwordCompare = await bcrypt.compare(password, pass);
    if (!passwordCompare) {
      success = false;
      return res.status(400).json({ error: "invalid login credential" });
    }

    const data = {
      user: {
        id: user.id,
      },
    };
    const authToken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.status(200).json({
      success,
      authToken,
    });
  } catch (err) {
    res.status(400).json({
      status: "error from login side",
      message: err,
    });
  }
};
