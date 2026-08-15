import type {
  CalculationInput,
  CalculationLine,
  CalculationResult,
  MarketplaceRule,
  MoneyOrRate
} from "@/lib/domain/types";

const clamp = (value: number, min = 0, max = Number.POSITIVE_INFINITY) =>
  Math.min(max, Math.max(min, value));

export function promoAmount(promo: MoneyOrRate | undefined, base: number): number {
  if (!promo || promo.type === "none") return 0;
  if (promo.type === "fixed") return clamp(promo.amount, 0, base);
  if (promo.minPurchase && base < promo.minPurchase) return 0;
  const raw = base * promo.rate;
  return clamp(promo.maxAmount ? Math.min(raw, promo.maxAmount) : raw, 0, base);
}

function feeBase(rule: MarketplaceRule, gross: number, afterDiscount: number, eligible: number) {
  if (rule.basis === "gross") return gross;
  if (rule.basis === "after_seller_discount") return afterDiscount;
  return eligible;
}

export function ruleFee(
  rule: MarketplaceRule,
  gross: number,
  afterDiscount: number,
  eligible: number,
  quantity: number
) {
  const base = feeBase(rule, gross, afterDiscount, eligible);
  let fee = 0;
  if (rule.rate) fee += base * rule.rate;
  if (rule.fixedAmount) fee += rule.fixedAmount * (rule.scope === "per_item" ? quantity : 1);
  if (rule.minFee != null) fee = Math.max(fee, rule.minFee);
  if (rule.maxFee != null) fee = Math.min(fee, rule.maxFee * (rule.scope === "per_item" ? quantity : 1));
  return Math.max(0, fee);
}

function computeAtPrice(input: CalculationInput, rules: MarketplaceRule[], unitPrice: number) {
  const quantity = Math.max(1, Math.floor(input.quantity || 1));
  const gross = unitPrice * quantity;
  const sellerDiscount = promoAmount(input.sellerDiscount, gross);
  const afterDiscount = gross - sellerDiscount;
  const sellerVoucher = promoAmount(input.sellerVoucher, afterDiscount);
  const eligibleRevenue = Math.max(0, afterDiscount - sellerVoucher);
  const platformSubsidy = Math.max(0, input.platformSubsidy || 0);
  const marketplaceFees = rules.reduce(
    (sum, rule) => sum + ruleFee(rule, gross, afterDiscount, eligibleRevenue, quantity),
    0
  );
  const affiliateFee = eligibleRevenue * clamp(input.affiliateRate || 0, 0, 1);
  const hpp = Math.max(0, input.hppPerUnit) * quantity;
  const packaging = Math.max(0, input.packagingPerOrder || 0);
  const operational = Math.max(0, input.operationalPerOrder || 0);
  const ads = promoAmount(input.ads, eligibleRevenue);
  const otherCost = Math.max(0, input.otherCostPerOrder || 0);
  const sellerRevenue = eligibleRevenue + platformSubsidy;
  const estimatedProfit = sellerRevenue - marketplaceFees - affiliateFee - hpp - packaging - operational - ads - otherCost;
  const margin = sellerRevenue > 0 ? estimatedProfit / sellerRevenue : 0;
  return {
    gross,
    sellerDiscount,
    afterDiscount,
    sellerVoucher,
    eligibleRevenue,
    platformSubsidy,
    marketplaceFees,
    affiliateFee,
    hpp,
    packaging,
    operational,
    ads,
    otherCost,
    sellerRevenue,
    estimatedProfit,
    margin
  };
}

function solveUnitPrice(input: CalculationInput, rules: MarketplaceRule[], targetMargin: number) {
  const desired = clamp(targetMargin, -0.95, 0.95);
  let low = 0;
  let high = Math.max(input.unitPrice * 2, input.hppPerUnit * 4, 100_000);
  for (let grow = 0; grow < 30; grow++) {
    if (computeAtPrice(input, rules, high).margin >= desired) break;
    high *= 2;
  }
  for (let i = 0; i < 70; i++) {
    const mid = (low + high) / 2;
    const margin = computeAtPrice(input, rules, mid).margin;
    if (margin >= desired) high = mid;
    else low = mid;
  }
  return high;
}

