# Backend Architecture — IT Blog Platform
> **Stack:** Node.js · Express.js · MongoDB · Mongoose · PASETO v4 · Redis · Cloudinary · Docker

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                     │
│         Public Blog (React)   ·   Admin Dashboard (React)           │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────────────┐
│                    CLOUDFLARE CDN + WAF                             │
│            Cache · DDoS protection · Bot filtering                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│               NGINX — Reverse Proxy + Rate Limiter                  │
└──────┬───────────────────┬────────────────────────┬─────────────────┘
       │                   │                        │
┌──────▼────────┐  ┌───────▼──────────┐  ┌─────────▼────────────┐
│   Auth API    │  │  Content API     │  │   Analytics API      │
│   :4001       │  │  :4002           │  │   :4003              │
└──────┬────────┘  └───────┬──────────┘  └─────────┬────────────┘
       │                   │                        │
┌──────▼───────────────────▼────────────────────────▼────────────────┐
│                        DATA LAYER                                   │
│   MongoDB Atlas (primary)  ·  Redis (cache + token blacklist)       │
│   Cloudinary (media)       ·  Node-cron (scheduled jobs)            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Why PASETO v4 Over JWT

| Concern | JWT | PASETO v4 |
|---------|-----|-----------|
| Algorithm confusion attacks | Vulnerable (`alg: none`) | Impossible — algorithm is fixed |
| Payload confidentiality | Base64 encoded (readable by anyone) | `v4.local` = XChaCha20-Poly1305 fully encrypted |
| Signing | Developer picks algorithm (risk) | Ed25519 hardcoded — no misconfig possible |
| Token format | `header.payload.signature` | `v4.public.<signed>` or `v4.local.<encrypted>` |
| Library (Node.js) | jsonwebtoken | `paseto` (npm, zero dependencies) |

**Strategy for this project:**
- `v4.local` (symmetric, encrypted) for **access tokens** — payload fully encrypted, 15 min TTL
- `v4.local` for **refresh tokens** — stored in `HttpOnly` cookie only, 7-day TTL
- Token revocation via **Redis SET** with matching TTL (logout / security invalidation)

---

## 3. PASETO Implementation

### 3.1 Key Generation (run once, store in env)

```js
// scripts/generate-keys.js
import { generateKey } from 'paseto';

const key = await generateKey('local'); // 32-byte symmetric key
console.log(key.export().toString('hex'));
// Copy the hex string → paste into PASETO_LOCAL_KEY in .env
```

### 3.2 Token Service

```js
// src/services/token.service.js
import { V4 } from 'paseto';
import { createSecretKey } from 'crypto';
import redis from '../config/redis.js';

const rawKey = Buffer.from(process.env.PASETO_LOCAL_KEY, 'hex');
const secretKey = createSecretKey(rawKey);

export const tokenService = {
  async signAccess(payload) {
    return V4.encrypt(
      { ...payload, type: 'access' },
      secretKey,
      { expiresIn: '15 min', issuer: 'itblog.dev', audience: 'itblog-api' }
    );
  },

  async signRefresh(payload) {
    return V4.encrypt(
      { ...payload, type: 'refresh' },
      secretKey,
      { expiresIn: '7 days', issuer: 'itblog.dev', audience: 'itblog-api' }
    );
  },

  async verify(token) {
    const payload = await V4.decrypt(token, secretKey, {
      issuer: 'itblog.dev',
      audience: 'itblog-api',
    });
    // Check revocation blacklist
    const isRevoked = await redis.get(`bl:${token}`);
    if (isRevoked) throw new Error('Token has been revoked');
    return payload;
  },

  async revoke(token, ttlSeconds) {
    await redis.set(`bl:${token}`, '1', 'EX', ttlSeconds);
  },
};
```

### 3.3 Auth Middleware

```js
// src/middleware/auth.middleware.js
import { tokenService } from '../services/token.service.js';

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Missing access token' });

    const token = header.slice(7);
    const payload = await tokenService.verify(token);

    if (payload.type !== 'access')
      return res.status(401).json({ error: 'Invalid token type' });

    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Role guard factory — usage: requireRole('admin')
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};
```

