import type { MarketplaceRule } from "@/lib/domain/types";

export function mapDbRule(row: Record<string, any>): MarketplaceRule {
  return {
    id: String(row.id),
    marketplace: row.marketplace,
    sellerType: row.seller_type,
    categoryId: row.category_id,
    program: row.program,
    name: row.name,
    feeType: row.fee_type,
    rate: row.rate == null ? null : Number(row.rate),
    fixedAmount: row.fixed_amount == null ? null : Number(row.fixed_amount),
    basis: row.calculation_base,
    scope: row.fee_scope,
    minFee: row.min_fee == null ? null : Number(row.min_fee),
    maxFee: row.max_fee == null ? null : Number(row.max_fee),
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    sourceUrl: row.source_url,
    ruleVersion: row.rule_version,
    lastVerifiedAt: row.last_verified_at,
    status: row.status
  };
}
