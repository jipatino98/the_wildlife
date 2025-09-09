import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WildlifeSpecies } from '../types/Wildlife';
import { GOLDEN_GATE_PARK_BOUNDS } from '../data/wildlifeData';

// Utility functions for coordinate fixing
const isWithinParkBounds = (lat: number, lng: number): boolean => {
  const { bounds } = GOLDEN_GATE_PARK_BOUNDS;
  const [[swLat, swLng], [neLat, neLng]] = bounds;
  return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
};

const generateRandomParkCoordinates = (): { lat: number; lng: number } => {
  const { bounds } = GOLDEN_GATE_PARK_BOUNDS;
  const [[swLat, swLng], [neLat, neLng]] = bounds;
  
  const lat = swLat + Math.random() * (neLat - swLat);
  const lng = swLng + Math.random() * (neLng - swLng);
  
  return { lat, lng };
};

const fixSpeciesCoordinates = (species: WildlifeSpecies): WildlifeSpecies => {
  const { lat, lng } = species.location;
  
  if (!isWithinParkBounds(lat, lng)) {
    const newCoordinates = generateRandomParkCoordinates();
    console.log(`Fixed coordinates for ${species.name}: ${lat}, ${lng} -> ${newCoordinates.lat}, ${newCoordinates.lng}`);
    
    return {
      ...species,
      location: {
        ...species.location,
        lat: newCoordinates.lat,
        lng: newCoordinates.lng,
      }
    };
  }
  
  return species;
};

interface MapContextType {
  displayedSpecies: WildlifeSpecies[];
  selectedSpecies: WildlifeSpecies | null;
  isModalOpen: boolean;
  addSpeciesToMap: (species: WildlifeSpecies) => void;
  setInitialSpecies: (species: WildlifeSpecies[]) => void;
  clearMapSpecies: () => void;
  showSpeciesModal: (species: WildlifeSpecies) => void;
  hideSpeciesModal: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

interface MapProviderProps {
  children: ReactNode;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [displayedSpecies, setDisplayedSpecies] = useState<WildlifeSpecies[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<WildlifeSpecies | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const addSpeciesToMap = useCallback((species: WildlifeSpecies) => {
    const fixedSpecies = fixSpeciesCoordinates(species);
    setDisplayedSpecies(prev => {
      const exists = prev.find(s => s.id === species.id);
      if (exists) {
        return prev;
      }
      return [...prev, fixedSpecies];
    });
  }, []);

  const setInitialSpecies = useCallback((species: WildlifeSpecies[]) => {
    const fixedSpecies = species.map(fixSpeciesCoordinates);
    setDisplayedSpecies(fixedSpecies);
  }, []);

  const clearMapSpecies = useCallback(() => {
    setDisplayedSpecies([]);
  }, []);

  const showSpeciesModal = useCallback((species: WildlifeSpecies) => {
    setSelectedSpecies(species);
    setIsModalOpen(true);
  }, []);

  const hideSpeciesModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedSpecies(null);
  }, []);

  return (
    <MapContext.Provider
      value={{
        displayedSpecies,
        selectedSpecies,
        isModalOpen,
        addSpeciesToMap,
        setInitialSpecies,
        clearMapSpecies,
        showSpeciesModal,
        hideSpeciesModal,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};