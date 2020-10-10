import React from "react";
import styled from "styled-components";
import { AudioOutlined, AudioMutedOutlined } from "@ant-design/icons";
import draggable from "../hocs/draggable";
import { darken } from "polished";

const ToolsBarWrapper = styled.div`
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  width: 10em;
  border-radius: 17px;
  overflow: hidden;
`;

const StyledButton = styled.button<ToolsBarProps>`
  transition: background-color 0.2s, color 0.2s;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 1em;
  border: none;
  background-color: ${(props: any) =>
    props.audioEnabled ? props.theme.colors.light : props.theme.colors.error};

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: ${(props) => darken(0.05, props.audioEnabled ? props.theme.colors.light : props.theme.colors.error)};
  }
`;

const StyledMic = styled(AudioOutlined)<ToolsBarProps>`
  font-size: ${(props) => props.theme.fontSizes.large};
  color: ${(props) => props.audioEnabled ? props.theme.colors.textDark : props.theme.colors.light};
`;

const StyledMutedMic = styled(AudioMutedOutlined)<ToolsBarProps>`
  font-size: ${(props) => props.theme.fontSizes.large};
  color: ${(props) => props.audioEnabled ? props.theme.colors.textDark : props.theme.colors.light};
`;

type ToolsBarProps = {
  className?: string;
  onToggleAudioEnabled?: Function;
  audioEnabled?: boolean;
};

const ToolsBar = React.forwardRef((props: ToolsBarProps, ref: any) => {
  const MicIcon = props.audioEnabled ? StyledMic : StyledMutedMic;

  return (
    <ToolsBarWrapper ref={ref} className={props.className}>
      <StyledButton
        audioEnabled={props.audioEnabled}
        onClick={() =>
          props.onToggleAudioEnabled && props.onToggleAudioEnabled()
        }
      >
        <MicIcon audioEnabled={props.audioEnabled} />
      </StyledButton>
    </ToolsBarWrapper>
  );
});

export default draggable(ToolsBar);
