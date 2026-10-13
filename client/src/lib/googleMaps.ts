import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

let mapsLibrariesReady: Promise<void> | undefined;
let authFailureHandlerInstalled = false;

export function loadGoogleMaps(): Promise<void> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    return Promise.reject(
      new Error(
        'Google Maps is not configured. Set VITE_GOOGLE_MAPS_API_KEY in the frontend deployment environment and redeploy the client.'
      )
    );
  }

  if (!mapsLibrariesReady) {
    try {
      if (!authFailureHandlerInstalled) {
        const existingAuthFailureHandler = window.gm_authFailure;
        window.gm_authFailure = () => {
          existingAuthFailureHandler?.();
          window.dispatchEvent(new Event('google-maps-auth-failure'));
        };
        authFailureHandlerInstalled = true;
      }
      setOptions({ key: apiKey, v: 'weekly', language: 'en', region: 'IN' });
      mapsLibrariesReady = importLibrary('maps').then(() => undefined);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return mapsLibrariesReady;
}