---

## 4. MongoDB Data Models

### 4.1 User

```js
// src/models/User.model.js
const userSchema = new mongoose.Schema({
  email:        { type: String, unique: true, required: true, lowercase: true },
  username:     { type: String, unique: true, required: true, lowercase: true },
  displayName:  { type: String, required: true },
  passwordHash: { type: String, required: true, select: false },
  role:         { type: String, enum: ['admin', 'reader'], default: 'reader' },
  avatar:       { type: String },                  // Cloudinary URL
  bio:          { type: String, maxlength: 300 },
  isActive:     { type: Boolean, default: true },
  lastLoginAt:  { type: Date },
}, { timestamps: true });

// Auto-hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = (plain) =>
  bcrypt.compare(plain, this.passwordHash);
```

**RBAC — Two roles only (clean & simple):**

| Capability | Reader | Admin |
|-----------|--------|-------|
| Read published posts | ✓ | ✓ |
| Like posts | ✓ | ✓ |
| Comment on posts | ✓ | ✓ |
| Create / edit / publish posts | ✗ | ✓ |
| Upload media | ✗ | ✓ |
| View analytics dashboard | ✗ | ✓ |
| Manage users & comments | ✗ | ✓ |

---

### 4.2 Post

```js
const postSchema = new mongoose.Schema({
  title:        { type: String, required: true, maxlength: 200 },
  slug:         { type: String, unique: true },
  excerpt:      { type: String, maxlength: 300 },
  content:      { type: String, required: true },  // raw Markdown
  contentHtml:  { type: String },                  // rendered + sanitized HTML (cached)
  coverImage:   { type: String },                  // Cloudinary URL
  author:       { type: ObjectId, ref: 'User', required: true },
  categories:   [{ type: ObjectId, ref: 'Category' }],
  tags:         [{ type: String, lowercase: true, trim: true }],
  status:       { type: String, enum: ['draft','published','archived'], default: 'draft' },
  isFeatured:   { type: Boolean, default: false },
  readingTime:  { type: Number },                  // auto-calculated minutes
  viewCount:    { type: Number, default: 0 },
  likeCount:    { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  publishedAt:  { type: Date },

  // SEO fields
  metaTitle:    { type: String, maxlength: 70 },
  metaDesc:     { type: String, maxlength: 160 },
  ogImage:      { type: String },                  // auto-generated if not set
  canonicalUrl: { type: String },
  schemaType:   { type: String, default: 'TechArticle' },
}, { timestamps: true });

// Auto-generate slug + reading time
postSchema.pre('validate', function (next) {
  if (!this.slug && this.title)
    this.slug = slugify(this.title, { lower: true, strict: true });
  const words = (this.content || '').split(/\s+/).length;
  this.readingTime = Math.ceil(words / 200);
  next();
});

// Text index for full-text search
postSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
postSchema.index({ status: 1, publishedAt: -1 });
```

---

### 4.3 Category

```js
const categorySchema = new mongoose.Schema({
  name:      { type: String, unique: true, required: true },
  slug:      { type: String, unique: true, required: true },
  desc:      { type: String },
  color:     { type: String, default: '#6366f1' },  // Tailwind indigo
  postCount: { type: Number, default: 0 },
}, { timestamps: true });
```

---

### 4.4 Comment

```js
const commentSchema = new mongoose.Schema({
  post:       { type: ObjectId, ref: 'Post', required: true },
  author:     { type: ObjectId, ref: 'User', required: true },
  parent:     { type: ObjectId, ref: 'Comment', default: null },  // nested replies
  content:    { type: String, required: true, maxlength: 2000 },
  isApproved: { type: Boolean, default: true },
  likeCount:  { type: Number, default: 0 },
}, { timestamps: true });

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parent: 1 });
```

---

### 4.5 Like

```js
// Separate collection — enforces one like per user per post
const likeSchema = new mongoose.Schema({
  post: { type: ObjectId, ref: 'Post', required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});
likeSchema.index({ post: 1, user: 1 }, { unique: true });
```

