# Chronicle Frontend & Backend Operations Runbook

This runbook covers incident response procedures, diagnostics, health checks, and post-deployment smoke verification for the Chronicle production stack.

---

## 1. System Architecture & Topology

- **Frontend:** Next.js (App Router, TypeScript, Tailwind CSS) deployed on **Vercel**.
- **Backend:** Node.js / Express API deployed on **Render** (`https://content-platform-e3tj.onrender.com/api/v1`).
- **Database:** PostgreSQL on Render, managed via **Prisma ORM**.
- **AI Service:** Google Gemini 2.0 API.

---

## 2. Troubleshooting & Incident Diagnostic Guide

### Symptom A: Registration or Login shows "Something went wrong on our side" (HTTP 500)

1. **Root Cause Analysis:**
   - Check Render service logs at [dashboard.render.com](https://dashboard.render.com).
   - Look for Prisma errors:
     - `P2021: The table public.<table_name> does not exist` (e.g. `post_likes`, `notifications`).
     - `P2022: The column <table_name>.<column_name> does not exist` (e.g. `users.emailVerifiedAt`).
   - This occurs when backend code updates Prisma schema without running migrations on the live database.

2. **Resolution Steps:**
   - Open Render Web Service Dashboard $\rightarrow$ **Shell** tab.
   - Run:
     ```bash
     npx prisma migrate deploy
     ```
     *(or `npx prisma db push` if running unversioned schema sync)*.
   - To prevent future occurrences, ensure the Render Build Command includes:
     ```bash
     npm run build && npx prisma migrate deploy
     ```

3. **Verification:**
   - In browser, open `https://content-platform-e3tj.onrender.com/api/v1/ready`.
   - Expected healthy response: `{"status":"ready","database":"connected"}` (HTTP 200).

---

### Symptom B: "We can't reach the server right now. It may be waking up"

1. **Root Cause:**
   - Render free-tier hosting suspends web service containers after 15 minutes of inactivity.
   - The first incoming request triggers container boot, which takes **30–50 seconds**.

2. **Expected Behavior:**
   - The frontend displays the animated `ServerWakingNotice` ("Waking up backend server...") and honest error alert with retry affordances.
   - Once awake, subsequent requests respond in < 150ms.

3. **Resolution / Mitigation:**
   - Wait 30–45 seconds and click **Try Again** or **Refresh**.
   - For 100% uptime without sleep, upgrade Render instance to a Starter tier or set up an automated ping cron.

---

### Symptom C: Public Home (`/`) shows "Latest articles are temporarily unavailable"

1. **Root Cause:**
   - The public posts endpoint `/api/v1/public/posts` timed out or returned a 5xx error.

2. **Resilience Feature:**
   - The Home page hero, features, and marketing sections continue to render seamlessly because the article feed fetch is isolated in an error boundary.
   - Next.js ISR (Incremental Static Regeneration) serves the stale cached version while background revalidations retry.

---

## 3. Post-Deploy Smoke Verification Checklist

After every frontend deploy to Vercel or backend deploy to Render, verify the following 5 critical flows:

- [ ] **1. Public Discovery (`/` and `/explore`):**
  - Home page loads latest articles.
  - Explore page loads search bar and topic tags (`/explore?tag=...`).
- [ ] **2. SEO & Metatags:**
  - `curl -I https://<site-url>/sitemap.xml` returns `200 OK` (`application/xml`).
  - `curl -I https://<site-url>/robots.txt` returns `200 OK`.
- [ ] **3. Authentication Flow (`/register` & `/login`):**
  - Register a new account or sign in with test credentials.
  - Token refresh works seamlessly on expiry.
- [ ] **4. Authoring & AI Companion (`/posts/new`):**
  - Markdown editor toolbar and draft autosave function.
  - Gemini AI Assistant returns title/tag suggestions.
- [ ] **5. Engagement & Reading (`/read/<slug>`):**
  - Article renders Markdown body cleanly with sanitized HTML.
  - Like, Bookmark, and nested comment replies work without 500 errors.
