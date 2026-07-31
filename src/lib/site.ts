// Centralized site config + helpers
export const SITE = {
  name: 'unitbox',
  legalName: 'unitbox',
  tagline: 'Convert any unit — and everything related to it',
  description:
    'Conversion tables and live calculators for length, mass, temperature, area, volume, speed, time, data, energy, pressure, angle, and fuel-economy. Plus a knowledge base on units, history, and standards.',
  url: 'https://unitbox.online',
  ogImage: '/og-default.png',
  locale: 'en_US',
  twitterHandle: '@unitbox',
};

export const NAV_GROUPS = [
  {
    title: 'Common Conversions',
    links: [
      { label: 'All Converters', href: '/' },
      { label: 'All Units', href: '/category/all' },
      { label: 'Length', href: '/category/length' },
      { label: 'Mass', href: '/category/mass' },
      { label: 'Temperature', href: '/category/temperature' },
      { label: 'Volume', href: '/category/volume' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Area', href: '/category/area' },
      { label: 'Speed', href: '/category/speed' },
      { label: 'Time', href: '/category/time' },
      { label: 'Data', href: '/category/data' },
      { label: 'Energy', href: '/category/energy' },
      { label: 'Pressure', href: '/category/pressure' },
      { label: 'Angle', href: '/category/angle' },
      { label: 'Fuel Economy', href: '/category/fuel-economy' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'Unit Calculator', href: '/calculator' },
      { label: 'Browse All Pairs', href: '/compare' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Articles', href: '/articles' },
      { label: 'About', href: '/about' },
    ],
  },
];

export function pageTitle(name: string): string {
  return `${name} — ${SITE.name}`;
}