function psychologicalRound(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const ceilThousand = Math.ceil(value / 1000) * 1000;
  return Math.max(900, ceilThousand - 100);
}

function solveSafeAffiliate(input: CalculationInput, rules: MarketplaceRule[], targetMargin: number) {
  let low = 0;
  let high = 0.8;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const margin = computeAtPrice({ ...input, affiliateRate: mid }, rules, input.unitPrice).margin;
    if (margin >= targetMargin) low = mid;
    else high = mid;
  }
  return low;
}

export function calculateProfit(input: CalculationInput, rules: MarketplaceRule[]): CalculationResult {
  const active = rules.filter((r) => r.status === "verified");
  const base = computeAtPrice(input, active, input.unitPrice);
  const breakEvenPrice = psychologicalRound(solveUnitPrice(input, active, 0));
  const targetMargin = input.targetMargin ?? 0.2;
  const recommendedPrice = psychologicalRound(solveUnitPrice(input, active, targetMargin));
  const safeAffiliateRate = solveSafeAffiliate(input, active, targetMargin);
  const ruleWarnings: string[] = [];
  if (active.length === 0) ruleWarnings.push("Tidak ada marketplace rule terverifikasi untuk konteks ini.");
  if (!input.categoryId) ruleWarnings.push("Kategori belum dikonfirmasi; estimasi fee dapat belum lengkap.");

  const lines: CalculationLine[] = [
    { code: "gross", label: "Harga × jumlah", amount: base.gross, source: "Input produk" },
    { code: "seller_discount", label: "Diskon seller", amount: -base.sellerDiscount, source: "Konfigurasi promo" },
    { code: "seller_voucher", label: "Voucher seller", amount: -base.sellerVoucher, source: "Konfigurasi promo" },
    { code: "platform_subsidy", label: "Subsidi platform", amount: base.platformSubsidy, source: "Input/subsidi platform" },
    ...active.map((r) => ({
      code: `rule:${r.id}`,
      label: r.name,
      amount: -ruleFee(r, base.gross, base.afterDiscount, base.eligibleRevenue, Math.max(1, input.quantity)),
      source: `${r.marketplace} rule ${r.ruleVersion}`
    })),
    { code: "affiliate", label: "Affiliate", amount: -base.affiliateFee, source: "Brand/Product/Campaign setting" },
    { code: "hpp", label: "Modal / HPP", amount: -base.hpp, source: "Cost Master" },
    { code: "packaging", label: "Packaging", amount: -base.packaging, source: "Cost setting" },
    { code: "operational", label: "Biaya operasional", amount: -base.operational, source: "Cost setting" },
    { code: "ads", label: "Iklan", amount: -base.ads, source: "Ads setting" },
    { code: "other", label: "Biaya lainnya", amount: -base.otherCost, source: "Cost setting" }
  ];

  const completenessParts = [
    input.unitPrice > 0,
    input.hppPerUnit >= 0,
    active.length > 0,
    Boolean(input.categoryId),
    input.affiliateRate != null,
    input.packagingPerOrder != null,
    input.ads != null
  ];
  const completeness = Math.round((completenessParts.filter(Boolean).length / completenessParts.length) * 100);
  const versions = [...new Set(active.map((r) => r.ruleVersion))];

  return {
    grossRevenue: base.gross,
    sellerDiscount: base.sellerDiscount,
    sellerVoucher: base.sellerVoucher,
    eligibleRevenue: base.eligibleRevenue,
    platformSubsidy: base.platformSubsidy,
    marketplaceFees: base.marketplaceFees,
    affiliateFee: base.affiliateFee,
    hpp: base.hpp,
    packaging: base.packaging,
    operational: base.operational,
    ads: base.ads,
    otherCost: base.otherCost,
    estimatedProfit: base.estimatedProfit,
    margin: base.margin,
    breakEvenPrice,
    recommendedPrice,
    safeAffiliateRate,
    completeness,
    lines,
    ruleVersion: versions.join(", ") || "UNVERIFIED",
    ruleWarnings
  };
}
