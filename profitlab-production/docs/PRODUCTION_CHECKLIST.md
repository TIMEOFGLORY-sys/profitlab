# Production Checklist

## P0 — Required before paid launch

- [ ] Verify complete Shopee category fee matrix currently applicable.
- [ ] Verify complete TikTok/Tokopedia Shop fee matrix currently applicable.
- [ ] Add admin rule editor with two-person verification workflow.
- [ ] Add XLSX parser and marketplace-specific import adapters.
- [ ] Commit imports through database transaction with preview diff.
- [ ] Implement actual import rollback.
- [ ] Connect dashboard/product pages to live Supabase data.
- [ ] Add sign-up, password reset, email verification and route protection.
- [ ] Configure production SMTP.
- [ ] Add full calculation regression fixture library.
- [ ] Add telemetry/error monitoring.
- [ ] Confirm privacy policy, terms, and account data deletion process.
- [ ] Backup + restore drill.

## P1 — Recommended shortly after launch

- [ ] Saved scenarios.
- [ ] Rule-change impact analysis.
- [ ] Actual order/settlement import.
- [ ] Refund/return handling.
- [ ] Ads report import.
- [ ] Multi-store dashboard.
- [ ] RBAC UI.

## Quality gate

No marketplace percentage rule can be published without:
- source;
- effective date;
- fee basis;
- category/seller scope;
- regression case;
- verification date.
