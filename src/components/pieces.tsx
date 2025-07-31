import React, {useRef} from 'react';
// import  {View} from 'react-native';
import { useChessboardProps } from '../context/props-context/hooks';

import { useBoard } from '../context/board-context/hooks';
import { usePieceRefs } from '../context/board-refs-context/hooks';

import Piece from './piece';
import { useReversePiecePosition } from '../notation';

import Xarrow, {Xwrapper} from "react-xarrows";
import { PieceType } from 'src/types';

const Pieces = React.memo(() => {
  const board = useBoard();
  const refs = usePieceRefs();
  const { pieceSize } = useChessboardProps();
  const { toPosition } = useReversePiecePosition();

  // const pieceRef = useRef<string>(null);
  const pieceRef:React.MutableRefObject<string | null> = useRef<string | null>(null);
  const element:React.MutableRefObject<PieceType | null>= useRef<PieceType | null>(null);

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
            // pieceRef.current =  refs?.current?.[square] 



            const id=`${piece.color}${piece.type}` as const

            //  (async ()=>{pieceRef.current = id})()

            // if(square ==='h1') {
              // pieceRef.current = 'a8';
            // }

            if (element.current === null) {
            element.current = <Piece
                // ref={refs?.current?.[square]}
                ref = {pieceRef}
                key={`${x}-${y}`}
                id = {id}
                // id={`${piece.color}${piece.type}` as const}
                startPosition={{ x, y }}
                square={square}
                size={pieceSize}
              />
              pieceRef.current = id;
            }
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
              <>
              {/* {pieceRef.current &&  */}
              <Xwrapper key={id}>
                <Piece
                ref={refs?.current?.[square]}
                // ref = {pieceRef}
                key={`${x}-${y}` as const}
                id = {id}
                // id={`${piece.color}${piece.type}` as const}
                startPosition={{ x, y }}
                square={square}
                size={pieceSize}/>
                {element.current}
                <Xarrow start={pieceRef.current} end={id}/>
              </Xwrapper>
              {/* } */}
                          
                          
                {/* {!pieceRef.current && 
                <Piece
                ref={refs?.current?.[square]}
                // ref = {pieceRef}
                key={`${x}-${y}`}
                id = {id}
                // id={`${piece.color}${piece.type}` as const}
                startPosition={{ x, y }}
                square={square}
                size={pieceSize}/>} */}
              </> 


            );



            
          }
          return null;
        })
      )}
    </>
  );
});

export { Pieces };
