# ProfitLab Architecture

## High-level

```text
Browser
  |
Next.js App Router
  |-- Dashboard / Product UX
  |-- /api/calculate
  |-- /api/import/preview
  |
Domain Layer
  |-- Rule Resolver
  |-- Calculation Engine
  |-- Import Normalizer
  |
Supabase
  |-- Auth
  |-- PostgreSQL
  |-- RLS
  |-- Storage (future import raw files)
```

## Core data graph

```text
Business
  ├─ Membership
  ├─ Brand
  │   └─ Store
  │       └─ Marketplace Account
  │           └─ Listing
  │               └─ Marketplace Variant
  └─ Product
      └─ Internal Variant/SKU
          ├─ Cost History
          └─ mapped Marketplace Variants
```

## Why Internal Variant is separate

Marketplace SKU can differ across channels, while HPP belongs to the physical/internal SKU. This design allows one HPP history to be reused across Shopee and TikTok listings.

## Override hierarchy

System → Store → Brand → Product → Variant → Campaign.

When multiple values are applicable, the most specific active override wins. The database stores override effective periods so historical calculations remain reproducible.

## Calculation audit

Production calculations should persist input, output, applied rule IDs, rule versions and calculation date to `calculation_audits`. This provides traceability when marketplace rules later change.
