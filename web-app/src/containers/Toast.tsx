import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const StyledContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;
const StyledToast = styled.div`
  position: absolute;
  bottom: 18%;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: fit-content;
  font-size: ${props => props.theme.fontSizes.medium};
  background-color: ${props => props.theme.colors.light};
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  border-radius: 17px;
  padding: 1em;
`;

function Toast() {
  const toasts = useSelector((state: RootState) => state.ui.toasts);
  return (
    <StyledContainer>
      {toasts.map((toast) => (
        <StyledToast>{toast.text}</StyledToast>
      ))}
    </StyledContainer>
  );
}

export default Toast;
