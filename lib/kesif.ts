"use client";

import { tarayiciSupabase } from "./supabase/client";
import type { KesifTuru } from "./pasaport";

/**
 * Bir keşfi (giriş yapmış kullanıcı için) sessizce kaydeder. Aynı
 * (kullanıcı, tür, anahtar) yalnızca bir kez sayılır. Giriş yoksa veya
 * Supabase yapılandırılmamışsa hiçbir şey yapmaz — kullanıcı akışını asla
 * kesmez.
 */
export async function kesfet(
  tur: KesifTuru,
  anahtar: string,
  il?: string | null,
): Promise<void> {
  try {
    const supabase = tarayiciSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("kesifler").upsert(
      { kullanici_id: data.user.id, tur, anahtar, il: il ?? null },
      { onConflict: "kullanici_id,tur,anahtar", ignoreDuplicates: true },
    );
  } catch {
    // Sessiz: keşif kaydı hiçbir zaman kritik yol değildir.
  }
}
