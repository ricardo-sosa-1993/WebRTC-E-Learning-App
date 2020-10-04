import { createSlice } from "@reduxjs/toolkit";
import { getWebSocket } from "../utils/web-socket";
import {
  createWebRtcOffer,
  createWebRtcAnswer,
  getAudioAndVideoStream,
} from "../utils/webrtc";

const AUDIO_ANALYSIS_INTERVAL = 100;
// @ts-ignore
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

type PeerConnection = {
  isMaster: boolean;
  webRtcPeerConnectionObject: any;
  userName: string;
  videoAndAudioStream: any;
  audioLevel: number;
  analyser: any;
  dataArray: any;
};

type SliceState = {
  isMaster: boolean;
  audioAndVideoStream?: any;
  selfUuid: string | null;
  selfUsername: string | null;
  selfAudioLevel: number | null;
  peerConnections: Record<string, PeerConnection>;
  audioAnalyser: any;
  audioDataArray: any;
  userUuidTalking: string | null;
};

const initialState: SliceState = {
  isMaster: false,
  audioAndVideoStream: null,
  selfUuid: null,
  selfUsername: null,
  selfAudioLevel: null,
  peerConnections: {},
  audioAnalyser: null,
  audioDataArray: null,
  userUuidTalking: null,
};

const slice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setIsMaster: (state, action) => void (state.isMaster = action.payload),
    setAudioAndVideoStream: (state, action) =>
      void (state.audioAndVideoStream = action.payload),
    setSelfUuid: (state, action) => void (state.selfUuid = action.payload),
    setSelfUsername: (state, action) =>
      void (state.selfUsername = action.payload),
    setPeerConnection: (state, action) =>
      void (state.peerConnections[action.payload.uuid] =
        action.payload.peerConnection),
    setPeerConnectionAudioLevel: (state, action) =>
      void (state.peerConnections[action.payload.uuid].audioLevel =
        action.payload.audioLevel),
    setSelfAudioLevel: (state, action) =>
      void (state.selfAudioLevel = action.payload),
    setAudioAnalyser: (state, action) =>
      void (state.audioAnalyser = action.payload),
    setAudioDataArray: (state, action) =>
      void (state.audioDataArray = action.payload),
    setUserUuidTalking: (state, action) =>
      void (state.userUuidTalking = action.payload),
  },
});

export const {
  setIsMaster,
  setAudioAndVideoStream,
  setSelfUuid,
  setSelfUsername,
  setPeerConnection,
  setPeerConnectionAudioLevel,
  setSelfAudioLevel,
  setAudioAnalyser,
  setAudioDataArray,
  setUserUuidTalking,
} = slice.actions;

/*
 * Connection process:
 * 1) Master creates room
 * 2) Slave joins room
 * 3) Master sends webrtc sdp (offer) with user info and other room members
 * 4) Slave sends webrtc sdp (answer) with user info to master and other room members
 * 5) They exchage ice candidates with each other
 */

function sendOffer(
  dispatch: any,
  getState: any,
  socket: any,
  roomId: string,
  selfUuid: string,
  newUserUuid: string,
  selfUserName: string,
  newUserName: string,
  peerIsMaster: boolean,
  selfIsMaster: boolean
) {
  const onIceCandidateCallback = (iceEvent: any) => {
    if (iceEvent.candidate) {
      socket.emit("ice_candidate", {
        roomId,
        from: selfUuid,
        to: newUserUuid,
        candidate: iceEvent.candidate,
      });
    }
  };

  const onConnectionChangeCallback = () => {
    // const connectionState = getConnectionState();
    // dispatch(setConnectionState(connectionState));
  };

  const onMessageCallback = () => {};

  const onAddStreamCallback = (event: any) => {
    const peerConnection = getState().connection.peerConnections[newUserUuid];
    const source = audioCtx.createMediaStreamSource(event.streams[0]);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    const dataArray = new Uint8Array(analyser.fftSize);
    dispatch(
      setPeerConnection({
        uuid: newUserUuid,
        peerConnection: {
          ...peerConnection,
          videoAndAudioStream: event.streams[0],
          audioAnalyser: analyser,
          audioDataArray: dataArray,
        },
      })
    );
  };

  const callback = (offer: any, peerConnection: any) => {
    const roomMembers = getState().connection.peerConnections || {};
    const otherRoomMembers = Object.keys(roomMembers).reduce(
      (acc: any, memberUuid: string) => {
        if (memberUuid === newUserUuid) return acc;

        acc[memberUuid] = roomMembers[memberUuid];
        return acc;
      },
      {}
    );
    dispatch(
      setPeerConnection({
        uuid: newUserUuid,
        peerConnection: {
          isMaster: peerIsMaster,
          webRtcPeerConnectionObject: peerConnection,
          userName: newUserName,
        },
      })
    );
    socket.emit("sdp_offer", {
      roomId,
      from: selfUuid,
      to: newUserUuid,
      offer,
      userName: selfUserName,
      isMaster: selfIsMaster,
      ...(selfIsMaster && {
        otherRoomMembers,
      }),
    });
  };

  createWebRtcOffer(
    onIceCandidateCallback,
    onConnectionChangeCallback,
    onMessageCallback,
    onAddStreamCallback,
    callback
  );
}

