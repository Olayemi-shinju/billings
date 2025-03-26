import express from 'express';
import { checkAuth, forgetPassword, getAllUsers, login, register, resetPassword, resetVerificationCode, verifyEmail } from '../contollers/auth.controller.js';
import { authorized, protect } from '../middlewares/authMiddleware.js';
import uploadMiddleware from '../utils/upload.js';



const router = express.Router();

router.post('/register', uploadMiddleware, register)
router.post('/verify-account', verifyEmail)
router.post('/resend-verification-code', resetVerificationCode)
router.post('/login', login)
router.get('/check-auth',protect, checkAuth)
router.get('/user',protect, authorized('admin'), getAllUsers)
router.post('/forgost-password', forgetPassword)
router.post('/reset-password/:token', resetPassword)


export default router;