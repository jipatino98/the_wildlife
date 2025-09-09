# Changelog

All notable changes to the Golden Gate Park Wildlife Discovery project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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