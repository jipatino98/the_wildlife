export interface Location {
  lat: number;
  lng: number;
  area: string;
}

export interface Seasonality {
  bestMonths: number[];
  availability: "year-round" | "seasonal";
  peakTime: string;
  behavior: string;
}

export interface PhotoAttribution {
  url: string;
  attribution?: string;
  license?: string;
  source: "iNaturalist" | "local" | "placeholder" | "unsplash.com";
}

export interface WildlifeSpecies {
  id: string;
  name: string;
  scientificName: string;
  type: "animal" | "plant";
  category: string;
  description: string;
  image: string;
  imageAttribution?: PhotoAttribution;
  location: Location;
  seasonality: Seasonality;
  habitat: string;
  conservationStatus: string;
}

export type SpeciesType = "all" | "animal" | "plant";
export type SpeciesCategory =
  | "mammal"
  | "bird"
  | "reptile"
  | "amphibian"
  | "tree"
  | "flower"
  | "shrub";
