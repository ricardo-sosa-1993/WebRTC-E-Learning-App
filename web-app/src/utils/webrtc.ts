const constraints = {
  audio: true,
  video: true,
};
const dataChannelOptions = {
  ordered: false,
  maxRetransmitTime: 1000,
};
let audioAndVideoStream: any;

async function getAudioAndVideoStream(callback?: Function) {
  if (!audioAndVideoStream) {
    audioAndVideoStream = await navigator.mediaDevices.getUserMedia(
      constraints
    );
  }
  if (callback) callback(audioAndVideoStream);
  return audioAndVideoStream;
}

// function handleError(error) {
//   if (error.name === "ConstraintNotSatisfiedError") {
//     const v = constraints.video;
//     console.error(
//       `The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`
//     );
//   } else if (error.name === "PermissionDeniedError") {
//     console.error(
//       "Permissions have not been granted to use your camera and " +
//         "console.error, you need to allow the page access to your devices in " +
//         "order for the demo to work."
//     );
//   }
//   console.error(`getUserMedia error: ${error.name}`, error);
// }

async function createWebRtcOffer(
  onIceCandidateCallback: Function,
  onConnectionChangeCallback: Function,
  onAddStreamCallback: Function,
  dataChannelNames: string[],
  callback: Function
) {
  const peerConnection: any = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  // setup data channel
  const dataChannels = dataChannelNames.reduce((acc: any, dataChannelName: string) => {
    acc[dataChannelName] = peerConnection.createDataChannel(
      dataChannelName,
      dataChannelOptions
    );
    return acc;
  }, {});
  // const dataChannel = peerConnection.createDataChannel(
  //   "dataChannel",
  //   dataChannelOptions
  // );
  // dataChannel.onmessage = onMessageCallback;

  // setup listeners
  peerConnection.onicecandidate = onIceCandidateCallback;
  peerConnection.ontrack = onAddStreamCallback;
  peerConnection.onconnectionstatechange = onConnectionChangeCallback;

  // setup andio and video stream
  audioAndVideoStream = await getAudioAndVideoStream();
  audioAndVideoStream
    .getTracks()
    .forEach((track: any) =>
      peerConnection.addTrack(track, audioAndVideoStream)
    );

  // create offer
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  callback(offer, peerConnection, dataChannels);
}

// function setRemoteDescription(remoteDescription: any) {
//   peerConnection.setRemoteDescription(remoteDescription);
// }

// function addIceCandidate(candidate: any) {
//   try {
//     peerConnection.addIceCandidate(candidate);
//   } catch (e) {}
// }

// function sendOnDataChannel(data: any) {
//   dataChannel.send(data);
// }

// function getConnectionState() {
//   return peerConnection.connectionState;
// }

async function createWebRtcAnswer(
  offerFromMaster: any,
  onIceCandidateCallback: Function,
  onConnectionChangeCallback: Function,
  onDataChannelCallback: Function,
  onAddStreamCallback: Function,
  callback: Function
) {
  const peerConnection: any = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  // setup datachannel
  peerConnection.ondatachannel = onDataChannelCallback;

  // setup listeners
  peerConnection.onicecandidate = onIceCandidateCallback;
  peerConnection.ontrack = onAddStreamCallback;
  peerConnection.onconnectionstatechange = onConnectionChangeCallback;

  // setup andio and video stream
  audioAndVideoStream = await getAudioAndVideoStream();
  audioAndVideoStream
    .getTracks()
    .forEach((track: any) =>
      peerConnection.addTrack(track, audioAndVideoStream)
    );

  // create answer
  await peerConnection.setRemoteDescription(offerFromMaster);
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  callback(answer, peerConnection);
}

export {
  createWebRtcOffer,
  createWebRtcAnswer,
  getAudioAndVideoStream,
};
