# AI Fantasy Draft Assistant

An intelligent real-time fantasy football draft assistant that integrates with Sleeper's platform to provide AI-powered recommendations during live drafts.

## Features

- 🤖 Multi-agent AI system for comprehensive player analysis
- 🔄 Real-time integration with Sleeper drafts
- 💬 Conversational AI recommendations via Claude API
- 🌙 Beautiful dark mode UI with responsive design
- ⚡ Live draft synchronization with WebSocket connections

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Redux Toolkit for state management
- Socket.io client for real-time updates

### Backend
- Node.js with Express
- TypeScript
- Supabase for database
- Socket.io for WebSocket connections
- Claude API for AI analysis

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Claude API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-fantasy-draft-assistant.git
cd ai-fantasy-draft-assistant
```

2. Install dependencies:
```bash
npm install
npm run install:all
```

3. Set up environment variables:

Backend (.env in /backend):
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
CLAUDE_API_KEY=your_claude_api_key
```

4. Run the development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:5173

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── utils/        # Utility functions
│   │   └── index.ts      # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   ├── hooks/        # Custom hooks
│   │   └── App.tsx       # Main app component
│   └── package.json
└── package.json          # Root package.json
```

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Database Setup

The application uses Supabase. Create the following tables in your Supabase project:

1. `users` - User profiles and preferences
2. `draft_history` - Historical draft data
3. `analysis_cache` - Cached AI analysis results

See the design document for detailed schema information.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.