import React from "react";
import styled from "styled-components";
import { AudioOutlined } from "@ant-design/icons";
import draggable from "../hocs/draggable";
import { darken } from "polished";

const ToolsBarWrapper = styled.div`
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  width: 10em;
  border-radius: 17px;
  overflow: hidden;
`;

const StyledButton = styled.button`
  transition: background-color 0.2s;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: 1em;
  border: none;
  background-color: ${props => props.theme.colors.light};

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: ${props => darken(.05, props.theme.colors.light)};
  }
`;

const StyledMic = styled(AudioOutlined)`
  font-size: ${(props) => props.theme.fontSizes.large};
  color: ${props => props.theme.colors.textDark};
`;

type ToolsBarProps = {
  className?: string;
  onMute?: Function;
};

const ToolsBar = React.forwardRef((props: ToolsBarProps, ref: any) => {
  return (
    <ToolsBarWrapper ref={ref} {...props}>
      <StyledButton onClick={() => props.onMute && props.onMute()}>
        <StyledMic />
      </StyledButton>
    </ToolsBarWrapper>
  );
});

export default draggable(ToolsBar);