function sendAnswer(
  dispatch: any,
  getState: any,
  socket: any,
  roomId: string,
  selfUuid: string,
  from: string,
  peerIsMaster: boolean,
  newUserName: string,
  offer: any
) {
  const onIceCandidateCallback = (iceEvent: any) => {
    socket.emit("ice_candidate", {
      roomId,
      candidate: iceEvent.candidate,
      from: selfUuid,
      to: from,
    });
  };

  const onConnectionChangeCallback = () => {
    //const connectionState = getConnectionState();
    // dispatch(setConnectionState(connectionState));
  };

  const onMessageCallback = () => {};

  const onAddStreamCallback = (event: any) => {
    const peerConnection = getState().connection.peerConnections[from];
    const source = audioCtx.createMediaStreamSource(event.streams[0]);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    const dataArray = new Uint8Array(analyser.fftSize);

    dispatch(
      setPeerConnection({
        uuid: from,
        peerConnection: {
          ...peerConnection,
          videoAndAudioStream: event.streams[0],
          audioAnalyser: analyser,
          audioDataArray: dataArray,
        },
      })
    );
  };

  const callback = (answer: any, peerConnection: any) => {
    const storedPeerConnection = getState().connection.peerConnections[from];
    dispatch(
      setPeerConnection({
        uuid: from,
        peerConnection: {
          ...storedPeerConnection,
          isMaster: peerIsMaster,
          userName: newUserName,
          webRtcPeerConnectionObject: peerConnection,
        },
      })
    );
    socket.emit("sdp_answer", { roomId, answer, from: selfUuid, to: from });
  };

  createWebRtcAnswer(
    offer,
    onIceCandidateCallback,
    onConnectionChangeCallback,
    onMessageCallback,
    onAddStreamCallback,
    callback
  );
}

export const setupAudioAnalysisInterval = () => (
  dispatch: any,
  getState: any
) => {
  let audioLevelsBoard: Record<string, number> = {};
  let maxAudioLevelUserUuid: string | null = null;
  let maxAudioLevelValue: number = 0;

  setInterval(() => {
    audioLevelsBoard = {};
    maxAudioLevelUserUuid = null;
    maxAudioLevelValue = 0;

    // Peer connections audio analysis
    const peerConnections = getState().connection.peerConnections;

    Object.keys(peerConnections).forEach((peerUuid) => {
      const { audioAnalyser, audioDataArray } = peerConnections[peerUuid];

      if (!audioAnalyser || !audioDataArray) return;

      audioAnalyser.getByteTimeDomainData(audioDataArray);
      const sum = audioDataArray.reduce(
        (acc: any, curr: any) => acc + Math.abs(curr - 128),
        0
      );
      const audioLevel = sum / audioDataArray.length;
      audioLevelsBoard[peerUuid] = audioLevel;
      dispatch(setPeerConnectionAudioLevel({ uuid: peerUuid, audioLevel }));
    });

    // Self audio analysis
    const { audioAnalyser, audioDataArray, selfUuid } = getState().connection;

    if (!audioAnalyser || !audioDataArray) return;

    audioAnalyser.getByteTimeDomainData(audioDataArray);
    const sum = audioDataArray.reduce(
      (acc: any, curr: any) => acc + Math.abs(curr - 128),
      0
    );
    const audioLevel = sum / audioDataArray.length;
    audioLevelsBoard[selfUuid] = audioLevel;
    dispatch(setSelfAudioLevel(audioLevel));

    Object.keys(audioLevelsBoard).forEach((userUuid) => {
      if (
        audioLevelsBoard[userUuid] &&
        audioLevelsBoard[userUuid] > maxAudioLevelValue
      ) {
        maxAudioLevelValue = audioLevelsBoard[userUuid];
        maxAudioLevelUserUuid = userUuid;
      }
    });

    dispatch(setUserUuidTalking(maxAudioLevelUserUuid));
  }, AUDIO_ANALYSIS_INTERVAL);
};

