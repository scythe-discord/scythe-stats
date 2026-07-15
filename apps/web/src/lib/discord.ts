/**
 * Discord CDN avatar URL for a user, or null when they have no custom avatar
 * (callers fall back to initials). Animated avatars ("a_" hashes) get .gif.
 */
export function discordAvatarUrl(
  discordId: string | null | undefined,
  avatarHash: string | null | undefined,
  size: 16 | 32 | 64 | 128 = 64,
): string | null {
  if (!discordId || !avatarHash) return null;
  const ext = avatarHash.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${ext}?size=${size}`;
}
