# nowinyzgminy – makieta serwisu (wersja testowa)

Strona testowa z hasłem. To nie jest oficjalna strona GWŻ w Warszawie.

## Struktura
- `worker.js` – logowanie hasłem i serwowanie plików (hasło w pierwszych liniach pliku)
- `wrangler.jsonc` – konfiguracja Cloudflare Workers (nazwa: `nowinyzgminy`)
- `public/` – strony (`index.html` = Aktualności), style `site.css`, `dokumenty/` (PDF), `img/`, `assets/`

## Wdrożenie
Cloudflare → Workers & Pages → Create → Import a repository → `nowinyzgminy`.
Następnie Settings → Domains & Routes → Add → Custom domain: `nowinyzgminy.pl`, `www.nowinyzgminy.pl`.

Repozytorium powinno być prywatne (Settings → Danger Zone → Change visibility).
