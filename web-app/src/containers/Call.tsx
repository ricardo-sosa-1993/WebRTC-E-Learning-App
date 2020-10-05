import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import UserBox from "../components/UserBox";
import { Redirect } from "react-router-dom";
import styled from "styled-components";
import CallInfo from "../components/CallInfo";
import ToolsBar from "../components/ToolsBar";
import draggable from "../hocs/draggable";

const CallWrapper = styled.div``;
const MainContainer = styled.div`
  display: inline-block;
  width: 83%;
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
const StyledCallInfo = draggable(styled(CallInfo)`
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
`);
const StyledToolsBar = styled(ToolsBar)`
  position: absolute;
  bottom: 10px;
`;

function Call() {
  const {
    audioAndVideoStream,
    peerConnections,
    selfUuid,
    selfAudioLevel,
    selfUsername,
    userUuidTalking,
    roomId,
    isMaster,
  } = useSelector((state: RootState) => state.connection);
  const baseUrl = window.location.href.split("/call")[0];
  const callUrl = `${baseUrl}/join-call/${roomId}`;

  if (!selfUuid) {
    return <Redirect to="/create-call" />;
  }

  return (
    <CallWrapper>
      {isMaster && <StyledCallInfo callUrl={callUrl} />}
      <StyledToolsBar />
      <MainContainer></MainContainer>
      <UsersContainer>
        {audioAndVideoStream && (
          <UserBox
            audioAndVideoStream={audioAndVideoStream}
            audioLevel={selfAudioLevel}
            userName={selfUsername}
            talking={userUuidTalking === selfUuid}
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
            />
          ))}
      </UsersContainer>
    </CallWrapper>
  );
}

export default React.memo(Call, function (prevProps, nextProps) {
  return true;
});
