import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const BlackboardContainer = styled.div`
  background-color: #fff;
  height: 100%;
`;

type BlackboardProps = {
  isDrawingSetting: boolean;
}

let canvasContext: any = null;

const Blackboard = ({ isDrawingSetting }: BlackboardProps) => {
  const [drawing, setDrawing] = useState(false);
  const canvasContainer = useRef() as React.MutableRefObject<HTMLInputElement>;
  const canvas = useRef() as React.RefObject<HTMLCanvasElement>;
  const [lastX, setLastX] = useState<any>(0);
  const [lastY, setLastY] = useState<any>(0);

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

    if(!isDrawingSetting){
      canvasContext.globalCompositeOperation="destination-out";
      canvasContext.arc(newX,newY,8,0,Math.PI*2,false);
      canvasContext.fill();
      return;
    }

    canvasContext.globalCompositeOperation="source-over";
    canvasContext.lineCap = "round";
    canvasContext.strokeStyle = "green";
    canvasContext.lineWidth = 5;

    if (lastX !== 0 && lastY !== 0) {
      canvasContext.lineTo(newX, newY);
      canvasContext.stroke();
    }else{
      canvasContext.moveTo(newX, newY);
    }

    // canvasContext.fillStyle = "green";
    // canvasContext.beginPath();
    // canvasContext.arc(newX, newY, 2, 0, Math.PI*2, true);
    // canvasContext.closePath();
    // canvasContext.fill();

    setLastX(newX);
    setLastY(newY);
  };

  return (
    <BlackboardContainer ref={canvasContainer}>
      <canvas
        ref={canvas}
        style={{ position: "absolute" }}
        onMouseUp={() => {
          setDrawing(false);
          canvasContext.closePath();
        }}
        onMouseDown={() => {
          canvasContext.beginPath();
          setDrawing(true);
        }}
        onMouseMove={(event) => {
          if (drawing) {
        
            draw(event.clientX, event.clientY);
          }
        }}
      />
    </BlackboardContainer>
  );
};

export default Blackboard;
