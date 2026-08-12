# Editör Masası kurulumu

## 1. Migration

Supabase Dashboard → SQL Editor içinde aşağıdaki dosyayı çalıştırın:

`supabase/migrations/20260812_admin_icerik.sql`

Bu migration kullanıcı rollerini, katkı izin alanlarını, editör türkülerini ve kültür/kurs/rota içeriklerini oluşturur.

## 2. İlk admin

Önce siteye giriş yapıp kullanıcı adınızı oluşturun. Sonra SQL Editor'da:

```sql
update public.profiller
set rol = 'admin'
where kullanici_adi = 'KULLANICI_ADINIZ';
```

Kullanıcı adını `@` işareti olmadan yazın. Çıkış yapıp yeniden giriş yaptıktan sonra profil menüsünde **Editör Masası** görünür.

## 3. Vercel değişkeni

Vercel → Project → Settings → Environment Variables:

```text
SUPABASE_SERVICE_ROLE_KEY=Supabase service_role anahtarı
```

Bu anahtar `NEXT_PUBLIC_` öneki taşımamalıdır. Yalnızca sunucuda kullanıcı e-postalarını listelemek ve yönetim işlemlerini güvenli biçimde yürütmek için kullanılır.

## 4. Roller

- `uye`: katkı gönderir ve kendi katkılarını izler.
- `editor`: katkıları inceler, türkü ve kültür içeriği yönetir.
- `admin`: editör yetkilerine ek olarak kullanıcı rollerini ve e-posta listesini yönetir.

Her sunucu işlemi oturumu ve rolü yeniden doğrular. Arayüzde `/admin` bağlantısının gizlenmesi tek başına güvenlik önlemi değildir.

## 5. Yayın akışı

1. Katkı `bekliyor` durumuyla gelir.
2. Editör kaynak ve yayın iznini kontrol edip `inceleniyor` yapar.
3. Gerekirse ayrı bir `editor_turkuler` kaydı hazırlanır.
4. Kaynaklar tamamlandığında kayıt `yayinda` yapılır.
5. Yayımlanan editör türküsü `/turku/<slug>` ve ilgili şehir arşivinde görünür.

Spotify oynatıcıları, kullanıcı e-postaları ve özel katkı dosyaları reklam hedeflemesi veya oyun içeriği için kullanılmamalıdır.
