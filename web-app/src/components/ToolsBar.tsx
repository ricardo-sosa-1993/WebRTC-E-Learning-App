import React from "react";
import styled from "styled-components";

const ToolsBarWrapper = styled.div`
  border-radius: 17px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
`;

type ToolsBarProps = {
  className?: string;
};

function ToolsBar({ className }: ToolsBarProps) {
  return <ToolsBarWrapper className={className}>holaaa</ToolsBarWrapper>;
}

export default ToolsBar;
