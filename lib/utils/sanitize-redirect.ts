/**
 * Sanitize a redirect path to prevent open redirect attacks.
 * Only allows relative paths starting with a single slash.
 */
export function sanitizeRedirect(path: string | null | undefined): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes(':\\')) {
    return '/';
  }
  return path;
}
