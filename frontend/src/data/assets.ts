import type { InundationFrame } from '../types/contracts';
import { pointInPolygon } from '../lib/geo';

export type ContainmentVerdict = 'YES' | 'PARTLY' | 'NO';

export interface InfraAsset {
  id: string;
  name: string;
  nameHi: string;
  type: string;
  lat: number;
  lon: number;
  chainage_km: number;
  elevation_rel_m: number; // elevation relative to riverbed
  measureEn: string;
  measureHi: string;
  costInr: number;
  pledgedInr: number;
  eligibleScheduleVii: boolean;
}

export const INITIAL_ASSETS: InfraAsset[] = [
  {
    id: 'ASSET-CHUNG-PHC',
    name: 'Chungthang Primary Health Centre',
    nameHi: 'चुंगथांग प्राथमिक स्वास्थ्य केंद्र',
    type: 'Medical Facility',
    lat: 27.603,
    lon: 88.647,
    chainage_km: 2,
    elevation_rel_m: 4.8,
    measureEn: 'Deploy perimeter deployable flood barrier & elevated equipment plinth',
    measureHi: 'सुरक्षात्मक बाढ़ अवरोधक एवं उपकरण चबूतरे की स्थापना',
    costInr: 1250000,
    pledgedInr: 850000,
    eligibleScheduleVii: true,
  },
  {
    id: 'ASSET-MANG-SCH',
    name: 'Mangan Lower Secondary School',
    nameHi: 'मंगन कनिष्ठ माध्यमिक विद्यालय',
    type: 'Educational Infrastructure',
    lat: 27.486,
    lon: 88.593,
    chainage_km: 19,
    elevation_rel_m: 5.2,
    measureEn: 'Construct stone gabion deflection revetment & drainage check-gates',
    measureHi: 'पत्थर गेबियन सुरक्षा दीवार एवं जल निकासी चेक-गेट निर्माण',
    costInr: 1800000,
    pledgedInr: 1200000,
    eligibleScheduleVii: true,
  },
  {
    id: 'ASSET-DIKCHU-PUMP',
    name: 'Dikchu Municipal Water Pump House',
    nameHi: 'दिक्छू नगर जल आपूर्ति पंप घर',
    type: 'Potable Water Utility',
    lat: 27.399,
    lon: 88.550,
    chainage_km: 33,
    elevation_rel_m: 2.1,
    measureEn: 'Waterproof electrical switchgear & install high-lift submersible pump',
    measureHi: 'विद्युत स्विचगियर वॉटरप्रूफिंग एवं उच्च क्षमता सबमर्सिबल पंप स्थापना',
    costInr: 950000,
    pledgedInr: 600000,
    eligibleScheduleVii: true,
  },
  {
    id: 'ASSET-MAKHA-BRIDGE',
    name: 'Makha Suspension Footway Anchor',
    nameHi: 'माखा सस्पेंशन पैदल मार्ग एंकर',
    type: 'Corridor Pedestrian Link',
    lat: 27.288,
    lon: 88.515,
    chainage_km: 49,
    elevation_rel_m: 1.5,
    measureEn: 'Relocate / evacuate cable anchorage to higher rock strata',
    measureHi: 'केबल एंकरेज को ऊपरी चट्टानी स्तर पर स्थानांतरित करें',
    costInr: 2200000,
    pledgedInr: 450000,
    eligibleScheduleVii: true,
  },
  {
    id: 'ASSET-SINGTAM-SUB',
    name: 'Singtam 66kV Power Distribution Substation',
    nameHi: 'सिंगताम 66kV विद्युत वितरण सबस्टेशन',
    type: 'Grid Substation',
    lat: 27.232,
    lon: 88.500,
    chainage_km: 63,
    elevation_rel_m: 3.5,
    measureEn: 'Raise 33/11kV transformer plinths by 2.0m & install dewatering pumps',
    measureHi: 'ट्रांसफॉर्मर चबूतरों को 2.0 मी ऊंचा करना एवं डि-वाटरिंग पंप लगाना',
    costInr: 3400000,
    pledgedInr: 2800000,
    eligibleScheduleVii: true,
  },
  {
    id: 'ASSET-RANGPO-STORE',
    name: 'Rangpo Essential Commodity Relief Godown',
    nameHi: 'रांगपो आवश्यक वस्तु राहत गोदाम',
    type: 'Civil Supply Logistics',
    lat: 27.179,
    lon: 88.528,
    chainage_km: 77,
    elevation_rel_m: 4.0,
    measureEn: 'Install sealed storm shutters & raised pallet racks above high flood line',
    measureHi: 'सीलबंद स्टॉर्म शटर एवं उच्च बाढ़ रेखा से ऊपर उठे पैलेट रैक',
    costInr: 1500000,
    pledgedInr: 950000,
    eligibleScheduleVii: true,
  },
  {
    id: 'ASSET-TBAZAR-CLINIC',
    name: 'Teesta Bazar Emergency River Dispensary',
    nameHi: 'तीस्ता बाज़ार आपातकालीन नदी औषधालय',
    type: 'Primary Care Clinic',
    lat: 27.079,
    lon: 88.469,
    chainage_km: 99,
    elevation_rel_m: 0.8,
    measureEn: 'Relocate / evacuate medical stocks to higher administrative complex',
    measureHi: 'दवाओं एवं उपकरणों को ऊपरी प्रशासनिक परिसर में स्थानांतरित करें',
    costInr: 800000,
    pledgedInr: 150000,
    eligibleScheduleVii: true,
  },
  {
    id: 'ASSET-SEVOKE-SIPHON',
    name: 'Sevoke Railway Siphon Pumphouse',
    nameHi: 'सेवोक रेलवे साइफ़न पंपहाउस',
    type: 'Rail Drainage Infrastructure',
    lat: 26.883,
    lon: 88.470,
    chainage_km: 129,
    elevation_rel_m: 3.2,
    measureEn: 'Erect sandbag reinforced earthen dike & emergency diesel standby',
    measureHi: 'रेत की बोरी प्रबलित मिट्टी का तटबंध एवं आपातकालीन डीजल बैकअप',
    costInr: 1650000,
    pledgedInr: 1100000,
    eligibleScheduleVii: true,
  },
];

