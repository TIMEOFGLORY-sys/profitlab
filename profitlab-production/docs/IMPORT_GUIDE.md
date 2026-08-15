# Import Design

## User-facing flow

```text
Produk → Import
  → Shopee / TikTok / Excel
  → already have file?
  → upload
  → auto-detect
  → column mapping
  → validation
  → preview changes
  → commit import
  → HPP matching
  → data quality issues
```

## Required principle

A file should not be rejected only because HPP/category is incomplete. Import valid rows and route missing data into Data Quality Center.

## Universal mapping targets

- SKU
- Product Name
- Variant Name
- Selling Price
- HPP
- Category
- Brand
- Marketplace Product ID
- Marketplace Variant ID

## Matching order

1. Marketplace external variant ID.
2. Exact marketplace SKU mapping already known.
3. Exact Internal SKU.
4. Suggested fuzzy mapping, requiring user confirmation.

Never auto-merge low-confidence SKU matches.

## Import history

Each import is an `import_batch`. Row-level raw/normalized data is retained so the system can show what changed and support rollback logic.
