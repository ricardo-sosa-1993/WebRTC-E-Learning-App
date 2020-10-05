import React, { useRef, useState } from "react";
import styled from "styled-components";
import Input from "./Input";
import Button from "./Button";

const CallInfoWrapper = styled.div`
  background-color: ${(props) => props.theme.colors.light};
  font-size: ${(props) => props.theme.fontSizes.small};
  width: 380px;
  white-space: nowrap;
  max-width: 100%;
  padding: 15px;
  border-radius: 17px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
`;

const StyledInput = styled(Input)`
  width: 100%;
  font-size: ${(props) => props.theme.fontSizes.small};
  margin-top: 5px;
`;

const StyledButton = styled(Button)`
  margin-top: 5px;
  font-size: ${(props) => props.theme.fontSizes.small};
  align-self: flex-end;
`;

type CallInfoProps = {
  className?: string;
  callUrl?: string;
};

const CallInfo = React.forwardRef((props: CallInfoProps, ref: any) => {
  const textInputRef = useRef(null);
  const [copyButtonText, setCopyButtonText] = useState("Copiar");

  function copyUrlToClipboard() {
    const currentRef: any = textInputRef.current;
    if (currentRef !== null) {
      currentRef.select();
      document.execCommand("copy");
      currentRef.blur();
    }
    setCopyButtonText("Copiado!");
    setTimeout(() => setCopyButtonText("Copiar"), 3000);
  }

  return (
    <CallInfoWrapper ref={ref} {...props}>
      <div>Comparte el link de tu llamada:</div>
      <StyledInput ref={textInputRef} value={props.callUrl} readOnly />
      <StyledButton onClick={copyUrlToClipboard}>{copyButtonText}</StyledButton>
    </CallInfoWrapper>
  );
});

export default CallInfo;
