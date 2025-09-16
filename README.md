# Cashout Chess - Multiplayer Chess Game

A real-time multiplayer chess game built with Next.js, TypeScript, and Socket.io. Play chess with friends online in real-time!

## Features

- 🎮 **Real-time Multiplayer**: Play chess with friends in real-time using Socket.io
- 🏠 **Room System**: Create or join game rooms with unique room IDs
- ♟️ **Interactive Chess Board**: Beautiful, responsive chess board with piece movement
- 👥 **Player Management**: See who's playing and whose turn it is
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, modern interface built with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.io
- **Icons**: Lucide React
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cashout-chess
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

### How to Play

1. **Create a Game**:
   - Enter your name
   - Click "Create Room"
   - Share the room ID with a friend

2. **Join a Game**:
   - Enter your name and the room ID
   - Click "Join Room"

3. **Play Chess**:
   - Click on a piece to select it
   - Click on a valid square to move
   - Wait for your opponent's turn

## Project Structure

```
cashout-chess/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main game page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ChessBoard.tsx      # Chess board component
│   │   └── GameLobby.tsx       # Lobby component
│   └── types/
│       └── game.ts             # TypeScript type definitions
├── server.js                   # Socket.io server
├── package.json
└── README.md
```

## Game Features

### Room System
- Create rooms with unique IDs
- Join existing rooms
- Real-time player management
- Automatic room cleanup when empty

### Chess Board
- Interactive 8x8 chess board
- Visual piece representation with icons
- Move validation (basic implementation)
- Captured pieces display
- Turn indicator

### Real-time Updates
- Instant move synchronization
- Live player status updates
- Automatic turn switching
- Connection status monitoring

## Development

### Available Scripts

- `npm run dev` - Start development server with Socket.io
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Customization

The game uses a modular component structure, making it easy to customize:

- **Styling**: Modify Tailwind classes in components
- **Game Logic**: Extend the move validation in `server.js`
- **UI Components**: Update React components in `src/components/`
- **Types**: Modify TypeScript interfaces in `src/types/`

## Future Enhancements

- [ ] Full chess rule validation
- [ ] Game history and replay
- [ ] Chat system
- [ ] Spectator mode
- [ ] Tournament system
- [ ] User accounts and statistics
- [ ] Mobile app version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Enjoy playing Cashout Chess! 🎮♟️