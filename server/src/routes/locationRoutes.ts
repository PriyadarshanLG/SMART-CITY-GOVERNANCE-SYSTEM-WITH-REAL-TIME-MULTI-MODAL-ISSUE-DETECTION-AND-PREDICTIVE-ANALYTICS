import { Router } from 'express';
import rateLimit from 'express-rate-limit';

interface NominatimReverseResponse {
  display_name?: string;
  address?: {
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    residential?: string;
    village?: string;
    hamlet?: string;
    town?: string;
    city_district?: string;
    city?: string;
    county?: string;
    state_district?: string;
    state?: string;
    postcode?: string;
    road?: string;
  };
}

interface ReverseLocation {
  area: string;
  address: string;
  city: string;
  district: string;
  state: string;
  postcode: string;
}

const reverseLocationCache = new Map<string, ReverseLocation>();
let nominatimQueue: Promise<void> = Promise.resolve();
let lastNominatimRequestAt = 0;

export const locationRouter = Router();

locationRouter.get(
  '/reverse',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 60 }),
  async (req, res) => {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);
    if (
      !Number.isFinite(latitude)
      || !Number.isFinite(longitude)
      || latitude < -90
      || latitude > 90
      || longitude < -180
      || longitude > 180
    ) {
      return res.status(400).json({ message: 'Valid latitude and longitude are required.' });
    }

    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const cachedLocation = reverseLocationCache.get(cacheKey);
    if (cachedLocation) return res.json(cachedLocation);

    const queuedRequest = nominatimQueue.then(async () => {
      const waitMs = Math.max(0, 1000 - (Date.now() - lastNominatimRequestAt));
      if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
      lastNominatimRequestAt = Date.now();

      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('lat', String(latitude));
      url.searchParams.set('lon', String(longitude));
      url.searchParams.set('zoom', '18');
      url.searchParams.set('addressdetails', '1');

      const upstream = await fetch(url, {
        headers: { 'User-Agent': 'SmartCityGovernanceSystem/1.0' },
        signal: AbortSignal.timeout(8000),
      });
      if (!upstream.ok) {
        throw new Error(`OpenStreetMap reverse geocoding failed with HTTP ${upstream.status}.`);
      }

      const result = await upstream.json() as NominatimReverseResponse;
      const address = result.address ?? {};
      const area = address.neighbourhood
        || address.suburb
        || address.quarter
        || address.residential
        || address.village
        || address.hamlet
        || address.town
        || address.city_district
        || address.city
        || '';
      const location: ReverseLocation = {
        area,
        address: result.display_name || [address.road, area].filter(Boolean).join(', '),
        city: address.city || address.town || address.village || '',
        district: address.state_district || address.county || '',
        state: address.state || '',
        postcode: address.postcode || '',
      };

      reverseLocationCache.set(cacheKey, location);
      if (reverseLocationCache.size > 1000) {
        const oldestKey = reverseLocationCache.keys().next().value;
        if (oldestKey) reverseLocationCache.delete(oldestKey);
      }
      return location;
    });
    nominatimQueue = queuedRequest.then(() => undefined, () => undefined);

    try {
      return res.json(await queuedRequest);
    } catch (error) {
      console.error('Reverse geocoding request failed:', error);
      return res.status(502).json({ message: 'Could not find an area name for these coordinates. You can enter the area manually.' });
    }
  },
);
