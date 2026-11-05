export interface ScenarioPage {
  slug: string;
  title: string;
  description: string;
  intro: string;
  units: string[];
  pairs: Array<[string, string]>;
  faqs: Array<{ q: string; a: string }>;
  /** A working converter shown before the reading material on focused guides. */
  primaryPair?: [string, string];
  defaultValue?: number;
  workingNotes?: string[];
  reference?: { label: string; href: string; description: string };
  explainers?: Array<{ heading: string; paragraphs: string[] }>;
}

export const scenarios: ScenarioPage[] = [
  {
    slug: 'construction-unit-converter',
    title: 'Construction Unit Converter',
    description: 'Convert mm, cm, metres, inches, feet and yards for construction measurements.',
    intro: 'Use these length conversions when reading architectural drawings, measuring rooms, checking material sizes or comparing metric and imperial construction dimensions.',
    units: ['millimeter', 'centimeter', 'meter', 'inch', 'foot', 'yard'],
    pairs: [['millimeter', 'inch'], ['inch', 'millimeter'], ['meter', 'foot'], ['foot', 'meter'], ['centimeter', 'inch'], ['yard', 'meter']],
    primaryPair: ['millimeter', 'inch'],
    defaultValue: 25.4,
    workingNotes: [
      'Use millimetres for exact drawing dimensions, then convert to inches only when a material, fastener, or supplier specification requires it.',
      'Keep the original drawing unit in the record. A conversion is a working view, not a replacement for the source dimension.',
      'For area, load, tolerance, or safety-critical work, verify the governing drawing and project standard before ordering material.',
    ],
    reference: { label: 'Metric and imperial cheat sheet', href: '/en/reference/metric-imperial/', description: 'Keep the common length, area, mass and temperature relationships close to the calculation.' },
    explainers: [
      {
        heading: 'Read the source unit before converting',
        paragraphs: [
          'Construction drawings normally choose one primary unit system. Metric drawings often use millimetres for component dimensions and metres for overall dimensions. US drawings may use feet and inches, sometimes with a decimal-foot survey value. The converter changes the number, but it cannot decide which drawing convention the author intended.',
          'Treat the supplied drawing or manufacturer specification as the source of truth. Use the converted value to compare materials or communicate across systems, then retain the original value and unit in the purchase record or work instruction.',
        ],
      },
      {
        heading: 'Area and tolerance need extra care',
        paragraphs: [
          'Area is not converted with the same factor as length: the factor is squared. That is why one square metre is about 10.76 square feet rather than 3.28 square feet. Volume introduces a third dimension and uses a cubed factor.',
          'A conversion result is not a tolerance decision. If a fastener, pipe, opening, or load-bearing component is involved, check the governing drawing revision and the applicable project or product standard before ordering or cutting material.',
        ],
      },
    ],
    faqs: [
      { q: 'How many millimetres are in an inch?', a: 'One inch equals exactly 25.4 millimetres.' },
      { q: 'Which units are common on construction drawings?', a: 'Millimetres and metres are common in metric drawings, while inches and feet are common in US customary drawings.' },
    ],
  },
  {
    slug: 'engineering-unit-converter',
    title: 'Engineering Unit Converter',
    description: 'Convert pressure, torque, power, energy, length and temperature units for engineering work.',
    intro: 'A practical starting point for engineering calculations: convert common SI and imperial units, then open a dedicated pair page for the formula and reference table.',
    units: ['pascal', 'bar', 'psi', 'kilowatt-hour', 'joule', 'foot-pound'],
    pairs: [['psi', 'bar'], ['bar', 'psi'], ['kilowatt-hour', 'joule'], ['joule', 'kilowatt-hour'], ['foot-pound', 'joule'], ['celsius', 'fahrenheit']],
    faqs: [
      { q: 'Does unitbox support SI and imperial engineering units?', a: 'Yes. The unit catalogue includes SI units and common imperial or US customary equivalents where the category supports them.' },
      { q: 'Should I round engineering conversion results?', a: 'Keep extra precision during intermediate calculations and round only the final value to match the tolerance of your application.' },
    ],
  },
  {
    slug: 'cooking-unit-converter',
    title: 'Cooking Unit Converter',
    description: 'Convert cups, tablespoons, teaspoons, millilitres, litres and gallons for cooking measurements.',
    intro: 'Convert recipe measurements between common kitchen units. Always check whether a recipe uses US or UK volume units before scaling it.',
    units: ['milliliter', 'liter', 'cup-us', 'tablespoon-us', 'teaspoon-us', 'gallon-us'],
    pairs: [['cup-us', 'milliliter'], ['milliliter', 'cup-us'], ['tablespoon-us', 'milliliter'], ['teaspoon-us', 'milliliter'], ['liter', 'gallon-us'], ['gallon-us', 'liter']],
    faqs: [
      { q: 'Are US and UK gallons the same?', a: 'No. US and UK gallons have different volumes, so choose the correct unit system before converting.' },
      { q: 'Can volume conversion replace weight in a recipe?', a: 'No. Volume and mass are different dimensions. Converting grams to cups also requires the ingredient density.' },
    ],
  },
  {
    slug: 'data-storage-converter',
    title: 'Data Storage Converter',
    description: 'Convert bytes, KB, KiB, MB, MiB, GB, GiB, TB and related data units.',
    intro: 'Understand the difference between decimal storage units and binary computer units when comparing disk capacity, downloads, memory and file sizes.',
    units: ['byte', 'kilobyte', 'kibibyte', 'megabyte', 'mebibyte', 'gigabyte', 'gibibyte', 'terabyte', 'tebibyte'],
    pairs: [['kilobyte', 'kibibyte'], ['kibibyte', 'kilobyte'], ['gigabyte', 'megabyte'], ['gigabyte', 'gibibyte'], ['terabyte', 'tebibyte'], ['byte', 'kilobyte']],
    primaryPair: ['gigabyte', 'gibibyte'],
    defaultValue: 1,
    workingNotes: [
      'Storage vendors normally use decimal GB and TB. Operating systems often show the binary GiB and TiB equivalent.',
      'Use lowercase b for bits and uppercase B for bytes. A quoted internet speed is often bits per second, not bytes per second.',
      'When a contract, cloud bill, or backup plan matters, write the unit in full instead of relying on GB alone.',
    ],
    reference: { label: 'KB, KiB, MB and MiB explained', href: '/en/articles/why-kb-and-kib-are-different/', description: 'See why a 1 TB drive and a 1 TiB reading are not the same quantity.' },
    explainers: [
      {
        heading: 'Decimal storage and binary storage describe bytes differently',
        paragraphs: [
          'Storage manufacturers commonly use decimal prefixes: 1 GB means 1,000,000,000 bytes and 1 TB means 1,000,000,000,000 bytes. Binary prefixes use powers of two: 1 GiB is 1,073,741,824 bytes and 1 TiB is 1,099,511,627,776 bytes.',
          'Both descriptions can be accurate. The apparent mismatch happens when a drive label uses decimal capacity while an operating system reports the same byte count in binary units. State the unit rather than claiming one side is wrong.',
        ],
      },
      {
        heading: 'Bytes and bits answer different questions',
        paragraphs: [
          'Files, memory, and storage capacity are normally described in bytes with an uppercase B. Network speeds are commonly expressed in bits per second with a lowercase b. Eight bits make one byte, so a connection marketed at 100 Mb/s cannot download 100 MB every second.',
          'For quotas, contracts, cloud storage, and backups, write the full unit in the requirement. A short “GB” label is not enough when the decimal versus binary convention changes the available capacity.',
        ],
      },
    ],
    faqs: [
      { q: 'What is the difference between KB and KiB?', a: 'KB uses the decimal prefix and equals 1,000 bytes. KiB uses the binary prefix and equals 1,024 bytes.' },
      { q: 'Why does a drive show less space than advertised?', a: 'Drive manufacturers commonly use decimal GB and TB, while operating systems may display binary GiB and TiB.' },
    ],
  },
  {
    slug: 'fuel-economy-converter',
    title: 'Fuel Economy Converter',
    description: 'Convert MPG, km/L and L/100km for comparing fuel economy across countries.',
    intro: 'Fuel economy is different from most units because some values are reciprocal. Use the correct MPG-US or MPG-UK option before comparing vehicles.',
    units: ['mpg-us', 'mpg-uk', 'km-per-liter', 'liter-per-100km'],
    pairs: [['mpg-us', 'liter-per-100km'], ['liter-per-100km', 'mpg-us'], ['mpg-uk', 'liter-per-100km'], ['km-per-liter', 'mpg-us']],
    primaryPair: ['mpg-us', 'liter-per-100km'],
    defaultValue: 30,
    workingNotes: [
      'Choose MPG-US or MPG-UK before comparing a vehicle. The gallon is different, so the two figures cannot be swapped.',
      'In L/100 km, a smaller number means lower fuel use. In MPG and km/L, a larger number means better economy.',
      'Use one unit system for the whole comparison, then add fuel price and annual distance separately when estimating cost.',
    ],
    reference: { label: 'Temperature formulas and reference points', href: '/en/reference/temperature-formulas/', description: 'Travelling and vehicle research often involves both fuel economy and an unfamiliar temperature scale.' },
    explainers: [
      {
        heading: 'Fuel economy reverses the direction of “better”',
        paragraphs: [
          'MPG and kilometres per litre describe distance travelled for each unit of fuel, so a larger result is more efficient. Litres per 100 kilometres describes fuel used for a fixed distance, so a smaller result is more efficient.',
          'This makes fuel economy reciprocal rather than a simple multiplier. A small change at low MPG can have a much larger cost effect than the same numerical change at high MPG, which is why comparisons should use a single unit system.',
        ],
      },
      {
        heading: 'Choose the correct gallon before comparing',
        paragraphs: [
          'US MPG and UK MPG use different gallon volumes. The UK Imperial gallon is larger, so an MPG-UK figure will look higher than the equivalent MPG-US figure for the same vehicle. Unitbox keeps them as separate choices.',
          'For a spending estimate, first convert every vehicle to the same fuel-economy unit. Then multiply fuel use by the annual distance and local fuel price. The converter makes the unit comparison reproducible; local prices remain a separate assumption.',
        ],
      },
    ],
    faqs: [
      { q: 'Is a higher L/100km better?', a: 'No. L/100km measures fuel used per distance, so a lower value means better fuel economy.' },
      { q: 'Are US MPG and UK MPG the same?', a: 'No. A US gallon and an imperial UK gallon have different volumes, so the two MPG scales must not be mixed.' },
    ],
  },
];

/** The only scenario guides promoted on the homepage until their search demand is proven. */
export const featuredScenarioSlugs = [
  'data-storage-converter',
  'fuel-economy-converter',
  'construction-unit-converter',
];
