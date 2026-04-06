import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts. Wait 1 minute.' },
});

export const commentLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  message: { error: 'Too many comments. Please slow down.' },
});

export const globalLimiter = rateLimit({
  windowMs: 60000,
  max: 120,
  message: { error: 'Too many requests. Please wait.' },
});
