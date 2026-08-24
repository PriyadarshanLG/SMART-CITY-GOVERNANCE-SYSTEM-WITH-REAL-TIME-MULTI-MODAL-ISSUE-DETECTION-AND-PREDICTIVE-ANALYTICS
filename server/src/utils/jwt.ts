import crypto from 'crypto';
import { env } from '../config/env.js';

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signJwt(payload: Record<string, string>, secret: string, expiresIn: string) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const issuedAt = Math.floor(Date.now() / 1000);
  const expirationSeconds = expiresIn.endsWith('d')
    ? Number.parseInt(expiresIn, 10) * 24 * 60 * 60
    : expiresIn.endsWith('m')
      ? Number.parseInt(expiresIn, 10) * 60
      : expiresIn.endsWith('h')
        ? Number.parseInt(expiresIn, 10) * 60 * 60
        : Number.parseInt(expiresIn, 10);

  const body = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + expirationSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const unsignedToken = `${encodedHeader}.${encodedBody}`;
  const signature = crypto.createHmac('sha256', secret).update(unsignedToken).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${unsignedToken}.${signature}`;
}

export function signAccessToken(payload: { userId: string; role: string }) {
  return signJwt(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES_IN);
}

export function signRefreshToken(payload: { userId: string; role: string }) {
  return signJwt(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN);
}

export function verifyJwt(token: string, secret: string) {
  const [headerPart, payloadPart, signaturePart] = token.split('.');

  if (!headerPart || !payloadPart || !signaturePart) {
    throw new Error('Invalid token format');
  }

  const unsignedToken = `${headerPart}.${payloadPart}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(unsignedToken).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (expectedSignature !== signaturePart) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString('utf8')) as {
    exp?: number;
    userId: string;
    role: string;
  };

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}