export const setupMasterConnection = (
  roomId: string,
  selfUuid: string,
  userName: string
) => (dispatch: any, getState: any) => {
  console.log("room id ", roomId);
  // Join to room
  const socket = getWebSocket(roomId, selfUuid, userName);

  getAudioAndVideoStream((audioAndVideoStream: any) => {
    const source = audioCtx.createMediaStreamSource(audioAndVideoStream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    const dataArray = new Uint8Array(analyser.fftSize);

    dispatch(setAudioAndVideoStream(audioAndVideoStream));
    dispatch(setAudioAnalyser(analyser));
    dispatch(setAudioDataArray(dataArray));
  });
  dispatch(setIsMaster(true));
  dispatch(setSelfUuid(selfUuid));
  dispatch(setSelfUsername(userName));
  dispatch(setupAudioAnalysisInterval());

  // Establish connection with new members who join to room and share other members with them
  socket.on(
    "joined_to_room",
    ({
      uuid: newUserUuid,
      userName: newUserName,
    }: {
      uuid: string;
      userName: string;
    }) => {
      sendOffer(
        dispatch,
        getState,
        socket,
        roomId,
        selfUuid,
        newUserUuid,
        userName,
        newUserName,
        false,
        true
      );
    }
  );

  // Records answers to offers
  socket.on("sdp_answer", (data: any) => {
    if (data.to === selfUuid) {
      const peerConnection = getState().connection.peerConnections[data.from];
      peerConnection.webRtcPeerConnectionObject.setRemoteDescription(
        data.answer
      );
    }
  });

  // Handle ice candidates
  socket.on("ice_candidate", (data: any) => {
    if (data.to === selfUuid && data.candidate) {
      const peerConnection = getState().connection.peerConnections[data.from];

      if (peerConnection && peerConnection.webRtcPeerConnectionObject) {
        peerConnection.webRtcPeerConnectionObject.addIceCandidate(
          data.candidate
        );
      }
    }
  });
};

export const setupSlaveConnection = (
  roomId: string,
  selfUuid: string,
  userName: string
) => (dispatch: any, getState: any) => {
  // Join room
  const socket = getWebSocket(roomId, selfUuid, userName);

  getAudioAndVideoStream((audioAndVideoStream: any) => {
    const source = audioCtx.createMediaStreamSource(audioAndVideoStream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    const dataArray = new Uint8Array(analyser.fftSize);

    dispatch(setAudioAndVideoStream(audioAndVideoStream));
    dispatch(setAudioAnalyser(analyser));
    dispatch(setAudioDataArray(dataArray));
  });
  dispatch(setIsMaster(false));
  dispatch(setSelfUuid(selfUuid));
  dispatch(setSelfUsername(userName));
  dispatch(setupAudioAnalysisInterval());

  // On web rtc offer from master
  socket.on(
    "sdp_offer",
    async ({
      roomId,
      from,
      to,
      offer,
      userName: newUserName,
      isMaster: peerIsMaster,
      otherRoomMembers,
    }: {
      roomId: string;
      from: string;
      to: string;
      offer: any;
      userName: string;
      isMaster: boolean;
      otherRoomMembers: Record<string, PeerConnection>;
    }) => {
      // Ignore messages that are not for slave
      if (to !== selfUuid) return;

      // Send answer to received offer
      sendAnswer(
        dispatch,
        getState,
        socket,
        roomId,
        selfUuid,
        from,
        peerIsMaster,
        newUserName,
        offer
      );
      // Send offer to other members received from master
      if (
        peerIsMaster &&
        otherRoomMembers &&
        Object.keys(otherRoomMembers).length
      ) {
        Object.keys(otherRoomMembers).forEach((otherRoomMemberUuid) => {
          sendOffer(
            dispatch,
            getState,
            socket,
            roomId,
            selfUuid,
            otherRoomMemberUuid,
            userName,
            otherRoomMembers[otherRoomMemberUuid].userName,
            peerIsMaster,
            false
          );
        });
      }
    }
  );

  // Records answers to offers
  socket.on("sdp_answer", (data: any) => {
    if (data.to === selfUuid) {
      const peerConnection = getState().connection.peerConnections[data.from];
      peerConnection.webRtcPeerConnectionObject.setRemoteDescription(
        data.answer
      );
    }
  });

  // Handle ice candidates
  socket.on("ice_candidate", async (data: any) => {
    if (data.to === selfUuid && data.candidate) {
      const peerConnection = getState().connection.peerConnections[data.from];

      if (peerConnection && peerConnection.webRtcPeerConnectionObject) {
        peerConnection.webRtcPeerConnectionObject.addIceCandidate(
          data.candidate
        );
      }
    }
  });
};

export default slice.reducer;