---

### 4.6 PageView (Analytics)

```js
const pageViewSchema = new mongoose.Schema({
  post:      { type: ObjectId, ref: 'Post', required: true },
  visitorId: { type: String },         // SHA-256(IP + UA) — privacy-safe
  path:      { type: String },
  referer:   { type: String },
  country:   { type: String },         // GeoIP lookup
  device:    { type: String, enum: ['desktop','mobile','tablet'] },
  sessionId: { type: String },
  createdAt: { type: Date, default: Date.now, expires: 31536000 },  // auto-delete after 1 year
});
pageViewSchema.index({ post: 1, createdAt: -1 });
pageViewSchema.index({ visitorId: 1, post: 1, createdAt: -1 });     // dedup queries
```

---

### 4.7 SiteVisit (Global — all pages)

```js
const siteVisitSchema = new mongoose.Schema({
  visitorId: { type: String },
  path:      { type: String },
  country:   { type: String },
  device:    { type: String },
  referer:   { type: String },
  isUnique:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 31536000 },
});
siteVisitSchema.index({ createdAt: -1 });
```

---

## 5. API Documentation

### Base URL
```
https://api.itblog.dev/v1
```

### 5.1 Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Create reader account |
| POST | `/auth/login` | Public | Returns PASETO access token + refresh cookie |
| POST | `/auth/refresh` | Cookie | Issue new access token |
| POST | `/auth/logout` | Bearer | Revoke both tokens in Redis |

**POST /auth/login — Response 200:**
```json
{
  "accessToken": "v4.local.ENCRYPTED_PAYLOAD",
  "expiresIn": 900,
  "user": { "id": "...", "username": "neo", "role": "reader", "avatar": "..." }
}
```
*Refresh token is set as `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh`*

---

### 5.2 Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/posts` | Public | Paginated published posts |
| GET | `/posts/featured` | Public | Featured posts |
| GET | `/posts/:slug` | Public | Single post (auto-tracks view) |
| GET | `/posts/search?q=` | Public | Full-text search |
| POST | `/posts` | Admin | Create post |
| PUT | `/posts/:id` | Admin | Update post |
| PATCH | `/posts/:id/status` | Admin | `{ "status": "published" }` |
| DELETE | `/posts/:id` | Admin | Soft-delete (status → archived) |

---

### 5.3 Likes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/posts/:id/like` | Bearer | Toggle like — returns `{ liked, likeCount }` |
| GET | `/posts/:id/like-status` | Bearer | Check if current user liked |

---

### 5.4 Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/posts/:slug/comments` | Public | Threaded comments (nested) |
| POST | `/posts/:slug/comments` | Bearer | Create comment or reply |
| PUT | `/comments/:id` | Owner | Edit own comment |
| DELETE | `/comments/:id` | Owner · Admin | Delete comment |

**POST body:**
```json
{ "content": "Excellent breakdown of CNI plugins!", "parentId": null }
```

---

### 5.5 Analytics (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | Summary stats card data |
| GET | `/analytics/visitors?days=30` | Daily visit chart |
| GET | `/analytics/posts` | Per-post performance table |
| GET | `/analytics/devices` | Device breakdown |
| GET | `/analytics/countries` | Top 10 countries |
| POST | `/analytics/track` | Record a page view from frontend |

**GET /analytics/overview — Response:**
```json
{
  "totalVisits": 24819,
  "uniqueVisitors": 11402,
  "totalPosts": 42,
  "totalLikes": 2104,
  "totalComments": 518,
  "avgReadingTime": 6,
  "topPosts": [
    { "title": "Docker Internals", "slug": "docker-internals", "views": 4201, "likes": 312 }
  ],
  "visitTrend": [
    { "date": "2026-04-01", "visits": 820, "unique": 501 }
  ],
  "deviceSplit": { "desktop": 61, "mobile": 33, "tablet": 6 }
}
```

---

### 5.6 Media (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/media/upload` | Multipart — uploads to Cloudinary |
| DELETE | `/media/:publicId` | Remove from Cloudinary |

