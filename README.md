# Vinayaka Youth Vasavi Nagar — Podalakur

A full-stack, mobile-first festival community web app for Ganesh Chaturthi: live countdown, events, a folder-organized media gallery, and coordinator profiles — all managed from a protected admin dashboard.

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + React Router
- **Backend:** FastAPI + SQLAlchemy + JWT auth (bcrypt password hashing)
- **Database:** SQLite by default (zero setup); swap in PostgreSQL via one env var

```
vinayaka-youth-app/
├── backend/     FastAPI app, models, routers, media storage
└── frontend/    React + Vite + Tailwind app
```

---

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env — see below
```

### Configure `.env`

| Variable | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | SQLite by default. For Postgres: `postgresql://user:password@localhost:5432/vinayaka_youth` | `sqlite:///./vinayaka_youth.db` |
| `JWT_SECRET_KEY` | **Change this** to a long random string in production | dev placeholder |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session length | `1440` (24h) |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173,http://localhost:3000` |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Auto-created admin account on first run (only if no admin exists yet) | `admin` / — / **change this password** |
| `MEDIA_ROOT` | Folder where uploaded images are saved | `./media` |
| `MEDIA_URL_PREFIX` | URL path images are served under | `/media` |

**Never commit `.env` or hardcode secrets** — it's already in `.gitignore`.

### First login / resetting admin credentials

The admin account is auto-created **once**, on the very first server startup, using the `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` values in `.env` at that moment. If you edit `.env` afterward, the database still has the old credentials — editing `.env` alone does not update an existing admin.

To apply new admin credentials from `.env` to the database, run:

```bash
cd backend
source venv/bin/activate
python reset_admin.py
```

This updates the existing admin (or creates one if none exists yet) to match whatever is currently in `.env`.

### Run it

```bash
uvicorn app.main:app --reload --port 8000
```

On first startup the app creates all tables and seeds the admin account from `.env`. API docs are then available at `http://localhost:8000/docs`.

### Using PostgreSQL instead of SQLite

1. Create a database: `createdb vinayaka_youth`
2. Set `DATABASE_URL=postgresql://user:password@localhost:5432/vinayaka_youth` in `.env`
3. `psycopg2-binary` is already in `requirements.txt` — no other changes needed.

---

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL if your backend isn't on localhost:8000
npm run dev
```

Visit `http://localhost:5173`. The dev server proxies nothing — it talks directly to `VITE_API_URL` (CORS is handled on the backend via `CORS_ORIGINS`).

### Build for production

```bash
npm run build      # outputs to frontend/dist
npm run preview    # serve the production build locally
```

Deploy `frontend/dist` as static files behind any web server/CDN, and point `VITE_API_URL` (baked in at build time) at your deployed backend.

---

## 3. First login

Use the admin credentials from `backend/.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`) at `/login`. From there:

1. **`/admin/countdown`** — set the active countdown (creating a new one automatically deactivates the old one)
2. **`/admin/events`** — add festival events
3. **`/admin/media`** — create folders and upload photos (folders can also be created inline while uploading)
4. **`/admin/coordinators`** — add team members with a profile photo

Everything on the public site (`/`, `/events`, `/media`, `/coordinators`) is loaded live from the database — no frontend code changes needed to update content.

---

## 4. Timezone: everything is IST

This is a single-timezone community site (Podalakur, India), so the app never does browser-timezone conversion:

- Admin date/time inputs are two plain fields (date + time) with an "IST (Asia/Kolkata)" label — whatever the admin types is exactly what's stored and exactly what's shown to visitors, with no `Date` object conversion in between.
- On the public site, countdown and event times are always rendered in IST (via `timeZone: 'Asia/Kolkata'`), so a visitor browsing from any timezone still sees the correct Podalakur-local time — not their own local time.

## 5. Accounts: public browsing vs. member accounts vs. admin

- **No login required** to browse events, the media gallery, or coordinators, or to download any photo.
- **`/signup`** lets anyone create a regular member account (name, email, password) — this is separate from the admin account and can never create an admin. It exists for members who want a personalized/logged-in experience; it isn't required for viewing or downloading.
- The **admin account** is only ever created via the `.env` seed on first startup (see section 1) — there's no public path to an admin role.

## 6. Security notes

- All `/api/admin/*` routes require a valid JWT **and** the `ADMIN` role, enforced server-side — hiding buttons on the frontend is not relied on for security.
- Passwords are hashed with bcrypt; plaintext passwords are never stored.
- Uploaded images are validated by content-type and extension (jpg/png/webp/gif) and capped at 10MB (5MB for coordinator photos).
- Rotate `JWT_SECRET_KEY` and the seeded admin password before deploying publicly.

---

## 7. Notes on the hero carousel

The hero carousel (16:9, title text on the left) uses **3 fixed image links you set yourself** in `frontend/src/config/heroSlides.ts` — not uploaded media. Open that file and replace the `imageUrl` (and `eyebrow`/`title`) for each of the 3 slides with your own direct image links. Leave `imageUrl` as an empty string to fall back to a designed gradient background for that slide instead of a photo.

The login/signup illustration is an original abstract SVG (arch + diya + marigold motif) rather than a stock photo, so the project ships with zero external image dependencies.
