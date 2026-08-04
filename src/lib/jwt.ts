// Pure JWT decode + analysis helpers. No DOM, no network — runs fully
// client-side. Imported by JwtDecoder.astro's hoisted script (the import
// itself triggers Vite to bundle this into /_astro/hoisted.*.js).
//
// Decoding ≠ verifying. Anyone can decode a JWT (the payload is base64, not
// encrypted). Only the signature proves authenticity. See securityScan() for
// the risks we surface.

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string; // raw base64url segment (may be empty for alg:none)
  parts: string[];
}

export interface SecurityFinding {
  level: 'danger' | 'warn' | 'info';
  message: string;
}

export interface TokenTypeInference {
  type: 'access' | 'id' | 'refresh' | 'service' | 'unknown';
  label: string;
  reason: string;
}

export interface TimeInfo {
  iso: string;
  relative: string;
  state: 'valid' | 'expired' | 'not-yet-valid';
}

/** base64url → UTF-8 string (handles padding + url-safe chars). */
function base64urlDecode(seg: string): string {
  let s = seg.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  // atob gives binary string; decode as UTF-8 for claims with non-ASCII
  const binary = atob(s);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

/** Decode a JWT into header + payload + signature. Throws on malformed input. */
export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim();
  if (!trimmed) throw new Error('malformed');
  const parts = trimmed.split('.');
  if (parts.length < 2 || parts.length > 3) throw new Error('malformed');
  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = JSON.parse(base64urlDecode(parts[0]));
    payload = JSON.parse(base64urlDecode(parts[1]));
  } catch {
    throw new Error('invalid-json');
  }
  if (typeof header !== 'object' || header === null) throw new Error('invalid-json');
  if (typeof payload !== 'object' || payload === null) throw new Error('invalid-json');
  return { header, payload, signature: parts[2] ?? '', parts };
}

// ── Token type inference ─────────────────────────────────────────────────────
// Heuristic — JWTs don't carry an explicit "I am an access token" field, so we
// infer from the claim set. Reasoning is always shown so the user can judge.

export function inferTokenType(header: Record<string, unknown>, payload: Record<string, unknown>): TokenTypeInference {
  const has = (...keys: string[]) => keys.every((k) => k in payload);
  const alg = String(header['alg'] ?? '').toLowerCase();

  // OIDC ID token: identifies a user end-point, carries login claims.
  if ((has('email') || has('email_verified') || has('preferred_username')) && has('sub', 'iss', 'aud')) {
    return { type: 'id', label: 'OIDC ID token', reason: 'Contains user identity claims (email/sub) + aud — this proves who the user is to the client.' };
  }
  // Service account / signed JWT assertion (RFC 7523): iss is a service email,
  // carries scope, no individual user.
  if (has('iss', 'scope') && (alg === 'rs256' || alg === 'es256') && !has('sub')) {
    return { type: 'service', label: 'Service account assertion', reason: 'iss + scope, signed (RS/ES), no user sub — a service authenticating itself to an API.' };
  }
  // OAuth access token: carried to resource servers, short-lived, scoped.
  if ((has('scope') || has('client_id') || has('aud')) && has('exp', 'iss')) {
    return { type: 'access', label: 'OAuth access token', reason: 'scope/aud + exp + iss — presented to APIs to act on behalf of a user.' };
  }
  return { type: 'unknown', label: 'Unknown / custom', reason: 'No standard claim pattern detected — could be a custom token or an opaque token that only your server understands.' };
}

// ── Security scan ────────────────────────────────────────────────────────────

const SENSITIVE_KEYS = ['password', 'passwd', 'secret', 'private_key', 'privatekey', 'api_key', 'apikey', 'credit_card', 'creditcard', 'ssn', 'cardnumber', 'cvv', 'pin'];

function isSensitive(key: string): boolean {
  const k = key.toLowerCase();
  return SENSITIVE_KEYS.some((s) => k === s || k.includes(s));
}

