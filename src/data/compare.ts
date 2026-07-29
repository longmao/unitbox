// Comparison pages — side-by-side analysis of two conversion pair options.
// Each entry renders the same template (compare/[...slug].astro).
// Slug format: "<topic-slug>".

export interface CompareTopic {
  slug: string;
  title: string;
  description: string;
  category: string;
  pairA: { from: string; to: string; url: string; summary: string };
  pairB: { from: string; to: string; url: string; summary: string };
  body: string;
  /** When to pick A vs B */
  verdict: { pickA: string; pickB: string };
}

export const compareTopics: CompareTopic[] = [
  {
    slug: 'kb-vs-kib',
    title: 'KB vs KiB — what\'s the difference?',
    description: 'A side-by-side look at the decimal (KB) and binary (KiB) interpretations of "kilobyte".',
    category: 'Data',
    pairA: { from: 'kilobyte', to: 'byte', url: 'kilobyte-to-byte', summary: '1 kB = 1,000 bytes (SI decimal prefix)' },
    pairB: { from: 'kibibyte', to: 'byte', url: 'kibibyte-to-byte', summary: '1 KiB = 1,024 bytes (IEC binary prefix)' },
    body: `**KB (kilobyte)** is the SI decimal interpretation: 1,000 bytes. **KiB (kibibyte)** is the IEC binary interpretation: 1,024 bytes (2¹⁰).

The decimal interpretation is the standard one for SI prefixes: kilo, mega, giga mean ×1000, ×10⁶, ×10⁹ respectively. Disk drive manufacturers use this.

The binary interpretation predated the distinction. When memory and disk were both small, no one cared about the 2.4% discrepancy. As storage grew, the gap compounded:
- a 1 TB disk (10¹² bytes) reports as 931 GiB.
- a "1.44 MB" floppy was 1.44 × 1,000,000 = 1,440,000 bytes but the system actually gave you 1,474,560 bytes — 1.44 MiB with the binary definition.

In 1998 the IEC standardised KiB, MiB, GiB, TiB, PiB to remove the ambiguity. Most operating systems picked a side: Windows displays binary (GiB labelled "GB"); macOS displays decimal (GB labelled "GB").`,
    verdict: { pickA: 'Use KB when talking about disk drives, file sizes on macOS, and network speeds.', pickB: 'Use KiB when talking about RAM, OS-reported file sizes on Windows, or precise memory arithmetic.' },
  },

  {
    slug: 'celsius-vs-kelvin',
    title: 'Celsius vs Kelvin — which temperature scale is "correct"?',
    description: 'Same size, different zero. When to use Kelvin and when Celsius is fine.',
    category: 'Temperature',
    pairA: { from: 'celsius', to: 'kelvin', url: 'celsius-to-kelvin', summary: 'Celsius is the everyday scale for weather, cooking, body temperature' },
    pairB: { from: 'kelvin', to: 'celsius', url: 'kelvin-to-celsius', summary: 'Kelvin is the SI base; absolute zero at 0 K' },
    body: `Both scales are the **same size** (1 K = 1 °C in magnitude). They differ only in their zero point.

- 0 °C = 273.15 K (freezing point of water)
- 0 K = absolute zero (−273.15 °C, where atomic motion stops)

**When to use Celsius:** weather, cooking, body temperature, swimming-pool temperatures, and any context where you'll see negative numbers in extreme cases but never need to compare to fundamental physics.

**When to use Kelvin:** thermodynamics, gas law calculations (PV = nRT), astronomical temperatures (the Sun is 5,778 K, not 5,505 °C), LED colour temperature, cryogenics.

The formula K = °C + 273.15 is exact. The reverse °C = K − 273.15 is exact. The two scales differ by exactly 273.15 everywhere.

The shift isn't a "translation" in the linguistic sense — it's an offset that's added (or subtracted) consistently. Hence temperature is an **affine** quantity on this site: the conversion is linear with an offset, not just multiplicative.`,
    verdict: { pickA: 'Use Celsius for everyday temperature, weather, cooking, body temperature.', pickB: 'Use Kelvin for physics, chemistry, gas law calculations, and astronomical temperatures.' },
  },

  {
    slug: 'us-vs-uk-gallon',
    title: 'US vs UK gallon — they\'re not the same',
    description: 'Why a US gallon and a UK (imperial) gallon differ by 20%, and how to tell which one you have.',
    category: 'Volume',
    pairA: { from: 'gallon-us', to: 'liter', url: 'gallon-us-to-liter', summary: '1 US gallon = 3.785 L (231 in³)' },
    pairB: { from: 'gallon-uk', to: 'liter', url: 'gallon-uk-to-liter', summary: '1 UK gallon = 4.546 L (277.42 in³)' },
    body: `A **US gallon** is **3.785411784 L** (231 cubic inches). The **UK (imperial) gallon** is **4.54609 L** (about 277.42 cubic inches). That's a 20% difference — not a rounding error.

Which one to use depends on where the product is sold:

- **US**: petrol, milk, paint. Fuel economy typically quoted in MPG (US).
- **UK**: pre-1985 petrol was sold in imperial gallons. After 1985, fuel switched to litres, but road economy is sometimes still quoted as "MPG (UK)" to keep the legacy.
- **Canadian**: petrol in litres by law since 1979. Some legacy products (milk in Ontario) still appear in imperial but this is rare.

Traps:

- Recipes from US cookbooks use US gallons or cups. UK recipes use metric. **Don't assume they're the same.**
- Vehicle fuel economy quoted in the US is **MPG (US)**, while UK motor magazines still occasionally use "MPG (UK)". They differ by 20%.
- Older UK car manuals (pre-1985) assumed imperial gallons.

The site lists both gallons as distinct units. Convert either to litres, or to each other ([gallon-us to gallon-uk](gallon-us-to-gallon-uk) = 0.8327 imperial gallons, or 1 imperial = 1.201 US gallons).`,
    verdict: { pickA: 'Use the US gallon when the data or product is from the US (petrol, milk in US packaging, recipes).', pickB: 'Use the UK gallon for UK imperial units, heritage recipes, and UK-spec car efficiency.' },
  },

  {
    slug: 'miles-vs-kilometres',
    title: 'Miles vs kilometres — the global distance standoff',
    description: 'Why two units of distance have coexisted for centuries, and which one you should expect to see.',
    category: 'Length',
    pairA: { from: 'mile', to: 'kilometer', url: 'mile-to-kilometer', summary: '1 mile = 1.609 km (US + UK road distances)' },
    pairB: { from: 'kilometer', to: 'mile', url: 'kilometer-to-mile', summary: '1 km = 0.621 miles (everywhere else)' },
    body: `The metric system has been legal for road measurement in the UK since 1897 — but road signs are still in miles (deliberately, by act of Parliament in 1983). The US has debated conversion multiple times and never passed legislation.

| Use | Most common unit |
|---|---|
| US road sign | mile |
| US highway speed limit | mph |
| UK road sign | mile |
| UK car speedometer | both |
| EU road sign | km |
| Japan road sign | km |
| Running event | km (5K, 10K) or mile (mile fun-run) |
| Aviation distance | nautical mile |
| Maritime distance | nautical mile |
| Astronomy | AU, light-year, parsec |

Conversions:
- 1 mile = 1.609344 km exactly
- 1 km = 0.621371 miles
- 5 miles ≈ 8.04672 km
- 100 km ≈ 62.137 miles

Traps: running shoes, treadmills, and swimming pool sizes often use both side-by-side. The site lets you convert any number to any unit with the right precision.`,
    verdict: { pickA: 'Use miles for US / UK road distances and for running events measured in miles.', pickB: 'Use km for international road distances and most scientific / sporting contexts.' },
  },

  {
    slug: 'kilogram-vs-pound',
    title: 'Kilogram vs pound — body weight around the world',
    description: 'One kilogram = how many pounds? Plus the hidden stone unit you meet in the UK.',
    category: 'Mass',
    pairA: { from: 'kilogram', to: 'pound', url: 'kilogram-to-pound', summary: '1 kg = 2.2046 lb (SI base)' },
    pairB: { from: 'pound', to: 'kilogram', url: 'pound-to-kilogram', summary: '1 lb = 0.4536 kg (US body weight, food)' },
    body: `**One kilogram = 2.20462262 pounds.** The pound is defined as exactly 0.45359237 kilograms (an international avoirdupois pound; there are other historical pounds with slightly different masses).

The pound is widely used in:

- **US body weight** — 154 lb = ~70 kg
- **US food packaging** — often both units side by side
- **US postal/express weight** — pounds and ounces
- **UK body weight** — actually quoted in **stone** (14 lb), e.g., 11 stone 4 = 158 lb
- **UK food packaging** — mostly metric since the 1990s, but some legacy products still exist

Body mass index (BMI) is sometimes computed on US medical forms as a magic-number in pounds; conversion is implied.

A trap: pound-force vs pound-mass. The pound you see on a body-weight scale is pound-mass. If you ever work in US engineering, distinguish them — pound-force is a unit of force, defined as the force of gravity on one pound-mass at standard gravity.`,
    verdict: { pickA: 'Use kilograms for science, recipes, and everywhere outside the US.', pickB: 'Use pounds for US body weight, food packaging, and small-package shipping.' },
  },

  {
    slug: 'byte-vs-bit',
    title: 'Byte vs bit — the storage-vs-speed divide',
    description: 'A byte is 8 bits. Network speeds are in bits; storage is in bytes. The case matters.',
    category: 'Data',
    pairA: { from: 'byte', to: 'bit', url: 'byte-to-bit', summary: '1 B = 8 bits (storage is reported in bytes)' },
    pairB: { from: 'bit', to: 'byte', url: 'bit-to-byte', summary: '1 bit is one binary digit (networks are reported in bits)' },
    body: `A **bit** is one binary digit (0 or 1). A **byte** is 8 bits. The distinction matters because two parallel conventions exist in computing:

| Domain | Reported in | Why |
|---|---|---|
| File size | bytes (B, KB, MB, GB) | Storage devices address bytes |
| RAM size | bytes (KB, MB, GB) | Memory cells are bytes |
| Network speed | bits per second (bps, kbps, Mbps) | Bit-rate is the underlying physical layer unit |
| Disk interface | bytes (sectors are 512 or 4096 bytes) | The physical block size |

When you see "your internet is 100 Mbps", that's 100 megabits per second = 12.5 megabytes per second. The "MiB mystery" is why downloads feel slower than the speed test promised.

When buying storage, "1 TB SSD" is 10¹² bytes. When the OS reports the same disk, you see ~931 GiB. Same disk, different units (decimal SI TB vs binary GiB).

The byte/bit distinction also explains file-size ambiguity:
- "8 Mbps" = 8 megabits per second = 1 MB/s by the network-layer definition
- "1 MB file" = 1,000,000 bytes (decimal) or 1,048,576 bytes (binary)?

The site lets you convert with both prefixes correctly.`,
    verdict: { pickA: 'Use bytes for storage, RAM, file sizes.', pickB: 'Use bits for network speeds, bit-rate, and crypto hash sizes.' },
  },

  {
    slug: 'celsius-vs-fahrenheit',
    title: 'Celsius vs Fahrenheit — same metric, different zero',
    description: 'Both measure hot/cold; one is taught in school everywhere, the other used in the US for daily life.',
    category: 'Temperature',
    pairA: { from: 'celsius', to: 'fahrenheit', url: 'celsius-to-fahrenheit', summary: '°F = °C × 9/5 + 32 — every country except the US uses °C' },
    pairB: { from: 'fahrenheit', to: 'celsius', url: 'fahrenheit-to-celsius', summary: '°C = (°F − 32) × 5/9 — US weather and cooking only' },
    body: `Celsius and Fahrenheit are the two scales taught in school — and they differ in three ways:

1. **Zero point.** Water freezes at 0 °C and 32 °F. The scale factor (which I'll come back to in a moment) plus this offset together make the relationship what it is.
2. **Scale factor.** A degree Celsius is *bigger* than a degree Fahrenheit by 1.8×. 100 °C spans water-ice to water-boil; 180 °F spans the same. That's the **9/5**.
3. **Magnitude.** A comfortable room is 20–22 °C = 68–72 °F. A fever is 38 °C = 100.4 °F. A cold snowy day in Chicago is −10 °C = 14 °F.

Practical recommendation:
- For weather in the US, learn Fahrenheit.
- For weather everywhere else, Celsius.
- For cooking, both work but US recipes give oven temperatures in °F (350 °F, 400 °F) and European ones in °C (180 °C, 200 °C). Double-check your oven's knob.
- For science, Kelvin is the proper choice.

A few conversion shortcuts to memorize:
- 0 °C = 32 °F
- 100 °C = 212 °F
- 20 °C = 68 °F
- 30 °C = 86 °F
- 40 °C = 104 °F

The site does the arithmetic to 6 decimal places.`,
    verdict: { pickA: 'Use Celsius for weather outside the US, in scientific and engineering contexts, and in most international cooking.', pickB: 'Use Fahrenheit for US weather, cooking, and US medical thermometers.' },
  },

  {
    slug: 'joule-vs-calorie',
    title: 'Joule vs calorie — kitchen vs classroom',
    description: 'Why food labels use calories (or kilocalories) while physics uses joules.',
    category: 'Energy',
    pairA: { from: 'joule', to: 'calorie', url: 'joule-to-calorie', summary: '1 J = 0.239 cal (SI, physics)' },
    pairB: { from: 'calorie', to: 'kilocalorie', url: 'calorie-to-kilocalorie', summary: '1 cal = 0.001 kcal = 0.001 "Calorie" (food label)' },
    body: `Three units do almost all the work in everyday energy measurements:

- **Joule (J)** — the SI unit. Used in physics and engineering.
- **Calorie (cal)** — the energy to heat 1 g of water by 1 °C = 4.184 J. Used historically in nutrition and chemistry.
- **Kilocalorie (kcal)** — 1,000 cal = 4,184 J. This is what food labels call a "Calorie" (with capital C). "One Calorie" on a US food label = 1 kcal = 4,184 J.

The trap: capitalisation matters.

- "calorie" (lowercase) = 4.184 J
- "Calorie" (capital) = 1 kcal = 4,184 J

When a US label says "200 Calories" it means 200 kcal = 836,800 J. Most European labels now read "kJ" (kilojoule) for the same number, so 836.8 kJ ≈ 200 kcal.

Practical conversions:
- 1 kcal = 4.184 kJ
- 1 kJ = 0.239 kcal
- 1 BTU (British thermal unit) ≈ 1,055 J ≈ 252 cal
- 1 kWh = 3.6 MJ = 860 kcal
- 1 kWh ≈ 3,412 BTU

In a sentence: a 100 W light bulb running 10 hours uses 1 kWh, which equals 860 kcal of energy — enough to heat a cup of water from 0 to 100 °C plus a bit extra.

The site converts across all five common units.`,
    verdict: { pickA: 'Use joules for physics, electrical engineering, mechanical engineering.', pickB: 'Use (kilo)calories for nutrition, food labels, exercise science.' },
  },
];
