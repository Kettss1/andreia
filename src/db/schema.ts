import { randomUUID } from "node:crypto";
import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Auth tables (user, session, account, verification) are generated into
// auth-schema.ts by the Better Auth CLI and re-exported here.
export * from "./auth-schema";

export const pricingUnit = pgEnum("pricing_unit", [
  "unit",
  "kg",
  "cento",
  "duzia",
  "kit",
]);

export const pdfTemplate = pgEnum("pdf_template", [
  "clean",
  "rustico",
  "elegante",
  "festivo",
]);

export const business = pgTable("business", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  // Contact info — rendered on generated documents (cardápios / orçamentos).
  phone: text("phone"),
  email: text("email"),
  instagram: text("instagram"),
  city: text("city"),
  // Visual identity.
  logoPath: text("logo_path"), // filename in ./uploads/, served via /api/files/<filename>
  primaryColor: text("primary_color").default("#BE3E5C").notNull(),
  pdfTemplate: pdfTemplate("pdf_template").default("clean").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const category = pgTable("category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  businessId: text("business_id")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const product = pgTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  businessId: text("business_id")
    .notNull()
    .references(() => business.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => category.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  pricingUnit: pricingUnit("pricing_unit").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const businessRelations = relations(business, ({ one, many }) => ({
  owner: one(user, {
    fields: [business.ownerUserId],
    references: [user.id],
  }),
  categories: many(category),
  products: many(product),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  business: one(business, {
    fields: [category.businessId],
    references: [business.id],
  }),
  products: many(product),
}));

export const productRelations = relations(product, ({ one }) => ({
  business: one(business, {
    fields: [product.businessId],
    references: [business.id],
  }),
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
}));
