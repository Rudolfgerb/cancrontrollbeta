# 🗺️ Google Maps API Setup - WICHTIG!

## ⚠️ Problem: Street View zeigt "negativ" oder lädt nicht

**Ursache**: Fehlender oder ungültiger Google Maps API Key

## 🔑 Lösung: Google Maps API Key erstellen

### Schritt 1: Google Cloud Console öffnen
1. Gehe zu: https://console.cloud.google.com/
2. Logge dich mit deinem Google-Account ein
3. Erstelle ein neues Projekt oder wähle ein bestehendes

### Schritt 2: APIs aktivieren
1. Gehe zu: **APIs & Services** → **Library**
2. Suche und aktiviere folgende APIs:
   - ✅ **Maps JavaScript API**
   - ✅ **Street View Static API**
   - ✅ **Places API** (optional, aber empfohlen)
   - ✅ **Geocoding API** (optional)

### Schritt 3: API Key erstellen
1. Gehe zu: **APIs & Services** → **Credentials**
2. Klicke **+ CREATE CREDENTIALS** → **API key**
3. Kopiere den generierten API Key

### Schritt 4: API Key einschränken (WICHTIG für Sicherheit!)
1. Klicke auf den erstellten API Key
2. Unter **Application restrictions**:
   - Wähle **HTTP referrers (web sites)**
   - Füge hinzu:
     - `http://localhost:*`
     - `http://127.0.0.1:*`
     - `https://yourdomain.com/*` (deine Production Domain)

3. Unter **API restrictions**:
   - Wähle **Restrict key**
   - Wähle nur die aktivierten APIs:
     - Maps JavaScript API
     - Street View Static API
     - Places API

4. Klicke **SAVE**

### Schritt 5: API Key in .env eintragen
Öffne `.env` in deinem Projekt und füge hinzu:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ Ersetze `AIzaSy...` mit deinem echten API Key!**

### Schritt 6: Dev Server neu starten
```bash
# Stoppe den Server (Ctrl+C)
# Starte neu
npm run dev
```

## 💳 Kosten & Limits

### Google Maps Preise:
- **Kostenlos**: Erste $200/Monat
- **Maps JavaScript API**: $7 pro 1.000 Aufrufe (nach Free Tier)
- **Street View API**: $7 pro 1.000 Aufrufe (nach Free Tier)

### Free Tier bedeutet:
- ~28.500 Street View Aufrufe **kostenlos pro Monat**
- Für Entwicklung mehr als genug!

### Billing einrichten:
1. Google Cloud Console → **Billing**
2. Kreditkarte hinzufügen (erforderlich, auch für Free Tier)
3. Budget Alerts setzen (z.B. bei $50)

## 🧪 Testing

Nach dem Setup:

### 1. Browser Console öffnen (F12)
Keine Fehler mehr:
- ❌ ~~ApiProjectMapError~~
- ❌ ~~NoApiKeys~~
- ✅ Street View lädt normal

### 2. App öffnen
```
http://localhost:8081
```

### 3. Zur Game-Seite navigieren
- Street View sollte jetzt **normal** angezeigt werden
- **Keine invertierten Farben mehr!**

## 🐛 Troubleshooting

### Fehler: "ApiProjectMapError"
- **Problem**: APIs nicht aktiviert
- **Lösung**: Aktiviere alle oben genannten APIs in Google Cloud Console

### Fehler: "NoApiKeys"
- **Problem**: API Key fehlt oder falsch in .env
- **Lösung**:
  1. Check `.env` → `VITE_GOOGLE_MAPS_API_KEY` ist gesetzt
  2. Server neu starten
  3. Browser Cache leeren (Ctrl+Shift+R)

### Fehler: "RefererNotAllowedMapError"
- **Problem**: Deine Domain ist nicht in den API Key Restrictions
- **Lösung**:
  1. Google Cloud Console → API Key
  2. HTTP referrers → `http://localhost:*` hinzufügen

### Fehler: "InvalidKeyMapError"
- **Problem**: API Key ungültig oder gelöscht
- **Lösung**: Neuen API Key erstellen

### Street View zeigt immer noch "negativ" / falsche Farben
- **Problem**: Wahrscheinlich Browser/OS High Contrast Modus
- **Lösung**:
  1. Deaktiviere Windows High Contrast
  2. Deaktiviere Browser Dark Mode Extensions
  3. Siehe `docs/STREETVIEW_NEGATIVE_FIX.md` für weitere Lösungen

### API Limits erreicht
- **Problem**: Zu viele Requests
- **Lösung**:
  1. Google Cloud Console → **APIs & Services** → **Quotas**
  2. Check aktuelle Nutzung
  3. Ggf. Caching implementieren

## 📝 .env Beispiel (vollständig)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vfghfehsygewqrnwhpyy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: Other APIs
VITE_BACKEND_URL=http://localhost:3000
```

## 🔒 Sicherheit

### ⚠️ WICHTIG - API Key schützen:

1. **Nie commiten!**
   - `.env` ist in `.gitignore` ✅
   - Trotzdem: Double-check vor jedem Commit!

2. **API Key Restrictions setzen** (siehe Schritt 4 oben)

3. **Budget Alerts aktivieren**
   - Google Cloud Console → Billing → Budgets & alerts
   - Alert bei z.B. $50 setzen

4. **Für Production**:
   - Separaten API Key erstellen
   - Nur Production Domain erlauben
   - Tägliche Limits setzen

## 🚀 Nach dem Setup

### Was jetzt funktionieren sollte:
- ✅ Street View lädt normal (keine negativen Farben)
- ✅ Google Maps zeigt Karte
- ✅ Marker können gesetzt werden
- ✅ Spot Capture funktioniert
- ✅ Keine API Errors in Console

### Du kannst jetzt:
1. **Game-Seite** → Street View nutzen
2. **Spot Capture** → Google Maps verwenden (falls StreetViewMap.tsx aktiviert wird)
3. Screenshots von Street View machen
4. Spots auf der Map speichern

---

## 📞 Hilfe benötigt?

### Ressourcen:
- Google Maps Docs: https://developers.google.com/maps/documentation
- API Key Guide: https://developers.google.com/maps/documentation/javascript/get-api-key
- Pricing: https://mapsplatform.google.com/pricing/

### Häufige Fragen:

**Q: Muss ich eine Kreditkarte angeben?**
A: Ja, auch für Free Tier. Wird aber erst belastet, wenn du $200/Monat überschreitest.

**Q: Wie viel kostet das für meine Entwicklung?**
A: Wahrscheinlich $0, da Free Tier sehr großzügig ist.

**Q: Kann ich die App ohne Google Maps nutzen?**
A: Ja! Die **SimpleSpotCapture** Komponente funktioniert ohne Maps - nur mit Upload.

**Q: Wie deaktiviere ich Google Maps komplett?**
A: Einfach `VITE_GOOGLE_MAPS_API_KEY` in `.env` leer lassen oder entfernen. Die App läuft, aber Street View wird nicht funktionieren.

---
**Status**: Warte auf API Key Setup
**Erstellt**: 19.10.2025
**Priorität**: HOCH (für Street View Feature)
