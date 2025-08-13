import { useContext } from 'react';
import { useChessboardProps } from '../context/props-context/hooks';
import { ArrowsContext, ArrowPair } from '../context/board-refs-context';
import { useChessEngine } from '../context/chess-engine-context/hooks';

type Orientation = 'white' | 'black';

export type VisualWithArrows = {
  boardSize: number;
  squareSize: number; // same as pieceSize
  orientation: Orientation;
  arrows: ArrowPair[];
};

export const useBoardVisualWithArrows = (): VisualWithArrows => {
  const props = useChessboardProps();
  const arrows = useContext(ArrowsContext) || [];
  const chess = useChessEngine();
  const turn = chess?.turn?.(); // 'w' | 'b'
  const orientation: Orientation = turn === 'b' ? 'black' : 'white';

  const { boardSize, pieceSize } = props;
  return { boardSize, squareSize: pieceSize, orientation, arrows };
};



// import { useContext } from 'react';
// import { ChessboardPropsContext } from '../context/props-context';
// import { ArrowsContext, ArrowPair } from '../context/board-refs-context';
// import { useChessEngine } from '../context/chess-engine-context/hooks';

// type Orientation = 'white' | 'black';

// export const useBoardVisualWithArrows = () => {
//   const props = useContext(ChessboardPropsContext);
//   if (!props) throw new Error('useBoardVisualWithArrows must be used inside providers');

//   const arrows = useContext(ArrowsContext) || [];
//   const chess = useChessEngine();
//   const turn = chess?.turn?.();
//   const orientation: Orientation = turn === 'b' ? 'black' : 'white';

//   const { boardSize, pieceSize } = props;
//   return { boardSize, squareSize: pieceSize, orientation, arrows };
// };


// import { useContext } from 'react';
// import { useChessboardProps } from '../props-context'; // <-- if this exists
// import { ArrowsContext, ArrowPair } from '../board-ref-context';
// import { useChessEngine } from '../chess-engine-context/hooks';

// type Orientation = 'white' | 'black';
// export type VisualWithArrows = {
//   boardSize: number;
//   squareSize: number; // same as pieceSize
//   orientation: Orientation;
//   arrows: ArrowPair[];
// };

// export const useBoardVisualWithArrows = (): VisualWithArrows => {
//   const props = useChessboardProps();
//   const arrows = useContext(ArrowsContext) || [];
//   const chess = useChessEngine();
//   const turn = chess?.turn?.(); // 'w' | 'b'
//   const orientation: Orientation = turn === 'b' ? 'black' : 'white';

//   // pieceSize in props is the square size
//   const { boardSize, pieceSize } = props;
//   return { boardSize, squareSize: pieceSize, orientation, arrows };
// };
