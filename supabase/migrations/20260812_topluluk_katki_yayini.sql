-- ================================================================
-- Topluluk Katkıları — onaylanmış katkıların herkese açık gösterimi
--
-- Additive migration. hafiza_katkilari RLS'i onaylanmış katkıları anonim
-- okumaya KAPALI (yalnızca sahibi/editör). Satır tabanlı bir SELECT politikası
-- açmak tüm sütunları (kullanıcı kimliği, ilçe/köy, kaynak kişi) sızdırırdı.
-- Bunun yerine, YALNIZCA güvenli sütunları döndüren bir SECURITY DEFINER
-- fonksiyonu kullanıyoruz. Kişisel alanlar (kullanici_id, ilce_koy,
-- kaynak_kisi, dosya_yolu, editor_notu) DIŞARI VERİLMEZ.
-- ================================================================

create or replace function public.yayinlanan_katkilar(p_turku_slug text)
returns table (
  id uuid,
  katki_turu text,
  il text,
  aciklama text,
  atif_adi text,
  olusturulma timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    id,
    katki_turu,
    il,
    aciklama,
    -- Atıf adı yalnızca kullanıcı açıkça verdiyse gösterilir.
    nullif(btrim(coalesce(atif_adi, '')), '') as atif_adi,
    olusturulma
  from public.hafiza_katkilari
  where turku_slug = p_turku_slug
    and durum = 'onaylandi'
    and yayin_izni = true
  order by olusturulma desc
  limit 50
$$;

-- Anonim ve giriş yapmış ziyaretçiler çağırabilir; başka erişim yok.
revoke all on function public.yayinlanan_katkilar(text) from public;
grant execute on function public.yayinlanan_katkilar(text) to anon, authenticated;
