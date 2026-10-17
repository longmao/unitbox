export interface ScenarioPage {
  slug: string;
  title: string;
  description: string;
  intro: string;
  units: string[];
  pairs: Array<[string, string]>;
  faqs: Array<{ q: string; a: string }>;
}

export const scenarios: ScenarioPage[] = [
  {
    slug: 'construction-unit-converter',
    title: 'Construction Unit Converter',
    description: 'Convert mm, cm, metres, inches, feet and yards for construction measurements.',
    intro: 'Use these length conversions when reading architectural drawings, measuring rooms, checking material sizes or comparing metric and imperial construction dimensions.',
    units: ['millimeter', 'centimeter', 'meter', 'inch', 'foot', 'yard'],
    pairs: [['millimeter', 'inch'], ['inch', 'millimeter'], ['meter', 'foot'], ['foot', 'meter'], ['centimeter', 'inch'], ['yard', 'meter']],
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
    faqs: [
      { q: 'Is a higher L/100km better?', a: 'No. L/100km measures fuel used per distance, so a lower value means better fuel economy.' },
      { q: 'Are US MPG and UK MPG the same?', a: 'No. A US gallon and an imperial UK gallon have different volumes, so the two MPG scales must not be mixed.' },
    ],
  },
];
