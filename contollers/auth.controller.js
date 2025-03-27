import { sendPasswordResetEmail, sendRestSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const avatar = req.files?.avatar?.[0]?.path || null;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    let user = new User({
      firstName,
      lastName,
      email,
      password,
      avatar: avatar,
      role: "user",
      verificationToken,
      verificationTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    await user.save();
    await sendVerificationEmail(user.email, verificationToken);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );
    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: user,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpireAt: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpireAt = undefined;
    await user.save();
    await sendWelcomeEmail(user.email);
    res
      .status(200)
      .json({
        msg: "Verified Successfully",
        user: { ...user._doc, password: undefined },
      });
  } catch (error) {
    console.log("error verfying email", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User is already verified" });
    }
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    verificationTokenExpireAt = Date.now() + 10 * 60 * 1000;
    user.verificationToken = verificationToken;
    user.verificationTokenExpireAt = verificationTokenExpireAt;
    await user.save();
    await sendVerificationEmail(user.email, user.firstName, verificationToken);

    return res
      .status(200)
      .json({
        success: true,
        message: "Verification code sent successfully",
        verificationToken,
        verificationTokenExpireAt,
      });
  } catch (error) {
    console.log("Error in verifying email", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({success:true, message: "If an account exists with this email, a password rest link will be sent shortly"})
    }
    const resetToken = crypto.randomBytes(20).toString('hex')
    const resetPasswordTokenExpireAt = Date.now() + 2 * 60 * 1000

    user.resetPasswordToken = resetToken
    user.resetPasswordTokenExpireAt = resetPasswordTokenExpireAt;
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)
    res.status(200).json({success: true, message: "If an account exists with this email, a password rest link will be sent shortly"})
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const {token} = req.params
    const {password} = req.body
  
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordTokenExpireAt: {$gt: Date.now()}});
    if(!user) {
      return res.status(400).json({success: false, message: 'Inavlid or expired rest token'})
    }

    user.password = password,
    user.resetPasswordToken = undefined,
    user.resetPasswordTokenExpireAt = undefined;

    await user.save()
    await sendRestSuccessEmail(user.email)

    res.status(200).json({success: true, message: 'Password reset successfully'})
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async(req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(403).json({ success: false, message: "Invalid credentials" });
    }
    if(!user.isVerified){
      return res.status(403).json({success: false, message: "Please verify your email"})
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );
    user.lastLogin = new Date();
    user.isOnline = true
    await user.save();
    res.status(200).json({
      success: true,
      message: "User Login successfully",
      user: user,
      token,
    });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("firstName");
    res
      .status(200)
      .json({ success: true, message: "Users retrieved successfully", users });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error retrieving users", error });
  }
};


export const checkAuth = async(req, res)=>{
  try {
    const user = await User.findById(req.user).select('-password')
    if(!user){
      return res.status(400).json({success: false, message: 'User not found'})
    }
    res.status(200).json({success: true, user})
  } catch (error) {
    console.log('Error in check auth', error)
    res.status(500).json({success: false, message: error.message})
  }
}