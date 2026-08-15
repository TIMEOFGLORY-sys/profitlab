import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marketplace = searchParams.get("marketplace");
    if (marketplace !== "shopee" && marketplace !== "tiktok") {
      return NextResponse.json({ error: "Marketplace tidak valid." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from("marketplace_categories")
      .select("id,name,path,external_category_id,effective_from,effective_to")
      .eq("marketplace", marketplace)
      .lte("effective_from", today)
      .or(`effective_to.is.null,effective_to.gte.${today}`)
      .order("name", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ categories: data || [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memuat kategori marketplace." }, { status: 500 });
  }
}
