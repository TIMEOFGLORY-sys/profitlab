export interface ImportPreview {
  headers: string[];
  rowCount: number;
  sample: Record<string, string>[];
  detected: Record<string, string | null>;
  warnings: string[];
}

const aliases: Record<string, string[]> = {
  sku: ["sku", "seller sku", "kode barang", "kode produk", "merchant sku", "variation sku"],
  product_name: ["product name", "nama produk", "nama barang", "item name"],
  variant_name: ["variant", "variation", "variasi", "nama variasi"],
  selling_price: ["price", "harga", "selling price", "harga jual"],
  hpp: ["hpp", "modal", "cost", "cogs", "harga modal"],
  category: ["category", "kategori", "category name"]
};

function splitLine(line: string, separator: string) {
  const out: string[] = [];
  let buf = "";
  let quote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quote && line[i + 1] === '"') { buf += '"'; i++; }
      else quote = !quote;
    } else if (c === separator && !quote) { out.push(buf.trim()); buf = ""; }
    else buf += c;
  }
  out.push(buf.trim());
  return out;
}

export function previewCsv(text: string): ImportPreview {
  const rawLines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!rawLines.length) throw new Error("File kosong.");
  const separator = rawLines[0].includes(";") && !rawLines[0].includes(",") ? ";" : ",";
  const headers = splitLine(rawLines[0], separator);
  const normalized = headers.map((h) => h.toLowerCase().trim());
  const detected: Record<string, string | null> = {};
  for (const [target, names] of Object.entries(aliases)) {
    const idx = normalized.findIndex((h) => names.includes(h));
    detected[target] = idx >= 0 ? headers[idx] : null;
  }
  const sample = rawLines.slice(1, 6).map((line) => {
    const values = splitLine(line, separator);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
  const warnings: string[] = [];
  if (!detected.sku) warnings.push("Kolom SKU belum terdeteksi.");
  if (!detected.product_name) warnings.push("Kolom nama produk belum terdeteksi.");
  if (!detected.hpp) warnings.push("HPP tidak ditemukan; dapat dilengkapi setelah import.");
  if (!detected.category) warnings.push("Kategori tidak ditemukan; perlu mapping/konfirmasi.");
  return { headers, rowCount: Math.max(0, rawLines.length - 1), sample, detected, warnings };
}
