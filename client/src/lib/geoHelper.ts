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
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Location access is not available in this browser.');
  }

  const locate = (options: PositionOptions) =>
    new Promise<CurrentPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
          }),
        reject,
        options
      );
    });

  try {
    return await locate({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  } catch {
    try {
      return await locate({ enableHighAccuracy: false, timeout: 12000, maximumAge: 0 });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if (error.code === 1) {
          throw new Error('Location permission was denied. Allow location access in your browser settings and try again.');
        }
        if (error.code === 2) {
          throw new Error('Your device could not determine its current location.');
        }
        throw new Error('Getting your current location timed out. Please try again.');
      }
      throw new Error('Could not get your current location.');
    }
  }
}
