# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
The Wildlife is a React TypeScript application that allows users to explore animals and plants in Golden Gate Park through an interactive map and AI chatbot interface.

## Technology Stack
- **Frontend Framework**: React 18+ with TypeScript
- **Map Library**: React Leaflet with OpenStreetMap tiles
- **Chatbot**: React ChatBotify for AI-powered wildlife queries
- **Styling**: CSS Modules with responsive design
- **Build Tool**: Create React App (CRA)

## Common Commands

### Development
```bash
# Start development server
npm run start

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npx tsc --noEmit
```

### Development Server
The app runs on `http://localhost:3000` when started with `npm run start`. 
Alternative: Use `./start-dev.sh` if npm commands fail in shell.

## Project Architecture

### Core Components
- `App.tsx` - Main layout with header and two-section container
- `MapSection.tsx` - Interactive map with wildlife markers (top 50% of viewport)  
- `ChatbotSection.tsx` - AI chatbot interface (bottom 50% of viewport)
- `SpeciesModal.tsx` - Detailed species information modal
- `SpeciesModal.css` - Modal styling with animations

### Data Structure
Wildlife data is stored in `src/data/wildlifeData.ts` with the following schema:
- Species location coordinates for Golden Gate Park bounds
- Seasonal availability and behavior patterns  
- Categories: animals (mammals, birds, reptiles) and plants (trees, flowers, shrubs)
- Conservation status and habitat information

### Map Implementation
- Uses React Leaflet with OpenStreetMap tiles
- Custom colored markers: red for animals, teal for plants
- Golden Gate Park boundaries: SW [37.7665, -122.5103] to NE [37.7741, -122.4540]
- Center point: [37.7694, -122.4862]

### Chatbot Intelligence  
- Natural language processing for species queries
- Seasonal recommendations based on current month
- Location-specific advice for Golden Gate Park areas
- Integrated with species database for accurate responses

## File Structure
```
src/
├── components/          # React components
├── data/               # Wildlife species data and constants
├── types/              # TypeScript interfaces
├── services/           # API and utility services (future)
└── utils/              # Helper functions (future)

public/
└── images/             # Wildlife photos and placeholder images
```

## Styling Conventions
- CSS custom properties for consistent colors
- Mobile-first responsive design
- Green color palette (#2d5016, #4a7c59, #4ecdc4)
- Smooth animations and transitions
- Accessible design patterns

## Species Data Management
Species are defined in `wildlifeSpecies` array with:
- Unique IDs and scientific names
- GPS coordinates within park boundaries
- Monthly seasonality arrays (1-12 for Jan-Dec)
- Behavioral patterns and conservation status

Current species include: Coyotes, California Poppies, Red-tailed Hawks, Coast Live Oak, California Scrub Jays, and Douglas Iris.

## Development Notes
- Map markers use custom divIcon styling instead of default Leaflet markers
- Modal uses click-outside and ESC key handling
- Chatbot responses are generated based on current month and species availability
- All images have fallback placeholders for missing wildlife photos