/**
 * Format Indian number grouping (e.g. ₹12,50,000)
 */
export function formatInr(amount: number): string {
  const str = Math.round(amount).toString();
  if (str.length <= 3) return `₹${str}`;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${formattedOther},${lastThree}`;
}

export interface EvaluatedAsset extends InfraAsset {
  isInundated: boolean;
  modelledDepthM: number;
  arrivalMin: number;
  verdict: ContainmentVerdict;
}

export function evaluateAssets(
  assets: InfraAsset[],
  currentFrame: InundationFrame,
  allFrames: InundationFrame[]
): EvaluatedAsset[] {
  const currentRing = currentFrame?.extent_geojson?.geometry?.coordinates?.[0] || [];
  const maxDepth = currentFrame?.max_depth_m ?? 5;

  return assets.map((asset) => {
    const pt: [number, number] = [asset.lat, asset.lon];
    const isInundated = pointInPolygon(pt, currentRing);

    // Calculate arrival timestep across frames
    let arrivalMin = 120;
    for (const f of allFrames) {
      const ring = f.extent_geojson?.geometry?.coordinates?.[0] || [];
      if (pointInPolygon(pt, ring)) {
        arrivalMin = f.timestep_minutes;
        break;
      }
    }

    // Model depth based on river chainage and frame
    const chainageRatio = Math.max(0, 1 - asset.chainage_km / 140);
    const modelledDepthM = isInundated
      ? Number(Math.max(0.4, maxDepth * chainageRatio - asset.elevation_rel_m * 0.4).toFixed(1))
      : 0;

    // Verdict calculation
    let verdict: ContainmentVerdict = 'YES';
    if (asset.elevation_rel_m < 1.8 || modelledDepthM > 3.0) {
      verdict = 'NO';
    } else if (modelledDepthM > 1.2 || asset.elevation_rel_m < 3.8) {
      verdict = 'PARTLY';
    } else {
      verdict = 'YES';
    }

    return {
      ...asset,
      isInundated,
      modelledDepthM,
      arrivalMin,
      verdict,
    };
  });
}
