import type { MarketplaceRule } from "@/lib/domain/types";

/**
 * UI DEMO ONLY. Production mode must resolve verified rules from Supabase.
 * The processing fee rule is based on Shopee's public 2026 seller education material.
 * The percentage admin rule below is intentionally marked draft and will not be applied.
 */
export const demoRules: MarketplaceRule[] = [
  {
    id: "shopee-processing-2026-demo",
    marketplace: "shopee",
    sellerType: "any",
    categoryId: null,
    program: null,
    name: "Biaya Proses Pesanan",
    feeType: "processing",
    fixedAmount: 1250,
    basis: "eligible_revenue",
    scope: "per_order",
    effectiveFrom: "2025-07-20",
    effectiveTo: null,
    sourceUrl: "https://seller.shopee.co.id/edu/article/25787",
    ruleVersion: "SHOPEE-2026-PROCESSING",
    lastVerifiedAt: "2026-08-15",
    status: "verified"
  },
  {
    id: "demo-admin-rate",
    marketplace: "shopee",
    sellerType: "any",
    categoryId: "demo-category",
    program: null,
    name: "DEMO Admin Fee — jangan gunakan di produksi",
    feeType: "admin",
    rate: 0.1,
    basis: "eligible_revenue",
    scope: "per_item",
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    sourceUrl: "",
    ruleVersion: "DEMO-ONLY",
    status: "draft"
  }
];
