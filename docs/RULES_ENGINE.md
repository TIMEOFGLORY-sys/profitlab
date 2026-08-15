# Marketplace Rules Engine

## Non-negotiable rule

Never hard-code one global marketplace percentage such as `Shopee = 10%`.

Applicable fees can depend on marketplace, seller type, category, program, effective date, fee base, cap, and order/item scope.

## Resolution context

```text
marketplace
seller_type
category_id
programs[]
calculation_date
```

Only records with `status = verified` may be used in production.

## Status lifecycle

`draft → verified → needs_review → expired`

Recommended operational workflow:
1. Operator records source URL and proposed change.
2. Second reviewer checks fee/base/date/category.
3. Regression cases run.
4. Rule is marked verified.
5. Old rule gets `effective_to`, never overwritten.

## 2026 source notes included in package

- Shopee processing fee source: `https://seller.shopee.co.id/edu/article/25787`
- Shopee pre-order service source: `https://seller.shopee.co.id/edu/article/26517`
- Shopee admin fee reference: `https://seller.shopee.co.id/edu/article/7187`
- TikTok seller terms: `https://seller-id.tiktok.com/university/article/agreement?knowledge_id=10001020`

TikTok category commission percentages are not guessed in seed data. Seller terms indicate applicable fees are determined through Seller Center / Shop Academy and can change.
