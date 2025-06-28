import React, {useRef} from 'react';
import { useChessboardProps } from '../context/props-context/hooks';

import { useBoard } from '../context/board-context/hooks';
import { usePieceRefs } from '../context/board-refs-context/hooks';

import Piece from './piece';
import { useReversePiecePosition } from '../notation';

import Xarrow from "react-xarrows";

const Pieces = React.memo(() => {
  const board = useBoard();
  const refs = usePieceRefs();
  const { pieceSize } = useChessboardProps();
  const { toPosition } = useReversePiecePosition();

  const pieceRef = useRef<string>(null);

  return (
    <>
      {board.map((row, y) =>
        row.map((piece, x) => {
          if (piece !== null) {


            const square = toPosition({
              x: x * pieceSize,
              y: y * pieceSize,
            });

            console.log("square", square)
            pieceRef.current =  refs?.current?.[square] 


            const id=`${piece.color}${piece.type}` 

            const element = <Piece
                // ref={refs?.current?.[square]}
                ref = {pieceRef}
                key={`${x}-${y}`}
                id = {id}
                // id={`${piece.color}${piece.type}` as const}
                startPosition={{ x, y }}
                square={square}
                size={pieceSize}
              />

            // if(pieceRef.current) {
            //   <Xarrow
            //     start={pieceRef} //can be react ref
            //     end={id} //or an id
            //   />
            // } else {
            //   pieceRef.current = id;
            // }

            return (
              // <Piece
              //   ref={refs?.current?.[square]}
              //   key={`${x}-${y}`}
              //   id = {id}
              //   // id={`${piece.color}${piece.type}` as const}
              //   startPosition={{ x, y }}
              //   square={square}
              //   size={pieceSize}
              // />
              element
            );
          }
          return null;
        })
      )}
    </>
  );
});

export { Pieces };
