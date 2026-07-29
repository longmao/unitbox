// Learn page corpus — short educational topics tied to the conversion network.
// Each topic links to related pair and unit pages.

export interface LearnTopic {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  body: string;
  relatedPairs?: string[];
  relatedUnits?: string[];
}

export const learnTopics: LearnTopic[] = [
  {
    slug: 'metric-system-explained',
    title: 'The metric system explained — and why it works',
    description: 'A short tour of the metric (SI) system, its base units, prefixes, and why it has conquered most of the world.',
    category: 'Fundamentals',
    readTime: '6 min',
    body: `The metric system was the first deliberately decimalised measurement system in modern history. Everything is built around three principles:

**1. Powers of ten.** Every relationship between units is a power of ten. 1 kilometre = 10³ metres. 1 centimetre = 10⁻² metres. You never have to remember that 1 mile = 5,280 feet = 1,760 yards.

**2. Distinct prefixes for distinct scales.** kilo, mega, giga, tera for big things. milli, micro, nano, pico for small things. The same prefix works across units (kilogram, kilometre, kilobyte).

**3. Universal base units.** The 7 base units are defined by physical constants, not artefacts. Since 2019 the kilogram is defined by fixing Planck's constant — there's no prototype in a vault.

The system was developed during the French Revolution (1795) and refined through the 19th century. **SI** (Système International d'Unités) was formalised in 1960 by the Bureau International des Poids et Mesures.

### Why the US hasn't converted

Three countries still use non-metric measurement in everyday life: the United States, Liberia, and Myanmar. The UK uses a hybrid (miles for road signs, kilograms for vegetables). The cost of converting every road sign in a country of 4 million miles of roads is non-trivial — the US has debated it several times and the legislation has never passed.

### What this site uses

We organise units by category. Each category has an SI base: metre (length), kilogram (mass), kelvin (temperature), etc. Most conversions factor through this base. Temperature is the exception: it's **affine**, meaning there's an offset on top of a scale change.`,
    relatedPairs: ['meter-to-foot', 'kilogram-to-pound', 'celsius-to-fahrenheit', 'gallon-us-to-liter'],
  },

  {
    slug: 'decimal-vs-binary-prefixes',
    title: 'Decimal vs binary prefixes (KB vs KiB, MB vs MiB)',
    description: 'Why a "1 TB" drive is not 1,024 GB, and what the IEC binary prefixes fixed in 1998.',
    category: 'Data',
    readTime: '5 min',
    body: `There's a long-standing mess in computing: **KB** is sometimes 1000 bytes, sometimes 1024 bytes. The mess is so pervasive that the IEC standardised the binary prefixes in 1998 to disambiguate them.

### The decimal prefix (SI)

These follow the standard SI decimal naming:

- **kB** = 10³ = 1000 bytes
- **MB** = 10⁶ = 1,000,000 bytes
- **GB** = 10⁹ = 1,000,000,000 bytes
- **TB** = 10¹² = 1,000,000,000,000 bytes

### The binary prefix (IEC, 1998)

These were introduced to mean **2^n**:

- **KiB** = 2¹⁰ = 1024 bytes (kibi**byte**)
- **MiB** = 2²⁰ = 1,048,576 bytes (mebi**byte**)
- **GiB** = 2³⁰ = 1,073,741,824 bytes (gibi**byte**)
- **TiB** = 2⁴⁰ = 1,099,511,627,776 bytes (tebi**byte**)

### Which to use

- **Disk drives** advertise **GB** (decimal). A "1 TB" drive is 1,000,000,000,000 bytes; your operating system reports it in **TiB** (~931 GiB), which makes it look smaller than the box promised.
- **RAM** has always been sold in binary GB (now GiB formally), so the operating system matches.
- **Networking speeds** use **kb/s** (kilobit per second) — that's 1000 bits, and there are 8 bits in a byte, so 1 Mbps = 125 KB/s.
- **Data-transfer utilities** historically use binary prefixes. A file of "1 MB" reported by a downloader might mean 1,000,000 bytes (decimal) or 1,048,576 bytes (binary) depending on the tool.

### Practical recommendation

When you want accuracy, treat **KB = 1000 bytes** (decimal) and **KiB = 1024 bytes** (binary). The site lets you convert between both systems explicitly.`,
    relatedPairs: ['byte-to-kilobyte', 'kilobyte-to-kibibyte', 'megabyte-to-mebibyte', 'gigabyte-to-megabyte', 'terabyte-to-gigabyte', 'kbps-to-byte'],
  },

  {
    slug: 'temperature-scales-explained',
    title: 'Temperature scales explained — and why the conversion is affine',
    description: 'Celsius, Fahrenheit, Kelvin, Rankine, Réaumur. The first three are common; the last two are special-purpose.',
    category: 'Temperature',
    readTime: '5 min',
    body: `Five scales appear on this site. They all measure the same physical quantity, but their reference points differ.

### Celsius (°C)

The most common worldwide, used by every country except the US.

- 0 °C = freezing point of water (at 1 atm)
- 100 °C = boiling point of water (at 1 atm)
- same *size* as the kelvin

### Fahrenheit (°F)

Used in the US for weather, cooking, body temperature.

- 32 °F = freezing point of water
- 212 °F = boiling point of water
- size is smaller (180 °F span water-ice to water-boil)

### Kelvin (K)

The SI base. Same size as Celsius, but **0 K = absolute zero** (−273.15 °C). This is the scale used in physics, chemistry, and engineering where negative temperatures don't make sense.

### Rankine (°R) and Réaumur (°Ré)

Rankine is Fahrenheit-size, but starting at absolute zero (0 °R = −459.67 °F). Used in some US engineering disciplines (thermodynamics in particular). Réaumur was used historically for cheese-making and is making a small comeback in some European artisan contexts: 0 °Ré = freezing, 80 °Ré = boiling.

### The conversion math

Temperature is **affine** — it's not just a multiplier; it's a multiplier **plus** an offset. To go from Celsius to Fahrenheit:

$$ F = C \\times \\frac{9}{5} + 32 $$

That term +32 is the offset (the zero points differ). You can't convert temperature correctly with a single multiplication factor.

Convert on this site: [celsius to fahrenheit](/celsius-to-fahrenheit).`,
    relatedPairs: ['celsius-to-fahrenheit', 'fahrenheit-to-celsius', 'celsius-to-kelvin', 'kelvin-to-celsius', 'fahrenheit-to-kelvin', 'rankine-to-celsius', 'reaumur-to-celsius'],
  },

  {
    slug: 'why-fuel-economy-is-different',
    title: 'Why fuel-economy conversion is reciprocal, not linear',
    description: 'MPG and L/100km measure the same thing, but the conversion passes through an inverse. Here is why.',
    category: 'Fuel Economy',
    readTime: '4 min',
    body: `Almost every conversion on this site multiplies by a factor and maybe adds an offset. Fuel economy is the exception — it's **reciprocal**: the conversion divides by your number, not multiplies.

### Two formulations, one quantity

- **Distance per fuel** — MPG, km/L. "Higher is better."
- **Fuel per distance** — L/100km, GPM. "Lower is better."

The same number, different framing. Going from one to the other means dividing through the value, not multiplying.

### The constants

The conversion goes through the SI: distance in km, volume in L.

- 1 US gallon = 3.785411784 L
- 1 mile = 1.609344 km

So 1 mile per (US) gallon = 1.609344 km / 3.785411784 L = 0.42514 km/L. Inverting, 1 km/L = 2.35214583 MPG (US).

A faster formula:

$$ \\frac{L}{100\\,km} = \\frac{235.214583}{MPG} $$

**235.214583** = (gallon-in-litres × 100) ÷ mile-in-km. For imperial (UK) gallons, use **282.481** because the UK gallon is bigger (4.546 L).

### Sample values

- 30 MPG (US) = 7.84 L/100km
- 40 MPG (US) = 5.88 L/100km
- 50 MPG (US) = 4.70 L/100km
- 6 L/100km = 39.2 MPG (US)

### Sources of confusion

American car reviews cite MPG; European ones cite L/100km; UK reviews sometimes use imperial MPG (≈ 1.2 × US MPG). The site keeps all three as separate units so you can convert in any direction.`,
    relatedPairs: ['mpg-us-to-liter-per-100km', 'liter-per-100km-to-mpg-us', 'mpg-uk-to-liter-per-100km', 'liter-per-100km-to-mpg-uk', 'km-per-liter-to-liter-per-100km'],
  },

  {
    slug: 'length-units-beyond-the-meter',
    title: 'Length units beyond the metre — light-years, ångströms, and nautical miles',
    description: 'Why some length units live in physics and astronomy, not in everyday conversation.',
    category: 'Length',
    readTime: '4 min',
    body: `The SI defines exactly one length unit: the **metre**. Everything else is either a metric prefix (km, cm, mm), an old non-metric unit (mile, foot, inch), or a special-purpose unit designed for a specific context.

### Three special-purpose length units

**Light-year (ly)**: distance light travels in one Julian year. About 9.46 × 10¹⁵ metres, or roughly 63,000 AU, or about 0.31 parsecs. Used in astronomy for the distances to stars and galaxies. There are no everyday uses.

**Nautical mile (nmi)**: 1,852 metres, originally defined as one minute of latitude along any meridian. The corresponding speed unit is the **knot**. Marine navigation and aviation both use nautical miles because they map cleanly to the latitude/longitude grid.

**Ångström (Å)**: 10⁻¹⁰ metres (0.1 nm). Used in spectroscopy and crystallography — visible light wavelengths are on the order of 4,000–7,000 Å. Modern spectroscopy often uses nm, but published atomic tables often use Å.

### Why these three over something else?

Three is the right answer because:

- Astronomers need a unit that doesn't make every day-count completely unwieldy. Saying "4 light-years to Proxima Centauri" beats "38,000,000,000,000,000 metres".
- Navigators need a unit tied to the Earth coordinate grid so charts work directly.
- Spectroscopists need a unit tied to the size of an atom so tables of atomic lines have integer-ish numbers.

### Conversions

- 1 light-year = 9.4607 × 10¹⁵ m
- 1 nautical mile = 1,852 m
- 1 ångström = 10⁻¹⁰ m

The site lists all three plus the usual metric prefixes.`,
    relatedPairs: ['light-year-to-meter', 'meter-to-light-year', 'nautical-mile-to-kilometer', 'kilometer-to-nautical-mile', 'angstrom-to-nanometer', 'nanometer-to-angstrom'],
  },

  {
    slug: 'energy-units-and-power',
    title: 'Energy units vs power — why BTU/hour and watt are different',
    description: 'Watt is a power unit, watt-hour is an energy unit. The h matters.',
    category: 'Energy',
    readTime: '4 min',
    body: `One of the most common conversion traps: confusing **power** (rate of energy use) with **energy** (total work done). Watt (W) is power. Watt-hour (Wh) is energy.

### The relation

$$ \\text{energy} = \\text{power} \\times \\text{time} $$

A 100 W light bulb running for 10 hours uses 1,000 Wh (or 1 kWh) of energy. A 1,000 W microwave running for 1 minute uses about 17 Wh.

### Why BTU/hour exists

The BTU was defined first (British thermal unit, ~1,055 J). When HVAC engineers needed a power unit, they took BTU/hour instead of converting everything to watts. The result: two parallel worlds.

- 1 watt ≈ 3.412 BTU/hour
- 1 BTU/hour ≈ 0.293 watts

When you see "BTU" alone, it's usually energy. When you see "BTU/hour", it's power (a rate of use, useful for sizing an air conditioner).

### What to use when

- **Home energy bills**: kWh (kilowatt-hour).
- **Food labels**: kcal (kilocalorie, sometimes written as "Calorie" with a capital C).
- **HVAC sizing**: BTU/hour for cooling capacity; tons of refrigeration (12,000 BTU/hour ≈ 3.5 kW).
- **Physics / chemistry**: joules (J) or kilojoules (kJ).
- **Engines, motor torque**: horsepower (1 hp ≈ 746 W) or foot-pound.

The site lists energy units only (joule, calorie, kWh, BTU, etc.) — power units (watt, horsepower) are a separate family.`,
    relatedPairs: ['joule-to-calorie', 'calorie-to-joule', 'kilowatt-hour-to-btu', 'btu-to-kilowatt-hour', 'kilocalorie-to-kilojoule', 'joule-to-electronvolt'],
  },

  {
    slug: 'si-base-units-overview',
    title: 'The 7 SI base units — what they are and how they are defined',
    description: 'A quick reference to the seven base units of the International System of Units.',
    category: 'Fundamentals',
    readTime: '5 min',
    body: `The modern metric system has **seven base units**. Every other unit you encounter is either one of these (with a prefix) or derived from them.

### The seven

| Quantity | Unit | Symbol | Defined by (since 2019) |
|---|---|---|---|
| Length | metre | m | speed of light in vacuum |
| Mass | kilogram | kg | Planck constant |
| Time | second | s | cesium-133 hyperfine transition |
| Electric current | ampere | A | elementary charge |
| Temperature | kelvin | K | Boltzmann constant |
| Amount of substance | mole | mol | Avogadro constant |
| Luminous intensity | candela | cd | luminous efficacy of 540 THz radiation |

### Why the change in 2019

Before 2019, the kilogram was defined as the mass of the International Prototype Kilogram — a platinum-iridium cylinder stored in a vault in Sèvres, France. Every other country's kilogram had to be measured against it. The cylinder was slowly losing mass relative to its copies, which is a fun but unsustainable definition.

After 2019, the kilogram is defined by fixing Planck's constant **h** = 6.62607015 × 10⁻³⁴ kg·m²/s. This means the definition is reproducible in any well-equipped metrology lab, anywhere, forever.

### Derived units you'll use

Almost all the units on this site are derived:

- 1 newton = 1 kg·m/s²
- 1 joule = 1 kg·m²/s²
- 1 watt = 1 kg·m²/s³
- 1 pascal = 1 kg/(m·s²)
- 1 hertz = 1/s

### Practical implication

If you ever argue with someone about whether grams or kilograms are the "real" unit: the kilogram is base. The gram is a prefix-altered version (1 g = 10⁻³ kg).

The site uses the correct base in every category, so 1 m = 1, 1 kg = 1, 1 s = 1. Conversions away from the base are multiplicative factors.`,
    relatedPairs: ['meter-to-foot', 'kilogram-to-pound', 'celsius-to-kelvin', 'hour-to-second'],
  },

  {
    slug: 'understanding-pressure-units',
    title: 'Pressure units — psi, bar, atm, pascal, torr',
    description: 'Why every industry has its own pressure unit and how to translate between them.',
    category: 'Pressure',
    readTime: '4 min',
    body: `Pressure has the largest variety of common units of any physical quantity on this site. That's because pressure matters in many industries, and each picked its favourite.

### The SI base

The SI unit is the **pascal** (Pa), which is 1 newton per square metre. Atmospheric pressure is 101,325 Pa.

### Practical units

- **bar**: 100,000 Pa. Diving, hydraulics, brewing.
- **psi** (pounds per square inch): 6,894.76 Pa. US tire pressure, plumbing.
- **atm** (atmosphere): 101,325 Pa. Old physics default, still used in chemistry ("Standard Temperature and Pressure").
- **mmHg** (millimetres of mercury): 133.322 Pa. Medical blood pressure.
- **torr**: 1 mmHg exactly. Vacuum science; named after Torricelli.
- **mbar** (millibar): 100 Pa. Meteorology and altimeters.

### A useful comparison

| Unit | Pa | A car tire? |
|---|---|---|
| pascal (Pa) | 1 | no — too small |
| kilopascal (kPa) | 1,000 | 220 kPa = 32 psi (typical car) |
| bar | 100,000 | 2.2 bar = 32 psi |
| psi | 6,894.76 | 32 psi = 220 kPa |
| atm | 101,325 | 2.17 atm = 32 psi |

### Why each unit exists

- **bar** was invented by Norwegian meteorologist Vilhelm Bjerknes in 1909 because the millibar was a clean unit for atmospheric data.
- **atm** is the natural unit if you think in terms of "what fraction of an atmosphere".
- **psi** sticks around because US engineering was built on inch-pound-second units (before SI was complete).
- **mmHg** is still in medical practice because the sphygmomanometer literally uses a column of mercury.

### Which do you need?

If you're in the US measuring a tire, psi. In Europe, bar. In aviation, kPa or inHg. For scientific work, Pa. For blood pressure, mmHg. The site lets you convert any of these to any other.`,
    relatedPairs: ['psi-to-bar', 'bar-to-psi', 'pascal-to-bar', 'atm-to-pascal', 'torr-to-pascal', 'mmhg-to-kilopascal', 'kilopascal-to-psi'],
  },
];
