import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import UserBox from "../components/UserBox";

function Call() {
  const { audioAndVideoStream, peerConnections } = useSelector(
    (state: RootState) => state.connection
  );
  
  return (
    <div>
      <UserBox audioAndVideoStream={audioAndVideoStream}/>
      {Object.keys(peerConnections).map((peerUuid) => (
        <UserBox audioAndVideoStream={peerConnections[peerUuid].videoAndAudioStream} uuid={peerUuid}/>
      ))}
    </div>
  );
}

export default Call;
