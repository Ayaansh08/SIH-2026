export interface EvacNode {
  id: string;
  name: string;
  nameHi: string;
  type: 'village' | 'junction' | 'bridge_node' | 'shelter';
  lat: number;
  lon: number;
  elevation_m: number;
  landmark: string;
  landmarkHi: string;
}

export interface EvacEdge {
  from: string;
  to: string;
  walkMeters: number;
  viaBridgeId?: string;
  uphill?: boolean;
  blockedAfterFlood?: boolean;
}

export const EVAC_NODES: EvacNode[] = [
  // 1. Chungthang cluster
  {
    id: 'NODE_CHUNG_VILLAGE',
    name: 'Chungthang Lower Market',
    nameHi: 'चुंगथांग निचला बाज़ार',
    type: 'village',
    lat: 27.604,
    lon: 88.649,
    elevation_m: 1720,
    landmark: 'Turn past Gurudwara Nanaklama gate',
    landmarkHi: 'गुरुद्वारा नानकलमा द्वार से आगे मुड़ें',
  },
  {
    id: 'NODE_CHUNG_BRIDGE',
    name: 'Chungthang River Crossing',
    nameHi: 'चुंगथांग नदी पारगमन',
    type: 'bridge_node',
    lat: 27.601,
    lon: 88.646,
    elevation_m: 1690,
    landmark: 'Approach concrete abutment ramp',
    landmarkHi: 'कंक्रीट एबटमेंट रैंप की ओर बढ़ें',
  },
  {
    id: 'SHELTER_CHUNG_HIGH',
    name: 'Chungthang Sr. Secondary School Refuge',
    nameHi: 'चुंगथांग वरिष्ठ माध्यमिक विद्यालय आश्रय',
    type: 'shelter',
    lat: 27.609,
    lon: 88.642,
    elevation_m: 1850,
    landmark: 'Assemble at Upper Football Ground Pavilion',
    landmarkHi: 'ऊपरी फ़ुटबॉल मैदान पवेलियन पर एकत्र हों',
  },

  // 2. Mangan cluster
  {
    id: 'NODE_MANGAN_BAZAR',
    name: 'Mangan Town Square',
    nameHi: 'मंगन मुख्य चौक',
    type: 'village',
    lat: 27.487,
    lon: 88.595,
    elevation_m: 1380,
    landmark: 'Follow District Administration uphill road',
    landmarkHi: 'ज़िला प्रशासन चढ़ाई सड़क का अनुसरण करें',
  },
  {
    id: 'NODE_MANGAN_BRIDGE',
    name: 'Mangan Gorge Access',
    nameHi: 'मंगन गॉर्ज पहुंच मार्ग',
    type: 'bridge_node',
    lat: 27.484,
    lon: 88.591,
    elevation_m: 1290,
    landmark: 'Old Forest Checkpost junction',
    landmarkHi: 'पुरानी वन चेकपोस्ट जंक्शन',
  },
  {
    id: 'SHELTER_MANGAN_HELIPAD',
    name: 'Mangan Helipad & District Relief Camp',
    nameHi: 'मंगन हेलीपैड एवं ज़िला राहत शिविर',
    type: 'shelter',
    lat: 27.492,
    lon: 88.601,
    elevation_m: 1470,
    landmark: 'Enter via SDRF Medical Staging Tent',
    landmarkHi: 'SDRF मेडिकल स्टेजिंग टेंट से प्रवेश करें',
  },

  // 3. Dikchu cluster
  {
    id: 'NODE_DIKCHU_MARKET',
    name: 'Dikchu River Settlement',
    nameHi: 'दिक्छू नदी बस्ती',
    type: 'village',
    lat: 27.401,
    lon: 88.552,
    elevation_m: 680,
    landmark: 'Turn left at Panchayat Bhawan stairwell',
    landmarkHi: 'पंचायत भवन सीढ़ी के पास बाएं मुड़ें',
  },
  {
    id: 'NODE_DIKCHU_BRIDGE',
    name: 'Dikchu Dam West Abutment',
    nameHi: 'दिक्छू बांध पश्चिमी एबटमेंट',
    type: 'bridge_node',
    lat: 27.397,
    lon: 88.547,
    elevation_m: 650,
    landmark: 'Cross power canal inspection path',
    landmarkHi: 'पावर नहर निरीक्षण पथ पार करें',
  },
  {
    id: 'SHELTER_DIKCHU_GREF',
    name: 'Dikchu GREF Hilltop Staging Camp',
    nameHi: 'दिक्छू GREF पहाड़ी स्टेजिंग शिविर',
    type: 'shelter',
    lat: 27.408,
    lon: 88.560,
    elevation_m: 890,
    landmark: 'Proceed straight into BRO Barracks Complex',
    landmarkHi: 'सीधे BRO बैरक परिसर में जाएं',
  },

  // 4. Singtam cluster
  {
    id: 'NODE_SINGTAM_MAIN',
    name: 'Singtam Bazaar Riverside',
    nameHi: 'सिंगताम बाज़ार नदी तट',
    type: 'village',
    lat: 27.234,
    lon: 88.502,
    elevation_m: 350,
    landmark: 'Move away from lower embankment taxi stand',
    landmarkHi: 'निचले तटबंध टैक्सी स्टैंड से दूर जाएं',
  },
  {
    id: 'NODE_SINGTAM_BRIDGE',
    name: 'Singtam NH-10 Approach',
    nameHi: 'सिंगताम NH-10 पहुंच मार्ग',
    type: 'bridge_node',
    lat: 27.230,
    lon: 88.497,
    elevation_m: 340,
    landmark: 'Pass through Police Outpost checkpoint',
    landmarkHi: 'पुलिस चौकी चेकपॉइंट से गुजरें',
  },
  {
    id: 'SHELTER_SINGTAM_HIGH',
    name: 'Singtam Sr. Secondary School Refuge',
    nameHi: 'सिंगताम वरिष्ठ माध्यमिक विद्यालय आश्रय',
    type: 'shelter',
    lat: 27.242,
    lon: 88.508,
    elevation_m: 520,
    landmark: 'Upper Auditorium High-Ground Sanctuary',
    landmarkHi: 'ऊपरी ऑडिटोरियम उच्च-भूमि शरणालय',
  },

  // 5. Sevoke cluster
  {
    id: 'NODE_SEVOKE_VILLAGE',
    name: 'Sevoke Railway Colony',
    nameHi: 'सेवोक रेलवे कॉलोनी',
    type: 'village',
    lat: 26.885,
    lon: 88.472,
    elevation_m: 160,
    landmark: 'Keep left of railway track signals',
    landmarkHi: 'रेलवे ट्रैक सिग्नलों के बाईं ओर रहें',
  },
  {
    id: 'NODE_SEVOKE_BRIDGE',
    name: 'Sevoke Coronation Bridge Approach',
    nameHi: 'सेवोक कोरोनेशन ब्रिज पहुंच मार्ग',
    type: 'bridge_node',
    lat: 26.881,
    lon: 88.468,
    elevation_m: 145,
    landmark: 'Forest toll post divider',
    landmarkHi: 'वन टोल पोस्ट डिवाइडर',
  },
  {
    id: 'SHELTER_SEVOKE_HILL',
    name: 'Sevoke Forest Rest House & Ridge Sanctuary',
    nameHi: 'सेवोक वन विश्राम गृह एवं रिज शरणालय',
    type: 'shelter',
    lat: 26.892,
    lon: 88.480,
    elevation_m: 310,
    landmark: 'Forest Range Officer Ridge Compound',
    landmarkHi: 'वन रेंज अधिकारी रिज परिसर',
  },
];

