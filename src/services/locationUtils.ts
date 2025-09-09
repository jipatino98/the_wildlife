import { Location } from '../types/Wildlife';

// Golden Gate Park specific areas and their coordinates
export interface ParkArea {
  name: string;
  description: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    lat: number;
    lng: number;
  };
  habitat: string[];
  accessibility: 'easy' | 'moderate' | 'difficult';
  bestTimes: string[];
}

export const GOLDEN_GATE_PARK_AREAS: Record<string, ParkArea> = {
  'hippie-hill': {
    name: 'Hippie Hill',
    description: 'Open meadow area perfect for picnics and wildlife observation',
    bounds: {
      north: 37.7695,
      south: 37.7688,
      east: -122.4575,
      west: -122.4590
    },
    center: { lat: 37.7691, lng: -122.4583 },
    habitat: ['grassland', 'meadow', 'scattered trees'],
    accessibility: 'easy',
    bestTimes: ['morning', 'late afternoon']
  },
  'japanese-tea-garden': {
    name: 'Japanese Tea Garden Area',
    description: 'Cultivated gardens with diverse plant species and bird activity',
    bounds: {
      north: 37.7705,
      south: 37.7695,
      east: -122.4605,
      west: -122.4620
    },
    center: { lat: 37.7698, lng: -122.4612 },
    habitat: ['cultivated garden', 'water features', 'ornamental trees'],
    accessibility: 'easy',
    bestTimes: ['morning', 'afternoon']
  },
  'eucalyptus-grove': {
    name: 'Eucalyptus Grove',
    description: 'Dense eucalyptus forest area popular with birds and small mammals',
    bounds: {
      north: 37.7720,
      south: 37.7710,
      east: -122.4680,
      west: -122.4700
    },
    center: { lat: 37.7715, lng: -122.4690 },
    habitat: ['eucalyptus forest', 'dense canopy', 'understory'],
    accessibility: 'moderate',
    bestTimes: ['dawn', 'dusk']
  },
  'beach-chalet': {
    name: 'Beach Chalet Area',
    description: 'Western edge of park near ocean, good for coastal species',
    bounds: {
      north: 37.7710,
      south: 37.7695,
      east: -122.4740,
      west: -122.4760
    },
    center: { lat: 37.7703, lng: -122.4751 },
    habitat: ['coastal grassland', 'dunes', 'windswept areas'],
    accessibility: 'easy',
    bestTimes: ['morning', 'late afternoon']
  },
  'panhandle': {
    name: 'Panhandle',
    description: 'Narrow strip of park extending eastward, urban wildlife corridor',
    bounds: {
      north: 37.7697,
      south: 37.7690,
      east: -122.4440,
      west: -122.4570
    },
    center: { lat: 37.7694, lng: -122.4505 },
    habitat: ['urban parkland', 'tree-lined paths', 'small clearings'],
    accessibility: 'easy',
    bestTimes: ['morning', 'evening']
  },
  'native-plant-area': {
    name: 'Native Plant Areas',
    description: 'Restored native plant habitats throughout the park',
    bounds: {
      north: 37.7690,
      south: 37.7675,
      east: -122.4690,
      west: -122.4715
    },
    center: { lat: 37.7681, lng: -122.4702 },
    habitat: ['native grassland', 'coastal scrub', 'wildflower areas'],
    accessibility: 'moderate',
    bestTimes: ['spring mornings', 'late afternoon']
  },
  'oak-woodlands': {
    name: 'Oak Woodlands',
    description: 'Areas dominated by native oak trees, rich in wildlife',
    bounds: {
      north: 37.7695,
      south: 37.7680,
      east: -122.4635,
      west: -122.4655
    },
    center: { lat: 37.7685, lng: -122.4645 },
    habitat: ['oak woodland', 'mixed forest', 'understory shrubs'],
    accessibility: 'easy',
    bestTimes: ['morning', 'afternoon']
  }
};

// Park boundary constants
export const GOLDEN_GATE_PARK_BOUNDS = {
  center: { lat: 37.7694, lng: -122.4862 },
  bounds: [
    [37.7665, -122.5103], // Southwest
    [37.7741, -122.4540]  // Northeast
  ] as [[number, number], [number, number]],
  // More precise boundary polygon
  polygon: [
    { lat: 37.7741, lng: -122.4540 }, // Northeast corner
    { lat: 37.7741, lng: -122.5103 }, // Northwest corner
    { lat: 37.7665, lng: -122.5103 }, // Southwest corner
    { lat: 37.7665, lng: -122.4540 }, // Southeast corner
  ]
};

export class LocationUtils {
  /**
   * Check if coordinates are within Golden Gate Park bounds
   */
  static isWithinPark(lat: number, lng: number): boolean {
    const [[swLat, swLng], [neLat, neLng]] = GOLDEN_GATE_PARK_BOUNDS.bounds;
    return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
  }

  /**
   * Calculate distance between two points in kilometers
   */
  static calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Find the nearest park area to given coordinates
   */
  static findNearestArea(lat: number, lng: number): ParkArea | null {
    let nearestArea: ParkArea | null = null;
    let minDistance = Infinity;

    for (const area of Object.values(GOLDEN_GATE_PARK_AREAS)) {
      const distance = this.calculateDistance(
        lat, lng,
        area.center.lat, area.center.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestArea = area;
      }
    }

    return minDistance <= 0.5 ? nearestArea : null; // Within 500m
  }

