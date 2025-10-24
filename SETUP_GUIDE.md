# 🚀 Can Controll - Quick Setup Guide

## Schnellstart in 5 Minuten

### 1. Voraussetzungen prüfen

Stelle sicher, dass folgendes installiert ist:
```bash
node --version  # Should be v18+
npm --version   # Should be 8+
mongod --version # Should be 6+
```

### 2. MongoDB starten

**Option A - Lokal**:
```bash
# Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"

# Mac/Linux
mongod
```

**Option B - Docker**:
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

### 3. Backend Setup & Start

```bash
cd backend

# Dependencies installieren
npm install

# .env erstellen
copy .env.example .env  # Windows
# OR
cp .env.example .env    # Mac/Linux

# Server starten
npm run dev
```

✅ Backend läuft auf: `http://localhost:3001`

### 4. Frontend Setup & Start

Öffne ein **neues Terminal**:

```bash
# Zum Projekt-Root zurück
cd ..

# Dependencies installieren (falls noch nicht geschehen)
npm install

# Optional: .env für Frontend
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux

# Frontend starten
npm run dev
```

✅ Frontend läuft auf: `http://localhost:5173`

### 5. Erste Schritte

1. Öffne Browser: `http://localhost:5173`
2. Klicke auf "Register"
3. Erstelle einen Account
4. Du startest mit:
   - $500 Geld
   - 1 Spray Can
   - 2 Farben (Black & White)
5. Klicke auf "Explore" um Spots zu finden!

---

## 🔑 Google Maps API einrichten

### API Key erhalten

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Erstelle ein Projekt oder wähle bestehendes
3. Navigiere zu "APIs & Services" > "Library"
4. Aktiviere folgende APIs:
   - **Maps JavaScript API**
   - **Street View Static API**
   - **Geocoding API**
   - **Places API**

5. Gehe zu "Credentials"
6. Klicke "Create Credentials" > "API Key"
7. Kopiere den API Key

### API Key konfigurieren

**Backend** (`backend/.env`):
```env
GOOGLE_MAPS_API_KEY=DeinAPIKeyHier
```

**Frontend** (`.env` im Root):
```env
VITE_GOOGLE_MAPS_API_KEY=DeinAPIKeyHier
```

---

## 🐛 Troubleshooting

### Backend startet nicht

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:27017`

**Lösung**: MongoDB ist nicht gestartet
```bash
# Prüfe MongoDB Status
mongod

# Oder starte mit Docker
docker start mongodb
```

---

**Problem**: `JWT_SECRET is not defined`

**Lösung**: `.env` Datei fehlt
```bash
cd backend
cp .env.example .env
# Bearbeite .env und füge Werte hinzu
```

---

### Frontend verbindet nicht zum Backend

**Problem**: `Failed to fetch` oder `Network Error`

**Lösung 1**: Backend läuft nicht
```bash
cd backend
npm run dev
```

**Lösung 2**: Falsche URL in `.env`
```env
# Prüfe im Root .env:
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

---

### MongoDB Connection Error

**Problem**: `MongoServerError: Authentication failed`

**Lösung**: Verwende richtige Connection String
```env
# Lokal ohne Auth:
MONGODB_URI=mongodb://localhost:27017/cancontroll

# Mit Auth:
MONGODB_URI=mongodb://username:password@localhost:27017/cancontroll

# MongoDB Atlas:
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cancontroll
```

---

### Google Maps API Fehler

**Problem**: `Google Maps JavaScript API error: ApiNotActivatedMapError`

**Lösung**: API nicht aktiviert
1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Library
3. Suche und aktiviere alle benötigten APIs

---

**Problem**: `This API project is not authorized`

**Lösung**: API Key Restrictions
1. Gehe zu Credentials
2. Klicke auf deinen API Key
3. Unter "API restrictions":
   - Wähle "Restrict key"
   - Aktiviere alle Maps/Places APIs
4. Unter "Application restrictions":
   - Entwicklung: "None"
   - Produktion: "HTTP referrers" → Domain hinzufügen

---

## 📦 Dependencies installieren

Wenn `node_modules` fehlen oder Probleme auftreten:

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 Projekt zurücksetzen

Kompletter Reset (Datenbank löschen):

```bash
# MongoDB Shell öffnen
mongosh

# In MongoDB Shell:
use cancontroll
db.dropDatabase()
exit
```

Dann Backend & Frontend neu starten.

---

## ✅ Checkliste

- [ ] Node.js 18+ installiert
- [ ] MongoDB läuft
- [ ] Backend Dependencies installiert
- [ ] Backend .env konfiguriert
- [ ] Backend startet ohne Fehler
- [ ] Frontend Dependencies installiert
- [ ] Frontend startet ohne Fehler
- [ ] Google Maps API Key konfiguriert
- [ ] Browser öffnet `http://localhost:5173`
- [ ] Account erstellt
- [ ] Erster Spot generiert

---

## 🎉 Fertig!

Dein Can Controll läuft jetzt!

**Nächste Schritte**:
1. Spots in deiner Stadt finden
2. Erstes Graffiti malen
3. Reputation aufbauen
4. Neue Tools kaufen

**Need Help?**
- Siehe `PROJECT_DOCUMENTATION.md` für Details
- Siehe `backend/README.md` für API-Docs
- Öffne ein Issue auf GitHub

---

**Happy Spraying! 🎨**
