export type PricingUnit = "unit" | "kg" | "cento" | "duzia" | "kit";

type UnitMeta = {
  /** Short label shown after a price, e.g. "R$ 90,00 / cento". */
  short: string;
  /** Label for the unit selector. */
  label: string;
  /** Label for the quantity field on a quote line, e.g. "centos". */
  quantity: string;
};

export const PRICING_UNITS: Record<PricingUnit, UnitMeta> = {
  unit: { short: "un", label: "Unidade", quantity: "unidades" },
  kg: { short: "kg", label: "Quilo (kg)", quantity: "kg" },
  cento: { short: "cento", label: "Cento (100 un)", quantity: "centos" },
  duzia: { short: "dúzia", label: "Dúzia (12 un)", quantity: "dúzias" },
  kit: { short: "kit", label: "Kit (preço fixo)", quantity: "kits" },
};

export const PRICING_UNIT_OPTIONS = (
  Object.keys(PRICING_UNITS) as PricingUnit[]
).map((value) => ({ value, label: PRICING_UNITS[value].label }));

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formats a numeric/string price as Brazilian currency. */
export function formatBRL(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  return brl.format(Number.isFinite(n) ? n : 0);
}

/** Formats a price with its unit, e.g. "R$ 90,00 / cento". */
export function formatPriceWithUnit(
  value: number | string,
  unit: PricingUnit,
): string {
  return `${formatBRL(value)} / ${PRICING_UNITS[unit].short}`;
}
