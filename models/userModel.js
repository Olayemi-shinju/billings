import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String},
  password: { type: String, required: true},
  role: {
    type: String,
    required: true,
    default: "user",
    enum: ["admin", "user"],
  },
  lastLogin: {type: Date, default: Date.now()},
  isVerified: {type: Boolean, default: false},
  resetPasswordToken: String,
  resetPasswordTokenExpireAt: Date,
  verificationToken: String,
  verificationTokenExpireAt: Date,
  isOnline: {type: Boolean, default: false},
  created_at: { type: Date, default: Date.now()},
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};
export default mongoose.model("User", userSchema);
