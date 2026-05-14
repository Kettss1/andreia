# Andreia — Roadmap

Where the work sits and the order to do it in. Read alongside `analysis.md` (product spec) and `mockups/` (wireframes).

## Where we are

- Empty repo: `docs/` + `mockups/` + `README.md`. The old `services/andreia-backend/` was deleted — Python learning, no salvageable code.
- Stack chosen: **Next.js (App Router) + Neon + Drizzle + Better Auth (Google) + react-pdf + shadcn/ui + Tailwind**, deployed on **Vercel**.
- v1 scope and UX direction are locked in `analysis.md` and the mockups.

## Approach

Vertical slices. Each phase ships something the user can do end-to-end, even if narrow. Deploy continuously to Vercel previews from day one — production deploy happens at the end of Phase 4 (or whenever it feels good).

---

## Phase 0 — Foundation

**Goal**: Sign in with Google, land on a protected layout that matches the mockup's sidebar shell. Nothing else works yet, but it's deployed.

**In scope**
- `pnpm create next-app` at repo root, TypeScript strict, App Router
- Tailwind + shadcn/ui initialized
- Drizzle + Neon connected (one dev DB to start)
- Better Auth with Google provider, session in DB
- Layout shell from mockups: sidebar (Início / Catálogo / Cardápios / Orçamentos / Identidade visual / Configurações), business-switcher placeholder, user footer
- Sign-in page, sign-out, middleware that protects everything except `/login`
- Vercel project + preview deployments per branch

**Not in scope**
- Any product feature
- Real business-switcher logic
- Multi-tenancy enforcement

**Acceptance**: visit prod URL → Google → signed in → sidebar layout with empty pages → sign out works.

---

## Phase 1 — Catalog

**Goal**: she can put her real product list into Andreia. The data foundation everything else depends on.

**Schema**
- `user` (managed by Better Auth)
- `business` — id, ownerUserId, name, description, contact fields
- `category` — id, businessId, name, sortOrder
- `product` — id, businessId, categoryId, name, description, pricingUnit (enum: `unit` / `kg` / `cento` / `duzia` / `kit`), price

**Features**
- On first login, auto-create a default `Business` for the user
- Catalog list page (sectioned by category, matching `mockups/catalog.html`)
- Product create/edit form (RHF + Zod)
- Inline "+ nova categoria" from the product form
- Multi-tenancy: a `db.scopedTo(businessId)` helper that every query passes through

**Not in scope**
- Multiple businesses per user (schema supports it; UI assumes one)
- Product photos
- Catalog search

**Acceptance**: sign in → add categories and products with pricing units → edit, delete → log out and back in, data persists.

---

## Phase 2 — Visual Identity + Menus + PDF

**Goal**: she can replace her Canva menu PDF with one generated from Andreia.

**Schema additions**
- `business_identity` — businessId (1:1), logoUrl, primaryColor, pdfTemplate
- `menu` — id, businessId, name, description, updatedAt
- `menu_section` — id, menuId, name, sortOrder
- `menu_section_product` — menuSectionId, productId, sortOrder

**Features**
- Identidade visual page: logo upload via Vercel Blob, single manual color picker, business info fields (name, phone, email, Instagram, city), pick template (one implemented: "Clean")
- Menus list page
- Menu builder: name, description, add/reorder sections, add products from catalog
- react-pdf renderer for the Clean template, using business identity
- PDF preview in browser + download

**Not in scope**
- Auto-extracting brand colors from the logo (manual picker only for now)
- More than one template
- Per-menu section title overrides (mockup hints at it; defer)

**Acceptance**: upload a logo → pick a color → fill business info → build a menu → click *Pré-visualizar PDF* → real branded PDF.

---

## Phase 3 — Clients + Quotes

**Goal**: she can replace her Samsung Notes orçamentos. This is the core daily flow — the biggest payoff.

**Schema additions**
- `client` — id, businessId, name, phone, email, notes (no UI surface yet)
- `quote` — id, businessId, clientId, quoteNumber (sequential per business), eventType, eventDate, eventLocation, eventGuests, observations, validityDays, status (enum: `rascunho` / `enviado` / `aceito` / `rejeitado`), totalOverride (nullable)
- `quote_line_item` — quoteId, productId, productNameSnapshot, quantity, unitPriceSnapshot, unit
- `quote_adjustment` — quoteId, label, amount (positive = fee, negative = discount)

**Features**
- Quote builder (matches `mockups/quote-builder.html`):
  - Client: name/phone/email — typing name autocompletes against existing `client` rows; new ones auto-created behind the scenes
  - Event section
  - Line items: catalog picker, qty, auto unit price with manual override
  - Adjustments
  - Observations
  - Validity
  - Auto totals + manual grand-total override
  - Status pill in header
- Quotes list with status tabs (Todos / Rascunho / Enviado / Aceito / Rejeitado) + search
- Sequential quote numbering per business
- Quote PDF rendered through the same template engine

**Snapshot fields explained**: `productNameSnapshot` and `unitPriceSnapshot` are intentional — once a quote is sent, editing the catalog product later must not retroactively change historical quotes.

**Not in scope**
- Auto status transition on PDF export (manual only)
- Stale-quote warning (Phase 4)
- Clients page UI

**Acceptance**: create a new quote → fill it → see live totals → change status → export PDF. The list shows it correctly under each status tab.

---

## Phase 4 — Dashboard + Polish

**Goal**: feels like a real product, not a CRUD tool.

**Features**
- Dashboard (`mockups/dashboard.html`): próximos eventos (status `aceito` + future date), aguardando resposta (status `enviado`), stale warning when `enviado` is older than 3 days, resumo do mês (count + sum of `aceito` events)
- Auto color extraction from uploaded logo — suggest 4–5 swatches alongside the manual picker
- 3 more PDF templates: Rústico, Elegante, Festivo
- Empty states across the app
- Mobile responsive pass — sidebar collapses
- Loading skeletons

**Not in scope**: anything in the "deferred" list below.

**Acceptance**: dashboard greets with real counts; 4 visually distinct templates work; the app feels finished.

---

## Phase 5 — Ship to mom

**Goal**: in her hands, used in real life.

- Production deploy + custom domain (if you want one)
- Sit with mom — sign her in, walk through Identidade visual, help her enter her real catalog
- Watch her create a real cardápio + a real orçamento
- Note every friction point (probably the catalog setup is the steepest cliff)
- Iterate on what trips her up
- Drop in a small "Mandar feedback" link so future friction has a path back to you

---

## Deferred (already in `analysis.md`, kept here for orientation)

- Per-document-type PDF templates (wedding vs. birthday)
- Quote and menu version history
- Dedicated clients page and full CRM features
- Revenue analytics, monthly reports
- Inbound lead capture forms
- POS / daily-sales mode (xis gaúcho stays on 99 Food/iFood)
- Multi-language UI
- Post-`aceito` quote states (`concluído`, `cancelado`)

## Open decisions to make as we go

- **Multi-tenancy enforcement.** Default: `db.scopedTo(businessId)` helper at the application layer. Revisit Postgres RLS via Neon before the product has multiple paying users.
- **i18n library.** Defaulting to inline pt-BR strings — `next-intl` only if/when we expand languages.
- **CI.** Probably skip for solo dev. GitHub Actions if you change your mind.
- **Drizzle migration workflow.** Decide between `drizzle-kit push` (loose, fast) for solo dev vs. proper migrations from day one. I'd start loose and switch to migrations before going to prod.
