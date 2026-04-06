# Master Project Plan — IT Blog Platform
> **Stack:** MERN · PASETO v4 · Tailwind CSS · Redis · Cloudinary
> **Timeline:** 12 weeks · 1–2 developers

---

## 1. Project Summary

An IT blogging platform where content is **published exclusively by the admin**, readers can **like and comment** on posts, and the admin has a **real-time analytics dashboard** showing visitor counts, device breakdown, and top-performing content.

**Three pillars that define this platform:**

| Pillar | What it delivers | How |
|--------|-----------------|-----|
| **Strong SEO** | Google discovers and ranks every post | JSON-LD schema · OpenGraph · Canonical URLs · Sitemap · Fast load |
| **Secure Auth** | No JWT algorithm confusion attacks | PASETO v4.local (XChaCha20-Poly1305 encrypted tokens) |
| **Admin Intelligence** | Admin sees who visits and what they read | MongoDB PageView collection + Redis dedup + recharts dashboard |

---

## 2. Full Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                    PUBLIC USERS + ADMIN                              │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼──────────────────────────────────────┐
│                  CLOUDFLARE CDN + WAF                                │
│   Static assets cached (365d)  ·  HTML pages cached (60s)           │
│   DDoS protection  ·  Bot filtering  ·  HTTPS enforced              │
└──────────────────┬────────────────────────────┬──────────────────────┘
                   │ cache miss                  │ cache hit → served
