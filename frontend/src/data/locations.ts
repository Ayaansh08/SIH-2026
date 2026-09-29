export interface VillageLocation {
  id: string;
  name: string;
  nameHi: string;
  nodeId: string;
  lat: number;
  lon: number;
  chainage_km: number;
  district: string;
}

export const LOCATIONS: VillageLocation[] = [
  {
    id: 'LOC_CHUNG',
    name: 'Chungthang Village',
    nameHi: 'चुंगथांग गांव',
    nodeId: 'NODE_CHUNG_VILLAGE',
    lat: 27.604,
    lon: 88.649,
    chainage_km: 2,
    district: 'Mangan District (North Sikkim)',
  },
  {
    id: 'LOC_MANGAN',
    name: 'Mangan Town',
    nameHi: 'मंगन शहर',
    nodeId: 'NODE_MANGAN_BAZAR',
    lat: 27.487,
    lon: 88.595,
    chainage_km: 19,
    district: 'Mangan District (North Sikkim)',
  },
  {
    id: 'LOC_DIKCHU',
    name: 'Dikchu Bazaar',
    nameHi: 'दिक्छू बाज़ार',
    nodeId: 'NODE_DIKCHU_MARKET',
    lat: 27.401,
    lon: 88.552,
    chainage_km: 33,
    district: 'Gangtok District (East Sikkim)',
  },
  {
    id: 'LOC_SINGTAM',
    name: 'Singtam Riverbank',
    nameHi: 'सिंगताम नदी तट',
    nodeId: 'NODE_SINGTAM_MAIN',
    lat: 27.234,
    lon: 88.502,
    chainage_km: 63,
    district: 'Gangtok District (East Sikkim)',
  },
  {
    id: 'LOC_SEVOKE',
    name: 'Sevoke Corridor Colony',
    nameHi: 'सेवोक कॉरिडोर कॉलोनी',
    nodeId: 'NODE_SEVOKE_VILLAGE',
    lat: 26.885,
    lon: 88.472,
    chainage_km: 129,
    district: 'Darjeeling / Jalpaiguri (West Bengal)',
  },
];
