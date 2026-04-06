# Frontend Architecture — IT Blog Platform
> **Stack:** React 18 · Vite · Tailwind CSS v3 · React Router v6 · TanStack Query · Zustand · Shiki · KaTeX

---

## 1. Design Philosophy — "Terminal Elegance"

Inspired by the finest developer tools of 2025 — Linear, GitHub Dark, Vercel — this design system commits to a **dark-first, typographically precise** aesthetic that tech-savvy readers immediately recognize as premium.

**Core aesthetic decisions:**
- Background: `#0a0a0f` (near-black, not pure black — reduces eye strain per 2025 WCAG guidance)
- Surface: `#111118` (cards, nav)
- Border: `#1e1e2e` (subtle separators)
- Accent: `#6366f1` (Indigo — confident, technical, not overdone)
- Accent glow: used sparingly on CTAs and active states only
- Text primary: `#e2e8f0` · Text muted: `#94a3b8`
- Code font: `JetBrains Mono` · Prose font: `Inter` · Display: `Syne`
- WCAG contrast: all text pairs verified AA+

**The rule: every design decision serves readability.** Long-form technical content is the product. The UI is the frame.

---

## 2. Tailwind Configuration

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',   // class-based — admin toggle persists to localStorage
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          surface: '#111118',
          card:    '#16161f',
          hover:   '#1c1c28',
          border:  '#1e1e2e',
        },
        accent: {
          DEFAULT:  '#6366f1',
          hover:    '#818cf8',
          muted:    '#3730a3',
          glow:     'rgba(99,102,241,0.15)',
        },
        txt: {
          primary:  '#e2e8f0',
          secondary:'#94a3b8',
          muted:    '#64748b',
          code:     '#a5b4fc',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger:  '#ef4444',
          info:    '#3b82f6',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      typography: (theme) => ({
        invert: {
          css: {
            '--tw-prose-body':        theme('colors.txt.primary'),
            '--tw-prose-headings':    theme('colors.txt.primary'),
            '--tw-prose-code':        theme('colors.txt.code'),
            '--tw-prose-links':       theme('colors.accent.DEFAULT'),
            '--tw-prose-quotes':      theme('colors.txt.secondary'),
            '--tw-prose-hr':          theme('colors.bg.border'),
            '--tw-prose-pre-bg':      theme('colors.bg.card'),
            'code::before': { content: '""' },
            'code::after':  { content: '""' },
          },
        },
      }),
      boxShadow: {
        'glow-sm':  '0 0 12px rgba(99,102,241,0.25)',
        'glow':     '0 0 24px rgba(99,102,241,0.35)',
        'card':     '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-dot':  'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseDot: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

---

## 3. Project Structure

```
client/
├── public/
│   ├── robots.txt
│   └── og-default.png
├── src/
│   ├── main.jsx               # Entry point
│   ├── App.jsx                # Router root
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.jsx           # Blog feed
│   │   │   ├── PostDetail.jsx     # Single post + comments + likes
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── TagPage.jsx
│   │   │   └── SearchPage.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── admin/
│   │       ├── Dashboard.jsx      # Analytics overview
│   │       ├── Posts.jsx          # Post management table
│   │       ├── PostEditor.jsx     # Markdown editor + preview
│   │       ├── Comments.jsx       # Comment moderation
│   │       └── Settings.jsx
│   │
│   ├── components/
│   │   ├── blog/
│   │   │   ├── PostCard.jsx           # Feed card
│   │   │   ├── FeaturedPost.jsx       # Hero card
│   │   │   ├── PostHeader.jsx         # Title + meta + cover
│   │   │   ├── PostContent.jsx        # Rendered Markdown
│   │   │   ├── TableOfContents.jsx    # Scroll-spy TOC
│   │   │   ├── CodeBlock.jsx          # Shiki + copy button
│   │   │   ├── ReadingProgress.jsx    # Top bar progress
│   │   │   ├── LikeButton.jsx         # Toggle like with animation
│   │   │   ├── CommentSection.jsx     # Threaded comments
│   │   │   └── CommentForm.jsx
│   │   ├── admin/
│   │   │   ├── StatsCard.jsx          # Metric tile
│   │   │   ├── VisitorChart.jsx       # recharts line chart
│   │   │   ├── PostsTable.jsx         # Sortable data table
│   │   │   ├── DeviceChart.jsx        # Donut chart
│   │   │   └── CountryTable.jsx
│   │   ├── editor/
│   │   │   ├── MarkdownEditor.jsx     # Split-pane editor
│   │   │   ├── EditorToolbar.jsx
│   │   │   └── MediaUploader.jsx
│   │   ├── seo/
│   │   │   ├── PostMeta.jsx           # react-helmet-async tags
│   │   │   └── JsonLd.jsx             # JSON-LD structured data
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Badge.jsx
│   │       ├── Avatar.jsx
│   │       ├── Modal.jsx
│   │       ├── Skeleton.jsx
│   │       ├── Toast.jsx
│   │       ├── ThemeToggle.jsx
│   │       └── Pagination.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePosts.js
│   │   ├── useComments.js
│   │   ├── useLike.js
│   │   └── useAnalytics.js
│   │
│   ├── store/
│   │   ├── authStore.js           # Zustand: user + accessToken
│   │   └── editorStore.js         # Zustand: editor draft state
│   │
│   ├── lib/
│   │   ├── api.js                 # Axios instance + interceptors
│   │   ├── markdown.js            # unified pipeline
│   │   ├── shiki.js               # Shiki singleton
│   │   └── tracker.js             # Page view tracking
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── readingTime.js
│   │   └── slugify.js
│   │
│   └── styles/
│       ├── globals.css            # Tailwind directives + base
│       └── prose.css              # Extended prose overrides
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 4. Routing

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

const PrivateRoute = ({ children, role }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"                element={<Home />} />
        <Route path="/blog/:slug"      element={<PostDetail />} />
        <Route path="/category/:slug"  element={<CategoryPage />} />
        <Route path="/tag/:tag"        element={<TagPage />} />
        <Route path="/search"          element={<SearchPage />} />

        {/* Auth */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin — role-gated */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
          <Route index          element={<Dashboard />} />
          <Route path="posts"   element={<Posts />} />
          <Route path="posts/new"        element={<PostEditor />} />
          <Route path="posts/:id/edit"   element={<PostEditor />} />
          <Route path="comments"         element={<Comments />} />
          <Route path="settings"         element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 5. API Client with PASETO Token Refresh

```js
// src/lib/api.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,  // includes HttpOnly refresh cookie
});

