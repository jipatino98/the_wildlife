import { WildlifeSpecies, SpeciesType } from "../types/Wildlife";
import { wildlifeAPI } from "./wildlifeAPI";
import { wildlifeSpecies as fallbackSpecies } from "../data/wildlifeData";

export interface DataServiceOptions {
  useAPI: boolean;
  enableCache: boolean;
  fallbackToLocal: boolean;
  timeout: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isUsingFallback: boolean;
  lastUpdated: Date | null;
}

export interface SearchOptions {
  query?: string;
  type?: SpeciesType;
  category?: string;
  includeAPI?: boolean;
  includeLocal?: boolean;
}

export class WildlifeDataService {
  private static instance: WildlifeDataService;
  private apiSpecies: WildlifeSpecies[] = [];
  private loadingState: LoadingState = {
    isLoading: false,
    error: null,
    isUsingFallback: false,
    lastUpdated: null,
  };
  private options: DataServiceOptions = {
    useAPI: true,
    enableCache: true,
    fallbackToLocal: true,
    timeout: 10000,
  };
  private listeners: Array<(state: LoadingState) => void> = [];
  private dataCache: Map<
    string,
    { data: WildlifeSpecies[]; timestamp: number }
  > = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for iNaturalist data

  public static getInstance(): WildlifeDataService {
    if (!WildlifeDataService.instance) {
      WildlifeDataService.instance = new WildlifeDataService();
    }
    return WildlifeDataService.instance;
  }

  private constructor() {
    this.loadInitialData();
  }

