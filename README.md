# Chronicle — Modern Engineering & Content Platform

![CI](https://github.com/rajendrabist07/content-platform-web/actions/workflows/ci.yml/badge.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-5.0-FCC72B?style=flat&logo=vitest)

**Chronicle** is an enterprise-grade, portfolio-level content publishing platform built with Next.js 16 (App Router), TypeScript, and Tailwind CSS v4. It features on-demand ISR, Gemini AI writing assistance, WCAG 2.2 AA accessibility, full SEO/OpenGraph social sharing, real-time-feeling notifications, and token-based authenticated CRUD workflows.

---

## 🏗 Architecture Overview

```
                            ┌─────────────────────────────────────────┐
                            │               Chronicle Web             │
                            │      (Next.js 16 App Router on Vercel)  │
                            └────────────────────┬────────────────────┘
                                                 │
                                                 │ HTTPS / JSON
                                                 ▼
                            ┌─────────────────────────────────────────┐
                            │           Content Platform API          │
                            │        (Node.js / Express on Render)    │
                            └────────────────────┬────────────────────┘
                                                 │
                                ┌────────────────┴────────────────┐
                                ▼                                 ▼
                    ┌───────────────────────┐         ┌───────────────────────┐
                    │ PostgreSQL Database   │         │ Google Gemini AI SDK  │
                    │      (Neon DB)        │         │   (Writing Assistant) │
                    └───────────────────────┘         └───────────────────────┘
```

### Route Architecture & Rendering Strategy

| Path | Rendering Type | Description |
| :--- | :--- | :--- |
| `/` | **ISR / SSG** (`revalidate: 60s`) | Landing page with Hero, Features, Recent Articles |
| `/explore` | **Dynamic SSR** | Search-as-you-type feed, topic chips, pagination |
| `/read/[slug]` | **Dynamic SSR + ISR** | Sanitized Markdown reader, OpenGraph images, discussion |
| `/tags/[tag]` | **Dynamic SSR** | Topic landing feed with curated articles |
| `/u/[id]` | **Dynamic SSR** | Public author profile, bio, published stories |
| `/posts` | **Client (Protected)** | User article dashboard with Draft/Published filters |
| `/posts/new` | **Client (Protected)** | Markdown editor with live preview and AI Assistant |
| `/posts/[id]` | **Client (Protected)** | Post detail with edit/publish/delete & comment moderation |
| `/notifications` | **Client (Protected)** | Unread/All notification center with auto-polling |
| `/bookmarks` | **Client (Protected)** | Saved stories feed with reading time and quick links |
| `/settings` | **Client (Protected)** | Profile update, Password change, Verification info |
| `/privacy`, `/terms`| **Static SSG** | Platform legal agreements |

---

## 🌟 Key Features

1. **AI Writing Assistant (Gemini)**:
   - **Suggest Tab**: Generates catchy titles, relevant topic tags, and concise summaries.
   - **Improve Tab**: Rewrites text into selectable tones (*Professional, Engaging, Concise, Technical, Casual*).
   - **Outline Tab**: Generates structured Markdown outlines with headings and bullet points.

2. **Rich Markdown Editor (`MarkdownEditor`)**:
   - Write & Preview tabs with GFM (GitHub Flavored Markdown) and HTML sanitization (`rehype-sanitize`).
   - Formatting toolbar: Bold, Italic, Headings (H2/H3), Links, Code Blocks, Quotes, Lists.
   - Live metrics: word count, character count, estimated reading time (`~X min read`).
   - Autosave drafts to `localStorage` with restoration prompts.

3. **SEO & Social Sharing**:
   - Dynamic OpenGraph and Twitter cards generated on demand (`app/read/[slug]/opengraph-image.tsx`).
   - Structured Data (`JSON-LD`) for `WebSite`, `Organization`, `BlogPosting`, `BreadcrumbList`, and `ProfilePage`.
   - Dynamic `sitemap.xml` and `robots.txt` configuration.

4. **Design System & Accessibility (WCAG 2.2 AA)**:
   - Built-in Dark Mode with anti-flash script (`theme-init.js`).
   - Semantic primitives in `app/components/ui/`: `Button`, `Input`, `Textarea`, `Card`, `Badge`, `Avatar`, `Skeleton`, `ToastProvider`, `Modal`, `DropdownMenu`, `Tabs`, `EmptyState`, `Pagination`, `Tooltip`.
   - Skip-to-main-content accessible navigation link.
   - Keyboard accessible navigation and `prefers-reduced-motion` animations handling.

5. **Security & Performance**:
   - Enterprise security headers: HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
   - Silent JWT token refresh with module-level locking in `app/lib/api.ts` to prevent race conditions.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/rajendrabist07/content-platform-web.git
cd content-platform-web
npm install
```

### 2. Environment Configuration
Create a `.env.local` file based on `.env.example`:
```bash
cp .env.example .env.local
```

Configure your backend URL:
```env
NEXT_PUBLIC_API_URL=https://content-platform-e3tj.onrender.com/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Tests & Validation
```bash
# Run unit and component test suites with Vitest
npm test

# Type check
npx tsc --noEmit

# Production build test
npm run build
```

---

## 🧪 Testing Suite

Tests are located in the `__tests__/` directory and run via Vitest + Testing Library:
- `__tests__/Button.test.tsx` — Button rendering, sizes, variants, loading states.
- `__tests__/Primitives.test.tsx` — Avatar, Badge, Skeleton, Card, Toast primitives.
- `__tests__/LoginPage.test.tsx` — Authentication form submission and error rendering.
- `__tests__/VerifyEmail.test.tsx` — Email verification token extraction and error handling.
- `__tests__/passwordStrength.test.ts` — Password complexity scoring and feedback.
- `__tests__/public.test.ts` — Reading time calculator and public fetchers.
- `__tests__/redirect.test.ts` — Open redirect prevention (`safeNextPath`).
- `__tests__/time.test.ts` — Relative time formatting (`formatRelativeTime`).
- `__tests__/validation.test.ts` — Zod schema validation rules.

---

## 📄 License
MIT License © 2026 Chronicle Engineering Team.
