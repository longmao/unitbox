import type { APIRoute } from 'astro';
import { getAllUnits } from '~/lib/units';

export const prerender = true;

function csv(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export const GET: APIRoute = () => {
  const header = ['slug', 'name', 'symbol', 'category', 'factor', 'slope', 'offset', 'direction', 'reciprocal_constant', 'description'];
  const rows = getAllUnits().map(unit => [
    unit.slug,
    unit.name,
    unit.symbol,
    unit.category,
    (unit as any).factor ?? '',
    (unit as any).slope ?? '',
    (unit as any).offset ?? '',
    (unit as any).direction ?? '',
    (unit as any).K ?? '',
    unit.description ?? '',
  ]);
  const body = [header, ...rows].map(row => row.map(csv).join(',')).join('\n') + '\n';

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="unitbox-conversion-factors.csv"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
