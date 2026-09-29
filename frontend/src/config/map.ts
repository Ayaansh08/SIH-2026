/**
 * Map Tile & Provider Configuration
 * Standard OpenStreetMap (100% free, no API key required)
 */
export const MAP_CONFIG = {
  tileUrl:
    import.meta.env.VITE_MAP_TILE_URL ||
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  subdomains: ['a', 'b', 'c'],
  attribution: '© OpenStreetMap contributors',
  maxZoom: 14,
  minZoom: 8,
};
