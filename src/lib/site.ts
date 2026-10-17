// Centralized site config + helpers
import { getSiteStats } from './units';

const stats = getSiteStats();
const coverage = `${stats.categories} categories · ${stats.units} units · ${stats.pairs.toLocaleString('en-US')} conversion pairs`;

export const SITE = {
  name: 'unitbox',
  legalName: 'unitbox',
  tagline: 'Convert any unit — and everything related to it',
  description:
    `Free online unit converter tool. ${coverage}. Convert length, mass, temperature, area, volume, speed & more — instantly, no signup, no tracking.`,
  url: 'https://unitbox.online',
  ogImage: '/og-default.png',
  locale: 'en_US',
  twitterHandle: '@unitbox',
};

export const SITE_STATS = stats;
export const SITE_COVERAGE = coverage;

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
