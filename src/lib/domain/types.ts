export type Marketplace = "shopee" | "tiktok";
export type SellerType = "regular" | "non_star" | "star" | "mall" | "unknown";
export type RuleStatus = "draft" | "verified" | "needs_review" | "expired";
export type FeeBasis = "gross" | "after_seller_discount" | "eligible_revenue";
export type FeeScope = "per_order" | "per_item";

export type MoneyOrRate =
  | { type: "none" }
  | { type: "fixed"; amount: number }
  | { type: "percentage"; rate: number; maxAmount?: number; minPurchase?: number };

export interface MarketplaceRule {
  id: string;
  marketplace: Marketplace;
  sellerType: SellerType | "any";
  categoryId?: string | null;
  program?: string | null;
  name: string;
  feeType: string;
  rate?: number | null;
  fixedAmount?: number | null;
  basis: FeeBasis;
  scope: FeeScope;
  minFee?: number | null;
  maxFee?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  sourceUrl: string;
  ruleVersion: string;
  lastVerifiedAt?: string | null;
  status: RuleStatus;
}

export interface CalculationInput {
  marketplace: Marketplace;
  sellerType: SellerType;
  categoryId?: string | null;
  calculationDate: string;
  unitPrice: number;
  quantity: number;
  hppPerUnit: number;
  sellerDiscount?: MoneyOrRate;
  sellerVoucher?: MoneyOrRate;
  platformSubsidy?: number;
  affiliateRate?: number;
  packagingPerOrder?: number;
  operationalPerOrder?: number;
  ads?: MoneyOrRate;
  otherCostPerOrder?: number;
  targetMargin?: number;
}

export interface CalculationLine {
  code: string;
  label: string;
  amount: number;
  source: string;
}

export interface CalculationResult {
  grossRevenue: number;
  sellerDiscount: number;
  sellerVoucher: number;
  eligibleRevenue: number;
  platformSubsidy: number;
  marketplaceFees: number;
  affiliateFee: number;
  hpp: number;
  packaging: number;
  operational: number;
  ads: number;
  otherCost: number;
  estimatedProfit: number;
  margin: number;
  breakEvenPrice: number;
  recommendedPrice: number;
  safeAffiliateRate: number;
  completeness: number;
  lines: CalculationLine[];
  ruleVersion: string;
  ruleWarnings: string[];
}
