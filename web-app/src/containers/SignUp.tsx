import React from "react";
import styled from "styled-components";
import CreateCallDialog from "../components/CreateCallDialog";
import JoinCallDialog from "../components/JoinCallDialog";
import { useDispatch } from "react-redux";
import {
  setupMasterConnection,
  setupSlaveConnection,
} from "../store/connection";
import { useParams } from "react-router-dom";
import { v1 as uuidv1 } from "uuid";

const SignUpWrapper = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type SignUpProps = {
  isJoinCall?: boolean;
};

function SignUp({ isJoinCall }: SignUpProps) {
  const { id: callId = "" } = useParams<{ id?: string }>();
  const dispatch = useDispatch();

  function handleOnCreate(username: string) {
    dispatch(setupMasterConnection(uuidv1(), uuidv1(), username));
  }

  function handleOnJoin(username: string) {
    dispatch(setupSlaveConnection(callId, uuidv1(), username));
  }

  if (isJoinCall) {
    return (
      <SignUpWrapper>
        <JoinCallDialog onJoin={handleOnJoin} />
      </SignUpWrapper>
    );
  }

  return (
    <SignUpWrapper>
      <CreateCallDialog onCreate={handleOnCreate} />
    </SignUpWrapper>
  );
}

export default SignUp;
