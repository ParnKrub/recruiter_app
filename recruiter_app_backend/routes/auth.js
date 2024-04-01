const {Router} = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const router = Router();
// Register a new user
router.post("/register", async (req, res) => {
  try {
    const payload = req.body;
    const email = await payload.email.toLowerCase();

    // Check if the email is already registered
    const existingUser = await User.findOne({email: email});
    if (existingUser) {
      console.log("User already exists", email);
      return res.status(400).json({error: "Email already registered"});
    }

    // Encrypt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);
    payload.password = hashedPassword;

    // Create a new user
    const newUser = new User({...payload, email: email});
    await newUser.save();

    return res.status(201).json({message: "User registered successfully"});
  } catch (error) {
    console.error("Error registering user:", error);
    return res
      .status(500)
      .json({error: "An error occurred while registering the user"});
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const payload = req.body;
    const email = await payload.email.toLowerCase();
    // Check if the user exists
    const user = await User.findOne({email: email});
    if (!user) {
      console.log("User not found", email);
      return res.status(401).json({error: "Invalid email or password"});
    }
    // Validate the password
    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.password
    );
    if (!isPasswordValid) {
      console.log("Invalid password");
      return res.status(401).json({error: "Invalid email or password"});
    }
    // Generate a JWT token
    const token = jwt.sign({userId: user._id}, "secretKey");

    res.status(200).json({token});
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({error: "An error occurred while logging in"});
  }
});

// Generate a password reset token
router.post("/forgot-password", async (req, res) => {
  try {
    const {email} = req.body;

    // Check if the user exists
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({error: "User not found"});
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();
    res.status(200).json({message: "Password reset token sent"});
  } catch (error) {
    console.error("Error generating reset token:", error);
    res
      .status(500)
      .json({error: "An error occurred while generating the reset token"});
  }
});

// Reset password using the reset token
router.post("/reset-password", async (req, res) => {
  try {
    const {resetToken, newPassword} = req.body;

    // Find the user with the provided reset token
    const user = await User.findOne({
      resetToken,
      resetTokenExpiration: {$gt: Date.now()},
    });
    if (!user) {
      return res.status(401).json({error: "Invalid or expired reset token"});
    }

    // Encrypt and hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and reset token fields
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({message: "Password reset successful"});
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({error: "An error occurred while resetting the password"});
  }
});

module.exports = router;