export const EVAC_EDGES: EvacEdge[] = [
  // Chungthang routes
  { from: 'NODE_CHUNG_VILLAGE', to: 'NODE_CHUNG_BRIDGE', walkMeters: 420 },
  { from: 'NODE_CHUNG_BRIDGE', to: 'NODE_CHUNG_VILLAGE', walkMeters: 420 },
  { from: 'NODE_CHUNG_BRIDGE', to: 'SHELTER_CHUNG_HIGH', walkMeters: 980, viaBridgeId: 'BRG-CHUNG', uphill: true },
  { from: 'SHELTER_CHUNG_HIGH', to: 'NODE_CHUNG_BRIDGE', walkMeters: 980, viaBridgeId: 'BRG-CHUNG' },
  { from: 'NODE_CHUNG_VILLAGE', to: 'SHELTER_CHUNG_HIGH', walkMeters: 1100, uphill: true }, // alternate bypass path
  { from: 'SHELTER_CHUNG_HIGH', to: 'NODE_CHUNG_VILLAGE', walkMeters: 1100 },

  // Mangan routes
  { from: 'NODE_MANGAN_BAZAR', to: 'NODE_MANGAN_BRIDGE', walkMeters: 550 },
  { from: 'NODE_MANGAN_BRIDGE', to: 'NODE_MANGAN_BAZAR', walkMeters: 550 },
  { from: 'NODE_MANGAN_BRIDGE', to: 'SHELTER_MANGAN_HELIPAD', walkMeters: 1400, viaBridgeId: 'BRG-MANG', uphill: true },
  { from: 'SHELTER_MANGAN_HELIPAD', to: 'NODE_MANGAN_BRIDGE', walkMeters: 1400, viaBridgeId: 'BRG-MANG' },
  { from: 'NODE_MANGAN_BAZAR', to: 'SHELTER_MANGAN_HELIPAD', walkMeters: 920, uphill: true },
  { from: 'SHELTER_MANGAN_HELIPAD', to: 'NODE_MANGAN_BAZAR', walkMeters: 920 },

  // Dikchu routes
  { from: 'NODE_DIKCHU_MARKET', to: 'NODE_DIKCHU_BRIDGE', walkMeters: 480 },
  { from: 'NODE_DIKCHU_BRIDGE', to: 'NODE_DIKCHU_MARKET', walkMeters: 480 },
  { from: 'NODE_DIKCHU_BRIDGE', to: 'SHELTER_DIKCHU_GREF', walkMeters: 1350, viaBridgeId: 'BRG-DIKCHU', uphill: true, blockedAfterFlood: true },
  { from: 'SHELTER_DIKCHU_GREF', to: 'NODE_DIKCHU_BRIDGE', walkMeters: 1350, viaBridgeId: 'BRG-DIKCHU' },
  { from: 'NODE_DIKCHU_MARKET', to: 'SHELTER_DIKCHU_GREF', walkMeters: 1200, uphill: true }, // Eastern ridge trail
  { from: 'SHELTER_DIKCHU_GREF', to: 'NODE_DIKCHU_MARKET', walkMeters: 1200 },

  // Singtam routes
  { from: 'NODE_SINGTAM_MAIN', to: 'NODE_SINGTAM_BRIDGE', walkMeters: 510 },
  { from: 'NODE_SINGTAM_BRIDGE', to: 'NODE_SINGTAM_MAIN', walkMeters: 510 },
  { from: 'NODE_SINGTAM_BRIDGE', to: 'SHELTER_SINGTAM_HIGH', walkMeters: 1600, viaBridgeId: 'BRG-SINGTAM', uphill: true },
  { from: 'SHELTER_SINGTAM_HIGH', to: 'NODE_SINGTAM_BRIDGE', walkMeters: 1600, viaBridgeId: 'BRG-SINGTAM' },
  { from: 'NODE_SINGTAM_MAIN', to: 'SHELTER_SINGTAM_HIGH', walkMeters: 1250, uphill: true }, // Bazaar hill steps
  { from: 'SHELTER_SINGTAM_HIGH', to: 'NODE_SINGTAM_MAIN', walkMeters: 1250 },

  // Sevoke routes
  { from: 'NODE_SEVOKE_VILLAGE', to: 'NODE_SEVOKE_BRIDGE', walkMeters: 490 },
  { from: 'NODE_SEVOKE_BRIDGE', to: 'NODE_SEVOKE_VILLAGE', walkMeters: 490 },
  { from: 'NODE_SEVOKE_BRIDGE', to: 'SHELTER_SEVOKE_HILL', walkMeters: 1750, viaBridgeId: 'BRG-SEVOKE', uphill: true },
  { from: 'SHELTER_SEVOKE_HILL', to: 'NODE_SEVOKE_BRIDGE', walkMeters: 1750, viaBridgeId: 'BRG-SEVOKE' },
  { from: 'NODE_SEVOKE_VILLAGE', to: 'SHELTER_SEVOKE_HILL', walkMeters: 1300, uphill: true }, // Forest trail
  { from: 'SHELTER_SEVOKE_HILL', to: 'NODE_SEVOKE_VILLAGE', walkMeters: 1300 },
];
