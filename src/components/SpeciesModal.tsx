import React from 'react';
import { WildlifeSpecies } from '../types/Wildlife';
import './SpeciesModal.css';

interface SpeciesModalProps {
  species: WildlifeSpecies;
  isOpen: boolean;
  onClose: () => void;
}

const SpeciesModal: React.FC<SpeciesModalProps> = ({ species, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getMonthNames = (months: number[]) => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months.map(m => monthNames[m - 1]).join(', ');
  };

  const getSeasonalityColor = (availability: string) => {
    return availability === 'year-round' ? '#4ecdc4' : '#ff6b6b';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="species-type-badge" data-type={species.type}>
            {species.type}
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="species-image">
            <img 
              src={species.image} 
              alt={species.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/placeholder-wildlife.jpg';
              }}
            />
          </div>
          
          <div className="species-info">
            <h2>{species.name}</h2>
            <p className="scientific-name">{species.scientificName}</p>
            <p className="category">{species.category}</p>
            
            <div className="description">
              <p>{species.description}</p>
            </div>
            
            <div className="details-grid">
              <div className="detail-item">
                <h3>Location</h3>
                <p>{species.location.area}</p>
              </div>
              
              <div className="detail-item">
                <h3>Habitat</h3>
                <p>{species.habitat}</p>
              </div>
              
              <div className="detail-item">
                <h3>Conservation Status</h3>
                <p>{species.conservationStatus}</p>
              </div>
              
              <div className="detail-item">
                <h3>Best Viewing Months</h3>
                <p>{getMonthNames(species.seasonality.bestMonths)}</p>
              </div>
              
              <div className="detail-item">
                <h3>Availability</h3>
                <span 
                  className="availability-badge"
                  style={{ backgroundColor: getSeasonalityColor(species.seasonality.availability) }}
                >
                  {species.seasonality.availability}
                </span>
              </div>
              
              <div className="detail-item">
                <h3>Best Time to Visit</h3>
                <p>{species.seasonality.peakTime}</p>
              </div>
            </div>
            
            <div className="behavior-section">
              <h3>Seasonal Behavior</h3>
              <p>{species.seasonality.behavior}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeciesModal;