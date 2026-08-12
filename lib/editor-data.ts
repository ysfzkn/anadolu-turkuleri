import type { Turku } from "./types";
import { sunucuSupabase } from "./supabase/server";

function turkuyeCevir(x:any):Turku{return {slug:x.slug,baslik:x.baslik,yore:x.yore,ozet:x.ozet,hikaye:x.hikaye,ozan:x.ozan??undefined,sozYazari:x.soz_yazari??undefined,derleyen:x.derleyen??undefined,kaynakKisi:x.kaynak_kisi??undefined,digerAdlar:[],sozler:[],baglantilar:[],kaynaklar:Array.isArray(x.kaynaklar)?x.kaynaklar:[],etiketler:x.etiketler??[],dogrulama:x.durum==="yayinda"?"dogrulandi":"incelemede"}}
export async function editorTurkusuBul(slug:string){try{const db=await sunucuSupabase();const{data}=await db.from("editor_turkuler").select("*").eq("slug",slug).eq("durum","yayinda").maybeSingle();return data?turkuyeCevir(data):undefined}catch{return undefined}}
export async function yayinlananEditorTurkuleri(){try{const db=await sunucuSupabase();const{data}=await db.from("editor_turkuler").select("*").eq("durum","yayinda").order("guncellenme",{ascending:false});return(data??[]).map(turkuyeCevir)}catch{return[]}}
