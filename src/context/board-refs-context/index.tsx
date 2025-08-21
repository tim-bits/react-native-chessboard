import type { Move, Square } from 'chess.js';
import React, {
  createContext,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  useContext
} from 'react';
import type {
  ChessboardState,
} from '../../helpers/get-chessboard-state';

import {
  getChessboardState,
} from '../../helpers/get-chessboard-state';
import type { ChessPieceRef } from '../../components/piece';
import type { HighlightedSquareRefType } from '../../components/highlighted-squares/highlighted-square';

import { useChessEngine } from '../chess-engine-context/hooks';
import { useSetBoard } from '../board-context/hooks';
import { useChessboardProps } from '../props-context/hooks';

import { useSharedValue } from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';

// import type { ChessboardProps } from '../props-context';
// const { onMoveStart, onMoveEnd } = useChessboardProps();

const PieceRefsContext = createContext<React.MutableRefObject<Record<
  Square,
  React.MutableRefObject<ChessPieceRef>
> | null> | null>(null);

const SquareRefsContext = createContext<React.MutableRefObject<Record<
  Square,
  React.MutableRefObject<HighlightedSquareRefType>
> | null> | null>(null);


export type ArrowPair = [Square, Square];

interface ArrowsContextValue {
  arrowsState: ArrowPair[];
  setArrowsState: React.Dispatch<React.SetStateAction<ArrowPair[]>>;
}

// const ArrowsContext = createContext<ArrowPair[] | null>(null);
const ArrowsContext = createContext<ArrowsContextValue | undefined>(undefined);

export const ArrowsAnimContext = createContext<SharedValue<number> | null>(null);

// export function useArrows() {
//   const ctx = useContext(ArrowsContext);
//   if (!ctx) throw new Error("useArrows must be used within ArrowsContextProvider");
//   return ctx;
// }

// export const ArrowsDispatchContext = createContext<
//   ((arrows: ArrowPair[]) => void) | null
// >(null);

export type ChessboardRef = {
  undo: () => void;
  move: (_: {
    from: Square;
    to: Square;
  }) => Promise<Move | undefined> | undefined;
  highlight: (_: { square: Square; color?: string }) => void;
  resetAllHighlightedSquares: () => void;
  resetBoard: (fen?: string) => void;
  getState: () => ChessboardState;
  arrows: (arrows?: ArrowPair[]) => void;
};

const BoardRefsContextProviderComponent = React.forwardRef<
  ChessboardRef,
  { children?: React.ReactNode }
>(({ children }, ref) => {
  const chess = useChessEngine();
  const board = chess.board();
  const setBoard = useSetBoard();

  const { onMoveStart, onMoveEnd } = useChessboardProps();
  const [arrowsState, setArrowsState] = useState<ArrowPair[]>([]);
  const arrowsOpacity = useSharedValue(1);


  // There must be a better way of doing this.
  const generateBoardRefs = useCallback(() => {
    let acc = {};
    for (let x = 0; x < board.length; x++) {
      const row = board[x];
      for (let y = 0; y < row.length; y++) {
        const col = String.fromCharCode(97 + Math.round(x));
        // eslint-disable-next-line no-shadow
        const row = `${8 - Math.round(y)}`;
        const square = `${col}${row}` as Square;

        // eslint-disable-next-line react-hooks/rules-of-hooks
        acc = { ...acc, [square]: useRef(null) };
      }
    }
    return acc as any;
  }, [board]);

  const pieceRefs: React.MutableRefObject<Record<
    Square,
    React.MutableRefObject<ChessPieceRef>
  > | null> = useRef(generateBoardRefs());

  const squareRefs: React.MutableRefObject<Record<
    Square,
    React.MutableRefObject<HighlightedSquareRefType>
  > | null> = useRef(generateBoardRefs());

  useImperativeHandle(
    ref,
    () => ({
      // move: ({ from, to }) => {
      //   console.log('move', from, to)
      //   setArrowsState([])
      //   return pieceRefs?.current?.[from].current?.moveTo?.(to);
      // },

    move: async ({ from, to }) => {
      // Fire onMoveStart before animation
      if (onMoveStart) {
        try {
          const stateBefore = getChessboardState(chess);
          // We don’t yet have a chess.js Move object; provide {from,to} to the consumer
          //  we pass a shape compatible with ChessMoveInfo.move where needed
          onMoveStart({ move: { from, to } as any, state: { ...stateBefore, in_promotion: false } });
        } catch {}
      }

      arrowsOpacity.value = 0;
      setArrowsState([]);
      
      const result = await pieceRefs?.current?.[from]?.current?.moveTo?.(to);

      // Fire onMoveEnd after animation completes
      if (result && onMoveEnd) {
        try {
          const stateAfter = getChessboardState(chess);
          onMoveEnd({ move: result, state: { ...stateAfter, in_promotion: false } });
        } catch {}
      }

      return result;
    },

      undo: () => {
        chess.undo();
        setBoard(chess.board());
      },
      highlight: ({ square, color }) => {
        squareRefs.current?.[square].current.highlight({
          backgroundColor: color,
        });
      },
      resetAllHighlightedSquares: () => {
        for (let x = 0; x < board.length; x++) {
          const row = board[x];
          for (let y = 0; y < row.length; y++) {
            const col = String.fromCharCode(97 + Math.round(x));
            // eslint-disable-next-line no-shadow
            const row = `${8 - Math.round(y)}`;
            const square = `${col}${row}` as Square;
            squareRefs.current?.[square].current.reset();
          }
        }
      },
      getState: () => {
        return getChessboardState(chess);
      },
      resetBoard: (fen) => {
        chess.reset();
        if (fen) chess.load(fen);
        setBoard(chess.board());
      },
      
      arrows: (pairs: ArrowPair[] | undefined) => {
        setArrowsState(pairs || []);
      },
      hideArrowsNow: () => { arrowsOpacity.value = 0; },
      showArrowsNow: () => { arrowsOpacity.value = 1; },
    }),
    [board, chess, setBoard, onMoveStart, onMoveEnd, arrowsOpacity]
  );

  return (
    <PieceRefsContext.Provider value={pieceRefs}>
      <SquareRefsContext.Provider value={squareRefs}>
        <ArrowsContext.Provider value={{arrowsState, setArrowsState}}>
            <ArrowsAnimContext.Provider value={arrowsOpacity}>
              {/* <ArrowsDispatchContext.Provider value={setArrowsState}> */}
                  {children}
              {/* </ArrowsDispatchContext.Provider> */}
          </ArrowsAnimContext.Provider>
        </ArrowsContext.Provider>
      </SquareRefsContext.Provider>
    </PieceRefsContext.Provider>
  );
});

const BoardRefsContextProvider = React.memo(BoardRefsContextProviderComponent);

export { PieceRefsContext, SquareRefsContext, BoardRefsContextProvider, ArrowsContext };