  /**
   * Check if coordinates are within a specific park area
   */
  static isWithinArea(lat: number, lng: number, areaKey: string): boolean {
    const area = GOLDEN_GATE_PARK_AREAS[areaKey];
    if (!area) return false;

    const { bounds } = area;
    return lat >= bounds.south && lat <= bounds.north &&
           lng >= bounds.west && lng <= bounds.east;
  }

  /**
   * Get all areas that contain the given coordinates
   */
  static getContainingAreas(lat: number, lng: number): ParkArea[] {
    return Object.values(GOLDEN_GATE_PARK_AREAS).filter(area =>
      this.isWithinArea(lat, lng, Object.keys(GOLDEN_GATE_PARK_AREAS).find(
        key => GOLDEN_GATE_PARK_AREAS[key] === area
      )!)
    );
  }

  /**
   * Enhance a location with park-specific information
   */
  static enhanceLocation(location: Location): Location & {
    parkArea?: ParkArea;
    withinPark: boolean;
    distanceFromCenter: number;
  } {
    const withinPark = this.isWithinPark(location.lat, location.lng);
    const parkArea = this.findNearestArea(location.lat, location.lng);
    const distanceFromCenter = this.calculateDistance(
      location.lat, location.lng,
      GOLDEN_GATE_PARK_BOUNDS.center.lat,
      GOLDEN_GATE_PARK_BOUNDS.center.lng
    );

    return {
      ...location,
      parkArea: parkArea || undefined,
      withinPark,
      distanceFromCenter
    };
  }

  /**
   * Get suitable areas for a species based on habitat preferences
   */
  static getSuitableAreas(habitatTypes: string[]): ParkArea[] {
    return Object.values(GOLDEN_GATE_PARK_AREAS).filter(area =>
      area.habitat.some(habitat =>
        habitatTypes.some(type =>
          habitat.toLowerCase().includes(type.toLowerCase()) ||
          type.toLowerCase().includes(habitat.toLowerCase())
        )
      )
    );
  }

  /**
   * Generate a random location within a specific park area
   */
  static getRandomLocationInArea(areaKey: string): Location | null {
    const area = GOLDEN_GATE_PARK_AREAS[areaKey];
    if (!area) return null;

    const { bounds } = area;
    const lat = bounds.south + Math.random() * (bounds.north - bounds.south);
    const lng = bounds.west + Math.random() * (bounds.east - bounds.west);

    return {
      lat,
      lng,
      area: area.name
    };
  }

  /**
   * Get areas that are best to visit at a specific time
   */
  static getAreasByTime(timeOfDay: string): ParkArea[] {
    return Object.values(GOLDEN_GATE_PARK_AREAS).filter(area =>
      area.bestTimes.some(time =>
        time.toLowerCase().includes(timeOfDay.toLowerCase()) ||
        timeOfDay.toLowerCase().includes(time.toLowerCase())
      )
    );
  }

  /**
   * Get areas by accessibility level
   */
  static getAreasByAccessibility(level: 'easy' | 'moderate' | 'difficult'): ParkArea[] {
    return Object.values(GOLDEN_GATE_PARK_AREAS).filter(area =>
      area.accessibility === level
    );
  }

  /**
   * Generate optimized location suggestion for a species
   */
  static suggestOptimalLocation(
    speciesType: 'animal' | 'plant',
    category: string,
    preferredHabitat?: string
  ): Location {
    let suitableAreas: ParkArea[] = [];

    // Find areas based on species type and category
    if (speciesType === 'animal') {
      if (category === 'bird') {
        suitableAreas = [
          GOLDEN_GATE_PARK_AREAS['eucalyptus-grove'],
          GOLDEN_GATE_PARK_AREAS['oak-woodlands'],
          GOLDEN_GATE_PARK_AREAS['japanese-tea-garden']
        ];
      } else if (category === 'mammal') {
        suitableAreas = [
          GOLDEN_GATE_PARK_AREAS['beach-chalet'],
          GOLDEN_GATE_PARK_AREAS['eucalyptus-grove'],
          GOLDEN_GATE_PARK_AREAS['native-plant-area']
        ];
      }
    } else if (speciesType === 'plant') {
      if (category === 'flower') {
        suitableAreas = [
          GOLDEN_GATE_PARK_AREAS['hippie-hill'],
          GOLDEN_GATE_PARK_AREAS['native-plant-area']
        ];
      } else if (category === 'tree') {
        suitableAreas = [
          GOLDEN_GATE_PARK_AREAS['oak-woodlands'],
          GOLDEN_GATE_PARK_AREAS['eucalyptus-grove'],
          GOLDEN_GATE_PARK_AREAS['japanese-tea-garden']
        ];
      }
    }

    // If we have preferred habitat, filter further
    if (preferredHabitat && suitableAreas.length > 0) {
      const habitatFiltered = suitableAreas.filter(area =>
        area.habitat.some(h => h.toLowerCase().includes(preferredHabitat.toLowerCase()))
      );
      if (habitatFiltered.length > 0) {
        suitableAreas = habitatFiltered;
      }
    }

    // Default to a central location if no suitable areas found
    if (suitableAreas.length === 0) {
      return {
        lat: GOLDEN_GATE_PARK_BOUNDS.center.lat,
        lng: GOLDEN_GATE_PARK_BOUNDS.center.lng,
        area: 'Central Golden Gate Park'
      };
    }

    // Return a random suitable area
    const selectedArea = suitableAreas[Math.floor(Math.random() * suitableAreas.length)];
    return {
      lat: selectedArea.center.lat,
      lng: selectedArea.center.lng,
      area: selectedArea.name
    };
  }
}

export default LocationUtils;