import express, { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleAuth } from 'google-auth-library';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

interface GoogleSpeechResponse {
  results?: Array<{
    alternatives?: Array<{ transcript?: string }>;
  }>;
  error?: { message?: string };
}

export const speechRouter = Router();
const googleAuth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });

speechRouter.post(
  '/transcribe',
  requireAuth(['Citizen']),
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }),
  express.raw({ type: 'audio/*', limit: '10mb' }),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return res.status(400).json({ message: 'A recorded audio file is required.' });
    }

    const contentType = req.header('content-type')?.split(';')[0]?.trim().toLowerCase();
    const encoding = contentType === 'audio/webm'
      ? 'WEBM_OPUS'
      : contentType === 'audio/ogg'
        ? 'OGG_OPUS'
        : null;
    if (!encoding) {
      return res.status(415).json({ message: 'Unsupported recording format. Use a browser that records WebM or OGG audio.' });
    }

    if (!env.GOOGLE_CLOUD_PROJECT) {
      return res.status(503).json({ message: 'Google Speech-to-Text is not configured. Set GOOGLE_CLOUD_PROJECT in server/.env and configure Google Application Default Credentials.' });
    }

    try {
      const authClient = await googleAuth.getClient();
      const accessToken = await authClient.getAccessToken();
      if (!accessToken.token) {
        return res.status(503).json({ message: 'Google Cloud credentials are unavailable. Run gcloud auth application-default login or configure GOOGLE_APPLICATION_CREDENTIALS on the server.' });
      }

      const googleResponse = await fetch(
        `https://speech.googleapis.com/v1/projects/${encodeURIComponent(env.GOOGLE_CLOUD_PROJECT)}/locations/global/recognizers/_:recognize`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
            'x-goog-user-project': env.GOOGLE_CLOUD_PROJECT,
          },
          body: JSON.stringify({
            config: {
              encoding,
              autoDecodingConfig: {},
              languageCodes: ['en-IN', 'kn-IN', 'hi-IN'],
              model: 'chirp_3',
              features: { enableAutomaticPunctuation: true },
            },
            content: req.body.toString('base64'),
          }),
        },
      );
      const result = await googleResponse.json() as GoogleSpeechResponse;
      if (!googleResponse.ok) {
        console.error('Google Speech-to-Text request failed:', googleResponse.status, result.error?.message);
        return res.status(502).json({
          message: result.error?.message || `Google Speech-to-Text rejected the request (HTTP ${googleResponse.status}). Check API enablement, IAM access, and billing.`,
        });
      }

      const transcript = result.results
        ?.flatMap((item) => item.alternatives ?? [])
        .map((alternative) => alternative.transcript ?? '')
        .filter(Boolean)
        .join(' ')
        .trim() ?? '';

      return res.json({ transcript });
    } catch (error) {
      console.error('Google Speech-to-Text request error:', error);
      const message = error instanceof Error ? error.message : '';
      if (/default credentials|credential|could not load the default/i.test(message)) {
        return res.status(503).json({ message: 'Google Cloud credentials are missing or invalid. Run gcloud auth application-default login or configure GOOGLE_APPLICATION_CREDENTIALS on the server.' });
      }
      return res.status(502).json({ message: 'Could not reach Google Speech-to-Text. Check the server internet connection and try again.' });
    }
  },
);
