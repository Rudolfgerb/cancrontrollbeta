# 🔧 Street View "Negativ" Problem - Diagnose & Lösung

## 🐛 Problem-Beschreibung
"In Street View ist alles negativ" - Farben sind invertiert

## 🔍 Mögliche Ursachen

### 1. **Browser Dark Mode**
Einige Browser invertieren Bilder automatisch im Dark Mode.

**Lösung:**
```css
/* In index.css oder component CSS */
.street-view-container img,
.street-view-container canvas {
  filter: none !important;
  -webkit-filter: none !important;
}
```

### 2. **Windows High Contrast Mode**
Windows High Contrast kann Farben invertieren.

**Check:**
- Windows Einstellungen → Erleichterte Bedienung → Hoher Kontrast
- Falls aktiviert: Deaktivieren oder CSS Fix anwenden

### 3. **CSS Filter auf Parent Element**
Ein Parent-Element könnte einen `filter: invert()` haben.

**Check alle Komponenten:**
```bash
# Suche nach invert in allen Dateien
grep -r "invert(" src/
```

### 4. **Canvas Context Problem**
Bei Screenshot-Capture könnte der Canvas Context falsch gesetzt sein.

**Aktueller Code in StreetViewMap.tsx:**
```typescript
// Line 143-147
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#667eea');
gradient.addColorStop(1, '#764ba2');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);
```

**Problem:** Dies erstellt nur einen Platzhalter, kein echtes Street View Capture!

### 5. **Google Maps API Theme**
Google Maps Street View könnte im Dark Mode sein.

**Lösung - StreetViewPanorama Options:**
```typescript
<StreetViewPanorama
  position={currentPosition}
  visible={true}
  onLoad={handleStreetViewLoad}
  options={{
    addressControl: false,
    fullscreenControl: false,
    motionTracking: false,
    motionTrackingControl: false,
    // Farben korrigieren:
    styles: [
      {
        featureType: "all",
        elementType: "all",
        stylers: [
          { invert_lightness: false }, // WICHTIG!
          { saturation: 0 },
          { lightness: 0 }
        ]
      }
    ]
  }}
/>
```

## ✅ Empfohlene Lösungen

### Lösung A: SimpleSpotCapture verwenden (AKTUELL AKTIV)
Die aktuelle Implementierung nutzt **SimpleSpotCapture**, die:
- ✅ Keine Street View rendert
- ✅ Nur Upload-Funktion bietet
- ✅ Keine Farbprobleme hat
- ✅ Funktioniert perfekt

**Keine Aktion nötig, wenn du SimpleSpotCapture verwendest!**

### Lösung B: StreetViewMap Fix (falls verwendet)
Falls du die `StreetViewMap.tsx` Komponente verwendest:

#### 1. CSS Fix hinzufügen:
```css
/* In src/index.css */
@layer components {
  .street-view-container,
  .street-view-container * {
    filter: none !important;
    -webkit-filter: none !important;
  }

  .street-view-container canvas,
  .street-view-container img {
    filter: none !important;
  }
}
```

#### 2. Echtes Screenshot Capture implementieren:
```typescript
// In StreetViewMap.tsx - Replace placeholder code
import html2canvas from 'html2canvas';

const captureScreen = async () => {
  try {
    const streetViewContainer = document.querySelector('.street-view-container') as HTMLElement;
    if (!streetViewContainer) return;

    // Use html2canvas to capture REAL screenshot
    const canvas = await html2canvas(streetViewContainer, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      // WICHTIG: Keine Filter anwenden
      ignoreElements: (element) => {
        return element.classList.contains('gm-style-iw'); // Ignore info windows
      }
    });

    // Crop to selected area
    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) return;

    const width = Math.abs(cropArea.width);
    const height = Math.abs(cropArea.height);

    croppedCanvas.width = width;
    croppedCanvas.height = height;

    // Draw cropped area
    ctx.drawImage(
      canvas,
      cropArea.startX, cropArea.startY, width, height,
      0, 0, width, height
    );

    // Convert to data URL
    const imageData = croppedCanvas.toDataURL('image/png');

    if (onCaptureComplete) {
      const position = streetViewRef.current.getPosition();
      onCaptureComplete(imageData, {
        lat: position.lat(),
        lng: position.lng(),
      });
    }
  } catch (error) {
    console.error('Screenshot error:', error);
  }
};
```

