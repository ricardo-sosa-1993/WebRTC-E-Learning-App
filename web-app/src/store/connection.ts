import { createSlice } from "@reduxjs/toolkit";
import { getWebSocket } from "../utils/web-socket";
import {
  createWebRtcOffer,
  createWebRtcAnswer,
  getAudioAndVideoStream,
} from "../utils/webrtc";
import { toast } from "./ui";

const AUDIO_ANALYSIS_INTERVAL = 100;

// Data channel constants
const COMMANDS_DATACHANNEL = "commandsDataChannel";

// Commands constants
const SET_AUDIO_ENABLED = "SET_AUDIO_ENABLED";

// @ts-ignore
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const dataChannels = [COMMANDS_DATACHANNEL];

type PeerConnection = {
  isMaster: boolean;
  webRtcPeerConnectionObject: any;
  userName: string;
  videoAndAudioStream: any;
  audioLevel: number;
  audioEnabled: boolean;
  analyser: any;
  dataArray: any;
  commandsDataChannel: any;
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
  roomId: string | null;
  audioEnabled: boolean;
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
  roomId: null,
  audioEnabled: true,
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
    setPeerConnectionAudioEnabled: (state, action) =>
      void (state.peerConnections[action.payload.uuid].audioEnabled =
        action.payload.audioEnabled),
    setSelfAudioLevel: (state, action) =>
      void (state.selfAudioLevel = action.payload),
    setAudioAnalyser: (state, action) =>
      void (state.audioAnalyser = action.payload),
    setAudioDataArray: (state, action) =>
      void (state.audioDataArray = action.payload),
    setUserUuidTalking: (state, action) =>
      void (state.userUuidTalking = action.payload),
    setRoomId: (state, action) => void (state.roomId = action.payload),
    setAudioEnabled: (state, action) =>
      void (state.audioEnabled = action.payload),
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
  setRoomId,
  setAudioEnabled,
  setPeerConnectionAudioEnabled
} = slice.actions;

/*
 * Connection process:
 * 1) Master creates room
 * 2) Slave joins room
 * 3) Master sends webrtc sdp (offer) with user info and other room members
 * 4) Slave sends webrtc sdp (answer) with user info to master and other room members
 * 5) They exchage ice candidates with each other
 */

function handleCommandsMessage(message: any, peerUuid: string, dispatch: any) {
  const commandName = message.name;
  const commandValue = message.value;

  if (commandName === SET_AUDIO_ENABLED) {
    dispatch(setPeerConnectionAudioEnabled({ uuid: peerUuid, audioEnabled: commandValue}));
  }
}

function setupDataChannelListener(dataChannelName: string, dataChannel: any, peerUuid: string, dispatch: any) {
  if (dataChannelName === COMMANDS_DATACHANNEL) {
    dataChannel.onmessage = (event: any) =>
      handleCommandsMessage(JSON.parse(event.data), peerUuid, dispatch);
  }
}

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

  //const onMessageCallback = () => {};

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

  const callback = (offer: any, peerConnection: any, dataChannels: any) => {
    const roomMembers = getState().connection.peerConnections || {};
    const otherRoomMembers = Object.keys(roomMembers).reduce(
      (acc: any, memberUuid: string) => {
        if (memberUuid === newUserUuid) return acc;

        acc[memberUuid] = roomMembers[memberUuid];
        return acc;
      },
      {}
    );
    Object.keys(dataChannels).forEach((dataChannelName) => {
      setupDataChannelListener(dataChannelName, dataChannels[dataChannelName], newUserUuid, dispatch);
    });
    dispatch(
      setPeerConnection({
        uuid: newUserUuid,
        peerConnection: {
          isMaster: peerIsMaster,
          webRtcPeerConnectionObject: peerConnection,
          userName: newUserName,
          audioEnabled: true,
          ...dataChannels,
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
    onAddStreamCallback,
    dataChannels,
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

  const onDataChannelCallback = (event: any) => {
    const dataChannelName = event.channel.label;
    const dataChannel = event.channel;
    setupDataChannelListener(dataChannelName, dataChannel, from, dispatch);
    const peerConnection = getState().connection.peerConnections[from];
    dispatch(
      setPeerConnection({
        uuid: from,
        peerConnection: { ...peerConnection, [dataChannelName]: dataChannel },
      })
    );
  };

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
          audioEnabled: true
        },
      })
    );
    socket.emit("sdp_answer", { roomId, answer, from: selfUuid, to: from });
  };

  createWebRtcAnswer(
    offer,
    onIceCandidateCallback,
    onConnectionChangeCallback,
    onDataChannelCallback,
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
  // Join to room
  const socket = getWebSocket(roomId, selfUuid, userName);

  getAudioAndVideoStream((audioAndVideoStream: any) => {
    const source = audioCtx.createMediaStreamSource(audioAndVideoStream);
    const analyser = audioCtx.createAnalyser();
    source.connect(analyser);
    const dataArray = new Uint8Array(analyser.fftSize);

    dispatch(setAudioAndVideoStream(audioAndVideoStream));
    dispatch(setAudioAnalyser(analyser));
    dispatch(setAudioDataArray(dataArray));
  });
  dispatch(setIsMaster(true));
  dispatch(setSelfUuid(selfUuid));
  dispatch(setSelfUsername(userName));
  dispatch(setRoomId(roomId));
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
    const dataArray = new Uint8Array(analyser.fftSize);

    dispatch(setAudioAndVideoStream(audioAndVideoStream));
    dispatch(setAudioAnalyser(analyser));
    dispatch(setAudioDataArray(dataArray));
  });
  dispatch(setIsMaster(false));
  dispatch(setSelfUuid(selfUuid));
  dispatch(setSelfUsername(userName));
  dispatch(setRoomId(roomId));
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

export const toggleAudioEnabled = () => (dispatch: any, getState: any) => {
  const newAudioEnabled = !getState().connection.audioEnabled;
  if (getState().connection.audioAndVideoStream) {
    getState().connection.audioAndVideoStream.getAudioTracks()[0].enabled = newAudioEnabled;
  }
  if (newAudioEnabled) {
    dispatch(toast("Audio activado 🙂"));
  } else {
    dispatch(toast("Audio desactivado 😶"));
  }
  const peerConnections = getState().connection.peerConnections || {};
  Object.keys(peerConnections).forEach((peerUuid: any) => {
    const peerConnection = peerConnections[peerUuid];
    peerConnection.commandsDataChannel.send(
      JSON.stringify({ name: SET_AUDIO_ENABLED, value: newAudioEnabled })
    );
  });
  dispatch(setAudioEnabled(newAudioEnabled));
};

export default slice.reducer;
