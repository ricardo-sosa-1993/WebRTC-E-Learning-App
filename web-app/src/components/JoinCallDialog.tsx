import React, { useState } from "react";
import styled from "styled-components";
import Input from "./Input";
import Button from "./Button";

const JoinCallDialogWrapper = styled.div`
  background-color: ${(props) => props.theme.colors.light};
  width: 37rem;
  max-width: 100%;
  padding: 2.5rem;
  border-radius: 17px;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
`;

const DialogTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizes.large};
  font-weight: bold;
  text-align: center;
  cursor: default;
`;

const ContentWrapper = styled.div`
  margin-top: 2.5em;
`;

const NameInput = styled(Input)`
  width: 100%;
`;

const SaveButton = styled(Button)`
  margin-top: 2.5em;
  width: 100%;
`;

type JoinCallDialogProps = {
  onJoin(username: string): void
};

function JoinCallDialog({ onJoin }: JoinCallDialogProps) {
  const [username, setUsername] = useState('');

  return (
    <JoinCallDialogWrapper>
      <DialogTitle>Ingresa tu nombre</DialogTitle>
      <ContentWrapper>
        <NameInput placeholder="Nombre" onChange={event => setUsername(event.target.value)}/>
        <SaveButton disabled={!username} onClick={() => onJoin(username)}>Entrar a llamada</SaveButton>
      </ContentWrapper>
    </JoinCallDialogWrapper>
  );
}

export default JoinCallDialog;