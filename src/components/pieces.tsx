import React from 'react';
import { useChessboardProps } from '../context/props-context/hooks';

import { useBoard } from '../context/board-context/hooks';
import { usePieceRefs } from '../context/board-refs-context/hooks';

import Piece from './piece';
import { useReversePiecePosition } from '../notation';

import Draggable from 'react-draggable';

import Xarrow, { useXarrow, Xwrapper } from 'react-xarrows';


const Pieces = React.memo(() => {
  const board = useBoard();
  const refs = usePieceRefs();
  const { pieceSize } = useChessboardProps();
  const { toPosition } = useReversePiecePosition();


// const boxStyle = {/*border: 'grey solid 2px',*/ borderRadius: '10px', padding: '5px'};

const DraggableBox = ({id}:{id:string}) => {
    // const id = idx;
    const updateXarrow = useXarrow();
    return (
        <Draggable id={id} onDrag={updateXarrow} onStop={updateXarrow}>
            {/* <div id={id} style={boxStyle}> */}
                {/* {id} */}
            {/* </div> */}
        </Draggable>
    );
};

  return (
    <Xwrapper>
      {board.map((row, y) =>
        row.map((piece, x) => {
          
          console.log("piece, x, y", piece, x, y)

            const square = toPosition({
              x: x * pieceSize,
              y: y * pieceSize,
            });

          
          if (piece !== null) {
            // const square = toPosition({
            //   x: x * pieceSize,
            //   y: y * pieceSize,
            // });

            return (
              <Piece
                ref={refs?.current?.[square]}
                key={`${x}-${y}`}
                id={`${piece.color}${piece.type}` as const}
                startPosition={{ x, y }}
                square={square}
                size={pieceSize}
              />
            );
          }
          // return null;
          // return <View style={{display:'none'}}/>;
          return <DraggableBox id={square}/>
        })
      )}
      {/* {arrows.map((arrow, index) => (
                    <Xarrow key={index} start={arrow.start} end={arrow.end}/>
      ))} */}
      <Xarrow start={"f3"} end={"a8"}/>
    </Xwrapper>
  );
});

export { Pieces };
