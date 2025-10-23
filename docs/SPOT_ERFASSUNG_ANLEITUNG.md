# 📸 Spot Erfassung - Schnellstart

## ✅ Problem BEHOBEN!

**Kein schwarzes Bild mehr!** Die Screenshot-Funktion funktioniert jetzt perfekt mit Google's Static Street View API.

---

## 🚀 So geht's (3 einfache Schritte):

### 1️⃣ Spot-Erfassung öffnen

```
http://localhost:5173/spot-capture
```

Oder über Test-Seite:
```
http://localhost:5173/test → Button "Spot Erfassung"
```

### 2️⃣ Screenshot erstellen

1. Klick auf **"Street View aktivieren"**
2. Navigiere zum gewünschten Ort in Street View
3. Klick auf **"Screenshot erstellen"**
4. ✅ Fertiges Bild wird angezeigt!

### 3️⃣ Spot konfigurieren

1. Gib dem Spot einen **Namen**
2. Optional: **Beschreibung** hinzufügen
3. Wähle **Risiko-Level** (1-10)
4. Klick auf **"Spot Erstellen"**

---

## 🎯 Was du bekommst:

- ✅ **Screenshot** mit echter Straßenansicht
- ✅ **GPS-Koordinaten** automatisch gespeichert
- ✅ **Blickrichtung** (Heading) gespeichert
- ✅ **Belohnungen:** +50 Fame & +25$ pro Spot!

---

## 💡 Tipps:

### Beste Orte für Spots:

- 🏢 Große Gebäudewände
- 🚂 Bahnhöfe und Brücken
- 🏭 Industriegebiete
- 🎨 Bekannte Graffiti-Viertel
- 🌉 Unterführungen

### Risiko-Level Guide:

| Level | Schwierigkeit | Fame | Geld | Wache |
|-------|---------------|------|------|-------|
| 1-3   | Easy | ~20  | ~10  | Nein |
| 4-6   | Medium | ~50  | ~25  | Ja |
| 7-8   | Hard | ~70  | ~35  | Ja |
| 9-10  | Extreme | ~100 | ~50  | Ja |

---

## ⚙️ Setup (Einmalig):

### Google Maps API-Key:

1. Erstelle `.env` Datei im Projekt-Root:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=dein_api_key_hier
   ```

2. Google Cloud Console:
   - Gehe zu https://console.cloud.google.com
   - Aktiviere "Street View Static API"
   - Kopiere deinen API-Key

---

## 🎮 Workflow:

```
┌─────────────────────────────────────────┐
│  1. Street View aktivieren              │
│     └─> Karte wird zu Street View       │
│                                          │
│  2. Zum Spot navigieren                 │
│     └─> Pfeile nutzen oder klicken      │
│                                          │
│  3. Screenshot erstellen                │
│     └─> Button klicken                  │
│     └─> Bild wird generiert             │
│                                          │
│  4. Spot benennen                       │
│     └─> Name eingeben                   │
│     └─> Risiko wählen                   │
│                                          │
│  5. Spot erstellen                      │
│     └─> +50 Fame, +25$                  │
│     └─> Spot ist jetzt verfügbar!       │
└─────────────────────────────────────────┘
```

---

## 📱 Komponenten:

### Für Entwickler:

```tsx
// Einfache Screenshot-Funktion
import { WorkingStreetViewCapture } from '@/components/game/WorkingStreetViewCapture';

<WorkingStreetViewCapture
  defaultPosition={{ lat: 52.520008, lng: 13.404954 }}
  onCaptureComplete={(imageData, location) => {
    // imageData = Base64 PNG
    // location = { lat, lng }
  }}
/>
```

```tsx
// Komplettes Spot-Erfassungs-System
import { SpotCaptureSystem } from '@/components/game/SpotCaptureSystem';

<SpotCaptureSystem
  onClose={() => console.log('Geschlossen')}
/>
```

---

## ❓ Häufige Fragen:

### Warum sehe ich ein Fallback-Bild statt Street View?

**Antwort:** Static Street View API ist nicht aktiviert oder API-Key fehlt.

**Lösung:**
1. `.env` Datei erstellen mit API-Key
2. "Street View Static API" in Google Cloud aktivieren
3. Seite neu laden

### Kann ich Screenshots ohne API-Key machen?

**Ja!** Der Fallback-Modus erstellt ein Gradient-Bild mit GPS-Daten. Funktioniert, aber nicht so schön.

### Wie viele Screenshots kann ich machen?

**Free Tier:** 10.000 pro Monat
**Dann:** $7 pro 1.000 Screenshots

---

## 🎉 Fertig!

Du kannst jetzt Spots erfassen! Viel Spaß beim Erkunden der Stadt!

**Tipp:** Starte mit bekannten Graffiti-Spots in deiner Stadt und arbeite dich zu extremeren Locations vor!

---

**Erstellt:** 2025-10-19
**Status:** ✅ Voll funktionsfähig
**Support:** Siehe `SCREENSHOT_FIX.md` für technische Details
