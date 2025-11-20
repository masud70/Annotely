# Annotely

Annotely is a two-part application for qualitative data annotation. The Next.js
client lets researchers upload structured datasets (CSV, JSON/JSONL, Parquet),
configure which columns matter, highlight keywords, assign labels, and capture
multi-value codes/themes for every row. The Express/Prisma backend persists
uploads in MySQL, keeps the raw file on disk, and exposes a REST API for
labeling, coding, and exporting filtered slices of the dataset.

## Highlights

- **Upload & inspect** – drag-and-drop files up to 50 MB, auto-detect columns,
  and list all previous uploads with row counts and timestamps.
- **Configurable labeling surface** – pick the key/index column, decide which
  fields annotators see, define highlight keywords/colors, and create label sets.
- **Rich labeling UI** – Markdown rendering with optional keyword highlighting,
  keyboard-friendly navigation across rows, and instant stats for each label.
- **Code/Theme tagging** – add, autocomplete, and persist multiple codes or
  themes per row via the `CodeInput` tag picker component.
- **Export any slice** – download CSVs for specific columns and row ranges (a
  trailing `_label` column is appended automatically).
- **API first** – all operations are available via REST (`/dataset`, `/label`,
  `/code`) and Socket.IO is ready for future real-time collaboration.

## Tech Stack

- **Client:** Next.js 16, React 19, Tailwind CSS, Radix UI, shadcn/ui, Dropzone,
  React Markdown, Lucide icons.
- **Server:** Express 5, TypeScript, Prisma ORM (MySQL), Multer, csv-parse,
  Socket.IO, Parquet reader.
- **Storage:** MySQL for metadata/rows, filesystem (`uploads/`) for raw files and
  optional configuration artifacts.

## Repository Layout

```
Annotely/
├─ client/          # Next.js app, hooks, components (Upload table, Labeler, Coder)
├─ server/          # Express API, Prisma schema, file-processing services
├─ uploads/         # Created at runtime for uploaded source files/configs
├─ package.json     # Root script to run client+server concurrently
└─ README.md
```

## Prerequisites

- Node.js 18+
- pnpm 9.x (preferred, matches `packageManager`); npm works but commands differ
- A MySQL 8+ instance reachable through `DATABASE_URL`

## Environment Variables

Create `.env` files before running either app.

### `server/.env`

```
DATABASE_URL="mysql://user:password@localhost:3306/annotely"
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
# Optional:
UPLOAD_PATH=uploads
CONFIG_PATH=config
```

- `DATABASE_URL` (required) – Prisma connection string.
- `PORT` – Express listening port (default `4000`).
- `CLIENT_ORIGIN` – used by CORS and Socket.IO.
- `UPLOAD_PATH`/`CONFIG_PATH` – customize where parsed files/configs are stored.

### `client/.env.local`

```
NEXT_PUBLIC_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Both values should point to the running API. The UI uses `NEXT_PUBLIC_BASE_URL`
for most requests and `NEXT_PUBLIC_API_BASE_URL` inside the CSV export helpers.

## Installation

```bash
git clone <repo-url>
cd Annotely

# Root deps (concurrently)
pnpm install

# Client app
cd client
pnpm install
cd ..

# Server API
cd server
pnpm install
pnpm prisma generate
pnpm prisma migrate dev      # applies migrations to DATABASE_URL
cd ..
```

> Prefer pnpm. If you must use npm, replace `pnpm` with `npm install`, `npx
> prisma`, etc.

## Running the Apps

### Development (recommended)

From the repository root:

```bash
pnpm dev
```

This runs both:

- `client` – Next.js dev server on `http://localhost:3000`
- `server` – Express API on `http://localhost:4000` (with Socket.IO at `/ws`)

### Individual processes

```bash
# client/
pnpm dev        # or pnpm build && pnpm start

# server/
pnpm dev        # tsx watch src/server.ts
pnpm build
pnpm start
```

## Typical Workflow

1. **Upload data** – drag a CSV/JSON/Parquet file onto the home Dropzone. The
   backend stores metadata in MySQL (`File`, `Row` tables) and the raw file under
   `uploads/`.
2. **Configure** – open `Configure` from the uploads table, select which columns
   to display, set the key column, choose a highlight color, add keywords (literal
   strings or regex), and define labels. Saving issues a `PATCH /dataset/config/:id`.
3. **Label** – navigate to `/dataset/label/:id`. The UI fetches
   `GET /label/:id`, renders Markdown for each column, highlights keywords, and
   posts changes to `POST /label/update`.
4. **Code & Theme** – `/dataset/coding/:id` uses the same dataset payload but
   surfaces `CodeInput` components tied to `POST /code/updateCode` and
   `POST /code/updateTheme`, offering tag suggestions from existing values.
5. **Export** – use the “Export file” dialog on either labeling view to call
   `POST /dataset/export/:id` with chosen columns plus a row range; the server
   streams a CSV containing your annotations (`_label`, `_code`, `_theme`).
6. **Manage datasets** – `GET /dataset` powers the uploads table; delete a file
   via `DELETE /dataset/delete/:id`.

## Testing & Verification

- **Client linting:** `cd client && pnpm lint`
- **Server type-check:** `cd server && pnpm tsc --noEmit`
- **API smoke test:** use cURL or Postman against the `/dataset` and `/label`
  endpoints once the server is running.

## Troubleshooting

- **Prisma errors** – ensure `DATABASE_URL` points to a reachable database and
  run `pnpm prisma migrate dev` again.
- **File uploads fail** – verify the MIME type/extension is supported
  (`text/csv`, `application/json`, `application/vnd.apache.parquet`) and the file
  is <= 50 MB.
- **CORS issues** – confirm `CLIENT_ORIGIN` matches the URL you load the client
  from.
- **Export problems** – both `NEXT_PUBLIC_BASE_URL` and
  `NEXT_PUBLIC_API_BASE_URL` must resolve to the API; otherwise fetches fall back
  to the deployed origin.

---

Happy annotating! Let us know if you automate a new workflow or extend the API –
the modular `/dataset`, `/label`, and `/code` services were designed to be easy
to build on.
