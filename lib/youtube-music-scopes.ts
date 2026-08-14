/**
 * YouTube Data API v3 için Google OAuth kapsamı.
 * "youtube" kapsamı; okunabilir liste ve yazılabilir liste erişimini kapsar
 * (playlists.insert / playlistItems.insert dahil). YouTube Music, hesabı
 * YouTube ile paylaştığı için burada oluşturulan listeler music.youtube.com
 * üzerinde de görünür.
 */
export const YOUTUBE_MUSIC_SCOPES = "openid email profile https://www.googleapis.com/auth/youtube";
