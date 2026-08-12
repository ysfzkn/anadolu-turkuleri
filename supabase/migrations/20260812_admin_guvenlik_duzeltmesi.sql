-- Daha önce 20260812_admin_icerik.sql uygulanmış projeler için ileri yönlü
-- güvenlik ve tekrar çalıştırılabilirlik düzeltmesi.

revoke all on function public.admin_mi() from public;
revoke all on function public.editor_mi() from public;
grant execute on function public.admin_mi() to authenticated;
grant execute on function public.editor_mi() to authenticated;

drop policy if exists "kendi_katki_dosyasini_sil" on storage.objects;
create policy "kendi_katki_dosyasini_sil" on storage.objects for delete to authenticated
  using (
    bucket_id = 'hafiza-katkilari'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