### Lösung C: PaintCanvasWithBackground Fix
Falls das Negativ-Problem beim **Malen** auftritt:

```typescript
// In PaintCanvasWithBackground.tsx
useEffect(() => {
  if (backgroundImage && backgroundCanvasRef.current) {
    const canvas = backgroundCanvasRef.current;
    const ctx = canvas.getContext('2d', {
      // Wichtige Context-Optionen
      alpha: true,
      desynchronized: false,
      colorSpace: 'srgb', // Standard RGB
      willReadFrequently: false
    });

    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous'; // CORS fix

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // WICHTIG: Reset any transforms
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // NO FILTERS!
      ctx.filter = 'none';

      // Draw image normally
      ctx.drawImage(img, 0, 0);
      setBackgroundLoaded(true);
    };

    img.src = backgroundImage;
  }
}, [backgroundImage]);
```

## 🧪 Testing Checklist

- [ ] Öffne die App im Browser
- [ ] Gehe zu Spot Capture
- [ ] Lade einen Screenshot hoch
- [ ] **Check: Ist das Bild normal oder invertiert?**
- [ ] Klicke "Jetzt Bemalen"
- [ ] **Check: Ist der Hintergrund normal oder invertiert?**
- [ ] Male auf dem Canvas
- [ ] **Check: Sind die Farben korrekt?**

## 🔍 Browser Developer Tools Check

### Chrome/Edge DevTools:
```javascript
// Console ausführen:
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
console.log('Context:', ctx);
console.log('Filter:', window.getComputedStyle(canvas).filter);

// Sollte zeigen: filter: "none"
// Wenn nicht: Bug gefunden!
```

### Check Computed Styles:
1. F12 öffnen
2. Element auswählen (Canvas oder Street View Container)
3. Computed Tab öffnen
4. Suche nach "filter"
5. Sollte "none" sein

## 📊 Aktuelle Implementierung

### Status der Komponenten:

| Komponente | Verwendet | Street View | Problem möglich? |
|------------|-----------|-------------|------------------|
| `SimpleSpotCapture.tsx` | ✅ JA | ❌ Nein (nur Upload) | ❌ Nein |
| `SpotCaptureSystem.tsx` | ✅ JA | ❌ Nein | ❌ Nein |
| `PaintCanvasWithBackground.tsx` | ✅ JA | ❌ Nein | ⚠️ Möglich wenn Bild invertiert |
| `StreetViewMap.tsx` | ❌ NEIN | ✅ Ja | ✅ Ja - aber nicht verwendet |

## 🎯 Nächste Schritte

1. **Identifiziere genau wo das Problem auftritt:**
   - Beim Upload?
   - Beim Anzeigen als Background?
   - In einer anderen Komponente?

2. **Browser Check:**
   - Öffne DevTools
   - Console: `window.getComputedStyle(element).filter`
   - Sollte "none" sein

3. **OS/Browser Settings:**
   - Windows High Contrast: Aus
   - Browser Dark Mode: Prüfen
   - Browser Extensions: Deaktivieren (könnte Farben ändern)

4. **Wende entsprechende Lösung an**

## 💡 Quick Fix (Notfall)

Falls nichts hilft, temporärer Global Fix:

```css
/* In index.css ganz unten */
* {
  filter: none !important;
  -webkit-filter: none !important;
}

canvas, img, video {
  filter: none !important;
}
```

**⚠️ Warnung:** Dies entfernt ALLE Filter global. Nicht empfohlen für Production!

---
**Status**: Wartend auf genaue Problem-Lokalisierung
**Erstellt**: 19.10.2025
