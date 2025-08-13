import React, { memo } from 'react';
import { View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

type ArrowPair = [string, string];
type Orientation = 'white' | 'black';

type Props = {
  arrows: ArrowPair[];                // e.g. [['e2','e4'], ['g2','g3']]
  boardSize: number;                  // overall board px
  squareSize: number;                 // one square px
  orientation?: Orientation;          // default 'white'
  color?: string;                     // fill color
  borderColor?: string;
  zIndex?: number;
};

const round = (n: number) => Math.round(n * 10) / 10; // keep coordinates tidy for web

function squareToCenter(square: string, squareSize: number, orientation: Orientation = 'white') {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0..7
  const rank = parseInt(square[1], 10) - 1;              // 0..7 (1 -> 0)
  if (orientation === 'white') {
    const x = file * squareSize + squareSize / 2;
    const y = (7 - rank) * squareSize + squareSize / 2;
    return { x: round(x), y: round(y) };
  } else {
    // flipped board (black at bottom)
    const x = (7 - file) * squareSize + squareSize / 2;
    const y = rank * squareSize + squareSize / 2;
    return { x: round(x), y: round(y) };
  }
}

const ArrowOverlay: React.FC<Props> = ({
  arrows = [],
  boardSize,
  squareSize,
  orientation = 'white',
  color = 'rgba(0,128,255,0.7)',
  borderColor = 'rgba(0,0,0,0.3)',
}) => {
  if (!arrows || arrows.length === 0) return null;

  const baseThickness = Math.max(1, squareSize * 0.15); // 15% of square height, clamp min 1px
  const headLength = Math.max(8, squareSize * 0.22);    // arrowhead length in px

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width: boardSize, height: boardSize, zIndex: 50 }}>
      <Svg width={boardSize} height={boardSize} viewBox={`0 0 ${boardSize} ${boardSize}`}>
        {arrows.map(([from, to], idx) => {
          const start = squareToCenter(from, squareSize, orientation);
          const end = squareToCenter(to, squareSize, orientation);

          // compute angle and shorten the shaft to make room for head
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const angle = Math.atan2(dy, dx);
          const headLen = headLength;
          const shaftEndX = end.x - headLen * Math.cos(angle);
          const shaftEndY = end.y - headLen * Math.sin(angle);

          // thickness falling with priority (0 is highest)
          const thickness = round(baseThickness * Math.pow(0.7, idx));
          const borderThickness = Math.max(1, Math.round(thickness * 0.6));

          // arrow head triangle points
          const wingAngle = Math.PI / 6; // 30°
          const p1x = end.x;
          const p1y = end.y;
          const p2x = end.x - headLen * Math.cos(angle - wingAngle);
          const p2y = end.y - headLen * Math.sin(angle - wingAngle);
          const p3x = end.x - headLen * Math.cos(angle + wingAngle);
          const p3y = end.y - headLen * Math.sin(angle + wingAngle);

          const linePath = `M ${start.x} ${start.y} L ${shaftEndX} ${shaftEndY}`;

          return (
            <React.Fragment key={`arrow-${from}-${to}-${idx}`}>
              {/* border stroke for shaft */}
              <Path
                d={linePath}
                stroke={borderColor}
                strokeWidth={thickness + borderThickness * 2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* inner shaft */}
              <Path
                d={linePath}
                stroke={color}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* border for head */}
              <Polygon
                points={`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`}
                fill={borderColor}
              />
              {/* inner head */}
              <Polygon
                points={`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`}
                fill={color}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default memo(ArrowOverlay);
