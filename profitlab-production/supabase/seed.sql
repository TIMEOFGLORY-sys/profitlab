-- Production-safe seed: only rules with a directly verified source are enabled.
-- Do NOT add guessed category commission percentages here.

insert into marketplace_fee_rules(
  marketplace,seller_type,category_id,program,name,fee_type,fixed_amount,calculation_base,fee_scope,
  effective_from,source_url,source_note,rule_version,last_verified_at,status
) values (
  'shopee','any',null,null,'Biaya Proses Pesanan','processing',1250,'eligible_revenue','per_order',
  '2025-07-20','https://seller.shopee.co.id/edu/article/25787',
  'Public Shopee Seller Education result indexed Apr 6 2026. Verify edge cases/exemptions before production release.',
  'SHOPEE-ID-PROCESSING-2026-08','2026-08-15T00:00:00+07:00','verified'
);

-- Shopee pre-order service: seed as verified reference rule. Confirm scope/category eligibility operationally before enabling program on a store.
insert into marketplace_fee_rules(
  marketplace,seller_type,category_id,program,name,fee_type,rate,calculation_base,fee_scope,
  effective_from,source_url,source_note,rule_version,last_verified_at,status
) values (
  'shopee','any',null,'preorder','Biaya Layanan Produk Pre-order','preorder_service',0.03,'eligible_revenue','per_item',
  '2025-12-01','https://seller.shopee.co.id/edu/article/26517',
  'Shopee education page states 3% per quantity of completed pre-order product; program must be explicitly enabled in context.',
  'SHOPEE-ID-PREORDER-2026-08','2026-08-15T00:00:00+07:00','verified'
);

-- TikTok: current seller terms state applicable fees are determined in Seller Center / Shop Academy and may change.
-- Category commission rates are intentionally NOT seeded until an operator verifies/imports the current fee table.
