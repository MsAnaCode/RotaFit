import { RoutePoint } from '@/types';

const EARTH_RADIUS_METERS = 6371000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function isPlausibleJump(
  p1: RoutePoint,
  p2: RoutePoint,
  maxSpeedMps: number = 10, // ~36 km/h, limite humano para corrida
): boolean {
  const dtSeconds = Math.abs(p2.timestamp - p1.timestamp) / 1000;
  if (dtSeconds <= 0) return false;

  const dist = haversineMeters(p1.latitude, p1.longitude, p2.latitude, p2.longitude);

  const speed = dist / dtSeconds;
  return speed <= maxSpeedMps;
}

export function routeDistanceMeters(points: RoutePoint[]): number {
  if (points.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (isPlausibleJump(prev, curr)) {
      total += haversineMeters(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
      );
    }
  }

  return Math.round(total);
}

export function averagePaceSecPerKm(durationSec: number, distanceMeters: number): number {
  if (distanceMeters <= 0 || durationSec <= 0) return 0;
  const km = distanceMeters / 1000;
  return Math.round(durationSec / km);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = (meters / 1000).toFixed(2);
  return `${km} km`;
}

export function formatDuration(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSec = sec % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(remainingSec)}`;
  }
  return `${pad(minutes)}:${pad(remainingSec)}`;
}

export function formatPace(paceSecPerKm: number): string {
  if (!paceSecPerKm || paceSecPerKm <= 0 || !isFinite(paceSecPerKm)) {
    return `--'--" /km`;
  }
  const min = Math.floor(paceSecPerKm / 60);
  const sec = Math.floor(paceSecPerKm % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(min)}'${pad(sec)}" /km`;
}

export function estimateCalories(
  distanceMeters: number,
  _durationSec?: number,
  weightKg: number = 70,
): number {
  if (distanceMeters <= 0) return 0;
  const km = distanceMeters / 1000;
  // Regra padrão de gasto calórico de corrida por km por peso corporal
  return Math.round(km * weightKg * 1.036);
}

// Algoritmo Ramer-Douglas-Peucker para simplificação de rota
export function simplifyRoute(
  points: RoutePoint[],
  toleranceMeters: number = 2,
): RoutePoint[] {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > maxDistance) {
      index = i;
      maxDistance = d;
    }
  }

  if (maxDistance > toleranceMeters) {
    const recResults1 = simplifyRoute(points.slice(0, index + 1), toleranceMeters);
    const recResults2 = simplifyRoute(points.slice(index), toleranceMeters);
    return recResults1.slice(0, recResults1.length - 1).concat(recResults2);
  }

  return [points[0], points[end]];
}

function perpendicularDistance(p: RoutePoint, p1: RoutePoint, p2: RoutePoint): number {
  const x = p.longitude;
  const y = p.latitude;
  const x1 = p1.longitude;
  const y1 = p1.latitude;
  const x2 = p2.longitude;
  const y2 = p2.latitude;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return haversineMeters(y, x, y1, x1);
  }

  const numerator = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(dy * dy + dx * dx);
  // Escala aproximada em metros usando a latitude média
  const degDist = numerator / denominator;
  return degDist * 111320;
}
