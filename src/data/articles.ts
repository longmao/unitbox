// Hand-written article corpus. Each article has a slug, title, description, category, read time, and body (markdown-ish).
// For v0.1, bodies are short but real — better thin pages of substance than thick pages of fluff.

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  body: string;
}

export const articles: Article[] = [
  {
    slug: 'what-is-a-unit',
    title: 'What is a unit? A practical guide',
    description: 'Why every measurement needs a unit, the difference between base and derived units, and why SI exists.',
    category: 'Reference',
    readTime: '6 min',
    body: `A measurement without a unit is meaningless. "This room is 5 long" tells you nothing; "this room is 5 metres long" tells you the door is too narrow to fit a king-sized bed sideways.

A **unit** is a defined, agreed-upon reference quantity used to express the magnitude of a physical property. There are two flavours:

- **Base units** — defined by a standard. Since 2019, the kilogram is defined by fixing the value of Planck's constant. Before that it was an artefact in a vault in Paris.
- **Derived units** — defined as a combination of base units. A newton is kg·m/s². A joule is kg·m²/s².

The SI (Système International) lists seven base units: kilogram, metre, second, ampere, kelvin, mole, candela. Every other unit you see — feet, calories, gigabytes — is either derived from one of these or a cultural/locale-specific variant.

When you convert between two units, you're really expressing the same quantity in two different reference frames. 1 metre and 3.281 feet describe the same length, just scaled by a factor — the conversion factor.

The rest of the articles in this section dig into specific traps: decimal vs binary prefixes for data, the affine mathematics of temperature, and why fuel-economy is the one quantity that flips upside down when you switch between metric and imperial.`,
  },

  {
    slug: 'why-kb-and-kib-are-different',
    title: 'Why KB and KiB are different — and why it matters',
    description: 'Disk drives advertise GB, but your OS reports GiB. This article explains the 1000-vs-1024 divide.',
    category: 'Data',
    readTime: '5 min',
    body: `The short version: **KB = 1000 bytes, KiB = 1024 bytes**. They are not the same.

In 1998, the IEC standardised the binary prefixes precisely to fix the confusion: **KiB, MiB, GiB, TiB, PiB** for 1024-based quantities. **kB, MB, GB, TB, PB** stay SI-compliant at 1000-based.

Why does this matter in practice? Three scenarios:

1. **Disk drives** are advertised in TB (10¹² bytes). Your operating system reports them in TiB (2⁴⁰ bytes), so the same disk appears smaller.
2. **Networking** is measured in **kilobits per second** (kb/s, lowercase b for bits) — 1 kb = 1000 bits. Your download in **MB/s** means megabytes per second — 1 MB = 8 × 1000 = 8000 bits per byte.
3. **RAM** has always been sold and reported in binary GB (GiB formally), so the OS matches.

The "4.7 GB" DVD is actually 4.7 GB in SI bytes, which equals about 4.38 GiB. A "1 TB" SSD is about 0.91 TiB.

If you want to compare properly, use the converters on this site. They handle both decimal and binary prefixes correctly.`,
  },

  {
    slug: 'metric-vs-imperial',
    title: 'Metric vs Imperial: which countries still use imperial?',
    description: 'A quick map of who uses which — and where metric beats imperial at scale.',
    category: 'Length',
    readTime: '4 min',
    body: `Out of 195 countries, only **3** formally use the imperial / US customary system for everyday life: the **United States**, **Liberia**, and **Myanmar**.

The UK uses a confusing hybrid: road signs in miles, beer in pints, milk in litres, body weight in stones, and distances in metric at the supermarket. Canada is mostly metric but legally mandates imperial for some products (milk in quarts).

The metric system has two structural advantages:

1. **Powers of ten**. 1 km = 10³ m. 1 cm = 10⁻² m. No one has to remember 12 inches in a foot, 3 feet in a yard, 5,280 feet in a mile.
2. **Unique prefixes**. "kilo", "mega", "giga" mean the same thing everywhere — across mass, length, time, voltage, data, anything.

Imperial's redeeming feature is inertia: switching systems costs money and training, and the US has billions of dollars of road signs and recipes in inches and cups.

If you're converting frequently — say, working with international clients — a converter like the one on this site is faster than mental arithmetic, especially at scale (e.g. square footage to square metres).`,
  },

  {
    slug: 'celsius-to-fahrenheit-explained',
    title: 'Celsius to Fahrenheit explained — the formula and the intuition',
    description: 'F = C × 9/5 + 32. Here is why that formula is what it is.',
    category: 'Temperature',
    readTime: '4 min',
    body: `The formula to convert Celsius to Fahrenheit is:

$$ F = C \\times \\frac{9}{5} + 32 $$

The two terms do separate jobs:

- **9/5** is the **scale factor** — Fahrenheit degrees are smaller. 1 °C spans 1.8 °F. (Celsius inherited the 0°/100° anchor from the freezing/boiling points of water at standard pressure; Fahrenheit inherited his scale from ice-water / human-body temperature.)
- **+32** is the **offset** — at the freezing point of water, Celsius says 0, Fahrenheit says 32.

To go the other way:

$$ C = (F - 32) \\times \\frac{5}{9} $$

If you're a scientist, use **kelvin**. The kelvin scale has the same size as Celsius but starts at absolute zero (−273.15 °C). You can convert with:

$$ K = C + 273.15 $$

The reason the conversion has an *offset* and not just a scale is that temperature is an **affine** quantity: the zero points differ. Compare to mass, where "0 kg" actually means zero matter, and the conversion is just a multiplicative factor. (Hence "linear" units and "affine" units appear separately on this site.)`,
  },

  {
    slug: 'what-is-a-knot',
    title: 'What is a knot, and where did it come from?',
    description: 'A nautical mile per hour, measured by counting knots in a rope.',
    category: 'Speed',
    readTime: '3 min',
    body: `A **knot** is a speed of one nautical mile per hour. The name comes from an old sailing trick: a chip log — a wooden board tied to a long rope with knots tied at fixed intervals — was tossed overboard. Sailors counted how many knots played out in 30 seconds, and the count gave speed in nautical miles per hour.

A **nautical mile** is 1,852 metres (originally one minute of latitude along any meridian). That makes it convenient for navigation: 1 knot ≈ 1 minute of latitude per hour, and you can read your position directly off a chart.

Today, knots are used for:

- **Marine navigation** — boats, ships, sea state forecasts.
- **Aviation** — air traffic control, flight plans. Most airlines display airspeed in knots on the cockpit displays, even though passengers see km/h on the seat-back screen.

Converting knots to mph: 1 kn = 1.15078 mph. To km/h: 1 kn = 1.852 km/h. To m/s: 1 kn = 0.5144 m/s. The conversion page ([knot to mph](/knot-to-mile-per-hour)) gives instant values across 6 units.`,
  },

  {
    slug: 'why-29-days-in-february',
    title: 'Why 29 days in February? The Roman calendar mess',
    description: 'From Numa to Caesar to the Gregorian reform — and why this means "year to day" conversions have caveats.',
    category: 'Time',
    readTime: '4 min',
    body: `Converting years to days is tricky, and the reason is historical.

The Roman calendar (legend: Romulus, 8th-century BC) had 10 months, 304 days. February was added later by King Numa Pompilius, who also introduced January.

To make the year align with the lunar cycle (12 × 29.5 ≈ 354 days), Romans added a leap month every few years. Caesar's reform made the year exactly 365 days with a leap day every 4 years. Augustus refined it.

The result: a **calendar year** is **365 days** (or 366 in a leap year). A **Julian year** is fixed at **365.25 days**. A **tropical year** (the time for the sun to return to the same equinox) is **365.2422 days**.

When you see "year to day" on this site, we use the **Julian year** (365.25 days, exactly 31,557,600 seconds). It's the SI standard. It's also why the same conversion gives 365.25 days, but if you typed "how many days in 2026" you'd get a real-world answer of 365.

For most purposes the difference (0.0078 days per year ≈ 11 minutes) is irrelevant. For leap-second calculation, satellite trajectories, and historical chronology, it isn't.`,
  },

  {
    slug: 'how-pressure-measurement-evolved',
    title: 'How pressure measurement evolved — from Torricelli to psi',
    description: 'Why psi and kPa and bar are all 1 atm apart by design.',
    category: 'Pressure',
    readTime: '5 min',
    body: `In 1643, Evangelista Torricelli inverted a mercury-filled tube over a dish, and **the column stayed at 760 mm**. He had invented the barometer, and 760 mmHg became a unit of pressure.

A century later, **pascals** (Pa) were defined: 1 Pa = 1 N/m². Atmospheric pressure is 101,325 Pa. Pressure units proliferated because every industry picked one:

- **Meteorology** uses millibars (mbar) or hectopascals (hPa) — they're the same thing, 100 Pa each.
- **Tire pressure** in the US: PSI (pounds per square inch). In Europe: bar, or kPa.
- **Aviation** uses inches of mercury and hectopascals on altimeters.
- **Diving** uses bar.
- **Refrigeration and HVAC** use psi in the US and bar in Europe.
- **Vacuum physics** uses torr (= 1 mmHg, exactly).

The factors relating them all derive from the SI definition, plus a few historical accidents like 14.696 psi = 1 atm.

The site lets you type "30 psi" and see it's ~2.07 bar, or type "1 atm" and see 14.696 psi. The math is independent of which you start with.`,
  },

  {
    slug: 'joule-vs-calorie-vs-kwh',
    title: 'Joule vs calorie vs kWh — which energy unit wins?',
    description: 'Why your electric bill uses kWh, your food label uses kcal, and your physics class uses joules.',
    category: 'Energy',
    readTime: '5 min',
    body: `Three families of energy units dominate ordinary life, and they all measure the same thing:

- **Joules** (J) — the SI unit. 1 J = 1 N·m. Used in physics, chemistry, electricity.
- **Calories** (cal) — the energy to heat 1 g of water by 1 °C. Used on food labels (where it's labelled "Calorie" but actually kilocalorie, kcal).
- **Kilowatt-hours** (kWh) — the energy of 1 kW sustained for 1 hour. Used on electricity bills.

Conversions:

- 1 cal = 4.184 J
- 1 kcal = 4,184 J (or 4.184 kJ)
- 1 kWh = 3.6 × 10⁶ J = 3.6 MJ
- 1 BTU (British Thermal Unit) ≈ 1,055 J

The food calorie makes sense historically: a calorimeter literally measured how much heat food released when burned. The joule makes sense because energy and work are the same thing in physics. The kWh makes sense because electricity is sold as power × time.

If you're comparing foods across regions, a US label reads "250 kcal" and a European one reads "1,046 kJ". Same number, different unit — same energy. The site lets you pick any combination.`,
  },

  {
    slug: 'angle-units-when-to-use-what',
    title: 'Radians, degrees, and gradians — when to use which',
    description: 'Why radians are the only honest angle for math, and why gradians exist for surveyors.',
    category: 'Angle',
    readTime: '4 min',
    body: `Three systems. They all measure the same physical quantity — the angle between two intersecting lines or the rotation of a body.

- **Degrees (°)** — 360 per full turn. Origin: Babylonian base-60 counting; 360 days in a year. Most familiar.
- **Radians (rad)** — 2π per full turn. The "natural" unit for calculus: sin'(x) = cos(x) only if x is in radians. The SI standard.
- **Gradians (gon / grad)** — 400 per full turn. Each right angle is exactly 100. Used in surveying because right-angle = 100 makes the math integer-clean.

Conversions:

$$ \\text{rad} = \\text{°} \\times \\frac{\\pi}{180} $$
$$ \\text{°} = \\text{rad} \\times \\frac{180}{\\pi} $$
$$ \\text{gon} = \\text{°} \\times \\frac{10}{9} $$$

Sub-units exist for astronomy:

- 1° = 60 arcminutes (′)
- 1′ = 60 arcseconds (″)

A quarter at 50 km distance subtends about 1.4 milliarcseconds (the size of a coin seen from 4,000 km). That's how precision telescope pointing works.

For your day-to-day (compass, slice of pizza, turn of a steering wheel), degrees are fine. For math, use radians. For civil engineering, gradians. The site supports all of them.`,
  },

  {
    slug: 'how-mpg-converts-to-l-per-100km',
    title: 'How MPG converts to L/100 km — and why the math is reciprocal',
    description: 'Fuel economy is the one quantity where "higher is better" turns into "lower is better" depending on unit.',
    category: 'Fuel Economy',
    readTime: '4 min',
    body: `MPG (miles per gallon) measures **distance per unit fuel**. "Higher is better" — a car that gets 40 MPG uses less fuel than one that gets 20 MPG for the same journey.

L/100 km measures **fuel per 100 distance**. "Lower is better" — 5 L/100km beats 10 L/100km.

The two are reciprocals. Going from one to the other means a division by the value (not a multiply), plus a unit conversion on both sides.

**MPG (US) → L/100 km:**

$$ \\frac{L}{100\\,km} = \\frac{235.214}{MPG} $$

So 30 MPG = 7.84 L/100 km. 40 MPG = 5.88. 50 MPG = 4.70.

**L/100 km → MPG (US):**

$$ MPG = \\frac{235.214}{L/100\\,km} $$

So 6 L/100km = 39.2 MPG. 8 L/100km = 29.4 MPG.

The **235.214** constant is **(US-gallon-in-litres × 100) ÷ mile-in-km** = (3.785 × 100) ÷ 1.609. For imperial (UK) gallons, use **282.481** instead because the UK gallon is bigger (4.546 L).

If you only remember one thing: **the conversion is "235 over your number", not "multiply by 0.425".** The latter is the trap.`,
  },

  {
    slug: 'square-vs-cubic-units',
    title: 'Square vs cubic units — and why you can\'t directly convert',
    description: 'Square metres to square feet is a factor. Square metres to cubic metres is nonsense.',
    category: 'Reference',
    readTime: '3 min',
    body: `A square metre is a unit of **area** — 1 m × 1 m. A cubic metre is a unit of **volume** — 1 m × 1 m × 1 m.

Converting **square metres to square feet** is fine: 1 m² ≈ 10.764 ft². Same dimension (length²), just two reference frames.

Converting **square metres to cubic metres** is meaningless. They'd be related only if you had a third piece of information — like the depth, in metres. Then:

$$ \\text{volume} = \\text{area} \\times \\text{depth} $$

Same goes for feet vs feet³: dimensions matter.

The trap that catches people: a "60×40" room can be measured in m or ft for either dimension, but the resulting *area* is m² (or ft²), and you can't compare 2,400 m² with 2,400 ft³. The unit on the right of the slash matters.

This site only converts **within** a dimension (length↔length, area↔area, volume↔volume). It will refuse to convert cross-dimension pairs. If you find a request that looks like it would cross dimensions, that's the reason.`,
  },

  {
    slug: 'why-we-need-si',
    title: 'Why we need SI — and what it would cost to abolish it',
    description: 'A short history of measurement, the French Revolution, and the modern standards regime.',
    category: 'Reference',
    readTime: '5 min',
    body: `Before the **metric system** was forced on France in 1795, every region had its own units. An "aune" in Alsace was different from an "aune" in Lyon. The 18th-century astronomer Jean Picard proposed a universal unit based on a pendulum, but it wasn't politically feasible until after the revolution.

Napoleon spread the metric system across Europe. The result was the metre, the gram, and eventually the litre (and second, mole, candela, kelvin, ampere).

The **SI** system was codified in 1960 by the Bureau International des Poids et Mesures (BIPM). Since 2019, **all seven base units** are defined by physical constants:

- Kilogram — Planck's constant
- Metre — speed of light
- Second — hyperfine transition of cesium-133
- Ampere — elementary charge
- Kelvin — Boltzmann constant
- Mole — Avogadro constant
- Candela — luminous efficacy of 540 THz radiation

This means a kilogram in Paris is the same as one in Beijing. The standard doesn't depend on an artefact that could be destroyed. A future civilisation could re-derive the kilogram from the definition, even if every physical reference was lost.

Most countries now use SI for science, industry, and trade. The US is the major outlier.`,
  },

  {
    slug: 'time-vs-period-vs-duration',
    title: 'Second, minute, hour, day — clean conversions and 1 tricky case',
    description: 'Everything in the time category converts trivially except month-year boundaries.',
    category: 'Time',
    readTime: '3 min',
    body: `Within the SI time category, every conversion is exact:

- 1 s = 1000 ms = 1,000,000 μs = 1,000,000,000 ns
- 1 min = 60 s
- 1 h = 3600 s
- 1 d = 86,400 s
- 1 wk = 604,800 s
- 1 fortnight = 1,209,600 s (= 2 weeks)

The two units where the conversion is **not** exact:

- **Month**: 28–31 days depending on the calendar month and year.
- **Year**: 365 (non-leap), 366 (leap), 365.25 (Julian), 365.2422 (tropical), 365.2425 (Gregorian average).

This site picks the **Julian year** (365.25 days, 31,557,600 s) for consistency. Calendar months and years are not in our table because they aren't well-defined units — they're calendar periods.

For most practical use this is irrelevant. The interesting exceptions are: leap-year handling in billing (some subscription services charge 1/365 vs 1/366 depending on date), broadcast media scheduling, and pregnancy/maternity arithmetic (40 weeks ≈ 9 calendar months ± a few days).`,
  },
];
