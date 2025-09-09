# The Wildlife

An interactive React TypeScript application that allows users to explore animals and plants in Golden Gate Park through an intuitive map interface and AI-powered chatbot.

## Project Overview

The Wildlife provides an immersive way to discover the diverse flora and fauna of Golden Gate Park. Users can explore wildlife through an interactive map with location-specific markers and get intelligent recommendations through an AI chatbot interface that provides seasonal advice and detailed species information.

## Features

- **Interactive Map**: Explore Golden Gate Park with custom markers for animals (red) and plants (teal)
- **AI Chatbot**: Get intelligent, seasonal recommendations and species information
- **Species Details**: View comprehensive information about local wildlife through detailed modals
- **Responsive Design**: Optimized for both desktop and mobile experiences
- **Seasonal Intelligence**: Get recommendations based on current month and species availability

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Map Library**: React Leaflet with OpenStreetMap tiles
- **Chatbot**: React ChatBotify for AI-powered interactions
- **Styling**: CSS Modules with responsive design
- **Build Tool**: Create React App (CRA)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd the_wildlife
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your browser at [http://localhost:3000](http://localhost:3000).

Alternative: If npm commands fail, you can use:
```bash
./start-dev.sh
```

### Available Commands

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run typecheck` - Run TypeScript type checking (use: `npx tsc --noEmit`)

## Project Structure

```
src/
├── components/          # React components
│   ├── App.tsx         # Main layout component
│   ├── MapSection.tsx  # Interactive map component
│   ├── ChatbotSection.tsx # AI chatbot interface
│   └── SpeciesModal.tsx   # Species detail modal
├── data/               # Wildlife species data and constants
├── types/              # TypeScript interfaces
├── services/           # API and utility services
└── utils/              # Helper functions

public/
├── images/             # Wildlife photos and assets
└── index.html
```

## Wildlife Data

The application includes data for various species in Golden Gate Park:

**Animals**: Coyotes, Red-tailed Hawks, California Scrub Jays
**Plants**: California Poppies, Coast Live Oak, Douglas Iris

Each species includes:
- GPS coordinates within park boundaries
- Seasonal availability patterns
- Behavioral information
- Conservation status
- High-quality photographs

## Map Coverage

The application focuses on Golden Gate Park with the following boundaries:
- **Southwest**: 37.7665, -122.5103
- **Northeast**: 37.7741, -122.4540
- **Center Point**: 37.7694, -122.4862

## Contributing

This project follows React and TypeScript best practices. When contributing:

- Use the existing component patterns and styling conventions
- Follow the mobile-first responsive design approach
- Maintain the green color palette theme
- Ensure accessibility standards are met

## License

[Add your license information here]
