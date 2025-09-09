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
import { useMap } from "../contexts/MapContext";
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
  const {
    displayedSpecies,
    selectedSpecies,
    isModalOpen,
    showSpeciesModal,
    hideSpeciesModal,
    setInitialSpecies,
  } = useMap();
  const [allSpecies, setAllSpecies] = useState<WildlifeSpecies[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null,
    isUsingFallback: false,
    lastUpdated: null,
  });

  console.log("Rendering MapSection with displayed species:", displayedSpecies);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = wildlifeDataService.subscribe(setLoadingState);

    const loadInitialSpecies = async (allSpecies: WildlifeSpecies[]) => {
      if (!isMounted) return;
      
      try {
        // Get seasonal species first, then fall back to featured species
        let initialSpecies: WildlifeSpecies[] = [];

        try {
          const seasonalSpecies =
            await wildlifeDataService.getSeasonalSpecies();
          initialSpecies = seasonalSpecies.slice(0, 10);
        } catch (error) {
          console.warn(
            "Failed to get seasonal species, using featured species:",
            error
          );
        }

        // If we don't have enough seasonal species, fill with featured species
        if (initialSpecies.length < 10) {
          try {
            const featuredSpecies =
              await wildlifeDataService.getFeaturedSpecies(
                10 - initialSpecies.length
              );
            // Add featured species that aren't already in the initial list
            const existingIds = new Set(initialSpecies.map((s) => s.id));
            const additionalSpecies = featuredSpecies.filter(
              (s) => !existingIds.has(s.id)
            );
            initialSpecies = [...initialSpecies, ...additionalSpecies].slice(
              0,
              10
            );
          } catch (error) {
            console.warn("Failed to get featured species:", error);
          }
        }

        // Final fallback: use first 10 from all species
        if (initialSpecies.length < 10) {
          const existingIds = new Set(initialSpecies.map((s) => s.id));
          const remainingSpecies = allSpecies
            .filter((s) => !existingIds.has(s.id))
            .slice(0, 10 - initialSpecies.length);
          initialSpecies = [...initialSpecies, ...remainingSpecies].slice(
            0,
            10
          );
        }

        console.log("Loading initial species:", initialSpecies);
        
        if (isMounted) {
          setInitialSpecies(initialSpecies);
        }
      } catch (error) {
        console.error("Failed to load initial species:", error);
      }
    };

    const loadSpeciesData = async () => {
      if (!isMounted) return;
      
      try {
        const allSpecies = await wildlifeDataService.getAllSpecies();
        console.log("Fetched species:", allSpecies);
        if (isMounted) {
          setAllSpecies(allSpecies);
          // Load initial 10 species based on seasonality
          await loadInitialSpecies(allSpecies);
        }
      } catch (error) {
        console.error("Failed to load species data:", error);
      }
    };

    // Load initial species data
    loadSpeciesData();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); // Empty dependency array - this should only run once

  const handleMarkerClick = (species: WildlifeSpecies) => {
    showSpeciesModal(species);
  };

  const handleRefresh = async () => {
    try {
      await wildlifeDataService.forceRefresh();
      // Trigger a page reload to refresh all data
      window.location.reload();
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
              Animals (
              {displayedSpecies.filter((s) => s.type === "animal").length})
            </span>
          </div>
          <div className="legend-item">
            <div className="legend-marker plant"></div>
            <span>
              Plants (
              {displayedSpecies.filter((s) => s.type === "plant").length})
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
              <span>{allSpecies.length} species available</span>
              {loadingState.lastUpdated && (
                <span className="last-updated">
                  (Updated: {loadingState.lastUpdated.toLocaleTimeString()})
                </span>
              )}
            </div>
          )}

          <div className="data-source">
            {wildlifeDataService.getDataStats().isUsingAPI ? (
              <small>
                📱 Live data from iNaturalist community observations
              </small>
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

        {displayedSpecies.map((speciesItem) => (
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
                {speciesItem.id.startsWith("inat-") && (
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
          onClose={hideSpeciesModal}
        />
      )}
    </div>
  );
};

export default MapSection;
