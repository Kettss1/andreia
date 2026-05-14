# Andreia

## Purpose

Andreia is a tool for independent food and event workers to generate professional, client-facing documents — **menus** and **event quotes** ("orçamentos") — without needing a designer or an expensive SaaS subscription.

The first user is a home-based confeiteira/padeira whose business revolves around events (parties, weddings, etc.). The product is designed to scale beyond her into a real product for similar independent workers (confeitarias, padarias, food trucks, marmita sellers, small caterers, etc.).

**Positioning.** The competitive niche is mature but uniformly *functional-but-ugly*. Andreia's deliberate wedge is design quality — the app and especially the generated PDFs must be genuinely beautiful. This is a constraint on execution, not an added feature; v1 scope is unchanged.

---

## Core concepts

### User

Account holder. A user owns one or more Businesses.

### Business

A user's business identity. Replaces the original "Restaurant" concept because most target users don't have a physical restaurant.

Each Business has:
- A name and basic info (description, contact details)
- Visual identity (logo + brand colors)
- A product Catalog
- One or more Menus
- Optionally: Clients and Quotes

A single user can register multiple Businesses (e.g., one for events, one for delivery-app sales) — each fully independent in catalog, identity, and menus.

### Visual Identity

Per Business:
- Logo upload
- Primary brand color, auto-suggested from the uploaded logo, with manual override
- Choice of PDF template (3–5 designs available); the chosen template renders using the Business's brand colors
- Used consistently across all generated PDFs (menus and quotes)

### Catalog

The reusable list of products a Business sells. First-class entity — products live at the Business level, not nested inside menus.

Each product has:
- Name and optional description
- Category (e.g., "Bolos", "Salgados", "Doces", "Kits")
- Pricing unit: per unidade, per kg, per cento (per 100), per dúzia (per dozen), or fixed-price kit
- Price in the chosen unit

### Menu

A printable, exportable view of the Catalog (or a curated subset). Used as marketing/sales material — what the business publishes for prospective clients to browse.

A Business can have multiple Menus (e.g., "Cardápio de festas", "Cardápio xis gaúcho"). Each menu organizes products into sections, typically by category.

### Client *(internal-only in v1)*

Represents a customer. Modeled as a separate entity from day one so quotes can be linked back to a single client record — but **no dedicated clients page in v1**. The Client entity exists silently to support a future CRM surface.

Fields: name, phone, email (optional), notes.

### Quote ("orçamento")

A per-event document for a specific client. Contains:
- Quote number (sequential per Business)
- Created date, validity period ("válido por X dias")
- Client info (linked to Client entity)
- Event info: type (aniversário, casamento, etc.), date, location, # of guests
- **Line items**: pulled from Catalog. Each line has product, quantity, unit price (auto-filled from Catalog, manually overridable), line total
- **Adjustments**: extra fees (taxa de entrega, taxa de montagem) and/or discounts
- **Free-text observations**
- **Totals**: subtotal, fees, discounts, grand total — all calculated automatically, with the option to manually override the final amount

Quote status lifecycle:
- `rascunho` — draft, not yet sent
- `enviado` — sent to the client
- `aceito` — client confirmed
- `rejeitado` — client declined

No version history — editing a quote overwrites the previous state.

---

## Main features (v1 scope)

- Sign up, log in, manage account info
- Manage Businesses (create, view, update, delete)
- Configure Visual Identity per Business (logo, brand color, PDF template)
- Manage Catalog (products, categories, pricing units, prices)
- Create and manage Menus; preview before exporting to PDF
- Create and manage Quotes; preview before exporting to PDF
- Track Quote status (rascunho → enviado → aceito | rejeitado)

### Lightweight dashboard

The home/landing screen surfaces the most operationally useful info:
- **Próximos eventos** — next 7–14 days, from `aceito` quotes with future event dates
- **Aguardando resposta** — quotes in `enviado` status, optionally flagging ones sitting >3 days
- **Resumo do mês** — # confirmed events, expected revenue

This is the only "CRM-shaped" surface in v1. There is no dedicated clients page yet.

---

## UX principles

- **Beautiful by default.** Visual quality — of the app UI and especially the generated PDF documents — is a hard constraint, on par with correctness. The PDFs carry the user's brand into her client's hands; they must look designer-made. This is the product's deliberate competitive wedge.
- **The first user is not tech-savvy.** Defaults must be sensible. Every action needs an obvious path. Minimize jargon in the UI.
- **UI is in Portuguese (pt-BR).** Code, identifiers, and internal naming are in English. UI strings are translated.
- **Automatic calculations, always overridable.** Totals, line prices, and grand totals are computed automatically — but the user can override any value manually if needed.
- **Preview before export.** Every PDF is previewable before generation. PDF export is the final step, not the only step.

---

## Two business archetypes (one model)

Mom uses Andreia for two very different operations. Both fit the same model:

1. **Event-driven** (her confeitaria/padaria): full feature set — catalog, menus, quotes, status tracking, dashboard.
2. **Delivery-app-fronted** (her xis gaúcho, sold via 99 Food and iFood): only needs menu generation. Ordering and payment are handled by the external apps. Quotes and CRM features are simply unused.

Same `Business` entity, optional features. No type discrimination needed.

---

## Out of scope for v1 — "think about it later"

These are intentionally deferred. Worth keeping in mind so we don't paint into a corner, but not building now.

- **Per-document-type PDF templates** — e.g., an elegant template for weddings vs. a playful one for kids' birthdays. For v1, one template choice per Business covers all its documents.
- **Quote versioning / history.** Overwrite-only for now.
- **Menu version history** — keep a log of past saved versions of a menu so changes can be reviewed or reverted. Could be useful as the catalog grows.
- **Dedicated clients page** and full CRM surface (client detail page, full quote history per client, follow-up reminders, activity log, lead capture forms). The Client entity is modeled now to enable this later.
- **Revenue analytics, charts, monthly reports.**
- **Inbound lead capture.** Forms that prospective clients fill out which become draft quotes.
- **POS / daily-sales mode.** Real-time order taking is out of scope; that's what 99 Food/iFood already do.
- **Multi-language UI.** pt-BR only for now.
- **Post-acceptance quote states.** No `concluído` or `cancelado` — `aceito` is the terminal positive state. Tracking actual realized revenue per event is deferred.
