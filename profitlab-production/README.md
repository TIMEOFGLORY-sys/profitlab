# ProfitLab V1 — Production Starter

ProfitLab adalah Marketplace Profit Control System untuk seller Shopee dan TikTok Shop Indonesia. Paket ini mengubah prototype awal menjadi fondasi aplikasi produksi: Next.js 16.3, React 19.2, TypeScript, Supabase/PostgreSQL, RLS multi-tenant, calculation engine deterministik, marketplace rule registry, bulk CSV preview, dashboard premium, calculator, pricing, campaign simulator, dan database schema.

## 1. Yang sudah ada

- Premium dark SaaS UI yang responsif.
- Dashboard action-oriented.
- Product/variant workspace.
- Cek Profit dan calculation explanation.
- Cari Harga Jual / target margin.
- Campaign simulator / Profit Guard UI.
- CSV import preview + smart header detection.
- Variant-level deterministic calculation engine.
- Fixed, percentage, capped voucher, per-order, dan per-item cost primitives.
- Binary-search price solver untuk BEP dan target margin.
- Rule resolver berdasarkan marketplace, seller type, category, program, dan tanggal.
- Supabase database schema + RLS multi-tenant.
- Historical HPP / price foundation.
- Brand settings, profit profile, promotion overrides.
- Import batches, import rows, scenario, calculation audit.
- Regression test contoh untuk calculation engine.
- Production-safe seed policy: rule yang belum diverifikasi tidak diaktifkan.

## 2. Mode Rules

### Demo
`.env.local`

```bash
PROFITLAB_RULE_MODE=demo
```

UI tetap dapat diuji. Hanya rule demo yang berstatus `verified` yang digunakan.

### Production

```bash
PROFITLAB_RULE_MODE=production
```

API akan membaca `marketplace_fee_rules` dari Supabase dan menolak kalkulasi jika tidak ada rule terverifikasi untuk konteks yang diminta.

Ini disengaja. ProfitLab tidak boleh diam-diam menggunakan persentase asumsi.

## 3. Menjalankan lokal

```bash
cp .env.example .env.local
npm install
npm run dev
```

Buka `http://localhost:3000`.

## 4. Setup Supabase

1. Buat Supabase project.
2. Jalankan `supabase/migrations/001_initial.sql` pada SQL Editor.
3. Jalankan `supabase/seed.sql`.
4. Isi `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
PROFITLAB_RULE_MODE=production
```

5. Untuk production Auth, konfigurasi custom SMTP. Jangan mengandalkan default Supabase SMTP untuk production.

## 5. Kalkulasi

Calculation Engine berada di:

`src/lib/calculation/engine.ts`

Input utama:
- harga per unit
- quantity
- HPP per unit
- seller discount
- seller voucher
- platform subsidy
- affiliate
- packaging
- operational cost
- ads
- other costs
- target margin
- marketplace rules

Output:
- estimated profit
- margin
- marketplace fee breakdown
- BEP price
- recommended target price
- safe affiliate rate
- completeness score
- calculation lines + source
- rule version + warnings

## 6. Prinsip Rule

Marketplace rules adalah data, bukan source-code constants.

Setiap rule menyimpan:
- marketplace
- seller type
- category
- program
- fee type
- rate / fixed amount
- calculation base
- per-order/per-item scope
- min/max fee
- effective dates
- source URL
- rule version
- last verification
- status

Lihat `docs/RULES_ENGINE.md`.

## 7. Bulk Import

V1 source package menyediakan CSV preview endpoint. XLSX parsing produksi disiapkan sebagai next implementation item karena perlu parser yang aman dan mapping marketplace-specific.

Template `.xlsx` yang disertakan dalam package dipakai sebagai universal fallback dan Cost Master.

## 8. Production Gate

Sebelum go-live berbayar:
- Lengkapi fee category Shopee yang terverifikasi.
- Lengkapi fee TikTok berdasarkan Seller Center/Shop Academy terbaru.
- Tambahkan XLSX parser production.
- Implement full import commit transaction + undo.
- Sambungkan Product Workspace ke Supabase.
- Aktifkan authentication gate.
- Tambahkan service-role Admin Console untuk rule management.
- Jalankan regression cases untuk setiap kategori aktif.
- Implement observability/error reporting dan backups.

Lihat `docs/PRODUCTION_CHECKLIST.md`.
