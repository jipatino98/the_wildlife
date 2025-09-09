export interface Location {
  lat: number;
  lng: number;
  area: string;
}

export interface Seasonality {
  bestMonths: number[];
  availability: 'year-round' | 'seasonal';
  peakTime: string;
  behavior: string;
}

export interface WildlifeSpecies {
  id: string;
  name: string;
  scientificName: string;
  type: 'animal' | 'plant';
  category: string;
  description: string;
  image: string;
  location: Location;
  seasonality: Seasonality;
  habitat: string;
  conservationStatus: string;
}

export type SpeciesType = 'all' | 'animal' | 'plant';
export type SpeciesCategory = 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'tree' | 'flower' | 'shrub';