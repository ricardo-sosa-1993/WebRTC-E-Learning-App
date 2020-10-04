import React from "react";
import styled from "styled-components";
import { lighten } from "polished";

const VolumeBarWrapper = styled.div`
  width: 100%;
  background-color: ${(props) => lighten(0.65, props.theme.colors.textDark)};
  height: 7px;
`;
const VolumeBarInner = styled.div`
  transition: all 0.2s;
  max-width: 100%;
  background-color: ${(props) => props.theme.colors.success};
  height: 7px;
`;

type VolumeBarProps = {
  fillAmount: number;
};

function VolumeBar({ fillAmount }: VolumeBarProps) {
  return (
    <VolumeBarWrapper>
      <VolumeBarInner style={{ width: `${fillAmount * 100}%` }} />
    </VolumeBarWrapper>
  );
}

export default VolumeBar;
