// Worker chroniący całą makietę serwisu jednym hasłem.
// Hasło jest wpisane w kodzie (nie w zmiennych środowiskowych) – żeby je zmienić,
// podmień wartość poniżej i wypchnij nowy commit.
// UWAGA: repozytorium powinno być PRYWATNE, bo hasło i dokumenty są w jego plikach.
const SITE_PASSWORD = "testyTwarda6#";
const COOKIE_NAME = "nowiny_auth";

// Dostępne bez logowania (tylko to, czego potrzebuje strona logowania).
const PUBLIC_PATHS = new Set([
  "/login.html", "/site.css", "/assets/logogwz-crop.jpg", "/robots.txt", "/favicon.ico",
  "/manifest.webmanifest", "/sw.js", "/assets/icon-192.png", "/assets/icon-512.png",
  "/assets/icon-maskable-512.png", "/assets/apple-touch-icon.png",
]);

async function hashPassword(password) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function handleLogin(request) {
  const form = await request.formData();
  const password = (form.get("password") || "").toString();
  const next = (form.get("next") || "/").toString();
  if (password !== SITE_PASSWORD) {
    const u = new URL("/login.html", request.url);
    u.searchParams.set("error", "1");
    return Response.redirect(u.toString(), 302);
  }
  const token = await hashPassword(password);
  const headers = new Headers();
  headers.append("Set-Cookie", `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
  headers.append("Location", next.startsWith("/") && !next.startsWith("//") ? next : "/");
  return new Response(null, { status: 302, headers });
}

function handleLogout(request) {
  const headers = new Headers();
  headers.append("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  headers.append("Location", new URL("/login.html", request.url).toString());
  return new Response(null, { status: 302, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname;

    if (p === "/api/login" && request.method === "POST") return handleLogin(request);
    if (p === "/api/logout") return handleLogout(request);

    if (!PUBLIC_PATHS.has(p)) {
      const m = (request.headers.get("Cookie") || "").match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
      const ok = m && m[1] === (await hashPassword(SITE_PASSWORD));
      if (!ok) {
        const r = new URL("/login.html", url.origin);
        r.searchParams.set("next", p);
        return Response.redirect(r.toString(), 302);
      }
    }

    const a = new URL(request.url);
    a.pathname = p === "/" ? "/index.html" : p;
    let res = await env.ASSETS.fetch(new Request(a.toString(), request));
    if (res.status === 404 && !a.pathname.includes(".")) {
      a.pathname = a.pathname.replace(/\/$/, "") + ".html";
      const res2 = await env.ASSETS.fetch(new Request(a.toString(), request));
      if (res2.status === 200) res = res2;
    }
    const out = new Response(res.body, res);
    out.headers.set("X-Robots-Tag", "noindex, nofollow");
    out.headers.set("Cache-Control", "private, no-store");
    return out;
  },
};
