# CariPart

Cari harga PC parts Malaysia. Compare GPU, CPU, RAM, and other component prices from Shopee, Lazada, and local marketplaces — then track MYR trends and deals.

## Features

- **Public price browsing** — Dashboard, catalog, and charts are open to everyone
- **Contributor-gated imports** — Only admins/contributors can upload CSV/JSON
- **Normalization review** — Approve unmatched titles into permanent aliases
- **Admin role management** — Promote trusted users to contributor or admin
- **Price trends** — Tremor charts with platform comparison (Shopee vs Lazada)
- **MSRP margin** — Discount % vs manufacturer suggested retail price

## Access model

| Role | Who | Can do |
|------|-----|--------|
| Viewer (default) | Anyone / signed-in users without a role | Browse dashboard & products |
| Contributor | Promoted by admin | Imports + Review |
| Admin | You (first) | Contributor access + `/admin` role management |

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Auth | Clerk (RBAC via `publicMetadata.role`) |
| UI | Tailwind CSS v4, Shadcn/UI, Tremor |
| Database | MongoDB Atlas + Prisma 6 |
| Data fetching | TanStack Query |
| Validation | Zod |
| Tests | Vitest |

## Architecture

```text
src/
├── app/                    # Pages + API routes (thin controllers)
│   ├── api/                # REST endpoints
│   ├── dashboard/          # Analytics overview
│   ├── products/           # Catalog + detail pages
│   ├── imports/            # File upload
│   └── normalization/      # Review queue
├── components/             # Feature UI (products, charts, imports)
├── hooks/                  # TanStack Query hooks
├── lib/
│   ├── schemas/            # Zod validators
│   ├── parsers/            # CSV/JSON parsing
│   ├── services/           # Business logic
│   │   ├── catalog/        # Product queries
│   │   ├── ingestion/      # Import pipeline
│   │   ├── normalization/  # Title matching + aliases
│   │   └── analytics/      # Trends + margins
│   ├── errors/             # AppError + API helpers
│   └── validation/         # Request parsing utilities
└── types/                  # Shared TypeScript DTOs
```

### Data flow

```text
CSV upload → parser → Zod validation → normalization pipeline → Listing
                                              ↓ (unmatched)
                                    NormalizationCandidate queue
                                              ↓ (manual approve)
                                         ProductAlias
```

## Getting started

### Prerequisites

- Node.js 20+
- MongoDB (Atlas recommended) or Docker

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit DATABASE_URL + Clerk keys (see Auth setup below)

# Push schema to MongoDB
npm run db:push

# Seed sample products + listings
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Auth setup (Clerk)

1. Create an app at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Copy **Publishable key** and **Secret key** into `.env`
3. Sessions → Customize session token → save:

```json
{
  "metadata": "{{user.public_metadata}}"
}
```

4. Sign up once in the app, then in Clerk → Users → your user → Public metadata:

```json
{
  "role": "admin"
}
```

5. Sign out / sign in again so the role appears in the session
6. Open `/admin` to promote other users to `contributor` or `admin`

### Docker MongoDB (optional)

```bash
docker compose up -d
npm run db:push && npm run db:seed
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Run unit + integration tests |
| `npm run test:watch` | Tests in watch mode |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync Prisma schema to MongoDB |
| `npm run db:seed` | Load sample GPU/CPU/RAM data |
| `npm run db:studio` | Prisma Studio GUI |

## CI

GitHub Actions runs on every push and pull request to `main` / `master`:

1. Install dependencies (`npm ci`)
2. Lint
3. Typecheck
4. Unit + integration tests
5. Production build

Workflow: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

No live MongoDB is required in CI — a placeholder `DATABASE_URL` is used for Prisma client generation and env validation.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MongoDB connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | Default `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | Default `/sign-up` |

**Atlas URL format** (database name is required):

```text
mongodb+srv://USER:PASSWORD@cluster.mongodb.net/caripart?retryWrites=true&w=majority
```

URL-encode special characters in passwords (`@` → `%40`, `#` → `%23`).

If you already have data under an older database name (e.g. `techpricing_insights`), you can keep that path in `DATABASE_URL` — only the app branding changed.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + DB connectivity |
| GET | `/api/products` | List products |
| GET | `/api/products/slug/[slug]` | Product detail |
| GET | `/api/products/[id]/price-trend` | Price trend data |
| POST | `/api/imports` | Import CSV/JSON rows |
| GET | `/api/normalization/candidates` | Pending review queue |
| POST | `/api/normalization/candidates/[id]` | Approve alias mapping |
| DELETE | `/api/normalization/candidates/[id]` | Reject candidate |

All responses follow `{ success, data }` or `{ success, error: { code, message } }`.

## Deploy to Vercel

1. Push the repo to GitHub
2. Import project in [Vercel](https://vercel.com/new)
3. Add environment variable: `DATABASE_URL` (your Atlas connection string)
4. In Atlas → Network Access, allow `0.0.0.0/0` (or Vercel IP ranges)
5. Deploy — Vercel runs `prisma generate` via `postinstall` automatically

After first deploy, seed production if needed:

```bash
npm run db:seed
```

Verify deployment: `GET https://your-app.vercel.app/api/health`

## Sample data workflow

1. **Dashboard** — View RTX 2060 Super price trend
2. **Imports** — Upload `public/samples/shopee-export-sample.csv`
3. **Review** — Upload `public/samples/unmatched-export-sample.csv`, approve mappings
4. **Products** — Browse catalog, open product detail with chart + specs

## License

Private portfolio project.