export function securityScan(header: Record<string, unknown>, payload: Record<string, unknown>): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const alg = header['alg'];
  const algStr = String(alg ?? '').toLowerCase();

  // Algorithm
  if (algStr === 'none') {
    findings.push({ level: 'danger', message: 'alg: none — this token has no signature. Anyone could forge it. Never accept alg:none tokens.' });
  } else if (!alg) {
    findings.push({ level: 'warn', message: 'Header is missing alg. Signature algorithm is undefined.' });
  } else if (algStr.startsWith('hs')) {
    findings.push({ level: 'info', message: `${algStr.toUpperCase()} — HMAC (symmetric). Verification needs the shared secret. Anyone with the secret can sign tokens; the secret must never ship to a client.` });
  } else if (algStr.startsWith('rs') || algStr.startsWith('ps') || algStr.startsWith('es') || algStr === 'eddsa') {
    findings.push({ level: 'info', message: `${algStr.toUpperCase()} — asymmetric (public/private key pair). Verify with the public key; the private key stays on the signer.` });
  } else {
    findings.push({ level: 'warn', message: `Unrecognized algorithm: ${alg}.` });
  }

  // Expiry
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload['exp'] === 'number') {
    if (payload['exp'] < now) {
      findings.push({ level: 'danger', message: `Expired ${formatRelative(payload['exp'], now)}. Server should reject it.` });
    }
  } else {
    findings.push({ level: 'warn', message: 'No exp claim — this token never expires. Long-lived tokens raise the blast radius if stolen.' });
  }
  if (typeof payload['nbf'] === 'number' && payload['nbf'] > now) {
    findings.push({ level: 'warn', message: `Not valid yet (nbf is ${formatRelative(payload['nbf'], now)}).` });
  }
  if (typeof payload['iat'] === 'number' && payload['iat'] > now + 60) {
    findings.push({ level: 'warn', message: 'iat is in the future — clock skew or a forged token.' });
  }

  // Sensitive data exposure (payload is not encrypted!)
  const sensitiveFound = Object.keys(payload).filter(isSensitive);
  if (sensitiveFound.length > 0) {
    findings.push({ level: 'danger', message: `Payload contains sensitive field(s): ${sensitiveFound.join(', ')}. JWT payloads are only base64-encoded, not encrypted — anyone who reads the token sees these.` });
  }

  return findings;
}

// ── Timestamps ───────────────────────────────────────────────────────────────

function formatRelative(target: number, now: number): string {
  const diff = target - now;
  const abs = Math.abs(diff);
  const past = diff < 0;
  const units: Array<[number, string]> = [
    [60, 'second'], [3600, 'minute'], [86400, 'hour'], [604800, 'day'], [2592000, 'month'], [Infinity, 'year'],
  ];
  let div = 1; let unit = 'second';
  for (let i = 0; i < units.length; i++) {
    if (abs < units[i][0]) { div = i === 0 ? 1 : units[i - 1][0]; unit = units[i][1]; break; }
    div = units[i][0]; unit = units[i][1];
  }
  const value = Math.round(abs / div);
  const phrase = past ? `${value} ${unit}${value === 1 ? '' : 's'} ago` : `in ${value} ${unit}${value === 1 ? '' : 's'}`;
  return phrase;
}

export function describeTime(claim: unknown): TimeInfo | null {
  if (typeof claim !== 'number') return null;
  const ms = claim * 1000;
  const now = Math.floor(Date.now() / 1000);
  let state: TimeInfo['state'] = 'valid';
  // state is contextual; caller knows the claim name. We give best-effort:
  return {
    iso: new Date(ms).toISOString(),
    relative: formatRelative(claim, now),
    state,
  };
}

// ── Claim explanations ───────────────────────────────────────────────────────
// English only — these are standard technical terms; UI chrome around them is
// fully localized via i18n.

export const CLAIM_EXPLANATIONS: Record<string, string> = {
  iss: 'Issuer — who issued the token (authorization server URL or identifier).',
  sub: 'Subject — whom the token is about, usually the user id.',
  aud: 'Audience — who the token is intended for (client id or resource).',
  exp: 'Expiration — the token must not be accepted after this time.',
  nbf: 'Not before — the token must not be accepted before this time.',
  iat: 'Issued at — when the token was created.',
  jti: 'JWT ID — a unique identifier; used to prevent replay.',
  scope: 'Scope — the permissions granted, space-delimited.',
  scopes: 'Scopes — the permissions granted.',
  client_id: 'The OAuth client that requested this token.',
  azp: 'Authorized party — the client authorized to use the token.',
  typ: 'Token type (usually "JWT" or "at+jwt").',
  alg: 'Signature algorithm used to sign the header + payload.',
  kid: 'Key ID — which key to use to verify the signature.',
  email: 'User email (OIDC).',
  email_verified: 'Whether email was verified (OIDC).',
  name: 'User full name (OIDC).',
  preferred_username: 'User handle / display name (OIDC).',
  given_name: 'Given (first) name (OIDC).',
  family_name: 'Family (last) name (OIDC).',
  locale: 'User locale (OIDC).',
  at_hash: 'Access token hash — binds this id token to an access token.',
  c_hash: 'Code hash — binds this id token to an authorization code.',
  nonce: 'Replay-protection value set by the client during login.',
  amr: 'Authentication methods — how the user authenticated.',
  auth_time: 'When the user authenticated (re-auth sensitivity).',
};

export function explainClaim(key: string): string | undefined {
  return CLAIM_EXPLANATIONS[key.toLowerCase()];
}
