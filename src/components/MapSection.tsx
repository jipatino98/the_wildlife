import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { wildlifeSpecies, GOLDEN_GATE_PARK_BOUNDS } from '../data/wildlifeData';
import { WildlifeSpecies } from '../types/Wildlife';
import SpeciesModal from './SpeciesModal';
import 'leaflet/dist/leaflet.css';
import './MapSection.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons for different species types
const createCustomIcon = (type: string) => {
  const color = type === 'animal' ? '#ff6b6b' : '#4ecdc4';
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapSection: React.FC = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<WildlifeSpecies | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMarkerClick = (species: WildlifeSpecies) => {
    setSelectedSpecies(species);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSpecies(null);
  };

  return (
    <div className="map-section">
      <div className="map-controls">
        <div className="legend">
          <div className="legend-item">
            <div className="legend-marker animal"></div>
            <span>Animals</span>
          </div>
          <div className="legend-item">
            <div className="legend-marker plant"></div>
            <span>Plants</span>
          </div>
        </div>
      </div>
      
      <MapContainer
        center={GOLDEN_GATE_PARK_BOUNDS.center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        bounds={GOLDEN_GATE_PARK_BOUNDS.bounds}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {wildlifeSpecies.map((species) => (
          <Marker
            key={species.id}
            position={[species.location.lat, species.location.lng]}
            icon={createCustomIcon(species.type)}
            eventHandlers={{
              click: () => handleMarkerClick(species),
            }}
          >
            <Popup>
              <div className="popup-content">
                <h3>{species.name}</h3>
                <p><em>{species.scientificName}</em></p>
                <p>{species.location.area}</p>
                <button 
                  className="popup-button"
                  onClick={() => handleMarkerClick(species)}
                >
                  Learn More
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedSpecies && (
        <SpeciesModal
          species={selectedSpecies}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default MapSection;