  /**
   * Configure the data service options
   */
  configure(options: Partial<DataServiceOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Subscribe to loading state changes
   */
  subscribe(listener: (state: LoadingState) => void): () => void {
    this.listeners.push(listener);
    listener(this.loadingState); // Immediately call with current state

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current loading state
   */
  getLoadingState(): LoadingState {
    return { ...this.loadingState };
  }

  /**
   * Update loading state and notify listeners
   */
  private updateLoadingState(updates: Partial<LoadingState>): void {
    this.loadingState = { ...this.loadingState, ...updates };
    this.listeners.forEach((listener) => listener(this.loadingState));
  }

  /**
   * Load initial data on service creation
   */
  private async loadInitialData(): Promise<void> {
    if (this.options.useAPI) {
      try {
        await this.refreshAPIData();
      } catch (error) {
        console.warn("Initial API data load failed, using fallback data");
        this.updateLoadingState({
          error: "Failed to load API data",
          isUsingFallback: true,
        });
      }
    }
  }

  /**
   * Get cached data if still valid
   */
  private getCachedData(key: string): WildlifeSpecies[] | null {
    if (!this.options.enableCache) return null;

    const cached = this.dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Cache data with timestamp
   */
  private setCachedData(key: string, data: WildlifeSpecies[]): void {
    if (this.options.enableCache) {
      this.dataCache.set(key, { data, timestamp: Date.now() });
    }
  }

  /**
   * Refresh API data from iNaturalist
   */
  async refreshAPIData(): Promise<void> {
    if (!this.options.useAPI) return;

    this.updateLoadingState({ isLoading: true, error: null });

    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), this.options.timeout)
      );

      // Fetch recent observations from iNaturalist
      const dataPromise = wildlifeAPI.searchGoldenGateParkSpecies(undefined, undefined, 50);
      const apiData = await Promise.race([dataPromise, timeoutPromise]);

      this.apiSpecies = apiData;
      this.setCachedData('api_species', this.apiSpecies);

      this.updateLoadingState({
        isLoading: false,
        error: null,
        isUsingFallback: false,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.warn('iNaturalist API failed:', error);
      
      if (this.options.fallbackToLocal) {
        this.updateLoadingState({
          isLoading: false,
          error: `iNaturalist API failed: ${(error as Error).message}`,
          isUsingFallback: true,
          lastUpdated: new Date()
        });
      } else {
        this.updateLoadingState({
          isLoading: false,
          error: `API failed: ${(error as Error).message}`,
          isUsingFallback: false
        });
        throw error;
      }
    }
  }


  /**
   * Get all species data (API + local fallback)
   */
  async getAllSpecies(): Promise<WildlifeSpecies[]> {
    // Check cache first
    const cacheKey = "all_species";
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    let combinedSpecies: WildlifeSpecies[] = [];

    // Add API species if available and not in error state
    if (this.options.useAPI && !this.loadingState.error) {
      combinedSpecies = [...this.apiSpecies];
    }

    // Add local species (either as fallback or supplement)
    if (this.options.fallbackToLocal || !this.options.useAPI) {
      // Avoid duplicates by checking scientific names and IDs
      const existingNames = new Set(combinedSpecies.map(s => s.scientificName));
      const existingIds = new Set(combinedSpecies.map(s => s.id));
      
      const uniqueLocalSpecies = fallbackSpecies.filter(
        local => !existingNames.has(local.scientificName) && !existingIds.has(local.id)
      );
      combinedSpecies = [...combinedSpecies, ...uniqueLocalSpecies];
    }

    this.setCachedData(cacheKey, combinedSpecies);
    return combinedSpecies;
  }

  /**
   * Search species with various filters
   */
  async searchSpecies(options: SearchOptions = {}): Promise<WildlifeSpecies[]> {
    const {
      query,
      type = "all",
      category,
      includeAPI = true,
      includeLocal = true,
    } = options;

    let species: WildlifeSpecies[] = [];

    // Get API species if enabled
    if (includeAPI && this.options.useAPI) {
      try {
        const searchType = type === 'all' ? undefined : type as 'animal' | 'plant';
        const apiResults = await wildlifeAPI.searchGoldenGateParkSpecies(query, searchType);
        species = [...species, ...apiResults];
      } catch (error) {
        console.warn('API search failed:', error);
      }
    }

    // Get local species if enabled
    if (includeLocal) {
      let localResults = fallbackSpecies;

      // Avoid duplicates
      const existingNames = new Set(species.map(s => s.scientificName));
      localResults = localResults.filter(s => !existingNames.has(s.scientificName));

      species = [...species, ...localResults];
    }

    // Apply filters
    let filteredSpecies = species;

    // Filter by type
    if (type && type !== "all") {
      filteredSpecies = filteredSpecies.filter((s) => s.type === type);
    }

    // Filter by category
    if (category) {
      filteredSpecies = filteredSpecies.filter((s) => s.category === category);
    }

    // Filter by query (if not already handled by API)
    if (query && includeLocal) {
      const queryLower = query.toLowerCase();
      filteredSpecies = filteredSpecies.filter(s =>
        s.name.toLowerCase().includes(queryLower) ||
        s.scientificName.toLowerCase().includes(queryLower) ||
        s.description.toLowerCase().includes(queryLower) ||
        s.category.toLowerCase().includes(queryLower) ||
        s.habitat.toLowerCase().includes(queryLower)
      );
    }

    return filteredSpecies;
  }

  /**
   * Get species by ID
   */
  async getSpeciesById(id: string): Promise<WildlifeSpecies | null> {
    // Try API first for iNaturalist IDs
    if (id.startsWith('inat-')) {
      try {
        const apiResult = await wildlifeAPI.getSpeciesById(id);
        if (apiResult) return apiResult;
      } catch (error) {
        console.warn(`Failed to get species ${id} from API:`, error);
      }
    }

    // Fall back to local data
    const allSpecies = await this.getAllSpecies();
    return allSpecies.find(s => s.id === id) || null;
  }

  /**
   * Get species by type (animals or plants)
   */
  async getSpeciesByType(type: "animal" | "plant"): Promise<WildlifeSpecies[]> {
    return this.searchSpecies({ type });
  }

  /**
   * Get species that are best viewed in current month
   */
  async getSeasonalSpecies(month?: number): Promise<WildlifeSpecies[]> {
    const currentMonth = month || new Date().getMonth() + 1;
    const allSpecies = await this.getAllSpecies();

    return allSpecies.filter((species) =>
      species.seasonality.bestMonths.includes(currentMonth)
    );
  }

  /**
   * Get popular species from iNaturalist
   */
  async getPopularSpecies(count: number = 10): Promise<WildlifeSpecies[]> {
    try {
      if (this.options.useAPI) {
        return await wildlifeAPI.getPopularSpecies(undefined, count);
      }
    } catch (error) {
      console.warn('Failed to get popular species from API:', error);
    }

    // Fallback to random local species
    const allSpecies = await this.getAllSpecies();
    const shuffled = [...allSpecies].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get random featured species
   */
  async getFeaturedSpecies(count: number = 3): Promise<WildlifeSpecies[]> {
    // Prefer popular species from API, fall back to random selection
    try {
      const popular = await this.getPopularSpecies(count);
      if (popular.length > 0) return popular;
    } catch (error) {
      console.warn('Failed to get featured species:', error);
    }

    const allSpecies = await this.getAllSpecies();
    const shuffled = [...allSpecies].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Force refresh all data
   */
  async forceRefresh(): Promise<void> {
    this.dataCache.clear();
    wildlifeAPI.clearCache();
    this.apiSpecies = [];
    
    if (this.options.useAPI) {
      await this.refreshAPIData();
    }
  }

  /**
   * Get data source statistics
   */
  getDataStats(): {
    total: number;
    apiSpecies: number;
    localSpecies: number;
    isUsingAPI: boolean;
    isUsingFallback: boolean;
    lastUpdated: Date | null;
  } {
    const localCount = this.loadingState.isUsingFallback ? fallbackSpecies.length : 0;
    return {
      total: this.apiSpecies.length + localCount,
      apiSpecies: this.apiSpecies.length,
      localSpecies: fallbackSpecies.length,
      isUsingAPI: this.options.useAPI && !this.loadingState.error,
      isUsingFallback: this.loadingState.isUsingFallback,
      lastUpdated: this.loadingState.lastUpdated
    };
  }
}

// Export singleton instance
export const wildlifeDataService = WildlifeDataService.getInstance();
