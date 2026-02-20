# Deploy to Your Customer’s Render Account (Repo on GitHub)

This guide walks through keeping the repo on **your GitHub** and deploying the backend (and optionally the frontend) to **your customer’s Render account**.

---

## 1. GitHub: Repo and Access

### Option A – Customer uses your repo (recommended)

1. **Push your code to GitHub** (if not already):
   - Create a repo under your account (e.g. `your-org/pinata-image-api`).
   - Push the project (including `render.yaml`, `DEPLOY.md`, and `scripts/init-db.sql`).

2. **Give the customer access** so Render can connect:
   - **Repo Settings → Collaborators** (or **Manage access**): add the customer’s GitHub user as a collaborator with at least **Read** (or **Write** if they will push).
   - Or use a **GitHub App / OAuth** in the customer’s Render account that has access to this repo (see Render docs for “Connect repository”).

### Option B – Customer has their own copy

1. Customer **forks** your repo to their GitHub (or you transfer the repo to them).
2. They connect **their fork** in Render.  
   You lose direct control of their deploys; they get full control.

---

## 2. Customer’s Render Account: One-Time Setup

1. **Create a Render account** (or use existing): [render.com](https://render.com) → Sign up / Log in.
2. **Connect GitHub**:
   - **Account Settings → Integrations → GitHub** (or GitLab/Bitbucket).
   - Authorize Render for the org/user that owns the repo.
   - Ensure the repo `pinata-image-api` (or the fork) is visible/connected.

---

## 3. Deploy Backend + PostgreSQL with Blueprint

1. In Render: **Dashboard → New → Blueprint**.
2. **Connect repository**: choose the repo (e.g. `your-org/pinata-image-api`).  
   Render will look for `render.yaml` at the repo root.
3. **Apply the Blueprint**.  
   This creates:
   - A **PostgreSQL** database: `pinata-archive-db`.
   - A **Web Service**: `pinata-image-api` (Node, runs `npm start` from repo root).
4. **Set secret environment variables** for the **Web Service** (not the DB):
   - **Environment** tab of the `pinata-image-api` service:
     - `PINATA_JWT` = your Pinata JWT (or use `PINATA_API_KEY` + `PINATA_SECRET_API_KEY` instead of JWT).
     - `OPENAI_API_KEY` = your OpenAI API key (for image alt text).
   - Save. Render will redeploy.

5. **Note the backend URL**  
   Example: `https://pinata-image-api-xxxx.onrender.com`  
   Use this as the API URL for the frontend.

---

## 4. Create Database Tables (One-Time)

The app expects `image_likes` and `image_downloads` tables.

1. In Render: open the **PostgreSQL** service `pinata-archive-db`.
2. Copy the **Internal Database URL** (or External if you run from local).
3. **Option A – Render Shell**  
   - On the **Web Service** `pinata-image-api` → **Shell** tab.  
   - Run:  
     `psql "$DATABASE_URL" -f /dev/stdin <<'SQL'`  
     then paste the contents of `scripts/init-db.sql` and run.
4. **Option B – Local psql**  
   - Use the **External Database URL** from the Render DB dashboard.  
   - Run:  
     `psql "<paste External Database URL>" -f scripts/init-db.sql`

After this, the backend can record likes and downloads.

---

## 5. Frontend: Point to Customer’s Backend

The frontend uses **one** env var for the API base URL so each deploy (yours or customer’s) can point to the right backend.

- **Variable**: `NEXT_PUBLIC_API_URL`
- **Value**: backend URL from step 3, **no trailing slash**  
  Example: `https://pinata-image-api-xxxx.onrender.com`

Where to set it:

- **Vercel**: Project → Settings → Environment Variables → add `NEXT_PUBLIC_API_URL` for Production/Preview.
- **Render (if you deploy Next.js on Render)**: Web Service → Environment → add `NEXT_PUBLIC_API_URL`.

Then **rebuild/redeploy** the frontend so the new URL is baked in.

---

## 6. CORS: Allow Customer’s Frontend URL

The backend (`server.js`) has an `origin` allowlist. For the customer’s frontend to work, its URL must be allowed.

- If the **customer** will host the frontend (e.g. their Vercel/Render URL), add that origin to `server.js` in the `cors` config (e.g. `https://their-app.vercel.app` or `https://their-app.onrender.com`).
- Commit and push; redeploy the backend on Render (or rely on auto-deploy from GitHub).

---

## 7. Summary Checklist (Customer’s Render)

| Step | Where | What |
|------|--------|------|
| 1 | GitHub | Repo pushed; customer has access (or fork). |
| 2 | Render | GitHub connected; repo visible. |
| 3 | Render | New → Blueprint; connect repo; apply. |
| 4 | Render | Web Service env: `PINATA_JWT` (or Pinata keys), `OPENAI_API_KEY`. |
| 5 | Render / local | Run `scripts/init-db.sql` on PostgreSQL once. |
| 6 | Frontend host | Set `NEXT_PUBLIC_API_URL` = backend URL; rebuild. |
| 7 | Repo | Add customer’s frontend URL to CORS in `server.js` if needed. |

---

## 8. Optional: Deploy Frontend on Render

If the customer wants the frontend on Render (instead of Vercel):

1. **New → Web Service**.
2. Connect the **same repo**; set **Root Directory** to `frontend`.
3. **Build**: `npm install && npm run build`  
   **Start**: `npm start`
4. **Environment**:  
   - `NEXT_PUBLIC_API_URL` = `https://pinata-image-api-xxxx.onrender.com` (their backend).
   - Optionally `NEXT_PUBLIC_MAPBOX_API_KEY` if they use location in the upload form.
5. Add this frontend’s URL (e.g. `https://pinata-archive-xxxx.onrender.com`) to the backend CORS list in `server.js`.

---

## 9. Env Vars Reference

**Backend (Render Web Service)**  
- `DATABASE_URL` – set by Render when using Blueprint (from Postgres service).  
- `PINATA_JWT` – **or** `PINATA_API_KEY` + `PINATA_SECRET_API_KEY`.  
- `OPENAI_API_KEY` – for image alt text.  
- `PORT` – optional; Render sets it.  
- `NODE_ENV` – optional; Blueprint sets `production`.

**Frontend (Vercel / Render)**  
- `NEXT_PUBLIC_API_URL` – backend URL (e.g. `https://pinata-image-api-xxxx.onrender.com`).  
- `NEXT_PUBLIC_MAPBOX_API_KEY` – optional; for location in upload form.

---

You keep the repo on GitHub; the customer connects it in their Render account, sets env vars and CORS, runs the DB script once, and sets `NEXT_PUBLIC_API_URL` on the frontend. After that, deploys are driven by pushes to the connected branch (usually `main`).
