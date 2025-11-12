import { randomUUID } from 'crypto';

import type { XeroConnection, XeroInvoice, XeroTokenResponse } from './types';

const AUTH_BASE = 'https://login.xero.com/identity/connect/authorize';
const TOKEN_URL = 'https://identity.xero.com/connect/token';
const CONNECTIONS_URL = 'https://api.xero.com/connections';
const API_BASE = 'https://api.xero.com/api.xro/2.0';

const SCOPES = [
  'offline_access',
  'accounting.transactions.read',
  'accounting.contacts.read',
];

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function buildAuthorizeUrl(state: string, redirectUri: string) {
  const clientId = getEnv('XERO_CLIENT_ID');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES.join(' '),
    state,
  });

  return `${AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<XeroTokenResponse> {
  const clientId = getEnv('XERO_CLIENT_ID');
  const clientSecret = getEnv('XERO_CLIENT_SECRET');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('Failed to exchange authorization code with Xero');
  }

  const data = (await response.json()) as XeroTokenResponse;
  return data;
}

export async function refreshAccessToken(refreshToken: string): Promise<XeroTokenResponse> {
  const clientId = getEnv('XERO_CLIENT_ID');
  const clientSecret = getEnv('XERO_CLIENT_SECRET');

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Xero access token');
  }

  return (await response.json()) as XeroTokenResponse;
}

export async function fetchConnections(accessToken: string): Promise<XeroConnection[]> {
  const response = await fetch(CONNECTIONS_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve Xero connections');
  }

  return (await response.json()) as XeroConnection[];
}

export async function fetchXeroInvoices(
  accessToken: string,
  tenantId: string
): Promise<XeroInvoice[]> {
  // Fetch all invoices including PAID ones (exclude only VOIDED)
  // This allows us to track when invoices are marked as paid
  const params = new URLSearchParams({
    where: 'Status!="VOIDED"',
    order: 'DueDate DESC',
  });

  const response = await fetch(`${API_BASE}/Invoices?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'xero-tenant-id': tenantId,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Xero API error:', response.status, errorText);
    throw new Error(`Failed to fetch invoices from Xero: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  console.log('[fetchXeroInvoices] Fetched invoices:', {
    total: json.Invoices?.length || 0,
    statusBreakdown: json.Invoices?.reduce((acc: any, inv: any) => {
      acc[inv.Status] = (acc[inv.Status] || 0) + 1;
      return acc;
    }, {}),
  });
  return (json.Invoices ?? []) as XeroInvoice[];
}

export function generateState() {
  return randomUUID();
}

