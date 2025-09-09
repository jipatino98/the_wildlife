import {
  WildlifeSpecies,
  Location,
  Seasonality,
  PhotoAttribution,
} from "../types/Wildlife";
import { LocationUtils } from "./locationUtils";

// Golden Gate Park's iNaturalist place_id
const GOLDEN_GATE_PARK_ID = 120753;
const BASE_URL = "https://api.inaturalist.org/v1/observations";

// iNaturalist API interfaces
export interface iNatObservation {
  id: number;
  observed_on: string;
  time_observed_at: string;
  location: [number, number]; // [lat, lng]
  taxon: {
    id: number;
    name: string;
    preferred_common_name?: string;
    iconic_taxon_name: string;
    rank: string;
    ancestry?: string;
    wikipedia_url?: string;
    conservation_status?: {
      status_name: string;
    };
    default_photo?: {
      original_url: string;
      large_url: string;
      medium_url: string;
      attribution: string;
      license_code: string;
    };
  };
  user?: {
    name: string;
    login: string;
  };
  quality_grade: string;
  photos: Array<{
    url: string;
    attribution: string;
    license_code: string;
  }>;
}

export interface iNatResponse {
  total_results: number;
  page: number;
  per_page: number;
  results: iNatObservation[];
}

class iNaturalistAPI {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  private getCacheKey(endpoint: string, params: any): string {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? Date.now() - cached.timestamp < this.CACHE_DURATION : false;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    if (this.isValidCache(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `iNaturalist API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`iNaturalist API request failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Determine species type based on iNaturalist taxonomy
   */
  private determineSpeciesType(iconicTaxonName: string): "animal" | "plant" {
    const plantIndicators = ["Plantae", "Plants"];
    return plantIndicators.includes(iconicTaxonName) ? "plant" : "animal";
  }

  /**
   * Map iNaturalist iconic taxon to our category system
   */
  private mapCategory(iconicTaxonName: string): string {
    const categoryMap: { [key: string]: string } = {
      Aves: "bird",
      Mammalia: "mammal",
      Reptilia: "reptile",
      Amphibia: "amphibian",
      Actinopterygii: "fish",
      Insecta: "insect",
      Arachnida: "spider",
      Plantae: "plant",
      Fungi: "fungi",
    };
    return categoryMap[iconicTaxonName] || iconicTaxonName.toLowerCase();
  }

  /**
   * Extract seasonality data from observation dates
   */
  private extractSeasonality(observations: iNatObservation[]): Seasonality {
    const monthCounts: { [key: number]: number } = {};
    let totalObs = 0;

    observations.forEach((obs) => {
      if (obs.observed_on) {
        const month = new Date(obs.observed_on).getMonth() + 1; // 1-12
        monthCounts[month] = (monthCounts[month] || 0) + 1;
        totalObs++;
      }
    });

    // Find months with above-average activity
    const avgObsPerMonth = totalObs / 12;
    const bestMonths = Object.entries(monthCounts)
      .filter(([_, count]) => count > avgObsPerMonth * 0.5) // 50% of average
      .map(([month, _]) => parseInt(month))
      .sort((a, b) => a - b);

    // Determine availability
    const availability = bestMonths.length >= 8 ? "year-round" : "seasonal";

    // Generate peak time description
    let peakTime = "Best viewing varies by season";
    if (bestMonths.length > 0) {
      const monthNames = [
        "",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const peakMonthNames = bestMonths.slice(0, 3).map((m) => monthNames[m]);
      peakTime = `Most active in ${peakMonthNames.join(", ")}`;
    }

    return {
      bestMonths:
        bestMonths.length > 0
          ? bestMonths
          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      availability,
      peakTime,
      behavior: `Based on ${totalObs} community observations in Golden Gate Park`,
    };
  }

  /**
   * Transform iNaturalist observation to our WildlifeSpecies format
   */
  private transformObservation(
    obs: iNatObservation,
    allObservationsForSpecies: iNatObservation[] = [obs]
  ): WildlifeSpecies {
    const location: Location = {
      lat: obs.location ? obs.location[0] : 37.7694, // Default to park center if no coords
      lng: obs.location ? obs.location[1] : -122.4862,
      area: "Golden Gate Park",
    };

    // Enhance location with park area information
    const enhancedLocation = LocationUtils.enhanceLocation(location);
    if (enhancedLocation.parkArea) {
      location.area = enhancedLocation.parkArea.name;
    }

    // Generate description
    let description = obs.taxon.preferred_common_name || obs.taxon.name;
    if (obs.taxon.wikipedia_url) {
      description += ` - Learn more about this species on Wikipedia.`;
    }
    description += ` Observed by the iNaturalist community in Golden Gate Park.`;

    // --- Get best photo with highest quality available ---
    let imageUrl = "/images/placeholder-wildlife.jpg";
    const photo = obs.photos?.[0];
    const defaultPhoto = obs.taxon.default_photo;

    if (photo?.url) {
      // Replace "square" with "large" (or "original" if you want full res)
      imageUrl = photo.url.replace("square", "large");
    } else if (defaultPhoto) {
      imageUrl =
        defaultPhoto.original_url ||
        defaultPhoto.large_url ||
        defaultPhoto.medium_url ||
        imageUrl;
    }

    // Create photo attribution object
    const imageAttribution: PhotoAttribution = {
      url: imageUrl,
      source: imageUrl.includes("/images/placeholder-wildlife.jpg")
        ? "placeholder"
        : "iNaturalist",
    };

    if (photo) {
      imageAttribution.attribution = photo.attribution;
      imageAttribution.license = photo.license_code;
    } else if (defaultPhoto) {
      imageAttribution.attribution = defaultPhoto.attribution;
      imageAttribution.license = defaultPhoto.license_code;
    }

    return {
      id: `inat-${obs.id}`,
      name:
        obs.taxon.preferred_common_name || obs.taxon.name || "Unknown Species",
      scientificName: obs.taxon.name,
      type: this.determineSpeciesType(obs.taxon.iconic_taxon_name),
      category: this.mapCategory(obs.taxon.iconic_taxon_name),
      description,
      image: imageUrl,
      imageAttribution,
      location,
      seasonality: this.extractSeasonality(allObservationsForSpecies),
      habitat:
        enhancedLocation.parkArea?.habitat.join(", ") ||
        "Various habitats in Golden Gate Park",
      conservationStatus:
        obs.taxon.conservation_status?.status_name || "Not Evaluated",
    };
  }

  /**
   * Search for species in Golden Gate Park
   */
  async searchGoldenGateParkSpecies(
    query?: string,
    type?: "animal" | "plant",
    limit: number = 20
  ): Promise<WildlifeSpecies[]> {
    const params = new URLSearchParams({
      place_id: GOLDEN_GATE_PARK_ID.toString(),
      verifiable: "true",
      per_page: Math.min(limit, 100).toString(), // Max 100 per request
      order: "desc",
      order_by: "observed_on",
    });

    if (query) {
      params.set("q", query);
    }

    if (type) {
      const taxonId = this.mapTypeToTaxon(type);
      if (taxonId) {
        params.set("taxon_id", taxonId);
      }
    }

    const url = `${BASE_URL}?${params.toString()}`;
    const cacheKey = this.getCacheKey("observations", { query, type, limit });

    try {
      const response = await this.fetchWithCache<iNatResponse>(url, cacheKey);

      if (!response.results || response.results.length === 0) {
        return [];
      }

      // Group observations by species to get better seasonality data
      const speciesGroups = new Map<number, iNatObservation[]>();
      response.results.forEach((obs) => {
        if (obs.taxon) {
          const taxonId = obs.taxon.id;
          if (!speciesGroups.has(taxonId)) {
            speciesGroups.set(taxonId, []);
          }
          speciesGroups.get(taxonId)!.push(obs);
        }
      });

      // Transform grouped observations to species
      const species: WildlifeSpecies[] = [];
      for (const [, observations] of Array.from(speciesGroups.entries())) {
        const representativeObs = observations[0]; // Use most recent observation
        const wildlifeSpecies = this.transformObservation(
          representativeObs,
          observations
        );
        species.push(wildlifeSpecies);
      }

      return species;
    } catch (error) {
      console.error("Failed to fetch species from iNaturalist:", error);
      throw error;
    }
  }

  /**
   * Get species by specific ID
   */
  async getSpeciesById(id: string): Promise<WildlifeSpecies | null> {
    if (!id.startsWith("inat-")) {
      return null;
    }

    const obsId = id.replace("inat-", "");
    const url = `${BASE_URL}/${obsId}`;
    const cacheKey = this.getCacheKey("observation_detail", { id: obsId });

    try {
      const observation = await this.fetchWithCache<iNatObservation>(
        url,
        cacheKey
      );
      return this.transformObservation(observation);
    } catch (error) {
      console.error(`Failed to fetch species ${id}:`, error);
      return null;
    }
  }

  /**
   * Get popular species in Golden Gate Park
   */
  async getPopularSpecies(
    type?: "animal" | "plant",
    limit: number = 10
  ): Promise<WildlifeSpecies[]> {
    const params = new URLSearchParams({
      place_id: GOLDEN_GATE_PARK_ID.toString(),
      verifiable: "true",
      per_page: limit.toString(),
      order: "desc",
      order_by: "votes", // Most liked observations
    });

    if (type) {
      const taxonId = this.mapTypeToTaxon(type);
      if (taxonId) {
        params.set("taxon_id", taxonId);
      }
    }

    const url = `${BASE_URL}?${params.toString()}`;
    const cacheKey = this.getCacheKey("popular_species", { type, limit });

    try {
      const response = await this.fetchWithCache<iNatResponse>(url, cacheKey);
      return response.results.map((obs) => this.transformObservation(obs));
    } catch (error) {
      console.error("Failed to fetch popular species:", error);
      return [];
    }
  }

  /**
   * Map species type to iNaturalist taxon ID
   */
  private mapTypeToTaxon(type: string): string {
    const taxonMap: { [key: string]: string } = {
      animal: "", // Don't filter, let iNat return all animals
      bird: "3",
      mammal: "40151",
      reptile: "26036",
      amphibian: "20978",
      fish: "47178",
      insect: "47158",
      plant: "47126",
      fungi: "47170",
    };
    return taxonMap[type.toLowerCase()] || "";
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const wildlifeAPI = new iNaturalistAPI();
