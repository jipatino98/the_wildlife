import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { GOLDEN_GATE_PARK_BOUNDS } from "../data/wildlifeData";
import { WildlifeSpecies } from "../types/Wildlife";
import {
  wildlifeDataService,
  LoadingState,
} from "../services/wildlifeDataService";
import SpeciesModal from "./SpeciesModal";
import "leaflet/dist/leaflet.css";
import "./MapSection.css";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icons for different species types
const createCustomIcon = (type: string) => {
  const color = type === "animal" ? "#ff6b6b" : "#4ecdc4";
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: "custom-marker",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapSection: React.FC = () => {
  const [selectedSpecies, setSelectedSpecies] =
    useState<WildlifeSpecies | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [species, setSpecies] = useState<WildlifeSpecies[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
    isUsingFallback: false,
    lastUpdated: null,
  });

  console.log("Rendering MapSection with species:", species);

  useEffect(() => {
    const unsubscribe = wildlifeDataService.subscribe(setLoadingState);

    // Load initial species data
    loadSpeciesData();

    return unsubscribe;
  }, []);

  const loadSpeciesData = async () => {
    try {
      const allSpecies = await wildlifeDataService.getAllSpecies();
      console.log("Fetched species:", allSpecies); // 👈 log results here
      setSpecies(allSpecies);
    } catch (error) {
      console.error("Failed to load species data:", error);
    }
  };

  const handleMarkerClick = (species: WildlifeSpecies) => {
    setSelectedSpecies(species);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSpecies(null);
  };

  const handleRefresh = async () => {
    try {
      await wildlifeDataService.forceRefresh();
      await loadSpeciesData();
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  };

  return (
    <div className="map-section">
      <div className="map-controls">
        <div className="legend">
          <div className="legend-item">
            <div className="legend-marker animal"></div>
            <span>
              Animals ({species.filter((s) => s.type === "animal").length})
            </span>
          </div>
          <div className="legend-item">
            <div className="legend-marker plant"></div>
            <span>
              Plants ({species.filter((s) => s.type === "plant").length})
            </span>
          </div>
        </div>

        <div className="data-status">
          {loadingState.isLoading && (
            <div className="loading-indicator">
              <span className="loading-spinner">⟳</span>
              Loading species data...
            </div>
          )}

          {loadingState.error && (
            <div className="error-indicator">
              <span className="error-icon">⚠</span>
              <span>
                {loadingState.isUsingFallback
                  ? "Using offline data"
                  : "iNaturalist API failed"}
              </span>
              <button className="refresh-button" onClick={handleRefresh}>
                Retry
              </button>
            </div>
          )}

          {!loadingState.isLoading && !loadingState.error && (
            <div className="success-indicator">
              <span className="success-icon">✓</span>
              <span>{species.length} species loaded</span>
              {loadingState.lastUpdated && (
                <span className="last-updated">
                  (Updated: {loadingState.lastUpdated.toLocaleTimeString()})
                </span>
              )}
            </div>
          )}

          <div className="data-source">
            {wildlifeDataService.getDataStats().isUsingAPI ? (
              <small>📱 Live data from iNaturalist community observations</small>
            ) : (
              <small>🏛️ Using local species database</small>
            )}
          </div>
        </div>
      </div>

      <MapContainer
        center={GOLDEN_GATE_PARK_BOUNDS.center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        bounds={GOLDEN_GATE_PARK_BOUNDS.bounds}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {species.map((speciesItem) => (
          <Marker
            key={speciesItem.id}
            position={[speciesItem.location.lat, speciesItem.location.lng]}
            icon={createCustomIcon(speciesItem.type)}
            eventHandlers={{
              click: () => handleMarkerClick(speciesItem),
            }}
          >
            <Popup>
              <div className="popup-content">
                <h3>{speciesItem.name}</h3>
                <p>
                  <em>{speciesItem.scientificName}</em>
                </p>
                <p>📍 {speciesItem.location.area}</p>
                {speciesItem.id.startsWith('inat-') && (
                  <p>
                    <small>🌍 Community observation</small>
                  </p>
                )}
                <button
                  className="popup-button"
                  onClick={() => handleMarkerClick(speciesItem)}
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
