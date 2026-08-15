import type { MarketplaceRule, Marketplace, SellerType } from "@/lib/domain/types";

export interface RuleContext {
  marketplace: Marketplace;
  sellerType: SellerType;
  categoryId?: string | null;
  date: string;
  programs?: string[];
}

export function resolveRules(allRules: MarketplaceRule[], context: RuleContext) {
  const at = new Date(context.date).getTime();
  const programs = new Set(context.programs || []);
  return allRules.filter((rule) => {
    if (rule.status !== "verified") return false;
    if (rule.marketplace !== context.marketplace) return false;
    if (rule.sellerType !== "any" && rule.sellerType !== context.sellerType) return false;
    if (rule.categoryId && rule.categoryId !== context.categoryId) return false;
    if (rule.program && !programs.has(rule.program)) return false;
    const from = new Date(rule.effectiveFrom).getTime();
    const to = rule.effectiveTo ? new Date(rule.effectiveTo).getTime() : Number.POSITIVE_INFINITY;
    return at >= from && at <= to;
  });
}
