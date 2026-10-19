export type QuizQuestion = {
  id: string;
  slug: string;
  category: 'everyday' | 'space' | 'data' | 'distance' | 'weight';
  prompt: string;
  hint: string;
  answer: number;
  unit: string;
  min?: number;
  max?: number;
  explanation: string;
  sourceName: string;
  sourceUrl: string;
  relatedConversions: string[];
};

/**
 * The first question bank is deliberately small and hand-checked. Keeping the
 * source and explanation beside each answer makes the game useful beyond the
 * daily round and gives future explanation pages a reliable data source.
 */
export const quizQuestions: QuizQuestion[] = [
  {
    id: 'refrigerator-weight',
    slug: 'how-heavy-is-a-refrigerator',
    category: 'weight',
    prompt: 'How heavy is a typical full-size refrigerator?',
    hint: 'Think about the empty appliance, not the food inside.',
    answer: 90,
    min: 70,
    max: 130,
    unit: 'kg',
    explanation: 'A typical full-size refrigerator weighs roughly 70–130 kg. A useful middle estimate is about 90 kg.',
    sourceName: 'US Department of Energy — Refrigerators and Freezers',
    sourceUrl: 'https://www.energy.gov/energysaver/refrigerators-and-freezers',
    relatedConversions: ['kilogram-to-pound', 'pound-to-kilogram'],
  },
  {
    id: 'football-field-area',
    slug: 'how-big-is-a-football-field',
    category: 'everyday',
    prompt: 'What is the area of a regulation association football pitch?',
    hint: 'A full-size pitch is roughly a hundred metres long.',
    answer: 7140,
    min: 4050,
    max: 10800,
    unit: 'm²',
    explanation: 'Pitch dimensions vary. A useful estimate for a full-size football field is about 7,140 m², using 105 m × 68 m.',
    sourceName: 'The International Football Association Board — Laws of the Game',
    sourceUrl: 'https://www.theifab.com/laws/latest/the-field-of-play/',
    relatedConversions: ['square-meter-to-square-foot', 'hectare-to-acre'],
  },
  {
    id: 'one-terabyte-movies',
    slug: 'how-many-movies-fit-in-a-terabyte',
    category: 'data',
    prompt: 'How many 4 GB movie files fit into 1 TB?',
    hint: 'Use decimal storage: 1 TB is 1,000 GB.',
    answer: 250,
    min: 220,
    max: 280,
    unit: 'movies',
    explanation: 'Using decimal storage, 1 TB is 1,000 GB. Dividing by 4 GB per movie gives 250 movies, before filesystem overhead.',
    sourceName: 'IEC — International System of Quantities prefixes',
    sourceUrl: 'https://www.iec.ch/si-prefixes',
    relatedConversions: ['terabyte-to-gigabyte', 'gigabyte-to-megabyte'],
  },
  {
    id: 'mile-in-kilometers',
    slug: 'how-far-is-a-mile',
    category: 'distance',
    prompt: 'How many kilometres are in one international mile?',
    hint: 'It is a little more than one and a half kilometres.',
    answer: 1.609344,
    min: 1.5,
    max: 1.7,
    unit: 'km',
    explanation: 'The international mile is exactly 1.609344 kilometres. For mental maths, 1.6 km is a good estimate.',
    sourceName: 'NIST — SI Units and Conversion Factors',
    sourceUrl: 'https://www.nist.gov/pml/owm/metric-si/si-units',
    relatedConversions: ['mile-to-kilometer', 'kilometer-to-mile'],
  },
  {
    id: 'bathtub-volume',
    slug: 'how-many-liters-in-a-bathtub',
    category: 'everyday',
    prompt: 'How much water does a standard bathtub hold when full?',
    hint: 'A bathtub is closer to a few hundred litres than a few dozen.',
    answer: 300,
    min: 150,
    max: 400,
    unit: 'L',
    explanation: 'A typical bathtub holds around 150–400 litres when full. Around 300 litres is a useful middle estimate.',
    sourceName: 'US Environmental Protection Agency — WaterSense',
    sourceUrl: 'https://www.epa.gov/watersense/bathrooms',
    relatedConversions: ['liter-to-gallon-us', 'gallon-us-to-liter'],
  },
  {
    id: 'blue-whale-weight',
    slug: 'how-heavy-is-a-blue-whale',
    category: 'weight',
    prompt: 'How heavy can a large blue whale be?',
    hint: 'It weighs more than a dozen large elephants.',
    answer: 150,
    min: 100,
    max: 190,
    unit: 'tonnes',
    explanation: 'Large blue whales can weigh around 100–180 tonnes. A middle estimate of 150 tonnes is a sensible guess.',
    sourceName: 'NOAA Fisheries — Blue Whale',
    sourceUrl: 'https://www.fisheries.noaa.gov/species/blue-whale',
    relatedConversions: ['tonne-to-kilogram', 'kilogram-to-pound'],
  },
  {
    id: 'everest-height',
    slug: 'how-high-is-mount-everest',
    category: 'distance',
    prompt: 'How high is Mount Everest above sea level?',
    hint: 'It is just under nine kilometres high.',
    answer: 8848.86,
    min: 8000,
    max: 9500,
    unit: 'm',
    explanation: 'The officially announced height of Mount Everest is 8,848.86 metres above sea level.',
    sourceName: 'Government of Nepal — Mount Everest height announcement',
    sourceUrl: 'https://mofa.gov.np/content/1179/mount-everest-height/',
    relatedConversions: ['meter-to-foot', 'kilometer-to-mile'],
  },
  {
    id: 'smartphone-weight',
    slug: 'how-heavy-is-a-smartphone',
    category: 'everyday',
    prompt: 'How heavy is a modern smartphone?',
    hint: 'A smartphone is lighter than a paperback book.',
    answer: 200,
    min: 140,
    max: 260,
    unit: 'g',
    explanation: 'Modern smartphones commonly weigh about 140–260 grams. Around 200 grams is a useful everyday estimate.',
    sourceName: 'Apple — iPhone technical specifications',
    sourceUrl: 'https://www.apple.com/iphone/compare/',
    relatedConversions: ['gram-to-ounce', 'gram-to-kilogram'],
  },
];

export const quizBySlug = new Map(quizQuestions.map((question) => [question.slug, question]));

export function questionForDay(dayIndex: number, offset = 0): QuizQuestion {
  return quizQuestions[(dayIndex * 5 + offset) % quizQuestions.length];
}

export function dayIndexForDate(date = new Date()): number {
  const utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const epoch = Date.UTC(2026, 0, 1);
  return Math.floor((utc - epoch) / 86400000);
}
