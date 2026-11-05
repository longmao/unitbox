import type { APIRoute } from 'astro';
import { getAllUnits, getAllCategories } from '~/lib/units';

export const prerender = true;

export const GET: APIRoute = () => {
  const categories = Object.fromEntries(getAllCategories().map(category => [category.slug, category]));
  const units = getAllUnits().map(unit => ({
    slug: unit.slug,
    name: unit.name,
    symbol: unit.symbol,
    category: unit.category,
    categoryName: categories[unit.category]?.name,
    factor: (unit as any).factor ?? null,
    slope: (unit as any).slope ?? null,
    offset: (unit as any).offset ?? null,
    direction: (unit as any).direction ?? null,
    reciprocalConstant: (unit as any).K ?? null,
    description: unit.description ?? null,
  }));

  return new Response(JSON.stringify({
    name: 'Unitbox unit conversion factors',
    version: '2026-10',
    license: 'CC BY 4.0',
    documentation: 'https://unitbox.online/en/reference/data-units/',
    sourceCode: 'https://github.com/longmao/unitbox',
    categories: getAllCategories(),
    units,
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
