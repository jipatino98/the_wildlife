import { WildlifeDataService } from '../wildlifeDataService';

// Simple test to verify the data service functionality
describe('WildlifeDataService Integration', () => {
  let dataService: WildlifeDataService;

  beforeEach(() => {
    dataService = WildlifeDataService.getInstance();
  });

  test('should load species data without errors', async () => {
    try {
      const species = await dataService.getAllSpecies();
      expect(species).toBeDefined();
      expect(Array.isArray(species)).toBe(true);
      expect(species.length).toBeGreaterThan(0);
      
      // Check that at least the fallback species are loaded
      expect(species.length).toBeGreaterThanOrEqual(6);
      
      // Verify structure of first species
      if (species.length > 0) {
        const firstSpecies = species[0];
        expect(firstSpecies).toHaveProperty('id');
        expect(firstSpecies).toHaveProperty('name');
        expect(firstSpecies).toHaveProperty('scientificName');
        expect(firstSpecies).toHaveProperty('type');
        expect(firstSpecies).toHaveProperty('location');
        expect(firstSpecies).toHaveProperty('seasonality');
      }
    } catch (error) {
      console.error('Species loading failed:', error);
      throw error;
    }
  });

  test('should handle search functionality', async () => {
    try {
      const coyoteResults = await dataService.searchSpecies({ query: 'coyote' });
      expect(coyoteResults).toBeDefined();
      expect(Array.isArray(coyoteResults)).toBe(true);
      
      if (coyoteResults.length > 0) {
        const coyote = coyoteResults[0];
        expect(coyote.name.toLowerCase()).toContain('coyote');
      }
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  });

  test('should provide data statistics', () => {
    const stats = dataService.getDataStats();
    expect(stats).toBeDefined();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('apiSpecies');
    expect(stats).toHaveProperty('localSpecies');
    expect(stats).toHaveProperty('isUsingAPI');
    expect(stats).toHaveProperty('isUsingFallback');
    
    expect(typeof stats.total).toBe('number');
    expect(stats.total).toBeGreaterThanOrEqual(0);
  });

  test('should filter species by type', async () => {
    try {
      const animals = await dataService.getSpeciesByType('animal');
      const plants = await dataService.getSpeciesByType('plant');
      
      expect(Array.isArray(animals)).toBe(true);
      expect(Array.isArray(plants)).toBe(true);
      
      // Verify all returned species have correct type
      animals.forEach(species => {
        expect(species.type).toBe('animal');
      });
      
      plants.forEach(species => {
        expect(species.type).toBe('plant');
      });
    } catch (error) {
      console.error('Type filtering failed:', error);
      throw error;
    }
  });

  test('should get seasonal species', async () => {
    try {
      const currentSeasonalSpecies = await dataService.getSeasonalSpecies();
      const januarySpecies = await dataService.getSeasonalSpecies(1);
      
      expect(Array.isArray(currentSeasonalSpecies)).toBe(true);
      expect(Array.isArray(januarySpecies)).toBe(true);
      
      // Verify seasonal species have correct month in their bestMonths
      januarySpecies.forEach(species => {
        expect(species.seasonality.bestMonths).toContain(1);
      });
    } catch (error) {
      console.error('Seasonal filtering failed:', error);
      throw error;
    }
  });

  test('should handle featured species request', async () => {
    try {
      const featured = await dataService.getFeaturedSpecies(3);
      expect(Array.isArray(featured)).toBe(true);
      expect(featured.length).toBeLessThanOrEqual(3);
      
      // Should return unique species
      const ids = featured.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    } catch (error) {
      console.error('Featured species failed:', error);
      throw error;
    }
  });
});

// Manual test function that can be called directly
export const runManualTests = async () => {
  console.log('🧪 Running manual Wildlife Data Service tests...');
  
  const dataService = WildlifeDataService.getInstance();
  
  try {
    // Test 1: Load all species
    console.log('📊 Test 1: Loading all species...');
    const allSpecies = await dataService.getAllSpecies();
    console.log(`✅ Loaded ${allSpecies.length} species successfully`);
    
    // Test 2: Test search
    console.log('🔍 Test 2: Testing search functionality...');
    const searchResults = await dataService.searchSpecies({ query: 'coyote' });
    console.log(`✅ Found ${searchResults.length} results for 'coyote'`);
    
    // Test 3: Test data stats
    console.log('📈 Test 3: Getting data statistics...');
    const stats = dataService.getDataStats();
    console.log(`✅ Stats: ${stats.total} total, API: ${stats.isUsingAPI}, Fallback: ${stats.isUsingFallback}`);
    
    // Test 4: Test seasonal species
    console.log('🌱 Test 4: Getting seasonal species...');
    const seasonal = await dataService.getSeasonalSpecies();
    console.log(`✅ Found ${seasonal.length} species in season`);
    
    // Test 5: Test type filtering
    console.log('🐾 Test 5: Testing type filtering...');
    const animals = await dataService.getSpeciesByType('animal');
    const plants = await dataService.getSpeciesByType('plant');
    console.log(`✅ Animals: ${animals.length}, Plants: ${plants.length}`);
    
    console.log('🎉 All manual tests completed successfully!');
    return {
      success: true,
      totalSpecies: allSpecies.length,
      stats,
      searchResults: searchResults.length,
      seasonalCount: seasonal.length,
      animalCount: animals.length,
      plantCount: plants.length
    };
    
  } catch (error) {
    console.error('❌ Manual test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testWildlifeDataService = runManualTests;
}