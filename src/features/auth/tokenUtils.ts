export function isTokenExpired(token: string | null, skewSeconds = 15): boolean {
  if (!token) return true;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    ) as { exp?: number };

    if (!payload.exp) return false;
    return payload.exp <= Math.floor(Date.now() / 1000) + skewSeconds;
  } catch {
    return true;
  }
}
