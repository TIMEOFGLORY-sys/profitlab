import { NextResponse } from "next/server";
import { calculateProfit } from "@/lib/calculation/engine";
import type { CalculationInput } from "@/lib/domain/types";
import { demoRules } from "@/lib/rules/demo";
import { resolveRules } from "@/lib/rules/resolver";
import { mapDbRule } from "@/lib/rules/from-db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { input: CalculationInput; programs?: string[] };
    const input = body.input;
    if (!input || input.unitPrice < 0 || input.hppPerUnit < 0) {
      return NextResponse.json({ error: "Input kalkulasi tidak valid." }, { status: 400 });
    }

    const context = {
      marketplace: input.marketplace,
      sellerType: input.sellerType,
      categoryId: input.categoryId,
      date: input.calculationDate,
      programs: body.programs || []
    };

    const mode = process.env.PROFITLAB_RULE_MODE || "demo";
    if (mode === "production") {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase
        .from("marketplace_fee_rules")
        .select("*")
        .eq("marketplace", input.marketplace)
        .eq("status", "verified")
        .lte("effective_from", input.calculationDate)
        .or(`effective_to.is.null,effective_to.gte.${input.calculationDate}`);
      if (error) throw error;
      const rules = resolveRules((data || []).map(mapDbRule), context);
      if (!rules.length) {
        return NextResponse.json({
          error: "Belum ada rule marketplace terverifikasi untuk kombinasi marketplace, tipe seller, kategori, dan tanggal ini.",
          code: "RULE_NOT_VERIFIED"
        }, { status: 422 });
      }
      return NextResponse.json({ result: calculateProfit(input, rules), mode: "production" });
    }

    const rules = resolveRules(demoRules, context);
    return NextResponse.json({
      result: calculateProfit(input, rules),
      mode: "demo",
      warning: "Demo mode aktif. Hanya rule berstatus verified pada seed demo yang diterapkan."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menghitung profit." }, { status: 500 });
  }
}
