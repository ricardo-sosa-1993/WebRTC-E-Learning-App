import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import VolumeBar from "./VolumeBar";
import draggable from "../hocs/draggable";
import { AudioMutedOutlined } from "@ant-design/icons";

const MAX_AUDIO_LEVEL = 15;

type UserBoxProps = {
  audioAndVideoStream: any;
  muted?: boolean;
  audioLevel: number | null;
  userName: string | null;
  talking?: boolean;
  audioEnabled: boolean;
};

const UserBoxWrapper = styled.div`
  transition: transform 0.2s;
  border-radius: 7px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  overflow: hidden;
  position: relative;
  border: ${(props: any) =>
    props.talking ? `2px solid ${props.theme.colors.secondary}` : null};
  ${(props: any) => props.talking && "transform: scale(1.08);"}
`;

const VolumeBarContainer = styled.div`
  position: relative;
  bottom: 1px;
`;

const InfoContainer = styled.div`
  position: absolute;
  bottom: 15px;
  padding-left: 7px;
  padding-right: 7px;
  width: 100%;
`;

const NameContainer = styled.div`
  background-color: ${(props) => props.theme.colors.light};
  font-size: ${(props) => props.theme.fontSizes.small};
  display: inline-block;
  padding: 3px;
  border-radius: 5px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
`;

const StyledMutedMicIcon = styled(AudioMutedOutlined)`
  font-size: ${(props) => props.theme.fontSizes.medium};
  color: ${(props) => props.theme.colors.light};
  background-color: ${(props) => props.theme.colors.error};
  padding: 3px;
  border-radius: 5px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  float: right;
`;

const UserBox = React.forwardRef((props: UserBoxProps, ref: any) => {
  const videoRef = useRef(null);
  const {
    audioAndVideoStream,
    muted = false,
    audioLevel,
    userName,
    audioEnabled,
  } = props;

  useEffect(() => {
    const currentVideoRef: any = videoRef && videoRef.current;

    if (currentVideoRef) {
      currentVideoRef.srcObject = audioAndVideoStream;
    }
  }, [audioAndVideoStream]);

  return (
    <UserBoxWrapper ref={ref} {...props}>
      <video
        ref={videoRef}
        style={{ width: "100%", transform: "scale(-1, 1)" }}
        autoPlay
        playsInline
        muted={muted}
      ></video>
      {userName !== null && (
        <InfoContainer>
          <NameContainer>{userName}</NameContainer>
          {!audioEnabled && <StyledMutedMicIcon />}
        </InfoContainer>
      )}
      {audioLevel !== null && (
        <VolumeBarContainer>
          <VolumeBar fillAmount={audioLevel / MAX_AUDIO_LEVEL} />
        </VolumeBarContainer>
      )}
    </UserBoxWrapper>
  );
});

export default draggable(UserBox);
