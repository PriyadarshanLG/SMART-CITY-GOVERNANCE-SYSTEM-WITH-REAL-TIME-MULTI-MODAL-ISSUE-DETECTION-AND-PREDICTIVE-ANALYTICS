export interface GeoLocationResult {
  road: string;
  suburb: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  fullAddress: string;
  shortLocation: string;
}

export interface CurrentPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export const FIXED_CITY_LOCATION = {
  lat: 12.975896,
  lng: 76.034411,
  accuracy: 1,
  address: 'Navkis College of Engineering, KIADB, Thimmanahally Industrial Area, Kandali, Hassan, Karnataka 573217',
  area: 'Navkis College of Engineering',
  city: 'Hassan',
  district: 'Hassan',
  state: 'Karnataka',
  pincode: '573217',
} as const;

export function formatLocationFromCoordinates(lat: number, lng: number): GeoLocationResult {
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';
  const location = `${Math.abs(lat).toFixed(5)}° ${latDirection}, ${Math.abs(lng).toFixed(5)}° ${lngDirection}`;
  return {
    road: '',
    suburb: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    fullAddress: location,
    shortLocation: location,
  };
}

export async function getCurrentPositionAsync(): Promise<CurrentPosition> {
  return {
    lat: FIXED_CITY_LOCATION.lat,
    lng: FIXED_CITY_LOCATION.lng,
    accuracy: FIXED_CITY_LOCATION.accuracy,
  };
}
