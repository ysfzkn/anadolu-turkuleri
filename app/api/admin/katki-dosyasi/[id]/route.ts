import { NextResponse } from "next/server";
import { servisSupabase, yoneticiDogrula } from "@/lib/supabase/admin";

export async function GET(_istek: Request, { params }: { params: Promise<{ id: string }> }) {
  const yetki = await yoneticiDogrula();
  if (!yetki) return NextResponse.json({ hata: "Yetkisiz erişim" }, { status: 403 });

  const { id } = await params;
  const db = servisSupabase();
  const { data: katki, error } = await db
    .from("hafiza_katkilari")
    .select("dosya_yolu")
    .eq("id", id)
    .maybeSingle();
  if (error || !katki?.dosya_yolu) {
    return NextResponse.json({ hata: "Katkı dosyası bulunamadı" }, { status: 404 });
  }

  const { data, error: imzaHatasi } = await db.storage
    .from("hafiza-katkilari")
    .createSignedUrl(katki.dosya_yolu, 60);
  if (imzaHatasi || !data?.signedUrl) {
    return NextResponse.json({ hata: "Geçici dosya bağlantısı oluşturulamadı" }, { status: 500 });
  }
  return NextResponse.redirect(data.signedUrl);
}
