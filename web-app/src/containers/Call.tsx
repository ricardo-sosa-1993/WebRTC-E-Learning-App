import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import UserBox from "../components/UserBox";
import { Redirect } from "react-router-dom";
import styled from "styled-components";
import CallInfo from "../components/CallInfo";
import ToolsBar from "../components/ToolsBar";
import Blackboard from "../components/Blackboard";
import draggable from "../hocs/draggable";
import Toast from "./Toast";
import { toggleAudioEnabled } from "../store/connection";

const CallWrapper = styled.div`
  height: 100%;
`;
const MainContainer = styled.div`
  display: inline-block;
  width: 83%;
  height: 95%;
  padding: 8% 5%;
`;
const UsersContainer = styled.div`
  padding: 10px;
  display: inline-block;
  width: 17%;

  & > * {
    margin-top: 10px;
  }

  & > *:first-child {
    margin-top: 0px;
  }
`;
const StyledCallInfo = styled(CallInfo)`
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  z-index: 1000;
`;
const StyledToolsBar = styled(ToolsBar)`
  position: absolute;
  bottom: 5%;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
`;

function Call() {
  const dispatch = useDispatch();
  const {
    audioAndVideoStream,
    peerConnections,
    selfUuid,
    selfAudioLevel,
    selfUsername,
    userUuidTalking,
    roomId,
    isMaster,
    audioEnabled
  } = useSelector((state: RootState) => state.connection);
  const baseUrl = window.location.href.split("/call")[0];
  const callUrl = `${baseUrl}/join-call/${roomId}`;

  function onToggleAudioEnabled() {
    dispatch(toggleAudioEnabled());
  }

  if (!selfUuid) {
    return <Redirect to="/create-call" />;
  }

  return (
    <CallWrapper>
      <Toast />
      {isMaster && <StyledCallInfo callUrl={callUrl} />}
      <StyledToolsBar audioEnabled={audioEnabled} onToggleAudioEnabled={onToggleAudioEnabled}/>
      <MainContainer>
        <Blackboard />
      </MainContainer>
      <UsersContainer>
        {audioAndVideoStream && (
          <UserBox
            audioAndVideoStream={audioAndVideoStream}
            audioLevel={selfAudioLevel}
            userName={selfUsername}
            talking={userUuidTalking === selfUuid}
            audioEnabled={audioEnabled}
            muted
          />
        )}
        {Object.keys(peerConnections)
          .filter((peerUuid) => peerConnections[peerUuid].videoAndAudioStream)
          .map((peerUuid) => (
            <UserBox
              audioAndVideoStream={
                peerConnections[peerUuid].videoAndAudioStream
              }
              audioLevel={peerConnections[peerUuid].audioLevel}
              userName={peerConnections[peerUuid].userName}
              talking={userUuidTalking === peerUuid}
              audioEnabled={peerConnections[peerUuid].audioEnabled}
            />
          ))}
      </UsersContainer>
    </CallWrapper>
  );
}

export default React.memo(Call, function (prevProps, nextProps) {
  return true;
});