---

### 5.7 Error Format (RFC 7807)

```json
{
  "type": "https://api.itblog.dev/errors/validation",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The 'slug' field must be unique.",
  "errors": [{ "field": "slug", "message": "Already taken" }]
}
```

---

## 6. Analytics — View Tracking Service

```js
// src/services/analytics.service.js
import crypto from 'crypto';
import redis from '../config/redis.js';
import PageView from '../models/PageView.model.js';
import Post from '../models/Post.model.js';

export async function trackView({ req, postId, path, referer, sessionId }) {
  const ip = req.headers['x-forwarded-for'] || req.ip;
  const ua = req.headers['user-agent'] || '';
  // SHA-256 hash — never store raw IP
  const visitorId = crypto.createHash('sha256').update(ip + ua).digest('hex');
  const dedupeKey = `view:${visitorId}:${postId}`;

  // One unique view per visitor per post per 24h
  const already = await redis.get(dedupeKey);
  if (already) return;
  await redis.set(dedupeKey, '1', 'EX', 86400);

  // Non-blocking write
  setImmediate(async () => {
    const device = detectDevice(ua);
    await PageView.create({ post: postId, visitorId, path, referer, device, sessionId });
    await Post.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });
  });
}

function detectDevice(ua = '') {
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
}
```

---

## 7. Rate Limiting

```js
// src/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis.js';

// Strict: login endpoint
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
  message: { error: 'Too many login attempts. Wait 1 minute.' },
});

// Moderate: comments
export const commentLimiter = rateLimit({ windowMs: 60000, max: 10 });

// General API
export const globalLimiter = rateLimit({ windowMs: 60000, max: 120 });
```

---

## 8. Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── redis.js
│   │   └── cloudinary.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Post.model.js
│   │   ├── Category.model.js
│   │   ├── Comment.model.js
│   │   ├── Like.model.js
│   │   ├── PageView.model.js
│   │   └── SiteVisit.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── post.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   ├── media.routes.js
│   │   └── analytics.routes.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.middleware.js    ← PASETO verify + requireRole()
│   │   ├── rateLimit.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── token.service.js     ← PASETO sign / verify / revoke
│   │   └── analytics.service.js
│   └── app.js
├── scripts/
│   └── generate-keys.js         ← Run once to create PASETO_LOCAL_KEY
├── .env.example
├── Dockerfile
└── package.json
```

---

## 9. Core Dependencies

| Package | Purpose |
|---------|---------|
| `paseto` | PASETO v4 tokens (zero dependencies) |
| `express` | HTTP framework |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing (cost 12) |
| `ioredis` | Redis client (token blacklist + cache) |
| `cloudinary` | Image/media storage |
| `slugify` | URL-safe post slugs |
| `express-validator` | Request body validation |
| `helmet` | Security headers |
| `express-rate-limit` | Rate limiting |
| `rate-limit-redis` | Redis-backed distributed rate limit |
| `node-cron` | Daily analytics aggregation jobs |
| `morgan` | HTTP request logging |

---

## 10. Security Checklist

| Concern | Solution |
|---------|----------|
| Token security | PASETO v4.local — fully encrypted, no algorithm confusion possible |
| Token revocation | Redis blacklist keyed by token, TTL = remaining token lifetime |
| Password storage | bcrypt, cost factor 12 |
| Refresh token storage | HttpOnly + Secure + SameSite=Strict cookie only (never JS-readable) |
| Rate limiting | 5/min on login; 10/min on comments; 120/min global (Redis-backed) |
| Input validation | express-validator on all POST/PUT routes |
| XSS prevention | DOMPurify server-side sanitization on comment/post HTML |
| CORS | Strict origin whitelist from env var |
| Security headers | Helmet: CSP, HSTS, X-Frame-Options, Referrer-Policy |
| Visitor privacy | IPs hashed SHA-256 before any storage — GDPR-friendly |

---

*Backend.md v2.0 · MERN + PASETO v4 · Generated 2026-04-04*
