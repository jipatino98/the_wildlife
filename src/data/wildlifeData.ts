import { WildlifeSpecies } from '../types/Wildlife';

export const GOLDEN_GATE_PARK_BOUNDS = {
  center: { lat: 37.7694, lng: -122.4862 },
  bounds: [
    [37.7665, -122.5103], // Southwest
    [37.7741, -122.4540]  // Northeast
  ] as [[number, number], [number, number]]
};

export const wildlifeSpecies: WildlifeSpecies[] = [
  {
    id: 'coyote-1',
    name: 'Coyote',
    scientificName: 'Canis latrans',
    type: 'animal',
    category: 'mammal',
    description: 'Coyotes have returned to Golden Gate Park and the Presidio since 2002. These adaptable predators are most active during dawn and dusk hours.',
    image: '/images/coyote.jpg',
    location: {
      lat: 37.7703,
      lng: -122.4751,
      area: 'Western sections near Beach Chalet'
    },
    seasonality: {
      bestMonths: [1, 2, 3, 10, 11, 12],
      availability: 'year-round',
      peakTime: 'Dawn and dusk',
      behavior: 'More active in cooler months, often seen near dawn and dusk'
    },
    habitat: 'Open grasslands, wooded areas, and park edges',
    conservationStatus: 'Least Concern'
  },
  {
    id: 'california-poppy-1',
    name: 'California Poppy',
    scientificName: 'Eschscholzia californica',
    type: 'plant',
    category: 'flower',
    description: "California's state flower blooms in vibrant orange across Golden Gate Park's meadows and hillsides.",
    image: '/images/california-poppy.jpg',
    location: {
      lat: 37.7691,
      lng: -122.4583,
      area: 'Hippie Hill and surrounding meadows'
    },
    seasonality: {
      bestMonths: [3, 4, 5, 6, 7],
      availability: 'seasonal',
      peakTime: 'Spring through early summer',
      behavior: 'Peak blooming in spring, flowers close at night and on cloudy days'
    },
    habitat: 'Grasslands, meadows, and hillsides',
    conservationStatus: 'Least Concern'
  },
  {
    id: 'red-tailed-hawk-1',
    name: 'Red-tailed Hawk',
    scientificName: 'Buteo jamaicensis',
    type: 'animal',
    category: 'bird',
    description: 'Large raptors frequently seen soaring over Golden Gate Park, hunting for small mammals and birds.',
    image: '/images/red-tailed-hawk.jpg',
    location: {
      lat: 37.7715,
      lng: -122.4690,
      area: 'Eucalyptus groves and open areas'
    },
    seasonality: {
      bestMonths: [1, 2, 3, 4, 9, 10, 11, 12],
      availability: 'year-round',
      peakTime: 'Morning and late afternoon',
      behavior: 'More visible during migration periods in fall and spring'
    },
    habitat: 'Open woodlands, parks, and urban areas with tall perches',
    conservationStatus: 'Least Concern'
  },
  {
    id: 'coast-live-oak-1',
    name: 'Coast Live Oak',
    scientificName: 'Quercus agrifolia',
    type: 'plant',
    category: 'tree',
    description: 'Iconic California native oak trees that provide habitat for numerous wildlife species.',
    image: '/images/coast-live-oak.jpg',
    location: {
      lat: 37.7698,
      lng: -122.4612,
      area: 'Throughout the park, especially near Japanese Tea Garden'
    },
    seasonality: {
      bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      availability: 'year-round',
      peakTime: 'Year-round presence',
      behavior: 'Acorn production peaks in fall, providing food for wildlife'
    },
    habitat: 'Mixed woodlands and park areas',
    conservationStatus: 'Least Concern'
  },
  {
    id: 'california-scrub-jay-1',
    name: 'California Scrub Jay',
    scientificName: 'Aphelocoma californica',
    type: 'animal',
    category: 'bird',
    description: 'Intelligent blue birds known for their problem-solving abilities and acorn caching behavior.',
    image: '/images/scrub-jay.jpg',
    location: {
      lat: 37.7685,
      lng: -122.4645,
      area: 'Oak woodlands and picnic areas'
    },
    seasonality: {
      bestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      availability: 'year-round',
      peakTime: 'Most active in morning',
      behavior: 'Very active during acorn season (fall), highly social year-round'
    },
    habitat: 'Oak woodlands, scrublands, and park areas',
    conservationStatus: 'Least Concern'
  },
  {
    id: 'douglas-iris-1',
    name: 'Douglas Iris',
    scientificName: 'Iris douglasiana',
    type: 'plant',
    category: 'flower',
    description: 'Native California wildflower with striking blue-purple blooms in spring.',
    image: '/images/douglas-iris.jpg',
    location: {
      lat: 37.7681,
      lng: -122.4702,
      area: 'Native plant areas and hillsides'
    },
    seasonality: {
      bestMonths: [3, 4, 5, 6],
      availability: 'seasonal',
      peakTime: 'Spring blooming season',
      behavior: 'Peak blooming March through May, dormant in summer'
    },
    habitat: 'Coastal grasslands and native plant gardens',
    conservationStatus: 'Least Concern'
  }
];