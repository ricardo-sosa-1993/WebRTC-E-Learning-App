import React, { useState, useRef } from "react";

let prevXPos = 0;
let prevYPos = 0;

function draggable(Component: any) {
  return function (props: any) {
    const componentRef = useRef(null);
    const [xPos, setXPos] = useState<number | null>(null);
    const [yPos, setYPos] = useState<number | null>(null);
    const [startWidth, setStartWitdth] = useState<number | null>(null);
    const [startHeight, setStartHeight] = useState<number | null>(null);

    if(componentRef.current && (startWidth === null) && (startHeight === null)){
      setTimeout(() => {
        // @ts-ignore
      setStartWitdth(componentRef.current.getBoundingClientRect().width);
      // @ts-ignore
      setStartHeight(componentRef.current.getBoundingClientRect().height);
      }, 300);
    }

    const style = {
      ...((xPos !== null || yPos !== null) && {
        position: "fixed",
        width: startWidth,
        height: startHeight,
      }),
      // @ts-ignore
      ...(yPos !== null && { top: `${yPos}px`, marginTop: "unset" }),
      ...(xPos !== null && { left: `${xPos}px`, marginLeft: "unset" }),
    };

    function handleMouseMove(event: any) {
      if (componentRef.current) {
        event.preventDefault();
        let xDistance = event.clientX - prevXPos;
        let yDistance = event.clientY - prevYPos;
        // @ts-ignore
        let newLeft = componentRef.current.offsetLeft + xDistance;
        // @ts-ignore
        let newTop = componentRef.current.offsetTop + yDistance;

        // @ts-ignore
        let rect = componentRef.current.getBoundingClientRect();
        let newRight = window.innerWidth - rect.right;
        let newBottom = window.innerHeight - rect.bottom;

        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newRight < 5) newLeft = window.innerWidth - rect.width - 5;
        if (newBottom < 5) newTop = window.innerHeight - rect.height - 5;

        // @ts-ignore
        setXPos(newLeft);
        // @ts-ignore
        setYPos(newTop);
        prevXPos = event.clientX;
        prevYPos = event.clientY;
      }
    }

    function handleMouseDown(event: any) {
      prevXPos = event.clientX;
      prevYPos = event.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = handleMouseMove;
    }

    function closeDragElement(event: any) {
      document.onmouseup = null;
      document.onmousemove = null;
    }

    return (
      <Component
        {...props}
        ref={componentRef}
        onMouseDown={handleMouseDown}
        style={style}
      />
    );
  };
}

export default draggable;
