# MI Prison

En dansk landing page-prototype til MI Prison Minecraft-serveren.

## Kør lokalt

Åbn `index.html` direkte i browseren, eller start en lokal statisk server:

```bash
python -m http.server 8080
```

Besøg derefter <http://localhost:8080>.

## Supabase-opsætning

1. Opret et Supabase-projekt.
2. Åbn SQL Editor og kør `supabase-schema.sql`.
3. Opret den første Owner i Supabase Auth med email og adgangskode.
4. Indsæt brugerens UUID i den kommenterede `insert`-kommando i SQL-filen og kør den.
5. Indsæt projektets URL og **anon key** i `supabase-config.js`.

Brug aldrig en `service_role`-nøgle i browseren eller i GitHub. Supabase RLS
beskytter ansøgninger og teamroller, og Owner-login afvises, hvis brugeren ikke
har rollen `Owner`.

Serverstatus hentes løbende fra Minecraft-serveren via status-endpointet.
Webshop og Discord Points kræver stadig en server-side Discord-bot, før betaling
kan gennemføres rigtigt.
