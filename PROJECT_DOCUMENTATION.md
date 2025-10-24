# 🎨 Can Controll - Urban Graffiti Simulator
## Vollständige Projekt-Dokumentation

Ein immersives Urban Graffiti Simulator-Spiel, das Google Street View mit Canvas-basierter Malerei, Stealth-Mechaniken und Echtzeit-Risikosystemen kombiniert.

---

## 📋 Inhaltsverzeichnis

1. [Projektübersicht](#projektübersicht)
2. [Architektur](#architektur)
3. [Installation & Setup](#installation--setup)
4. [Backend-Dokumentation](#backend-dokumentation)
5. [Frontend-Dokumentation](#frontend-dokumentation)
6. [API-Referenz](#api-referenz)
7. [Spiel-Mechaniken](#spiel-mechaniken)
8. [Deployment](#deployment)

---

## 🎯 Projektübersicht

**Can Controll** ist ein browserbasierter Urban Graffiti Simulator, der Spielern ermöglicht:
- Echte Straßen via Google Street View zu erkunden
- Virtuelle Graffiti-Spots zu finden und zu bemalen
- Mit einem realistischen Stealth-System zu interagieren
- An einem vollständigen Wirtschaftssystem teilzunehmen
- Mit anderen Spielern zu konkurrieren

### Kern-Features

#### 🗺️ Street View Integration
- Google Street View API für realistische Umgebungen
- Geocoding für Adressen und Koordinaten
- Dynamische Spot-Generierung basierend auf Standort

#### 🎨 Mal-System
- HTML5 Canvas-basiertes Drawing Interface
- Multiple Brush-Typen (Spray Can, Fat Cap, Skinny Cap, Marker)
- Farbpalette mit 11+ Farben
- Stroke-basierte Speicherung für Replay

#### 🕵️ Stealth-Mechanik
- Kontinuierlich fallende Stealth-Bar
- Zeitbasierte Risikofaktoren (Tag/Nacht)
- Zufällige Events (Passanten, Autos, Polizei)
- "Look Around" Mechanik (3x pro Session)

#### 🚔 Polizei-System
- Quick-Time-Event Flucht-Minispiel
- Geldstrafen basierend auf Risikofaktor
- Gefängnissystem bei wiederholten Vergehen
- Arrest-Historie Tracking

#### 💰 Wirtschaftssystem
- Geld verdienen durch erfolgreiche Graffitis
- Tool-Shop mit verschiedenen Werkzeugen
- Farben-Shop mit unterschiedlichen Preisen
- Level & Experience System

---

## 🏗️ Architektur

### Tech Stack

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: MongoDB mit Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO 4
- **Security**: Helmet, bcryptjs, CORS

#### Frontend
- **Framework**: React 18 mit TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **WebSocket**: Socket.IO Client

#### External APIs
- Google Maps JavaScript API
- Google Street View Static API
- Google Geocoding API
- Google Places API

### Projektstruktur

```
cancontroll/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         # MongoDB Connection
│   │   │   └── constants.js        # Game Constants
│   │   ├── models/
│   │   │   ├── User.js            # User Model
│   │   │   ├── Player.js          # Player Model
│   │   │   ├── Spot.js            # Spot Model
│   │   │   └── Graffiti.js        # Graffiti Model
│   │   ├── routes/
│   │   │   ├── auth.routes.js     # Authentication
│   │   │   ├── player.routes.js   # Player Management
│   │   │   ├── spot.routes.js     # Spot Management
│   │   │   ├── graffiti.routes.js # Graffiti CRUD
│   │   │   └── game.routes.js     # Game Logic
│   │   ├── services/
│   │   │   ├── streetview.service.js
│   │   │   └── game.service.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   └── server.js              # Entry Point
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── src/                            # Frontend
│   ├── components/
│   │   └── ui/                    # shadcn/ui components
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   │   ├── api.ts                 # API Client
│   │   ├── socket.ts              # WebSocket Manager
│   │   └── utils.ts
│   ├── pages/
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🛠️ Installation & Setup

### Voraussetzungen

1. **Node.js** 18+ - [Download](https://nodejs.org/)
2. **MongoDB** 6+ - [Download](https://www.mongodb.com/try/download/community)
3. **Google Maps API Key** - [Anleitung](#google-api-setup)
4. **npm** oder **yarn**

### Schritt-für-Schritt Installation

#### 1. Repository Setup

```bash
git clone <repository-url>
cd cancontroll
```

#### 2. Backend Installation

```bash
cd backend
npm install

# Erstelle .env Datei
cp .env.example .env
```

Bearbeite `backend/.env`:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cancontroll
JWT_SECRET=dein-super-geheimer-jwt-key
GOOGLE_MAPS_API_KEY=AIzaSyDeYUqbrE5K8WTc79XVMokRy0883dI20c8
CORS_ORIGIN=http://localhost:5173
```

#### 3. Frontend Installation

```bash
cd ..  # Zurück zum Root
npm install
```

Optional - Erstelle `.env` im Root:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

#### 4. MongoDB Starten

**Option A: Lokal**
```bash
mongod
```

**Option B: Docker**
```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  mongo:latest
```

**Option C: MongoDB Atlas**
- Erstelle Cluster auf [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Kopiere Connection String in `.env`

#### 5. Starten

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

Server läuft auf: `http://localhost:3001`

**Frontend** (Terminal 2):
```bash
npm run dev
```

Frontend läuft auf: `http://localhost:5173`

### Google API Setup

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
2. Erstelle ein neues Projekt
3. Aktiviere APIs:
   - Maps JavaScript API
   - Street View Static API
   - Geocoding API
   - Places API
4. Erstelle API Key unter "Credentials"
5. Füge Key in `backend/.env` ein

---

## 📡 Backend-Dokumentation

### Datenbank-Modelle

#### User Model
```javascript
{
  username: String (unique, 3-20 chars),
  email: String (unique, validated),
  password: String (hashed with bcrypt),
  avatar: String (default),
  isActive: Boolean,
  isAdmin: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

**Methoden**:
- `comparePassword(password)` - Passwort-Vergleich
- `getPublicProfile()` - Öffentliche Profil-Daten

#### Player Model
```javascript
{
  userId: ObjectId (ref: User),
  username: String,
  money: Number (default: 500),
  reputation: Number (0-10000),
  level: Number (default: 1),
  experience: Number,
  inventory: {
    tools: [{ toolId, durability, capacity }],
    colors: [{ colorId, quantity }]
  },
  stats: {
    totalGraffitis: Number,
    spotsOwned: Number,
    timesArrested: Number,
    successfulEscapes: Number,
    totalPlayTime: Number
  },
  jailStatus: {
    isInJail: Boolean,
    releaseTime: Date,
    reason: String
  },
  arrestHistory: [{ timestamp, spotId, fineAmount }],
  crewId: ObjectId (ref: Crew),
  preferences: { defaultTool, defaultColor },
  lastActive: Date,
  createdAt: Date
}
```

**Methoden**:
- `checkJailStatus()` - Prüft Gefängnis-Status
- `addMoney(amount)` - Geld hinzufügen
- `deductMoney(amount)` - Geld abziehen
- `addReputation(amount)` - Ruf erhöhen
- `deductReputation(amount)` - Ruf verringern
- `addTool(toolId)` - Tool zum Inventar
- `getActiveTools()` - Verfügbare Tools
- `calculateLevel()` - Level aus Experience berechnen

#### Spot Model
```javascript
{
  spotId: String (unique, UUID),
  location: {
    lat: Number,
    lng: Number,
    address: String,
    city: String,
    country: String
  },
  spotType: Enum ['wall', 'electrical_box', 'bridge', 'train', 'billboard'],
  riskFactor: Number (0.1-1.0),
  baseScoreValue: Number,
  currentGraffiti: ObjectId (ref: Graffiti),
  owningPlayerId: ObjectId (ref: Player),
  owningCrewId: ObjectId (ref: Crew),
  lastPainted: Date,
  paintCount: Number,
  isActive: Boolean,
  streetViewMetadata: {
    panoramaId, heading, pitch, zoom, imageUrl
  },
  discoveredBy: ObjectId (ref: Player),
  createdAt: Date
}
```

**Methoden**:
- `calculateRisk(hour)` - Zeitbasiertes Risiko
- `canBePainted()` - Prüft Verfügbarkeit
- `findNearby(lat, lng, radius)` - Spots in der Nähe (Static)

#### Graffiti Model
```javascript
{
  graffitiId: String (unique, UUID),
  spotId: ObjectId (ref: Spot),
  playerId: ObjectId (ref: Player),
  crewId: ObjectId (ref: Crew),
  title: String (max 100),
  description: String (max 500),
  backgroundImage: String (Street View),
  canvasData: { width, height, cropArea },
  strokes: [{
    strokeId, brushType, points: [{x,y}],
    color, strokeSize, opacity, timestamp
  }],
  finalImage: String (Base64),
  paintingSession: {
    startTime, endTime, duration,
    stealthEvents: [{ eventType, timestamp, impact }],
    wasInterrupted, escapedPolice
  },
  stats: { score, likes, views, complexity },
  tags: [String],
  isPublic: Boolean,
  isPainted: Boolean,
  createdAt: Date,
  completedAt: Date
}
```

**Methoden**:
- `calculateComplexity()` - Berechnet Komplexität
- `calculateScore(spot)` - Berechnet Punktzahl
- `addView()` - View Counter erhöhen
- `addLike()` - Like hinzufügen

---

## 🎮 API-Referenz

### Authentication

#### POST /api/auth/register
Registriert neuen Benutzer und erstellt Spieler-Profil.

**Request Body**:
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt.token.here",
  "user": { "id": "...", "username": "player123", "email": "..." },
  "player": { "id": "...", "money": 500, "reputation": 0, "level": 1 }
}
```

#### POST /api/auth/login
Authentifiziert Benutzer.

**Request Body**:
```json
{
  "email": "player@example.com",
  "password": "securePassword123"
}
```

---

### Player Management

#### GET /api/player/profile
Holt vollständiges Spieler-Profil.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "player": { /* vollständiges Player-Objekt */ }
}
```

#### POST /api/player/buy-tool
Kauft ein Tool.

**Request Body**:
```json
{
  "toolId": "fat_cap"
}
```

**Response**:
```json
{
  "success": true,
  "tool": { "toolId": "fat_cap", "durability": 100, "capacity": 100 },
  "remainingMoney": 485
}
```

---

### Spot Management

#### GET /api/spots/nearby
Findet Spots in der Nähe.

**Query Params**:
- `lat`: Breitengrad
- `lng`: Längengrad
- `radius`: Radius in km (default: 5)

**Response**:
```json
{
  "success": true,
  "count": 15,
  "spots": [{ /* Spot-Objekte */ }]
}
```

#### POST /api/spots/generate
Generiert neue Spots an einem Standort.

**Request Body**:
```json
{
  "lat": 52.5200,
  "lng": 13.4050,
  "count": 10
}
```

---

### Graffiti

#### POST /api/graffiti/start
Startet neue Mal-Session.

**Request Body**:
```json
{
  "spotId": "spot-uuid",
  "backgroundImage": "data:image/jpeg;base64,...",
  "canvasData": { "width": 1024, "height": 768 }
}
```

#### PUT /api/graffiti/:id/stroke
Fügt Brush-Stroke hinzu.

**Request Body**:
```json
{
  "stroke": {
    "strokeId": "uuid",
    "brushType": "spray_can",
    "points": [{"x": 100, "y": 200}, ...],
    "color": "#FF0000",
    "strokeSize": 10,
    "opacity": 1.0
  }
}
```

#### POST /api/graffiti/:id/complete
Schließt Graffiti ab.

**Request Body**:
```json
{
  "finalImage": "data:image/png;base64,...",
  "wasSuccessful": true,
  "escaped": false
}
```

---

### Game Logic

#### POST /api/game/arrest
Verarbeitet Spieler-Festnahme.

**Request Body**:
```json
{
  "spotId": "spot-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "fine": 150,
  "jailed": false,
  "remainingMoney": 350,
  "reputation": 450
}
```

#### POST /api/game/escape
Verarbeitet erfolgreiche Flucht.

**Response**:
```json
{
  "success": true,
  "reputation": 525
}
```

#### GET /api/game/constants
Holt alle Spiel-Konstanten.

---

## 🎯 Spiel-Mechaniken

### Stealth-System

#### Berechnungsformel
```javascript
drainRate = baseDrainRate * spotRiskFactor * timeFactor * eventModifiers
```

**Zeitfaktoren**:
- **Tag (6-18 Uhr)**: ×1.3 Risiko
- **Abend (19-21 Uhr)**: ×1.0 Risiko
- **Nacht (22-5 Uhr)**: ×0.7 Risiko

**Event-Modifikatoren**:
- Passant entdeckt: ×1.5 (15s)
- Auto fährt vorbei: ×1.2 (10s)
- Polizeistreife: ×2.0 (20s)
- Gute Deckung: ×0.7 (30s)
- Dunkelheit: ×0.5 (60s)

#### Look Around Mechanik
- **Verfügbar**: 3x pro Session
- **Cooldown**: 10 Sekunden
- **Effekt**: +50% Stealth
- **Chance**: 30% negative Events entfernen

### Polizei-System

#### Alarm-Trigger
1. Stealth erreicht 0%
2. 3+ übersehene Verkehrsteilnehmer

#### Quick-Time-Event
- **Zeit**: 10 Sekunden
- **Ziele**: 8 Taps
- **Erfolg**: +25 Reputation, Session fortsetzen
- **Misserfolg**: Arrest-Prozess

#### Strafen
```javascript
fine = baseFine(100) × spotRiskFactor × 1.5^(arrestCount-1)
```

**Gefängnis-Regeln**:
- 3 Arrests in 24h → 72 Stunden
- 5 Arrests in 48h → 168 Stunden (1 Woche)

### Wirtschaftssystem

#### Tools

| Tool | Kosten | Durability | Precision | Spray Width |
|------|--------|------------|-----------|-------------|
| Spray Can | $10 | 100 | 0.7 | 10px |
| Fat Cap | $15 | 100 | 0.5 | 20px |
| Skinny Cap | $15 | 100 | 0.95 | 3px |
| Marker | $5 | 100 | 0.9 | 5px |

#### Farben

| Farbe | Kosten | Hex |
|-------|--------|-----|
| Black | $5 | #000000 |
| White | $5 | #FFFFFF |
| Red | $8 | #FF0000 |
| Blue | $8 | #0000FF |
| Chrome | $20 | #C0C0C0 |
| Gold | $25 | #FFD700 |

#### Score-Berechnung
```javascript
score = complexity + (riskFactor × 100) + escapeBonus(200) + (duration/10)
```

#### Level-System
```javascript
level = floor(sqrt(experience / 100)) + 1
```

---

## 🚀 Deployment

### Backend Deployment (Heroku)

```bash
# Heroku CLI installieren und einloggen
heroku login

# App erstellen
heroku create cancontroll-backend

# MongoDB Atlas verwenden
# Füge MONGODB_URI als Config Var hinzu
heroku config:set MONGODB_URI="mongodb+srv://..."

# Andere Env Vars
heroku config:set JWT_SECRET="..."
heroku config:set GOOGLE_MAPS_API_KEY="..."

# Deployen
cd backend
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Vercel)

```bash
# Vercel CLI installieren
npm i -g vercel

# Deployen
vercel

# Production deployen
vercel --prod

# Env Vars in Vercel Dashboard setzen:
# VITE_API_URL=https://cancontroll-backend.herokuapp.com/api
# VITE_SOCKET_URL=https://cancontroll-backend.herokuapp.com
```

### Alternative: Docker

**Backend Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    env_file:
      - ./backend/.env
    depends_on:
      - mongodb

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
npm test
```

---

## 📝 Lizenz

MIT License

---

**Entwickelt mit ❤️ für die Urban Art Community**
