import {
  haversineMeters,
  isPlausibleJump,
  routeDistanceMeters,
  averagePaceSecPerKm,
  formatDistance,
  formatDuration,
  formatPace,
  estimateCalories,
  simplifyRoute,
} from '@/utils/geo';
import { RoutePoint } from '@/types';

describe('Geo Utilities', () => {
  describe('haversineMeters', () => {
    it('calcula a distância de ~111km para 1 grau de latitude', () => {
      const dist = haversineMeters(0, 0, 1, 0);
      expect(Math.round(dist / 1000)).toBe(111);
    });

    it('retorna 0 para pontos idênticos', () => {
      const dist = haversineMeters(-15.7801, -47.9292, -15.7801, -47.9292);
      expect(dist).toBe(0);
    });

    it('calcula distância razoável entre dois pontos em Brasília (~1km)', () => {
      // Eixo Monumental
      const dist = haversineMeters(-15.7983, -47.8756, -15.7975, -47.8845);
      expect(dist).toBeGreaterThan(800);
      expect(dist).toBeLessThan(1200);
    });
  });

  describe('isPlausibleJump', () => {
    it('aceita deslocamento plausível de corrida (ex: 20m em 4s = 5m/s)', () => {
      const p1: RoutePoint = {
        latitude: -15.7983,
        longitude: -47.8756,
        timestamp: 1000,
      };
      // ~20 metros adiante
      const p2: RoutePoint = {
        latitude: -15.79848,
        longitude: -47.8756,
        timestamp: 5000,
      };
      expect(isPlausibleJump(p1, p2, 10)).toBe(true);
    });

    it('rejeita pulo impossível (teletransporte de GPS)', () => {
      const p1: RoutePoint = {
        latitude: -15.7983,
        longitude: -47.8756,
        timestamp: 1000,
      };
      // 1 grau adiante (~111km) em 1 segundo
      const p2: RoutePoint = {
        latitude: -14.7983,
        longitude: -47.8756,
        timestamp: 2000,
      };
      expect(isPlausibleJump(p1, p2, 10)).toBe(false);
    });

    it('rejeita pontos com mesmo timestamp ou delta <= 0', () => {
      const p1: RoutePoint = {
        latitude: -15.7983,
        longitude: -47.8756,
        timestamp: 5000,
      };
      const p2: RoutePoint = {
        latitude: -15.7985,
        longitude: -47.8756,
        timestamp: 5000,
      };
      expect(isPlausibleJump(p1, p2)).toBe(false);
    });
  });

  describe('routeDistanceMeters', () => {
    it('retorna 0 para rotas vazias ou com apenas 1 ponto', () => {
      expect(routeDistanceMeters([])).toBe(0);
      expect(
        routeDistanceMeters([{ latitude: -15.79, longitude: -47.88, timestamp: 1000 }]),
      ).toBe(0);
    });

    it('soma os segmentos plausíveis', () => {
      const points: RoutePoint[] = [
        { latitude: 0, longitude: 0, timestamp: 0 },
        { latitude: 0.001, longitude: 0, timestamp: 20000 }, // ~111m em 20s = 5.5 m/s
        { latitude: 0.002, longitude: 0, timestamp: 40000 }, // ~111m
      ];
      const dist = routeDistanceMeters(points);
      expect(dist).toBeGreaterThan(200);
      expect(dist).toBeLessThan(250);
    });
  });

  describe('averagePaceSecPerKm', () => {
    it('retorna 300 s/km (5:00 min/km) para 1km em 5 minutos (300s)', () => {
      expect(averagePaceSecPerKm(300, 1000)).toBe(300);
    });

    it('retorna 0 quando distância é zero', () => {
      expect(averagePaceSecPerKm(300, 0)).toBe(0);
    });

    it('retorna 0 quando tempo é zero', () => {
      expect(averagePaceSecPerKm(0, 1000)).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('formata metros abaixo de 1000m', () => {
      expect(formatDistance(450)).toBe('450 m');
      expect(formatDistance(0)).toBe('0 m');
    });

    it('formata quilômetros a partir de 1000m', () => {
      expect(formatDistance(1000)).toBe('1.00 km');
      expect(formatDistance(5230)).toBe('5.23 km');
    });
  });

  describe('formatDuration', () => {
    it('formata segundos para mm:ss', () => {
      expect(formatDuration(0)).toBe('00:00');
      expect(formatDuration(65)).toBe('01:05');
      expect(formatDuration(599)).toBe('09:59');
    });

    it('formata segundos para h:mm:ss acima de 1 hora', () => {
      expect(formatDuration(3600)).toBe('1:00:00');
      expect(formatDuration(3665)).toBe('1:01:05');
    });
  });

  describe('formatPace', () => {
    it('formata ritmo corretamente', () => {
      expect(formatPace(300)).toBe(`05'00" /km`);
      expect(formatPace(325)).toBe(`05'25" /km`);
    });

    it('retorna traços para valores inválidos ou zero', () => {
      expect(formatPace(0)).toBe(`--'--" /km`);
      expect(formatPace(-1)).toBe(`--'--" /km`);
    });
  });

  describe('estimateCalories', () => {
    it('calcula calorias baseado no peso e distância', () => {
      // 5km * 70kg * 1.036 = ~362.6 kcal
      const cal = estimateCalories(5000, 1800, 70);
      expect(cal).toBe(363);
    });

    it('retorna 0 para distância zero', () => {
      expect(estimateCalories(0, 300, 70)).toBe(0);
    });
  });

  describe('simplifyRoute', () => {
    it('mantém rotas pequenas inalteradas', () => {
      const pts: RoutePoint[] = [
        { latitude: 0, longitude: 0, timestamp: 0 },
        { latitude: 1, longitude: 1, timestamp: 1 },
      ];
      expect(simplifyRoute(pts)).toEqual(pts);
    });

    it('simplifica pontos colineares intermediários', () => {
      const pts: RoutePoint[] = [
        { latitude: 0, longitude: 0, timestamp: 0 },
        { latitude: 0.5, longitude: 0.5, timestamp: 10 },
        { latitude: 1, longitude: 1, timestamp: 20 },
      ];
      const simplified = simplifyRoute(pts, 10);
      expect(simplified.length).toBe(2);
      expect(simplified[0]).toBe(pts[0]);
      expect(simplified[1]).toBe(pts[2]);
    });
  });
});
