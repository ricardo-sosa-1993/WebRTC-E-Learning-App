import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const BlackboardContainer = styled.div`
  background-color: #fff;
  height: 100%;
`;

let canvasContext: any = null;

const Blackboard = () => {
  const [drawing, setDrawing] = useState(false);
  const canvasContainer = useRef() as React.MutableRefObject<HTMLInputElement>;
  const canvas = useRef() as React.RefObject<HTMLCanvasElement>;
  let last = { x: 0, y: 0 };

  // Canvas initialization
  useEffect(() => {
    if (canvas.current) {
      canvas.current.height = canvasContainer.current.offsetHeight;
      canvas.current.width = canvasContainer.current.offsetWidth;

      canvasContext = canvas.current.getContext("2d");
    }
  }, []);

  const draw = (x: number, y: number) => {
    const canvasOffsetLeft = canvas?.current ? canvas.current.offsetLeft : 0;
    const canvasOffsetTop = canvas?.current ? canvas.current.offsetTop : 0;
    let newX = x - canvasOffsetLeft;
    let newY = y - canvasOffsetTop;

    if (last.x === 0 && last.y === 0) {
      canvasContext.moveTo(newX, newY);
    }

    canvasContext.lineTo(newX, newY);

    last.x = newX;
    last.y = newY;

    canvasContext.lineCap = "round";
    canvasContext.strokeStyle = "green";
    canvasContext.lineWidth = 5;
    canvasContext.stroke();
  };

  return (
    <BlackboardContainer ref={canvasContainer}>
      <canvas
        ref={canvas}
        style={{ position: "absolute" }}
        onMouseUp={() => setDrawing(false)}
        onMouseDown={() => {
          setDrawing(true);
          canvasContext.beginPath();
        }}
        onMouseMove={(event) => {
          if (drawing) draw(event.clientX, event.clientY);
        }}
      />
    </BlackboardContainer>
  );
};

export default Blackboard;
