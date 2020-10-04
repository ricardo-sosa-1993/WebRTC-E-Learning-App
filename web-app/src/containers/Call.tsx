import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import UserBox from "../components/UserBox";
import { Redirect } from "react-router-dom";
import styled from "styled-components";

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

function Call() {
  const {
    audioAndVideoStream,
    peerConnections,
    selfUuid,
    selfAudioLevel,
    selfUsername,
    userUuidTalking
  } = useSelector((state: RootState) => state.connection);

  if (!selfUuid) {
    return <Redirect to="/create-call" />;
  }

  return (
    <CallWrapper>
      <MainContainer></MainContainer>
      <UsersContainer>
        <UserBox
          audioAndVideoStream={audioAndVideoStream}
          audioLevel={selfAudioLevel}
          userName={selfUsername}
          talking={userUuidTalking === selfUuid}
          muted
        />
        {Object.keys(peerConnections).map((peerUuid) => (
          <UserBox
            audioAndVideoStream={peerConnections[peerUuid].videoAndAudioStream}
            audioLevel={peerConnections[peerUuid].audioLevel}
            userName={peerConnections[peerUuid].userName}
            talking={userUuidTalking === peerUuid}
          />
        ))}
      </UsersContainer>
    </CallWrapper>
  );
}

export default Call;
