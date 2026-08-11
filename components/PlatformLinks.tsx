import type { PlatformBaglantisi } from "@/lib/types";
import {
  SpotifyIkon,
  YouTubeIkon,
  AppleMusicIkon,
} from "./MarkaIkonlari";

const ETIKET: Record<PlatformBaglantisi["platform"], string> = {
  youtube: "YouTube",
  spotify: "Spotify",
  "apple-music": "Apple Music",
  diger: "Dinle",
};

const RENK: Record<PlatformBaglantisi["platform"], string> = {
  youtube: "border-[#FF0000]/30 text-[#c4302b] hover:bg-[#FF0000] hover:text-white",
  spotify: "border-[#1DB954]/40 text-[#1a9e49] hover:bg-[#1DB954] hover:text-white",
  "apple-music": "border-[#FA243C]/30 text-[#d81f34] hover:bg-[#FA243C] hover:text-white",
  diger: "border-toprak/40 text-toprak-dark hover:bg-toprak hover:text-parsomen",
};

function Ikon({ platform }: { platform: PlatformBaglantisi["platform"] }) {
  const c = "h-4 w-4 shrink-0";
  if (platform === "youtube") return <YouTubeIkon className={c} />;
  if (platform === "spotify") return <SpotifyIkon className={c} />;
  if (platform === "apple-music") return <AppleMusicIkon className={c} />;
  return null;
}

export function PlatformLinks({
  baglantilar,
}: {
  baglantilar: PlatformBaglantisi[];
}) {
  if (!baglantilar.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {baglantilar.map((b, i) => (
        <a
          key={i}
          href={b.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-xl border bg-parsomen px-4 py-2 text-sm font-medium transition-colors ${RENK[b.platform]}`}
        >
          <Ikon platform={b.platform} />
          {ETIKET[b.platform]}
          {b.icra ? ` · ${b.icra}` : ""}
          {!b.dogrulandi && (
            <span className="text-[10px] opacity-70">(arama)</span>
          )}
        </a>
      ))}
    </div>
  );
}
