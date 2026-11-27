import { useMemo } from 'react';
import { Layer, Line } from 'react-konva';
import { CANVAS_DEFAULTS, GRID_CONFIG } from '../../constants/defaults.js';

/**
 * Lightweight Konva Layer rendering a fixed grid overlay on the canvas artboard.
 *
 * The grid is drawn once from constants; it never re-renders unless the
 * component is unmounted/remounted, keeping it completely free of store
 * subscriptions or prop-driven updates.
 *
 * @param {{ visible: boolean }} props
 * @returns {JSX.Element | null}
 */
export function GridLayer({ visible }) {
  /** Pre-compute all line points once. The grid does not change at runtime. */
  const { verticalLines, horizontalLines } = useMemo(() => {
    const { WIDTH, HEIGHT } = CANVAS_DEFAULTS;
    const { SIZE } = GRID_CONFIG;

    const vLines = [];
    for (let x = SIZE; x < WIDTH; x += SIZE) {
      vLines.push({ key: `v-${x}`, points: [x, 0, x, HEIGHT] });
    }

    const hLines = [];
    for (let y = SIZE; y < HEIGHT; y += SIZE) {
      hLines.push({ key: `h-${y}`, points: [0, y, WIDTH, y] });
    }

    return { verticalLines: vLines, horizontalLines: hLines };
  }, []);

  if (!visible) return null;

  return (
    <Layer listening={false}>
      {verticalLines.map((line) => (
        <Line
          key={line.key}
          points={line.points}
          stroke={GRID_CONFIG.STROKE}
          strokeWidth={1}
          opacity={GRID_CONFIG.OPACITY}
          perfectDrawEnabled={false}
        />
      ))}
      {horizontalLines.map((line) => (
        <Line
          key={line.key}
          points={line.points}
          stroke={GRID_CONFIG.STROKE}
          strokeWidth={1}
          opacity={GRID_CONFIG.OPACITY}
          perfectDrawEnabled={false}
        />
      ))}
    </Layer>
  );
}