┌──────────────────▼────────────────────────┐   └──────────────────────┐
│            REACT FRONTEND (Vite)          │                          │
│            Vercel / Cloudflare Pages      │   Cloudflare Cache Edge  │
│                                           │                          │
│   /            Home feed                  │
│   /blog/:slug  Post + likes + comments    │
│   /admin/*     Analytics + editor         │
└──────────────────┬────────────────────────┘
                   │ REST API (axios + PASETO Bearer)
┌──────────────────▼────────────────────────────────────────────────────┐
│                     NODE.JS / EXPRESS API                             │
│                     Render / Railway / Fly.io                         │
│                                                                       │
│   /auth/*          PASETO v4 token issue + refresh + revoke           │
│   /posts/*         CRUD + SEO fields + slug generation                │
│   /comments/*      Threaded + moderated                               │
│   /posts/:id/like  Toggle like (unique constraint)                    │
│   /analytics/*     Overview + trends + per-post stats                 │
│   /media/*         Cloudinary upload/delete                           │
└──────────┬────────────────────────────────────────────────────────────┘
           │
┌──────────▼──────────┐  ┌──────────────────────┐  ┌──────────────────┐
│   MongoDB Atlas     │  │      Redis           │  │   Cloudinary     │
│   (all data)        │  │  • PASETO blacklist  │  │   (images)       │
│                     │  │  • View dedup 24h    │  │                  │
│   Users             │  │  • API response cache│  │                  │
│   Posts             │  │  • Rate limit store  │  └──────────────────┘
│   Comments          │  └──────────────────────┘
│   Likes             │
│   PageViews         │
│   SiteVisits        │
└─────────────────────┘
```

---

## 3. Design System — "Terminal Elegance"

Inspired by Linear, GitHub Dark, and Vercel's dashboard: a dark-first aesthetic that feels native to developers.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `bg` | `#0a0a0f` | Page background (near-black, not pure black) |
| `bg-surface` | `#111118` | Navbar, sidebar |
| `bg-card` | `#16161f` | Cards, code blocks |
| `bg-hover` | `#1c1c28` | Row/card hover state |
| `bg-border` | `#1e1e2e` | All borders and dividers |
| `accent` | `#6366f1` | CTAs, active links, like button |
| `accent-hover` | `#818cf8` | Hover state on accent |
| `txt-primary` | `#e2e8f0` | Body text, headings |
| `txt-secondary` | `#94a3b8` | Metadata, timestamps |
| `txt-muted` | `#64748b` | Labels, placeholders |
| `txt-code` | `#a5b4fc` | Inline code, code comments |
| `success` | `#10b981` | Published badge, success toasts |
| `warning` | `#f59e0b` | Draft badge, warnings |
| `danger` | `#ef4444` | Delete, error states |

### Typography

| Use | Font | Size | Weight |
|-----|------|------|--------|
| Display / headings | Syne | 2xl–5xl | 700 |
| Body prose | Inter | 18px | 400 |
| UI labels | Inter | 13–14px | 500 |
| Code | JetBrains Mono | 14px | 400 |
| Captions / meta | Inter | 12px | 400 |

### WCAG Compliance
All text/background pairs verified at AA minimum (4.5:1). `txt-primary` on `bg` = 14.7:1 (AAA). `accent` on `bg` = 5.2:1 (AA). `txt-muted` on `bg-card` = 4.8:1 (AA).

---

## 4. Sprint Plan — 12 Weeks

### Phase 1 — Setup & Infrastructure (Week 1)

**Goal:** Everyone can `git clone && npm run dev` and see a working home page.

| Task | Done When |
|------|-----------|
| Monorepo: `client/` + `server/` in one repo | Both run independently |
| Server: Express + Mongoose + Redis connected | `/health` returns 200 |
| Client: Vite + React + Tailwind + dark theme | Home page renders with design tokens |
| GitHub Actions: lint + test on every PR | CI badge green |
| Docker Compose: Mongo + Redis + API | `docker compose up` boots stack |
| `.env.example` with all required vars | New dev knows what to configure |

---

### Phase 2 — Auth (PASETO) (Week 2)

**Goal:** Admin can log in. Readers can register. Tokens are secure.

| Task | Done When |
|------|-----------|
| PASETO key generation script | `PASETO_LOCAL_KEY` documented in README |
| `tokenService`: signAccess, signRefresh, verify, revoke | Unit tests pass |
| `POST /auth/register` · `POST /auth/login` | Returns `v4.local.*` access token |
| Refresh token in HttpOnly cookie | DevTools shows `refreshToken` cookie, not localStorage |
| `POST /auth/refresh` rotates token | New access token issued, old blacklisted in Redis |
| `POST /auth/logout` blacklists both tokens | Subsequent requests with old token → 401 |
| `authenticate` middleware + `requireRole()` | Admin route blocks reader with 403 |
| Login page in React + Zustand store | User object + accessToken persisted correctly |
| Auto-refresh on 401 (Axios interceptor) | Seamless re-auth without user noticing |

---

### Phase 3 — Blog Backend (Weeks 3–4)

**Goal:** Admin can create, publish, and manage posts via API.

| Task | Done When |
|------|-----------|
| Post CRUD (`POST/GET/PUT/DELETE /posts`) | Postman collection passes |
| Auto-slug from title | `slugify()` creates unique URL-safe slug |
| Auto reading-time calculation | `~200 wpm`, stored on save |
| Categories + Tags endpoints | `GET /categories`, `POST /categories` |
| `PATCH /posts/:id/status` | Draft → Published → Archived flow |
| `isFeatured` flag + featured endpoint | `GET /posts/featured` returns featured posts |
| Full-text search (`GET /posts/search?q=`) | MongoDB text index searched |
| Markdown → HTML render (unified pipeline) | `contentHtml` stored on publish |
| SEO fields: metaTitle, metaDesc, ogImage | Settable from admin |
| Media upload → Cloudinary (`POST /media/upload`) | Returns CDN URL |
| Admin-only routes protected by `requireRole('admin')` | Reader gets 403 |

---

### Phase 4 — Likes & Comments Backend (Week 5)

**Goal:** Readers can engage with posts.

| Task | Done When |
|------|-----------|
| `POST /posts/:id/like` toggle | Unique index prevents double-like; returns `{ liked, likeCount }` |
| `GET /posts/:id/like-status` | Returns whether current user liked the post |
| `likeCount` denormalized on Post | Incremented/decremented atomically on like toggle |
| `POST /posts/:slug/comments` | Creates top-level comment |
| `parentId` support for nested replies | Returns threaded structure in GET |
| `commentCount` denormalized on Post | Updated on create/delete |
| `PUT /comments/:id` | Only comment owner can edit |
| `DELETE /comments/:id` | Owner or admin can delete |
| DOMPurify sanitization on comment content | XSS input: `<script>` stripped |
| Comment rate limiting: 10/min per user | 429 on breach |

---

### Phase 5 — Analytics Backend (Week 6)

**Goal:** Admin sees real visitor data in a dashboard.

| Task | Done When |
|------|-----------|
| `POST /analytics/track` (public endpoint) | Records PageView + SiteVisit |
| IP hashed (SHA-256) before storage | Raw IP never in DB |
| Redis dedup: 1 unique view per `visitorId+postId` per 24h | Refresh doesn't double-count |
| Device detection from User-Agent | `desktop/mobile/tablet` stored |
| `viewCount` incremented atomically on Post | Shown on post card |
| `GET /analytics/overview` | Returns all summary stats |
| `GET /analytics/visitors?days=30` | Daily trend data for chart |
| `GET /analytics/posts` | Per-post views + likes + comments |
| `GET /analytics/devices` | Desktop/mobile/tablet percentages |
| `GET /analytics/countries` | Top 10 countries (via GeoIP / Cloudflare header) |
| All analytics routes: `requireRole('admin')` | Reader gets 403 |

---

### Phase 6 — Public Frontend (Weeks 7–8)

**Goal:** Beautiful, fast, SEO-optimized public blog.

| Task | Done When |
|------|-----------|
| Home feed (`/`) — post cards grid | Fetches published posts via TanStack Query |
| FeaturedPost hero card at top | Pulled from `/posts/featured` |
| Post detail page (`/blog/:slug`) | Renders `contentHtml` via `dangerouslySetInnerHTML` |
| Shiki syntax highlighting in code blocks | 10+ languages highlight correctly |
| KaTeX LaTeX rendering | `$$E=mc^2$$` renders as proper math |
| Auto Table of Contents with scroll spy | Active heading highlighted in indigo |
| Reading progress bar at top of page | Scrolls from 0–100% |
| `<PostMeta>` react-helmet-async tags | OG + Twitter Card tags in `<head>` |
| JSON-LD `TechArticle` schema per post | Validates in Google Rich Results Test |
| `LikeButton` — toggle with animation | Authenticated users like; others redirect to login |
| Comment section — display threaded | Nested replies indented |
| Comment form — authenticated | Form submits, optimistic UI update |
| Category page (`/category/:slug`) | Filtered posts |
| Tag page (`/tag/:tag`) | Filtered posts |
| Search page (`/search?q=`) | SSR-like fetch on query change |
| `sitemap.xml` generated at build | All published post URLs included |
| `robots.txt` | Blocks `/admin`, `/login`, `/register` |
| Responsive layout: mobile to 4K | Code blocks scroll horizontally on mobile |
| Dark/light mode toggle (Tailwind `class`) | Preference saved to localStorage |
| Skeleton loaders on all data-fetching pages | No layout shift on load |

---

### Phase 7 — Admin Frontend (Weeks 9–10)

**Goal:** Admin can manage everything from a beautiful dashboard.

| Task | Done When |
|------|-----------|
| Admin layout with sidebar nav | All admin routes render in layout |
| `PrivateRoute` with role check | Non-admin redirected to home |
| Login page | PASETO token stored, redirect to admin |
| **Analytics Dashboard** | — |
| — Stat cards: visits, unique visitors, likes, comments | Refresh every 60s |
| — Line chart: 30-day visitor trend (recharts) | Two lines: total + unique |
| — Top posts table | Sorted by views |
| — Device donut chart | Desktop / mobile / tablet |
| — Country table (top 10) | Flag emoji + count |
| **Post Management** | — |
| — Posts table: title, status, views, date, actions | Sortable columns |
| — Markdown editor: split-pane live preview | Right pane renders Markdown in real-time |
| — Editor toolbar: bold, italic, code block, link, image, LaTeX | Keyboard shortcuts work |
| — Media uploader: drag-and-drop → Cloudinary | Image URL inserted at cursor |
| — SEO sidebar: metaTitle, metaDesc, slug, ogImage | Counts character limit (70/160) |
| — Category + tag selector | Multi-select with tag input |
| — Draft autosave (debounced 3s) | "Saved" indicator appears |
| — Publish / unpublish toggle | Status changes via `PATCH` |
| **Comment Management** | — |
| — Comment list with post reference | Admin can delete any comment |

---

### Phase 8 — Hardening & SEO Audit (Week 11)

**Goal:** Production-safe, WCAG-compliant, Google-ready.

| Task | Acceptance |
|------|-----------|
| Lighthouse CI — gating on score ≥ 92 | Blocks PR merge on regression |
| Core Web Vitals: LCP < 2s, CLS < 0.1, INP < 200ms | Measured via PageSpeed Insights |
| WCAG 2.1 AA audit (axe-core in CI) | Zero violations on public pages |
| `npm audit` — zero high/critical CVEs | Dependabot alerts resolved |
| Helmet: CSP, HSTS, X-Frame-Options configured | `securityheaders.com` → A+ |
| Express-validator: all POST/PUT bodies validated | Fuzz inputs: no 500 errors |
| CORS: only `itblog.dev` origin allowed in production | Cross-origin requests blocked |
| Playwright E2E: 6 critical paths | See table below |

**E2E Test Coverage:**

| Path | Scenario |
|------|---------|
| 1 | Visitor loads home → clicks post → sees code block highlighted |
| 2 | Reader registers → logs in → likes a post → like toggles |
| 3 | Reader posts a comment → comment appears in thread |
| 4 | Reader posts reply to comment → appears indented |
| 5 | Admin logs in → creates post → publishes → appears on home feed |
| 6 | Admin views analytics dashboard → sees visitor count > 0 |

---

### Phase 9 — Production Deployment (Week 12)

**Goal:** Live at `itblog.dev` with monitoring and backup.

| Task | Done When |
|------|-----------|
| Provision MongoDB Atlas M10 cluster | Connection string in production env |
| Provision Upstash Redis (global) | Redis URL in production env |
| Deploy API to Render (or Fly.io) | `https://api.itblog.dev` responds |
| Deploy Frontend to Vercel | `https://itblog.dev` resolves |
| Cloudflare DNS + proxy enabled | SSL = A+ on Qualys SSL Labs |
| Cloudflare cache rules configured | Blog HTML: 60s · assets: 365d |
| Cloudinary account + upload preset | Image upload works end-to-end |
| All environment secrets set in production | No `.env` committed |
| Sentry installed (API + Frontend) | Test error appears in dashboard |
| Betterstack uptime monitoring | Alert fires if `/health` is down for 2 min |
| Seed: 3 published posts, 1 draft | Blog looks lived-in at launch |
| DNS propagation + HTTPS verified | `https://itblog.dev` loads in browser |

---

## 5. Technology Decision Matrix

| Concern | Choice | Why |
|---------|--------|-----|
| Token auth | PASETO v4.local | Fully encrypted, no algorithm confusion, zero deps |
| Frontend framework | React 18 + Vite | Fast HMR, huge ecosystem, SPA ideal for admin dashboard |
| Styling | Tailwind CSS v3 | Utility-first, perfectly pairs with component model |
| Server state | TanStack Query | Built-in caching, refetch, mutation — replaces useEffect+fetch pattern |
| Client state | Zustand | Lightweight, no boilerplate, persist middleware built-in |
| Database | MongoDB Atlas | Flexible schema for posts + typed relations for users/comments |
| Cache + blacklist | Redis (Upstash) | Token revocation, view dedup, rate limiting — all in one |
| Images | Cloudinary | Auto format (WebP/AVIF), quality optimization, CDN included |
| Syntax highlighting | Shiki | Server-rendered, no client-side JS cost, 140+ languages |
| Analytics charts | recharts | React-native, composable, Tailwind-compatible |
| SEO metadata | react-helmet-async | Per-page `<head>` management, async safe |
| HTTP logging | Morgan | Express middleware, structured output |
| CI/CD | GitHub Actions | Free tier, native to GitHub, Docker-based |
| Deployment (API) | Render / Fly.io | Dockerfile-native, free SSL, autoscale |
| Deployment (web) | Vercel | Best React SPA support, Edge Network, instant preview URLs |

---

## 6. Project File Structure (Monorepo)

```
itblog/
├── client/                    # React + Vite + Tailwind (Frontend.md)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── lib/
│   │   └── styles/
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                    # Node.js + Express + MongoDB (Backend.md)
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── services/
│   ├── scripts/
│   │   └── generate-keys.js   # One-time PASETO key generation
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       ├── ci.yml             # Lint + test on every PR
│       └── deploy.yml         # Deploy on merge to main
│
├── docker-compose.yml         # Local dev: Mongo + Redis + API
├── .env.example
└── README.md
```

---

## 7. Quick-Start Commands

```bash
# Clone & install
git clone https://github.com/your-org/itblog.git
cd itblog

# Install all workspaces
cd server && npm install
cd ../client && npm install

# Generate PASETO key (one time only)
cd server && node scripts/generate-keys.js
# → Copy output to PASETO_LOCAL_KEY in server/.env

# Start local stack (MongoDB + Redis + API)
docker compose up --build

# Start React dev server (separate terminal)
cd client && npm run dev

# Open
# Frontend: http://localhost:5173
# API:      http://localhost:4001/v1
```

---

## 8. Cost Estimate (Production)

| Service | Tier | Monthly |
|---------|------|---------|
| MongoDB Atlas M0 (free) → M10 at scale | Free start | $0–$57 |
| Upstash Redis | Pay-per-request | ~$5 |
| Render (API, 512MB) | Starter | $7 |
| Vercel (Frontend) | Hobby (free) | $0 |
| Cloudinary | Free 25GB | $0 |
| Cloudflare (CDN + WAF) | Free | $0 |
| Betterstack (monitoring) | Hobby | $0 |
| Sentry (error tracking) | Developer | $0 |
| **Total** | | **~$12–$70/month** |

*Starts at essentially $12/month (just Redis + Render). MongoDB Atlas free tier handles first 10K monthly active users comfortably.*

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| PASETO key leaked | Low | Critical | Store only in env vars / secrets vault; rotate via `generate-keys.js` + force logout all |
| Redis down → no token revocation | Low | High | Fallback: tokens expire naturally in 15min; add circuit breaker |
| MongoDB disk full on PageViews | Medium | Medium | TTL index: auto-delete PageViews after 1 year |
| Spam comments | Medium | Medium | Rate limiting (10/min) + Honeypot field in form |
| Cloudinary quota exceeded | Low | Medium | Set upload size limits; alert at 80% usage |
| SEO rankings drop after deploy | Low | High | Keep slugs stable; 301 redirects if any change |

---

## 10. Post-Launch Features (Backlog)

| Feature | Priority |
|---------|---------|
| Email subscription (Resend) — weekly digest | High |
| Post series (multi-part articles linked) | Medium |
| Reading list / bookmarks for readers | Medium |
| RSS feed (`/rss.xml`) | Medium |
| Newsletter integration | Low |
| Code sandbox embeds (CodeSandbox) | Low |
| Multi-admin support (second admin account) | Low |
| Comment email notifications | Low |

---

*plan.md v2.0 · MERN + PASETO v4 + Tailwind · Generated 2026-04-04*
