# I&K Service Dashboard

Internes Service-Dashboard zur zentralen Verwaltung und zum Zugriff auf Unternehmensanwendungen. Authentifizierung über Pocket ID (OIDC), rollenbasierte Zugriffskontrolle über Gruppen.

## Architektur

```
Browser → Next.js App (Full-Stack) → PostgreSQL
               ↕
          Pocket ID (OIDC)
```

- **Frontend & Backend**: Next.js 16 mit App Router (Server Components, Server Actions)
- **Datenbank**: PostgreSQL 17 mit Drizzle ORM
- **Authentifizierung**: Auth.js v5 mit generischem OIDC Provider
- **UI**: shadcn/ui + Tailwind CSS v4
- **Deployment**: Docker Compose

## Voraussetzungen

- Node.js 22+
- pnpm
- PostgreSQL 15+ (oder Docker)
- Eine konfigurierte [Pocket ID](https://github.com/pocket-id/pocket-id) Instanz

## Lokale Entwicklung

```bash
# 1. Repository klonen
git clone <repo-url> && cd iuk-overview

# 2. Abhängigkeiten installieren
pnpm install

# 3. Umgebungsvariablen konfigurieren
cp .env.example .env
# → Werte in .env ausfüllen (siehe Abschnitt Umgebungsvariablen)

# 4. PostgreSQL starten (via Docker Compose)
docker compose up db -d

# 5. Datenbankschema erstellen
pnpm db:push

# 6. Demo-Daten laden (optional)
pnpm db:seed

# 7. Entwicklungsserver starten
pnpm dev
```

Die App ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

## Start per Docker Compose

```bash
# 1. Umgebungsvariablen konfigurieren
cp .env.example .env
# → Pocket ID Credentials und AUTH_SECRET ausfüllen

# 2. Starten
docker compose up -d --build
```

Die App startet automatisch, führt Migrationen durch und ist unter Port 3000 erreichbar.

## Umgebungsvariablen

| Variable | Beschreibung | Pflicht | Default |
|---|---|---|---|
| `APP_URL` | Öffentliche URL der App | Ja | `http://localhost:3000` |
| `AUTH_SECRET` | Geheimer Schlüssel für Session-Verschlüsselung | Ja | – |
| `AUTH_TRUST_HOST` | Host-Header vertrauen (für Reverse Proxy) | Nein | `true` |
| `DATABASE_URL` | PostgreSQL Connection String | Ja | – |
| `POCKET_ID_ISSUER` | URL der Pocket ID Instanz | Ja | – |
| `POCKET_ID_CLIENT_ID` | OIDC Client ID | Ja | – |
| `POCKET_ID_CLIENT_SECRET` | OIDC Client Secret | Ja | – |
| `POCKET_ID_SCOPES` | Angeforderte OIDC Scopes | Nein | `openid profile email groups` |
| `POCKET_ID_GROUPS_CLAIM` | Name des Gruppen-Claims im Token | Nein | `groups` |
| `ADMIN_GROUP` | Gruppenname für Admin-Berechtigung | Ja | `dashboard-admins` |

`AUTH_SECRET` generieren:
```bash
openssl rand -base64 32
```

## Pocket ID Einrichtung

1. In Pocket ID einen neuen **OIDC Client** anlegen
2. **Redirect URI** setzen: `https://ihre-domain.com/api/auth/callback/pocket-id`
3. Folgende **Scopes** aktivieren: `openid`, `profile`, `email`, `groups`
4. **Client ID** und **Client Secret** kopieren und in `.env` eintragen
5. `POCKET_ID_ISSUER` auf die URL der Pocket ID Instanz setzen (z. B. `https://id.example.com`)
6. `ADMIN_GROUP` auf den Gruppennamen für Administratoren setzen (muss in Pocket ID existieren)

> **Wichtig**: Der `groups` Scope muss in Pocket ID konfiguriert sein, damit Gruppenzugehörigkeiten im Token oder per Userinfo-Endpunkt übermittelt werden.

## Datenbank-Migrationen

```bash
# Schema generieren
pnpm db:generate

# Schema auf DB anwenden
pnpm db:push

# Drizzle Studio (DB-Browser)
pnpm db:studio
```

Bei Docker-Deployment werden Migrationen automatisch beim Start ausgeführt.

## Berechtigungskonzept

### Normale Nutzer

- Sehen nur Services, für die sie berechtigt sind
- **Öffentliche Services** (`isPublic = true`) sind für alle eingeloggten Nutzer sichtbar
- **Gruppenbasierte Services** erfordern Mitgliedschaft in mindestens einer der konfigurierten Gruppen
- Können keine Services verändern

### Administratoren

- Mitglieder der konfigurierten `ADMIN_GROUP` Gruppe
- Können Services anlegen, bearbeiten und löschen
- Können Sichtbarkeit und Gruppenanforderungen pflegen
- Können die Reihenfolge der Services anpassen
- Sehen im Admin-Bereich alle Services (auch inaktive)

### Beispiel: Service mit Gruppenabsicherung

```
Name:                Grafana
URL:                 https://grafana.example.com
Öffentlich:          Nein
Erforderliche Gruppen: ops-team, monitoring-team
```

→ Nur Nutzer in der Gruppe `ops-team` oder `monitoring-team` sehen diesen Service im Dashboard.

## Technologie-Stack

| Komponente | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Sprache | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Komponenten | shadcn/ui |
| Authentifizierung | Auth.js v5 (OIDC) |
| Datenbank | PostgreSQL 17 |
| ORM | Drizzle ORM |
| Deployment | Docker + Docker Compose |

## Lizenz

MIT
