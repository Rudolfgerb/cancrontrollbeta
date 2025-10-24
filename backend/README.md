# Can Controll - Backend Server

Backend server for Can Controll Urban Graffiti Simulator

## Features

- **Authentication System**: JWT-based user authentication
- **Player Management**: Profile, inventory, stats tracking
- **Google Street View Integration**: Fetch and process Street View imagery
- **Spot System**: Dynamic spot generation and management
- **Graffiti Creation**: Canvas-based graffiti painting with stroke tracking
- **Stealth System**: Real-time risk calculation and event generation
- **Police & Jail System**: Arrest processing and jail time management
- **Game Economy**: Tool and color purchasing system
- **WebSocket Support**: Real-time game updates

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.IO
- **External APIs**: Google Maps API, Google Street View API

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

3. Start MongoDB:
```bash
# Make sure MongoDB is running locally or use MongoDB Atlas
```

4. Run the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Player
- `GET /api/player/profile` - Get player profile
- `GET /api/player/inventory` - Get player inventory
- `POST /api/player/buy-tool` - Purchase a tool
- `POST /api/player/buy-color` - Purchase paint colors
- `GET /api/player/stats` - Get player statistics

### Spots
- `GET /api/spots/nearby` - Get spots near location
- `POST /api/spots/generate` - Generate new spots
- `GET /api/spots/:id` - Get spot details
- `GET /api/spots/:id/streetview` - Get Street View image for spot

### Graffiti
- `POST /api/graffiti/start` - Start painting session
- `PUT /api/graffiti/:id/stroke` - Add brush stroke
- `POST /api/graffiti/:id/complete` - Complete graffiti
- `GET /api/graffiti/gallery` - Browse graffiti gallery

### Game
- `POST /api/game/risk-event` - Generate random risk event
- `POST /api/game/calculate-risk` - Calculate spot risk
- `POST /api/game/arrest` - Process arrest
- `POST /api/game/escape` - Process successful escape
- `GET /api/game/constants` - Get game constants

## WebSocket Events

### Client → Server
- `join-player-room` - Join player's personal room
- `start-painting` - Start painting session
- `stroke-update` - Send brush stroke update
- `stealth-update` - Send stealth level update
- `risk-event` - Report risk event
- `police-alert` - Trigger police alert

### Server → Client
- `painting-started` - Painting session initialized
- `stroke-added` - New stroke from other players
- `stealth-changed` - Stealth level changed
- `new-risk-event` - New risk event occurred
- `police-triggered` - Police response initiated

## Game Constants

### Stealth System
- Max Stealth: 100
- Default Drain Rate: 5% per second
- Look Around Restore: 50%
- Max Look Arounds: 3

### Spot Types
- **Wall**: Risk 0.3, Score 100
- **Electrical Box**: Risk 0.6, Score 150
- **Bridge**: Risk 0.8, Score 200
- **Train**: Risk 0.9, Score 300
- **Billboard**: Risk 0.95, Score 500

### Risk Events
- **Pedestrian Spotting**: ×1.5 risk for 15s
- **Car Passing**: ×1.2 risk for 10s
- **Police Patrol**: ×2.0 risk for 20s
- **Good Cover**: ×0.7 risk for 30s
- **Night Fall**: ×0.5 risk for 60s

### Police System
- QTE Time Limit: 10 seconds
- QTE Required Taps: 8
- Base Fine: $100
- Arrest Threshold: 3 arrests in 24h
- Base Jail Time: 72 hours

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── constants.js         # Game constants
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Player.js           # Player model
│   │   ├── Spot.js             # Spot model
│   │   └── Graffiti.js         # Graffiti model
│   ├── routes/
│   │   ├── auth.routes.js      # Auth endpoints
│   │   ├── player.routes.js    # Player endpoints
│   │   ├── spot.routes.js      # Spot endpoints
│   │   ├── graffiti.routes.js  # Graffiti endpoints
│   │   └── game.routes.js      # Game logic endpoints
│   ├── services/
│   │   ├── streetview.service.js  # Google Street View integration
│   │   └── game.service.js        # Game logic service
│   ├── middleware/
│   │   └── auth.middleware.js   # JWT authentication
│   └── server.js               # Main server file
├── .env                        # Environment variables
├── .env.example               # Example environment variables
├── package.json               # Dependencies
└── README.md                  # This file
```

## Development

### Running Tests
```bash
npm test
```

### Code Style
- ES6+ modules
- Async/await for asynchronous operations
- Mongoose for MongoDB operations
- Express middleware pattern

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS configuration
- Helmet.js security headers
- Input validation with Joi

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
