import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import User from '../models/User.model.js';
import { tokenService } from '../services/token.service.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};

router.post('/register', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3 }).matches(/^[a-z0-9_]+$/),
  body('password').isLength({ min: 8 }),
  body('displayName').notEmpty().trim(),
  body('role').optional().isIn(['admin', 'user']),
], validate, async (req, res) => {
  try {
    const { email, username, password, displayName, role } = req.body;
    
    const user = await User.register({ email, username, password, displayName, role: role || 'user' });
    const accessToken = await tokenService.signAccess({ id: user._id, role: user.role, username: user.username });

    res.status(201).json({
      accessToken,
      expiresIn: 900,
      user: { id: user._id, username: user.username, role: user.role, displayName: user.displayName, avatar: user.avatar },
    });
  } catch (error) {
    if (error.message === 'Email or username already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', authLimiter, [
  body('login').notEmpty(),
  body('password').notEmpty(),
], validate, async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ $or: [{ email: login }, { username: login }] }).select('+passwordHash');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = await tokenService.signAccess({ id: user._id, role: user.role, username: user.username });

    res.json({
      accessToken,
      expiresIn: 900,
      user: { id: user._id, username: user.username, role: user.role, displayName: user.displayName, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const payload = await tokenService.verify(token);
    if (payload.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const accessToken = await tokenService.signAccess({ id: user._id, role: user.role, username: user.username });

    res.json({ accessToken, expiresIn: 900 });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: user._id, username: user.username, role: user.role, displayName: user.displayName, avatar: user.avatar, bio: user.bio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail(),
], validate, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ message: 'If an account exists with this email, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    res.json({ message: 'If an account exists with this email, a reset link has been sent', resetToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', authLimiter, [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
], validate, async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    user.passwordHash = req.body.newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
