import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  G,
} from 'react-native-svg';
import { RoutePoint } from '@/types';
import { useTheme } from '@/theme';
import { simplifyRoute } from '@/utils/geo';

interface RoutePathProps {
  points: RoutePoint[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  showPins?: boolean;
}

export function RoutePath({
  points,
  width = 300,
  height = 200,
  strokeWidth = 4,
  showPins = true,
}: RoutePathProps) {
  const { theme } = useTheme();

  if (!points || points.length < 2) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {
            width,
            height,
            backgroundColor: theme.colors.mapBg,
            borderColor: theme.colors.cardBorder,
          },
        ]}
      >
        <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
          Aguardando traçado da rota...
        </Text>
      </View>
    );
  }

  // Otimiza traçado caso tenha muitos pontos
  const smoothedPoints = points.length > 60 ? simplifyRoute(points, 2) : points;

  // Encontra limites geográficos (bounding box)
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  smoothedPoints.forEach((p) => {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  });

  const latSpan = Math.max(maxLat - minLat, 0.0001);
  const lngSpan = Math.max(maxLng - minLng, 0.0001);

  const padding = 24;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  // Função de projeção geo -> SVG
  const project = (pt: RoutePoint) => {
    const x = padding + ((pt.longitude - minLng) / lngSpan) * usableWidth;
    // Inverte Y porque latitudes maiores ficam mais acima no hemisfério norte / tela
    const y = height - padding - ((pt.latitude - minLat) / latSpan) * usableHeight;
    return { x, y };
  };

  const svgPoints = smoothedPoints.map(project);

  // Constrói d do SVG Path com suavização Catmull-Rom para Bézier
  let d = `M ${svgPoints[0].x.toFixed(1)} ${svgPoints[0].y.toFixed(1)}`;
  for (let i = 1; i < svgPoints.length; i++) {
    const curr = svgPoints[i];
    d += ` L ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`;
  }

  const startPt = svgPoints[0];
  const endPt = svgPoints[svgPoints.length - 1];

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          backgroundColor: theme.colors.mapBg,
          borderColor: theme.colors.cardBorder,
        },
      ]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgGradient id="routeGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
            <Stop offset="50%" stopColor={theme.colors.accent} stopOpacity="1" />
            <Stop offset="100%" stopColor={theme.colors.primary} stopOpacity="1" />
          </SvgGradient>
        </Defs>

        {/* Glow / contorno traseiro */}
        <Path
          d={d}
          fill="none"
          stroke={theme.colors.primaryGlow}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Linha principal com gradiente */}
        <Path
          d={d}
          fill="none"
          stroke="url(#routeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {showPins ? (
          <G>
            {/* Ponto de partida (Verde) */}
            <Circle
              cx={startPt.x}
              cy={startPt.y}
              r={7}
              fill="#10B981"
              stroke="#FFFFFF"
              strokeWidth={2}
            />

            {/* Ponto de chegada / atual (Pulsante / Primário) */}
            <Circle cx={endPt.x} cy={endPt.y} r={9} fill={theme.colors.primaryGlow} />
            <Circle
              cx={endPt.x}
              cy={endPt.y}
              r={6}
              fill={theme.colors.primary}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          </G>
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
