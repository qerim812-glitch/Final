// Shared request helpers for API routes: JSON responses, security headers,
// input sanitisation, and lightweight session identification.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-user-id",
};

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...CORS_HEADERS,
      ...SECURITY_HEADERS,
    },
  });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } });
}

export function sanitize(value: unknown, max = 256): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, max);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length >= 6 && email.length <= 60;
}

export function sessionUserId(request: Request): string | null {
  const header = request.headers.get("x-user-id");
  if (!header) return null;
  const clean = sanitize(header, 64);
  return clean.startsWith("USR-") ? clean : null;
}

export async function parseJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    const text = await request.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    return null;
  }
}
