import React from "react";
import styled from "styled-components";
import Icon from "./Icon";
import { EditOutlined } from "@ant-design/icons";
import { darken } from "polished";

const BlackboardToolsBarWrapper = styled.div`
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  border-radius: 17px;
  overflow: hidden;
`;

const StyledButton = styled.button<BlackboardToolsbarButtonProps>`
  transition: background-color 0.2s, color 0.2s;
  cursor: pointer;
  width: 100%;
  height: 100%;
  padding: .7em;
  border: none;
  background-color: ${(props: any) => props.active ? props.theme.colors.secondary : props.theme.colors.light};
  color: ${(props: any) => props.active ? props.theme.colors.light : 'black'};
  fill: ${(props: any) => props.active ? props.theme.colors.light : 'black'};

  &:focus {
    outline: none;
  }

  &:hover {
    background-color: ${(props) => darken(0.05, props.active ? props.theme.colors.secondary : props.theme.colors.light)};
  }
`;

const StyledEditOutlined = styled(EditOutlined)`
  font-size: ${(props) => props.theme.fontSizes.large};
`;

type BlackboardToolsbarProps = {
  onDrawingChange: Function;
  drawing: boolean;
}

type BlackboardToolsbarButtonProps = {
  active?: boolean;
}

const BlakboardToolsBar = (props: BlackboardToolsbarProps) => {
  return <BlackboardToolsBarWrapper {...props}>
    <StyledButton active={props.drawing} onClick={() => props.onDrawingChange(true)}><StyledEditOutlined /></StyledButton>
    <StyledButton active={!props.drawing} onClick={() => props.onDrawingChange(false)}><Icon iconName="eraser" /></StyledButton>
  </BlackboardToolsBarWrapper>
}

export default BlakboardToolsBar;