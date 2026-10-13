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

  const getErrorCode = (error: unknown) =>
    typeof error === 'object' && error !== null && 'code' in error
      ? (error as { code?: number }).code
      : undefined;

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
      // A recent network-assisted fix is faster and more reliable on desktops.
      return await locate({ enableHighAccuracy: false, timeout: 20000, maximumAge: 30000 });
    } catch (firstError) {
      try {
        return await locate({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
      } catch (error) {
        const code = getErrorCode(error) ?? getErrorCode(firstError);
        if (code === 1) {
          throw new Error('Location permission was denied. Click the lock icon beside the website address, allow Location, then try again.');
        }
        if (code === 2) {
          throw new Error('Your device could not determine its current location. Turn on device Location services and try again.');
        }
        if (code === 3) {
          throw new Error('Getting your current location timed out. Move near a window or enable device Location services, then try again.');
        }
        throw new Error('Could not get your current location.');
      }
  }
}
