import { kvIncr, kvIncrBy, kvGet } from './kv';
import { parseMicroUSDC, formatMicroUSDC } from './usdc-math';
import { FILM_CATALOG } from './catalog';

const KEY_PAYMENTS = 'metrics:totalPayments';
const KEY_REVENUE = 'metrics:totalRevenueMicro';
const KEY_SESSIONS = 'metrics:sessionsStarted';

export type ErrorType =
  | '402_lease_expired'
  | '402_cap_exceeded'
  | '402_payment_failed'
  | '402_other'
  | 'stream_fail'
  | 'token_fail'
  | 'wallet_fail'
  | 'server_error';

export type RouteName = 'pay' | 'stream' | 'token';

export type StreamSource = 'jellyfin' | 'demo';

export type ClientEvent =
  | 'play_started'
  | 'play_paused'
  | 'video_ended'
  | 'client_402'
  | 'client_stream_error'
  | 'client_token_error';

const PAYMENT_INTERVAL_MS = 15_000;

function errKey(type: ErrorType) { return `analytics:error:${type}`; }
function latCountKey(route: RouteName) { return `analytics:lat:${route}:count`; }
function latMsKey(route: RouteName) { return `analytics:lat:${route}:ms`; }
function srcKey(source: StreamSource) { return `analytics:source:${source}`; }
function filmPaymentsKey(id: string) { return `analytics:film:${id}:payments`; }
function filmRevenueKey(id: string) { return `analytics:film:${id}:revenueMicro`; }
function evtKey(event: ClientEvent) { return `analytics:event:${event}`; }

const KEY_HEARTBEAT_TOTAL = 'analytics:heartbeat:total';

export async function recordPayment(amount: string) {
  await kvIncr(KEY_PAYMENTS);
  await kvIncrBy(KEY_REVENUE, Number(parseMicroUSDC(amount)));
}

export async function recordSessionStarted() {
  await kvIncr(KEY_SESSIONS);
}

export async function recordError(type: ErrorType) {
  await kvIncr(errKey(type));
}

export async function recordLatency(route: RouteName, ms: number) {
  await kvIncr(latCountKey(route));
  await kvIncrBy(latMsKey(route), ms);
}

export async function recordStreamSource(source: StreamSource) {
  await kvIncr(srcKey(source));
}

export async function recordFilmPayment(filmId: string, amount: string) {
  await kvIncr(filmPaymentsKey(filmId));
  await kvIncrBy(filmRevenueKey(filmId), Number(parseMicroUSDC(amount)));
}

export async function recordHeartbeat() {
  await kvIncr(KEY_HEARTBEAT_TOTAL);
}

export async function recordClientEvent(event: ClientEvent) {
  await kvIncr(evtKey(event));
}

export async function getMetrics() {
  const totalPayments = parseInt((await kvGet(KEY_PAYMENTS)) ?? '0', 10);
  const totalRevenueMicro = BigInt((await kvGet(KEY_REVENUE)) ?? '0');
  const totalSessions = parseInt((await kvGet(KEY_SESSIONS)) ?? '0', 10);

  return {
    totalPayments,
    totalRevenue: formatMicroUSDC(totalRevenueMicro),
    totalRuntimeMs: totalPayments * PAYMENT_INTERVAL_MS,
    totalRuntimeMin: ((totalPayments * PAYMENT_INTERVAL_MS) / 60000).toFixed(1),
    totalSessions,
  };
}

export type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

export async function getAnalytics() {
  const totalPayments = parseInt((await kvGet(KEY_PAYMENTS)) ?? '0', 10);
  const totalRevenueMicro = BigInt((await kvGet(KEY_REVENUE)) ?? '0');
  const totalSessions = parseInt((await kvGet(KEY_SESSIONS)) ?? '0', 10);

  const errorTypes: ErrorType[] = [
    '402_lease_expired', '402_cap_exceeded', '402_payment_failed', '402_other',
    'stream_fail', 'token_fail', 'wallet_fail', 'server_error',
  ];
  const errors: Record<string, number> = {};
  let totalErrors = 0;
  for (const t of errorTypes) {
    const v = parseInt((await kvGet(errKey(t))) ?? '0', 10);
    errors[t] = v;
    totalErrors += v;
  }

  const routes: RouteName[] = ['pay', 'stream', 'token'];
  const latency: Record<string, { avgMs: number; count: number }> = {};
  for (const r of routes) {
    const count = parseInt((await kvGet(latCountKey(r))) ?? '0', 10);
    const totalMs = parseInt((await kvGet(latMsKey(r))) ?? '0', 10);
    latency[r] = { avgMs: count > 0 ? Math.round(totalMs / count) : 0, count };
  }

  const sources: Record<string, number> = {};
  for (const s of ['jellyfin', 'demo'] as StreamSource[]) {
    sources[s] = parseInt((await kvGet(srcKey(s))) ?? '0', 10);
  }

  const perFilm: Record<string, { payments: number; revenue: string }> = {};
  for (const film of FILM_CATALOG) {
    const payments = parseInt((await kvGet(filmPaymentsKey(film.id))) ?? '0', 10);
    const revenueMicro = BigInt((await kvGet(filmRevenueKey(film.id))) ?? '0');
    if (payments > 0) {
      perFilm[film.id] = { payments, revenue: formatMicroUSDC(revenueMicro) };
    }
  }

  const heartbeats = parseInt((await kvGet(KEY_HEARTBEAT_TOTAL)) ?? '0', 10);

  const clientEvents: Record<string, number> = {};
  const clientEventTypes: ClientEvent[] = [
    'play_started', 'play_paused', 'video_ended',
    'client_402', 'client_stream_error', 'client_token_error',
  ];
  for (const e of clientEventTypes) {
    clientEvents[e] = parseInt((await kvGet(evtKey(e))) ?? '0', 10);
  }

  const totalRequests = totalPayments + totalSessions;
  const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(1) : '0.0';

  return {
    totalPayments,
    totalRevenue: formatMicroUSDC(totalRevenueMicro),
    totalRuntimeMs: totalPayments * PAYMENT_INTERVAL_MS,
    totalRuntimeMin: ((totalPayments * PAYMENT_INTERVAL_MS) / 60000).toFixed(1),
    totalSessions,
    errors,
    totalErrors,
    errorRate,
    latency,
    sources,
    perFilm,
    heartbeats,
    clientEvents,
  };
}
