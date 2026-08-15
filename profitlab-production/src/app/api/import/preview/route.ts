import { NextResponse } from "next/server";
import { previewCsv } from "@/lib/import/csv";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { text?: string };
    if (!body.text) return NextResponse.json({ error: "CSV text diperlukan." }, { status: 400 });
    return NextResponse.json(previewCsv(body.text));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import preview gagal." }, { status: 400 });
  }
}
