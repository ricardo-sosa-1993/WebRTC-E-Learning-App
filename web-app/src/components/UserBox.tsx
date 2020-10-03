import React, { useRef, useEffect } from "react";

type UserBoxProps = {
  uuid?: string; 
  audioAndVideoStream: any;
};

function UserBox({ uuid, audioAndVideoStream }: UserBoxProps) {
  const videoRef = useRef(null);

  useEffect(() => {
    const currentVideoRef: any = videoRef && videoRef.current;

    if (currentVideoRef) {
      currentVideoRef.srcObject = audioAndVideoStream;
    }
  }, [audioAndVideoStream]);

  return (
    <video
      ref={videoRef}
      style={{ height: 200, width: 200 }}
      autoPlay
      playsInline
    ></video>
  );
}

export default UserBox;
