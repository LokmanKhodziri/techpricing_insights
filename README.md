# TechPrising Insights

Data-driven pricing intelligence for PC hardware in the Malaysia market. Upload marketplace exports, normalize product titles, track price trends, and compare listings against MSRP.

## Features

- **CSV/JSON import** — Upload Shopee, Lazada, and other marketplace exports
- **Title normalization** — Map variants like `RTX 2060S` → canonical RTX 2060 Super
- **Review queue** — Manually approve unmatched titles and create permanent aliases
- **Price trends** — Tremor charts with platform comparison (Shopee vs Lazada)
- **MSRP margin** — Discount % vs manufacturer suggested retail price
- **Product catalog** — Specs, aliases, and listing history per component

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
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
npm install --legacy-peer-deps

# Configure environment
cp .env.example .env
# Edit DATABASE_URL — see notes below for Atlas password encoding

# Push schema to MongoDB
npm run db:push

# Seed sample products + listings
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

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
| `npm run db:push` | Sync Prisma schema to MongoDB |
| `npm run db:seed` | Load sample GPU/CPU/RAM data |
| `npm run db:studio` | Prisma Studio GUI |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MongoDB connection string |

**Atlas URL format** (database name is required):

```text
mongodb+srv://USER:PASSWORD@cluster.mongodb.net/techpricing_insights?retryWrites=true&w=majority
```

URL-encode special characters in passwords (`@` → `%40`, `#` → `%23`).

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
