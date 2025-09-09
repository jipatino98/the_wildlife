# Changelog

All notable changes to the Golden Gate Park Wildlife Discovery project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **README.md**: Completely replaced boilerplate Create React App README with comprehensive project documentation
  - Added detailed project overview and feature descriptions
  - Included clear installation and setup instructions
  - Added project structure documentation and wildlife data information
  - Included map coverage details and contributing guidelines
  - Replaced generic CRA content with project-specific information

## [0.3.0] - 2025-09-09

### Added
- **OpenAI Integration**: Full integration with OpenAI's GPT-3.5-turbo for AI-powered wildlife responses
  - Express server backend with OpenAI API endpoints (`/api/chat` and `/api/health`)
  - Smart fallback system - automatically uses local responses if OpenAI API is unavailable
  - Environment configuration with `.env` support for API keys
  - AI toggle in chatbot interface - users can switch between AI and local responses
  - Contextual AI responses that include current species data and seasonal information

- **Enhanced Species Modal Navigation**: Multi-species navigation system for detailed exploration
  - Navigation arrows (← →) for browsing through multiple species in single modal session
  - Species counter display ("X of Y species") showing current position
  - Seamless navigation between species without closing modal
  - Mobile-responsive navigation controls with touch-friendly design

- **Smart "More Info" Button System**: Post-AI response interaction enhancement
  - Automatic species detection in AI responses using intelligent text analysis
  - Dynamic "More Info" buttons appear after AI responses mention wildlife
  - One-click access to detailed species information and map integration
  - Support for single species ("Learn more about Coyotes") and multiple species ("Learn more about 4 species")

- **Comprehensive Species Image System**: Professional wildlife photography integration
  - Added high-quality images for all species with proper attribution
  - Coyote, California Poppy, Red-tailed Hawk, Coast Live Oak, California Scrub Jay images
  - Unsplash integration with proper photo credits and licensing
  - Moved images to public directory for optimal web serving

### Changed
- **Enhanced Chatbot Interface**: Modernized user experience with AI capabilities
  - Updated welcome message to reflect AI-powered capabilities
  - Added loading states and typing indicators during AI processing
  - Improved error handling with graceful degradation to local responses
  - Better visual feedback for user interactions

- **Improved Modal System**: Context-aware navigation and species management
  - Modal now handles both single species and arrays of species
  - Enhanced state management with navigation tracking
  - Better integration between chatbot queries and species exploration

- **Package Dependencies**: Added backend and AI capabilities
  - Express server framework and CORS middleware
  - OpenAI SDK for GPT integration
  - Environment variable management with dotenv
  - Concurrently for running multiple development servers
  - TypeScript types for all new dependencies

### Fixed
- **Species Image Rendering**: Corrected image paths and accessibility
  - Fixed Red-tailed Hawk image path from relative to absolute URL
  - Moved all species images to proper public/images directory
  - Updated image attribution system for proper credit display

### Technical Improvements
- **Backend Architecture**: Full-stack application with Express server
  - RESTful API endpoints for chat completion and health monitoring
  - Specialized system prompts for Golden Gate Park wildlife expertise
  - Rate limiting awareness and API error handling
  - Development workflow with concurrent frontend/backend servers

- **Advanced State Management**: Multi-species modal navigation system
  - Enhanced MapContext with navigation methods and species tracking
  - Modal state management for complex multi-species interactions
  - Improved component communication and data flow

- **Developer Experience**: Enhanced development setup and documentation
  - Comprehensive setup guide in README-OpenAI-Setup.md
  - Environment template with .env.example
  - Updated npm scripts for development workflow (npm run dev)
  - Git configuration to properly handle environment files

## [0.2.0] - 2025-09-09

### Added
- Dynamic wildlife pin system with initial 10 seasonal species displayed on map load
- Map context system for managing displayed species and modal state across components
- Coordinate validation and automatic fixing for species outside Golden Gate Park boundaries
- Random coordinate generation for iNaturalist species with invalid locations
- Enhanced chatbot integration with map pin addition functionality
- Species modal auto-opening when single species is queried

### Changed
- Map now starts with 10 pins based on seasonal availability instead of showing all species
- Species pins are dynamically added/managed through chatbot queries
- Improved state management with React Context API for map and species data
- Enhanced error handling for infinite re-render prevention in useEffect hooks
- Better separation of concerns between map display and species management

### Fixed
- Species with coordinates outside Golden Gate Park boundaries now appear within park limits
- Infinite re-render bug in MapSection useEffect dependencies
- iNaturalist species coordinates automatically relocated to random park locations
- Improved component stability with useCallback for context functions

### Technical Improvements
- Added MapContext for centralized state management of displayed species
- Implemented coordinate bounds checking utilities
- Enhanced wildlife data service integration with dynamic species loading
- Improved React component lifecycle management with proper cleanup

## [0.1.0] - 2025-09-09

### Added
- Initial implementation of Golden Gate Park Wildlife Discovery React application
- Interactive map component using React Leaflet with OpenStreetMap tiles
- AI chatbot interface for wildlife species queries and recommendations
- Species modal with detailed information, photos, and conservation status
- Wildlife data system with 6 initial species (3 animals, 3 plants)
  - Animals: Coyotes, Red-tailed Hawks, California Scrub Jays
  - Plants: California Poppies, Coast Live Oak, Douglas Iris
- Responsive design with 50/50 split layout (map top, chatbot bottom)
- Custom map markers with color coding (red for animals, teal for plants)
- Seasonal availability system for species recommendations
- GPS coordinate system within Golden Gate Park boundaries
- TypeScript support with proper type definitions
- Development tooling and scripts
- Project documentation and guidelines in CLAUDE.md

### Technical Details
- React 18+ with TypeScript
- React Leaflet for interactive mapping
- CSS custom properties for consistent theming
- Mobile-first responsive design approach
- Component-based architecture with separation of concerns

### Dependencies Added
- leaflet ^1.9.4
- react-leaflet ^4.2.1
- @types/leaflet ^1.9.8

### Project Structure
```
src/
├── components/     # React components (MapSection, ChatbotSection, SpeciesModal)
├── data/          # Wildlife species data and constants
├── types/         # TypeScript interfaces
public/
└── images/        # Wildlife photos and placeholder images
```

## Guidelines for Future Updates

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major feature overhauls
- **Minor (0.X.0)**: New features, significant enhancements
- **Patch (0.0.X)**: Bug fixes, minor improvements, documentation updates

### Categories
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

### Examples for Future Entries
```markdown
## [0.2.0] - YYYY-MM-DD
### Added
- New bird species: Golden Gate Bridge Hawks
- Audio recordings for bird calls
- User favorites system

### Changed
- Improved chatbot responses with more detailed information
- Updated map markers with custom icons

### Fixed
- Species modal not closing on mobile devices
- Map performance issues with large datasets
```