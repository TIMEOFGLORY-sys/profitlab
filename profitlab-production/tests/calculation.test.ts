import { describe, expect, it } from "vitest";
import { calculateProfit, promoAmount } from "@/lib/calculation/engine";
import type { MarketplaceRule } from "@/lib/domain/types";

const processing: MarketplaceRule = {
  id: "processing",
  marketplace: "shopee",
  sellerType: "any",
  name: "Processing",
  feeType: "processing",
  fixedAmount: 1250,
  basis: "eligible_revenue",
  scope: "per_order",
  effectiveFrom: "2025-07-20",
  sourceUrl: "https://seller.shopee.co.id/edu/article/25787",
  ruleVersion: "test",
  status: "verified"
};

describe("calculation engine", () => {
  it("caps a percentage voucher", () => {
    expect(promoAmount({ type: "percentage", rate: 0.2, maxAmount: 10_000 }, 100_000)).toBe(10_000);
  });

  it("applies per-order fee once for multi quantity", () => {
    const result = calculateProfit({
      marketplace: "shopee",
      sellerType: "regular",
      categoryId: "cat",
      calculationDate: "2026-08-15",
      unitPrice: 100_000,
      quantity: 3,
      hppPerUnit: 50_000,
      sellerDiscount: { type: "none" },
      sellerVoucher: { type: "none" },
      affiliateRate: 0,
      packagingPerOrder: 0,
      operationalPerOrder: 0,
      ads: { type: "none" },
      otherCostPerOrder: 0,
      targetMargin: 0.2
    }, [processing]);
    expect(result.marketplaceFees).toBe(1250);
    expect(result.estimatedProfit).toBe(148750);
  });
});
