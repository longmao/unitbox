/**
 * Editorial notes for the first conversion pages we actively promote. These
 * are intentionally specific: they make the page useful beyond the result
 * table and keep us from treating every possible unit pair as equal content.
 */
export interface PriorityConversionGuide {
  title: string;
  paragraphs: string[];
  pitfall: string;
  reference: { label: string; href: string };
  scenario?: { label: string; href: string };
}

const guides: Record<string, PriorityConversionGuide> = {
  'meter-to-foot': {
    title: 'When metres become feet',
    paragraphs: ['Use this direction when a metric drawing, room measurement, or product specification needs to be read by someone working in US customary units. Keep the source value in metres in the original record; the feet value is the working equivalent.', 'For plans and material cut lists, check whether the recipient expects decimal feet or feet and inches. They are both valid displays of the same length, but they are written differently.'],
    pitfall: 'Do not round a dimension before applying a tolerance. Convert first, then round to the precision the drawing or supplier specifies.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
    scenario: { label: 'Construction conversion guide', href: '/scenarios/construction-unit-converter/' },
  },
  'foot-to-meter': {
    title: 'When feet need a metric value',
    paragraphs: ['This direction is common when reading US room dimensions, elevation data, or supplier specifications for a metric project. A foot is exactly 0.3048 metres, so the underlying factor is fixed.', 'If a value is written in feet and inches, convert the inches to a decimal part of a foot before entering it. For example, 5 ft 6 in is 5.5 ft, not 5.6 ft.'],
    pitfall: 'A decimal foot is not an inches notation. Treating 5.6 ft as 5 ft 6 in introduces an error.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
    scenario: { label: 'Construction conversion guide', href: '/scenarios/construction-unit-converter/' },
  },
  'kilometer-to-mile': {
    title: 'Comparing road distance across systems',
    paragraphs: ['Kilometres appear on most road signs, running plans, and vehicle specifications. Miles are still common in the United States and United Kingdom, so this conversion is useful for travel and route comparison.', 'For a precise route, use the distance supplied by the mapping or navigation source. This calculator only changes the unit; it does not account for detours, elevation, or road conditions.'],
    pitfall: 'Do not confuse kilometres with kilometres per hour. Distance and speed require different categories and should not be converted as if they were interchangeable.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
  },
  'mile-to-kilometer': {
    title: 'Reading miles in kilometres',
    paragraphs: ['A mile is exactly 1.609344 kilometres. Use this for driving distances, trail descriptions, and vehicle range when the source uses miles but your local convention uses kilometres.', 'For fuel planning, convert distance and fuel economy separately. A distance conversion alone does not tell you fuel use.'],
    pitfall: 'A nautical mile is a different unit from a statute mile. Use the nautical-mile converter for marine or aviation navigation.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
  },
  'inch-to-centimeter': {
    title: 'Turning product dimensions into centimetres',
    paragraphs: ['Inches are widely used for screens, fasteners, pipes, and product dimensions. The exact relationship is simple: one inch equals 2.54 centimetres.', 'For manufacturing and construction, millimetres are often a better final unit because they avoid decimal centimetres and match drawing conventions.'],
    pitfall: 'Nominal pipe and screen sizes are not always their physical measured diameter. Check the product standard before ordering.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
    scenario: { label: 'Construction conversion guide', href: '/scenarios/construction-unit-converter/' },
  },
  'centimeter-to-inch': {
    title: 'Turning centimetres into inches',
    paragraphs: ['Use this direction for product dimensions, clothing and display sizes, or metric drawings shared with an inch-based market. The result may be shown as a decimal inch or rounded to a familiar fraction when the application permits it.', 'For precise work, retain the decimal result and the original centimetre measurement. Fractions are convenient for reading but can hide tolerance.'],
    pitfall: 'Do not round a metric specification to the nearest inch unless the receiving specification explicitly permits it.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
  },
  'kilogram-to-pound': {
    title: 'Comparing mass without losing context',
    paragraphs: ['Kilograms are the SI mass unit used for shipping, science, and everyday weight in much of the world. Pounds remain common in US retail, recipes, and personal-weight references.', 'When comparing a shipment or product, keep the unit label beside every value. A numeric value without kg or lb is easy to misread.'],
    pitfall: 'Pounds measure mass in everyday use, but engineering documents may distinguish pound-mass from pound-force. Check the document context.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
  },
  'pound-to-kilogram': {
    title: 'Reading pounds in kilograms',
    paragraphs: ['Use pounds to kilograms for body weight, parcel weights, food quantities, and US product specifications. One pound equals exactly 0.45359237 kilograms.', 'For medical, legal, aviation, or regulated shipping work, follow the precision and rounding rule stated by the relevant authority rather than a display preference.'],
    pitfall: 'An ounce is one sixteenth of a pound by mass; a fluid ounce is volume. They cannot be converted directly.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
  },
  'celsius-to-fahrenheit': {
    title: 'Reading Celsius on a Fahrenheit scale',
    paragraphs: ['Celsius and Fahrenheit have different zero points as well as different step sizes. That is why the conversion uses a scale and an offset, not a single multiplier.', 'Useful anchors are 0 °C = 32 °F, 20 °C = 68 °F, and 100 °C = 212 °F at standard pressure.'],
    pitfall: 'Water does not always boil at 100 °C outside standard atmospheric pressure. Altitude and pressure matter for cooking and laboratory work.',
    reference: { label: 'Temperature formulas and reference points', href: '/reference/temperature-formulas/' },
  },
  'fahrenheit-to-celsius': {
    title: 'Reading Fahrenheit on a Celsius scale',
    paragraphs: ['Use this when a weather forecast, oven setting, or equipment manual is written in Fahrenheit but your working reference is Celsius. Subtracting 32 is necessary before applying the five-ninths scale.', 'The two scales meet at −40, an exact crossover that is useful as a quick plausibility check.'],
    pitfall: 'Kelvin is not written with a degree sign and cannot be treated as Fahrenheit or Celsius with a simple ratio.',
    reference: { label: 'Temperature formulas and reference points', href: '/reference/temperature-formulas/' },
  },
  'liter-to-gallon-us': {
    title: 'Comparing litres with US gallons',
    paragraphs: ['Litres are metric volume. US gallons are common in US fuel, containers, and consumer products. This page uses the US gallon, which is exactly 3.785411784 litres.', 'Use a separately labelled Imperial gallon for UK-specific sources. It is larger than a US gallon, so the same number of gallons does not describe the same volume.'],
    pitfall: 'Do not assume “gallon” is universal. Label the regional convention whenever the number is shared.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
  },
  'gallon-us-to-liter': {
    title: 'Reading US gallons in litres',
    paragraphs: ['Convert US gallons to litres when comparing fuel capacity, packaging, or consumption between US and metric sources. The result is a volume conversion, not a fuel-economy comparison.', 'If you are comparing vehicle efficiency, use the MPG to L/100 km guide instead of converting fuel volume alone.'],
    pitfall: 'US liquid gallons and Imperial gallons differ. Confirm the source before using a value for purchasing or logistics.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
  },
  'square-meter-to-square-foot': {
    title: 'Comparing floor area correctly',
    paragraphs: ['Square metres and square feet both measure area. The conversion factor is squared because both sides measure length by length, which makes it much larger than the metre-to-foot factor.', 'Use this for rooms, property listings, flooring, and building plans. Keep the original area unit alongside the converted figure when documents cross regions.'],
    pitfall: 'Do not use a length conversion factor for area. One square metre is not 3.28 square feet; it is about 10.76 square feet.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
    scenario: { label: 'Construction conversion guide', href: '/scenarios/construction-unit-converter/' },
  },
  'square-foot-to-square-meter': {
    title: 'Reading square feet in square metres',
    paragraphs: ['Square feet are common in US property listings and floor plans. Convert to square metres to compare with metric property, flooring, or workspace requirements.', 'Area values should be compared using the same measurement definition. A gross floor area, usable area, and land area can all use square feet but mean different things.'],
    pitfall: 'Do not use the figure alone to infer layout or room size. The shape and definition of the measured area still matter.',
    reference: { label: 'Metric and imperial reference', href: '/reference/metric-imperial/' },
    scenario: { label: 'Construction conversion guide', href: '/scenarios/construction-unit-converter/' },
  },
  'kilobyte-to-kibibyte': {
    title: 'Separating decimal and binary storage',
    paragraphs: ['A kilobyte is 1,000 bytes. A kibibyte is 1,024 bytes. The words sound similar but use different standards, which explains why storage figures can appear inconsistent across devices and software.', 'Use the written symbol as the source of truth: kB or KB is normally decimal; KiB is binary.'],
    pitfall: 'Bits use a lowercase b and bytes use an uppercase B. A network speed and a file size may use different units even when the prefix looks similar.',
    reference: { label: 'KB, KiB, MB and MiB explained', href: '/articles/why-kb-and-kib-are-different/' },
    scenario: { label: 'Data storage conversion guide', href: '/scenarios/data-storage-converter/' },
  },
  'gigabyte-to-gibibyte': {
    title: 'Why a gigabyte is not a gibibyte',
    paragraphs: ['A gigabyte is 1,000,000,000 bytes. A gibibyte is 1,073,741,824 bytes. Storage vendors commonly label capacity in decimal GB, while operating systems may display the binary GiB equivalent.', 'This conversion is useful when comparing a drive, cloud allowance, backup plan, or download against the number shown by a device.'],
    pitfall: 'Do not use GB and GiB interchangeably in a contract, quota, or capacity plan. Write the unit in full.',
    reference: { label: 'KB, KiB, MB and MiB explained', href: '/articles/why-kb-and-kib-are-different/' },
    scenario: { label: 'Data storage conversion guide', href: '/scenarios/data-storage-converter/' },
  },
  'mpg-us-to-liter-per-100km': {
    title: 'Comparing US MPG with L/100 km',
    paragraphs: ['MPG measures distance per fuel, so a larger number is better. L/100 km measures fuel used for a fixed distance, so a smaller number is better. The relationship is reciprocal rather than linear.', 'This page uses US MPG. Use the dedicated MPG-UK option when the source is British or Imperial.'],
    pitfall: 'Never multiply MPG by a fixed number to get L/100 km. Divide the correct constant by the MPG value.',
    reference: { label: 'Fuel economy: reciprocal conversion explained', href: '/articles/how-mpg-converts-to-l-per-100km/' },
    scenario: { label: 'Fuel economy conversion guide', href: '/scenarios/fuel-economy-converter/' },
  },
  'liter-per-100km-to-mpg-us': {
    title: 'Comparing L/100 km with US MPG',
    paragraphs: ['This is the reverse fuel-economy conversion. A smaller L/100 km reading means less fuel is used, while a larger MPG reading means more distance per gallon.', 'For a meaningful ownership estimate, combine the converted efficiency with the local fuel price and expected annual distance.'],
    pitfall: 'US and UK MPG are different because the gallon size is different. Confirm the source before comparing vehicles.',
    reference: { label: 'Fuel economy: reciprocal conversion explained', href: '/articles/how-mpg-converts-to-l-per-100km/' },
    scenario: { label: 'Fuel economy conversion guide', href: '/scenarios/fuel-economy-converter/' },
  },
  'psi-to-bar': {
    title: 'Reading pressure across regions',
    paragraphs: ['PSI is common for tyres, plumbing, and equipment in the United States. Bar and kilopascal are common in many other regions. This conversion changes pressure units only; it does not validate a safe pressure for a device.', 'Use the unit printed by the manufacturer and keep the permitted range with the converted number.'],
    pitfall: 'Gauge pressure and absolute pressure use different zero references. Check which one a manual specifies before comparing values.',
    reference: { label: 'Conversion factors and calculation method', href: '/reference/conversion-factors/' },
  },
  'bar-to-psi': {
    title: 'Reading bar in PSI',
    paragraphs: ['Use this for tyre, compressor, refrigeration, and industrial equipment specifications when the source is written in bar and the receiving instrument shows PSI.', 'If a device displays kPa, it may be clearer to convert bar to kPa first because one bar equals 100 kPa exactly.'],
    pitfall: 'Never choose a pressure setting from a converter alone. Follow the manufacturer, vehicle placard, or governing operating procedure.',
    reference: { label: 'Conversion factors and calculation method', href: '/reference/conversion-factors/' },
  },
};

export function getPriorityConversionGuide(from: string, to: string): PriorityConversionGuide | undefined {
  return guides[`${from}-to-${to}`];
}

export const priorityConversionCount = Object.keys(guides).length;
