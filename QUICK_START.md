# 🚀 Quick Start - Can Control App

## ✅ Status: Bereit zum Testen!

Die App wurde erfolgreich wiederhergestellt und das Screenshot-Feature ist vollständig implementiert.

## 🎮 App starten

### Development Server läuft auf:
- **Local**: http://localhost:8081
- **Network**: http://192.168.178.131:8081

### Commands:
```bash
# Development Server starten
npm run dev

# Production Build erstellen
npm run build

# Build testen
npm run preview
```

## 🎯 Screenshot-Feature testen

### 1. Zur Spot Capture Seite navigieren:
- Öffne http://localhost:8081
- Gehe zu "Test" oder direkt zu `/spot-capture`

### 2. Screenshot hochladen:
1. Öffne Google Street View in neuem Tab:
   - https://www.google.com/maps/@52.520008,13.404954,3a,75y,90h,90t/data=!3m7!1e1
2. Mache einen Screenshot:
   - **Windows**: Win + Shift + S
   - **Mac**: Cmd + Shift + 4
3. Lade den Screenshot in der App hoch
4. Setze GPS-Koordinaten (oder nutze "Aktuelle Position")

### 3. Spot konfigurieren:
- **Name**: Gib dem Spot einen Namen (z.B. "East Side Gallery")
- **Beschreibung**: Optional - Besonderheiten des Spots
- **Risiko-Level**: 1-10 (beeinflusst Belohnungen und Schwierigkeit)

### 4. Graffiti malen:
- Klicke auf "Jetzt Bemalen!"
- Der Screenshot wird als Hintergrund angezeigt
- Male dein Graffiti direkt auf dem Screenshot
- **Ziel**: Mindestens 30% Coverage erreichen
- **Achtung**: Wache im Auge behalten! (Abstand-Meter)

### 5. Belohnungen erhalten:
- **Spot-Erfassung**: +50 Fame, +25$
- **Graffiti-Qualität**: Bonus basierend auf Coverage-Prozent

## 📊 Risiko-Level Übersicht

| Level | Schwierigkeit | Wache | Belohnung | Farbe |
|-------|--------------|-------|-----------|-------|
| 1-3   | Easy         | Nein  | Niedrig   | 🟢 Grün |
| 4-6   | Medium       | Ja    | Mittel    | 🔵 Cyan |
| 7-8   | Hard         | Ja    | Hoch      | 🟠 Orange |
| 9-10  | Extreme      | Ja    | Sehr Hoch | 🔴 Rot |

## 🗄️ Supabase-Konfiguration

### Bereits konfiguriert in `.env`:
```env
VITE_SUPABASE_URL=https://vfghfehsygewqrnwhpyy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### Project Details:
- **Project ID**: vfghfehsygewqrnwhpyy
- **Region**: Automatisch zugewiesen
- **Status**: ✅ Bereit für Verwendung

### Nächste Schritte für Supabase (optional):
1. Tabellen erstellen:
   - `spots` - Alle erfassten Spots
   - `graffitis` - Alle gemalten Graffitis
   - `player_profiles` - Spieler-Profile
2. Row Level Security (RLS) aktivieren
3. Storage für Screenshot-Bilder einrichten

## 🎨 Features im Detail

### PaintCanvasWithBackground
- ✅ Screenshot als Hintergrund
- ✅ Transparente Zeichenebene
- ✅ Auto-Skalierung
- ✅ Stealth-System (Wachen)
- ✅ Timer-System
- ✅ Qualitäts-Berechnung
- ✅ Sound-Effekte

### SimpleSpotCapture
- ✅ Screenshot-Upload
- ✅ Kamera-Support
- ✅ GPS-Koordinaten (manuell/automatisch)
- ✅ Bildvorschau
- ✅ Quick-Links zu Google Maps

### SpotCaptureSystem
- ✅ 3-stufiger Workflow
- ✅ Spot-Konfiguration
- ✅ Belohnungssystem
- ✅ Integration mit Game Context

## 🐛 Troubleshooting

### Server startet nicht:
```bash
# Port könnte bereits belegt sein
# Stoppe andere Prozesse auf Port 8081
# Oder: App wird automatisch auf nächsten freien Port umgeleitet
```

### Screenshot wird nicht geladen:
- Überprüfe Browser-Console auf Fehler
- Stelle sicher, dass Bild unter 10MB ist
- Unterstützte Formate: PNG, JPG, JPEG, WebP

### Supabase-Fehler:
- Überprüfe `.env` Datei
- Stelle sicher, dass Credentials korrekt sind
- Öffne Supabase Dashboard: https://app.supabase.com

## 📁 Wichtige Dateien

### Komponenten:
- `src/components/game/PaintCanvasWithBackground.tsx` - Mal-Canvas mit Screenshot
- `src/components/game/SimpleSpotCapture.tsx` - Screenshot-Upload
- `src/components/game/SpotCaptureSystem.tsx` - Spot-Erfassungssystem
- `src/pages/SpotCapture.tsx` - Hauptseite

### Konfiguration:
- `.env` - Supabase Credentials
- `src/lib/supabase.ts` - Supabase Client
- `src/contexts/GameContext.tsx` - Game State

### Dokumentation:
- `docs/RESTORATION_AND_FIX_SUMMARY.md` - Vollständige Zusammenfassung
- `QUICK_START.md` - Diese Datei

## 🎉 Los geht's!

1. Öffne http://localhost:8081
2. Navigate zu "Spot Capture"
3. Lade einen Screenshot hoch
4. Konfiguriere den Spot
5. Male dein erstes Graffiti!

**Viel Spaß beim Testen! 🎨**

---
**Letzte Aktualisierung**: 19.10.2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
