import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true },
  username: { type: String, unique: true, required: true, lowercase: true },
  displayName: { type: String, required: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  avatar: { type: String },
  bio: { type: String, maxlength: 300 },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash') && !this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.register = async function ({ email, username, password, displayName, role }) {
  const existing = await this.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new Error('Email or username already exists');
  }
  
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await this.create({ 
    email, 
    username, 
    passwordHash, 
    displayName, 
    role: role || 'user' 
  });
  return user;
};

export default mongoose.model('User', userSchema);
