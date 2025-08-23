import type { Move, Square } from 'chess.js';
import React, {
  createContext,
  useCallback,
  useImperativeHandle,
  useRef,
  useState
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

import { Platform } from 'react-native';

// Web-only: get ReactDOM.flushSync if available
let flushSync: ((cb: () => void) => void) | null = null;
// if (typeof window !== 'undefined' && Platform.OS === 'web') {
if (Platform.OS === 'web') {  
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    flushSync = require('react-dom').flushSync;
  } catch {
    flushSync = null;
  }
}


const PieceRefsContext = createContext<React.MutableRefObject<Record<
  Square,
  React.MutableRefObject<ChessPieceRef>
> | null> | null>(null);

const SquareRefsContext = createContext<React.MutableRefObject<Record<
  Square,
  React.MutableRefObject<HighlightedSquareRefType>
> | null> | null>(null);


export type ArrowPair = [Square, Square];

const ArrowsContext = createContext<ArrowPair[] | null>(null);

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

  const [arrowsState, setArrowsState] = useState<ArrowPair[]>([]);


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
      move: ({ from, to }) => {
        // setArrowsState([])
      if (Platform.OS === 'web' && flushSync) {
        flushSync(() => setArrowsState([]));
      }

        return pieceRefs?.current?.[from].current?.moveTo?.(to);
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
      
      // arrows: (pairs: ArrowPair[] | undefined) => {
      //   setArrowsState(pairs || []);
      // }

      arrows: (pairs: ArrowPair[] | undefined) => {
        const next = pairs || [];
        if (Platform.OS === 'web' && next.length === 0 && flushSync) {
          // synchronous clear on web so no stale arrows can render under new orientation
          flushSync(() => setArrowsState([]));
        } else {
          setArrowsState(next);
        }
      }

    }),
    [board, chess, setBoard]
  );

  return (
    <PieceRefsContext.Provider value={pieceRefs}>
      <SquareRefsContext.Provider value={squareRefs}>
        <ArrowsContext.Provider value={arrowsState}>
        {children}
        </ArrowsContext.Provider>
      </SquareRefsContext.Provider>
    </PieceRefsContext.Provider>
  );
});

const BoardRefsContextProvider = React.memo(BoardRefsContextProviderComponent);

export { PieceRefsContext, SquareRefsContext, BoardRefsContextProvider, ArrowsContext };
