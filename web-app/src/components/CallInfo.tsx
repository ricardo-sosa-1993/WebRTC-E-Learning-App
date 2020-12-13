import React, { useRef, useState } from "react";
import styled from "styled-components";
import { lighten } from "polished";
import AnimateHeight from "react-animate-height";
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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Title = styled.span`
  font-weight: bold;
  font-size: ${(props) => props.theme.fontSizes.medium};
`;

const MinimizeButton = styled.span`
  cursor: pointer;
  color: ${(props) => props.theme.colors.secondary};
  user-select: none;

  &:hover {
    color: ${(props) => lighten(0.12, props.theme.colors.secondary)};
  }
`;

const ContentWrapper = styled.div`
  margin-top: 15px;
`;

const StyledInput = styled(Input)`
  width: 100%;
  font-size: ${(props) => props.theme.fontSizes.small};
  margin-top: 5px;
`;

const StyledButton = styled(Button)`
  display: block;
  margin-top: 5px;
  font-size: ${(props) => props.theme.fontSizes.small};
  margin-left: auto;
`;

type CallInfoProps = {
  className?: string;
  callUrl?: string;
};

const CallInfo = React.forwardRef((props: CallInfoProps, ref: any) => {
  const textInputRef = useRef(null);
  const [copyButtonText, setCopyButtonText] = useState("Copiar");
  const [minimized, setMinimized] = useState(false);

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
      <Header onClick={() => setMinimized(!minimized)}>
        <Title>Link de llamada</Title>
        <MinimizeButton>{minimized ? "Maximizar" : "Minimizar"}</MinimizeButton>
      </Header>
      <AnimateHeight
        style={{ flexShrink: 0 }}
        duration={500}
        height={minimized ? 0 : "auto"}
      >
        <ContentWrapper>
          <div>Comparte el link de tu llamada:</div>
          <StyledInput ref={textInputRef} value={props.callUrl} readOnly />
          <StyledButton onClick={copyUrlToClipboard}>
            {copyButtonText}
          </StyledButton>
        </ContentWrapper>
      </AnimateHeight>
    </CallInfoWrapper>
  );
});

export default CallInfo;