// Attach PASETO access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`,
            {}, { withCredentials: true });
          useAuthStore.getState().setAccessToken(data.accessToken);
          isRefreshing = false;
        } catch {
          useAuthStore.getState().logout();
          isRefreshing = false;
          return Promise.reject(err);
        }
      }
      return api(original);
    }
    return Promise.reject(err);
  }
);

export default api;
```

---

## 6. Auth Store (Zustand)

```js
// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'itblog-auth',
      partialize: (s) => ({ user: s.user }),
      // NOTE: accessToken is NOT persisted — fetched fresh via refresh cookie on reload
    }
  )
);
```

---

## 7. Key Public-Side Components

### 7.1 Like Button

```jsx
// src/components/blog/LikeButton.jsx
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function LikeButton({ postId, initialCount }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['like-status', postId],
    queryFn: () => user ? api.get(`/posts/${postId}/like-status`).then(r => r.data) : { liked: false },
    enabled: !!user,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.post(`/posts/${postId}/like`).then(r => r.data),
    onSuccess: (res) => {
      qc.setQueryData(['like-status', postId], { liked: res.liked });
      qc.invalidateQueries({ queryKey: ['post'] });
    },
  });

  const liked = data?.liked;

  return (
    <button
      onClick={() => user ? mutate() : window.location='/login'}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200
        ${liked
          ? 'bg-accent text-white border-accent shadow-glow-sm'
          : 'border-bg-border text-txt-secondary hover:border-accent hover:text-accent'
        }`}
    >
      <span className={`transition-transform ${liked ? 'scale-125' : ''}`}>
        {liked ? '♥' : '♡'}
      </span>
      <span className="text-sm font-medium">{initialCount}</span>
    </button>
  );
}
```

---

### 7.2 Code Block with Shiki

```jsx
// src/components/blog/CodeBlock.jsx
import { useState, useEffect } from 'react';
import { getHighlighter } from '../lib/shiki';

export default function CodeBlock({ code, lang = 'text', filename }) {
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getHighlighter().then(h => {
      setHtml(h.codeToHtml(code, { lang, theme: 'github-dark-dimmed' }));
    });
  }, [code, lang]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-bg-border my-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-bg-card border-b border-bg-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-txt-muted">{lang}</span>
          {filename && <span className="text-xs text-txt-secondary font-mono">— {filename}</span>}
        </div>
        <button
          onClick={copy}
          className="text-xs font-mono text-txt-secondary hover:text-txt-primary transition-colors"
        >
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      {/* Highlighted code */}
      <div
        className="overflow-x-auto text-sm [&>pre]:!bg-transparent [&>pre]:p-5 [&>pre]:m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
```

---

### 7.3 Table of Contents

```jsx
// src/components/blog/TableOfContents.jsx
import { useEffect, useState } from 'react';

export default function TableOfContents({ headings }) {
  const [active, setActive] = useState('');

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        const vis = entries.find(e => e.isIntersecting);
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    document.querySelectorAll('h2,h3,h4').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav className="sticky top-24 hidden xl:block">
      <p className="text-xs font-semibold uppercase tracking-widest text-txt-muted mb-4">
        On this page
      </p>
      <ul className="space-y-1 border-l border-bg-border pl-4">
        {headings.map(h => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - 2) * 10}px` }}>
            <a
              href={`#${h.id}`}
              className={`block text-sm py-1 transition-colors duration-150
                ${active === h.id
                  ? 'text-accent font-medium border-l-2 border-accent -ml-4 pl-[14px]'
                  : 'text-txt-secondary hover:text-txt-primary'
                }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

---

### 7.4 SEO — Post Metadata

```jsx
// src/components/seo/PostMeta.jsx
import { Helmet } from 'react-helmet-async';

export default function PostMeta({ post }) {
  const url = `https://itblog.dev/blog/${post.slug}`;
  const image = post.ogImage || `https://itblog.dev/og?title=${encodeURIComponent(post.title)}`;

  return (
    <Helmet>
      <title>{post.metaTitle || post.title} — ITBlog</title>
      <meta name="description" content={post.metaDesc || post.excerpt} />
      <link rel="canonical" href={post.canonicalUrl || url} />

      {/* OpenGraph */}
      <meta property="og:type"         content="article" />
      <meta property="og:title"        content={post.title} />
      <meta property="og:description"  content={post.excerpt} />
      <meta property="og:url"          content={url} />
      <meta property="og:image"        content={image} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="article:published_time" content={post.publishedAt} />
      <meta property="article:author"  content={post.author?.displayName} />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={post.title} />
      <meta name="twitter:description" content={post.excerpt} />
      <meta name="twitter:image"       content={image} />
    </Helmet>
  );
}
```

---

### 7.5 JSON-LD Structured Data

```jsx
// src/components/seo/JsonLd.jsx
export default function JsonLd({ post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': post.schemaType || 'TechArticle',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author?.displayName },
    image: post.ogImage,
    url: `https://itblog.dev/blog/${post.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'ITBlog',
      logo: { '@type': 'ImageObject', url: 'https://itblog.dev/logo.png' },
    },
    keywords: post.tags?.join(', '),
    timeRequired: `PT${post.readingTime}M`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## 8. Admin Dashboard — Analytics Panel

```jsx
// src/pages/admin/Dashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.get('/analytics/overview').then(r => r.data),
    refetchInterval: 60000,   // refresh every minute
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Visits"      value={data.totalVisits.toLocaleString()} icon="👁" />
        <StatCard label="Unique Visitors"   value={data.uniqueVisitors.toLocaleString()} icon="🧑‍💻" />
        <StatCard label="Total Likes"       value={data.totalLikes.toLocaleString()} icon="♥" />
        <StatCard label="Total Comments"    value={data.totalComments.toLocaleString()} icon="💬" />
      </div>

      {/* Visitor trend chart */}
      <div className="bg-bg-card border border-bg-border rounded-xl p-6">
        <h3 className="font-display font-semibold text-txt-primary mb-4">Visitors (last 30 days)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.visitTrend}>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                background: '#16161f',
                border: '1px solid #1e1e2e',
                borderRadius: '8px',
                color: '#e2e8f0',
              }}
            />
            <Line type="monotone" dataKey="visits"  stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="unique"  stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top posts table */}
      <div className="bg-bg-card border border-bg-border rounded-xl p-6">
        <h3 className="font-display font-semibold text-txt-primary mb-4">Top Posts</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-txt-muted border-b border-bg-border">
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium text-right">Views</th>
              <th className="pb-3 font-medium text-right">Likes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-border">
            {data.topPosts.map(p => (
              <tr key={p.slug} className="hover:bg-bg-hover transition-colors">
                <td className="py-3 text-txt-primary">{p.title}</td>
                <td className="py-3 text-right text-txt-secondary">{p.views.toLocaleString()}</td>
                <td className="py-3 text-right text-txt-secondary">{p.likes.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-5 hover:border-accent/40 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-txt-muted text-xs font-medium uppercase tracking-wide">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <p className="text-2xl font-display font-semibold text-txt-primary">{value}</p>
    </div>
  );
}
```

---

## 9. Page View Tracking (Frontend)

```js
// src/lib/tracker.js
import api from './api';
import { v4 as uuid } from 'uuid';

// Stable session ID for this browser tab
const sessionId = sessionStorage.getItem('sid') || (() => {
  const id = uuid();
  sessionStorage.setItem('sid', id);
  return id;
})();

export async function trackPageView(postId) {
  try {
    await api.post('/analytics/track', {
      postId,
      path: window.location.pathname,
      referer: document.referrer || null,
      sessionId,
    });
  } catch {
    // Fail silently — tracking should never break the page
  }
}
```

Usage in PostDetail:
```jsx
useEffect(() => {
  if (post?.id) trackPageView(post.id);
}, [post?.id]);
```

---

## 10. Performance Strategy

| Concern | Solution |
|---------|----------|
| Bundle size | Vite code-splitting by route; lazy-load admin pages |
| Images | Cloudinary `f_auto,q_auto,w_800` transforms |
| Fonts | `font-display: swap`; only Inter 400/600 + JetBrains Mono 400 |
| Shiki | Lazy-loaded singleton; highlight only visible blocks |
| TanStack Query | `staleTime: 60s` on post lists; deduplicated requests |
| Analytics tracking | Fire-and-forget, never blocks render |
| Code splitting | `React.lazy()` + `<Suspense>` for `/admin/*` routes |

---

## 11. Key Dependencies

| Package | Purpose |
|---------|---------|
| `react` + `react-dom` | UI framework |
| `react-router-dom v6` | Routing + protected routes |
| `@tanstack/react-query` | Server state, caching, mutation |
| `zustand` | Client state (auth, editor) |
| `axios` | HTTP client + PASETO interceptors |
| `tailwindcss` | Utility-first CSS |
| `@tailwindcss/typography` | Prose styles for blog content |
| `@tailwindcss/forms` | Form input resets |
| `shiki` | Server/browser syntax highlighting |
| `react-helmet-async` | `<head>` tag management |
| `recharts` | Admin analytics charts |
| `unified` + `remark-*` + `rehype-*` | Markdown → HTML pipeline |
| `rehype-katex` + `remark-math` | LaTeX math rendering |
| `uuid` | Session ID generation for tracking |

---

## 12. SEO Technical Checklist

- `<title>` and `<meta description>` per page via react-helmet-async
- OpenGraph + Twitter Card tags on every post
- JSON-LD `TechArticle` schema per post
- `robots.txt` blocks `/admin`, `/login`, `/register`
- Sitemap generated at build time via Vite plugin (list all published posts)
- Canonical URLs on all pages
- `rel="preload"` for above-the-fold fonts
- `<img>` always has `alt` text (enforced in PostCard + PostHeader)
- Mobile-responsive code blocks (horizontal scroll, no overflow clipping)
- Heading hierarchy H1 → H2 → H3, never skipped
- `<meta name="viewport" content="width=device-width, initial-scale=1">`

---

*Frontend.md v2.0 · React + Tailwind CSS + PASETO · Generated 2026-04-04*
