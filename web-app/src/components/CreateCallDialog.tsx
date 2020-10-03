import React, { useState } from "react";
import styled from "styled-components";
import Input from "./Input";
import Button from "./Button";

const CreateCallDialogWrapper = styled.div`
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

type CreateCallDialogProps = {
  onCreate(username: string): void
};

function CreateCallDialog({ onCreate }: CreateCallDialogProps) {
  const [username, setUsername] = useState('');

  return (
    <CreateCallDialogWrapper>
      <DialogTitle>Ingresa tu nombre</DialogTitle>
      <ContentWrapper>
        <NameInput placeholder="Nombre" onChange={event => setUsername(event.target.value)}/>
        <SaveButton disabled={!username} onClick={() => onCreate(username)}>Crear llamada</SaveButton>
      </ContentWrapper>
    </CreateCallDialogWrapper>
  );
}

export default CreateCallDialog;
