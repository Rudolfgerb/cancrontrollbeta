# Google Street View Integration Setup

Die Google Street View Integration wurde erfolgreich implementiert! 🎉

## Features

1. **Street View Modus**: Wechsel zwischen klassischer Kartenansicht und Street View
2. **Screenshot-Funktion**: Ziehe einen Bereich auf der Street View auf, um einen Screenshot zu erstellen
3. **Crop-Tool**: Präzises Auswählen von Bereichen mit Echtzeit-Größenanzeige
4. **Location-Tracking**: Automatische Erfassung der GPS-Koordinaten beim Screenshot

## Setup-Anleitung

### 1. Google Maps API Key erstellen

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Erstelle ein neues Projekt oder wähle ein bestehendes aus
3. Aktiviere folgende APIs:
   - **Maps JavaScript API**
   - **Street View Static API**
4. Erstelle einen API Key unter "APIs & Services" → "Credentials"
5. Schränke den API Key ein (optional aber empfohlen):
   - Application restrictions: HTTP referrers
   - API restrictions: Nur die oben genannten APIs

### 2. API Key konfigurieren

1. Öffne die `.env` Datei im Projekt-Root
2. Füge deinen API Key ein:
   ```
   VITE_GOOGLE_MAPS_API_KEY=dein_api_key_hier
   ```
3. Speichere die Datei
4. Starte den Dev-Server neu: `npm run dev`

### 3. Verwendung

#### Im Spiel:

1. Navigiere zur **Stadt-Map** Seite
2. Klicke auf den **"Street View"** Button in der oberen rechten Ecke
3. Die Google Street View wird geladen
4. Bewege dich in der Street View mit Maus/Touch
5. Klicke auf **"Screenshot Modus"**
6. Ziehe einen Bereich auf der Street View auf
7. Klicke auf **"Speichern"** um den Screenshot zu erstellen

#### Features:

- **Crop-Modus**: Aktiviere mit dem "Screenshot Modus" Button
- **Bereich auswählen**: Ziehe mit der Maus einen rechteckigen Bereich
- **Größe anzeigen**: Die Dimensionen werden während des Ziehens angezeigt
- **Speichern**: Der Screenshot wird als Base64-Image gespeichert
- **Abbrechen**: Brich den Crop-Modus ab mit "Abbrechen"

## Komponenten

### StreetViewMap.tsx
Die Haupt-Komponente für Street View Integration:
- Google Maps API Loader
- Street View Panorama
- Crop/Screenshot-Funktionalität
- Canvas für Bild-Erfassung
- Location-Tracking

### CityMap.tsx (erweitert)
Integriert Street View in die Map-Ansicht:
- Toggle zwischen klassischer Map und Street View
- Dialog für Street View Capture
- Spot-Integration (vorbereitet)

## Nächste Schritte

Um die Street View Screenshots mit den Painting-Spots zu verbinden:

1. Erweitere die `Spot` Interface um `streetViewImage` und `location` Properties
2. Speichere Screenshots im GameContext
3. Nutze die Screenshots als Hintergrund im PaintCanvas
4. Implementiere "Paint on Street View" Feature

## Troubleshooting

### "Fehler beim Laden von Google Maps"
- Überprüfe ob der API Key korrekt in der `.env` Datei eingetragen ist
- Stelle sicher, dass die Maps JavaScript API aktiviert ist
- Überprüfe die API Key Restrictions in der Google Cloud Console

### Street View zeigt keine Bilder
- Nicht alle Standorte haben Street View Daten
- Versuche einen anderen Standort (z.B. eine Großstadt)
- Stelle sicher, dass die Street View Static API aktiviert ist

### Screenshot funktioniert nicht
- Stelle sicher, dass ein Bereich ausgewählt wurde
- Der Bereich muss mindestens 10x10 Pixel groß sein
- Überprüfe die Browser-Console auf Fehler

## Entwickler-Notizen

Die aktuelle Screenshot-Implementierung nutzt einen Canvas-Placeholder mit Gradient-Hintergrund. Für eine echte Screenshot-Funktionalität kannst du eine Library wie `html2canvas` integrieren:

```bash
npm install html2canvas
```

Dann in `StreetViewMap.tsx` importieren und verwenden:
```typescript
import html2canvas from 'html2canvas';

// Im captureScreen():
const canvas = await html2canvas(streetViewContainer, {
  x: cropArea.startX,
  y: cropArea.startY,
  width: Math.abs(cropArea.width),
  height: Math.abs(cropArea.height),
});
const imageData = canvas.toDataURL('image/png');
```
