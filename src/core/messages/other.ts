type ConversationStreamManagerType = 'local' | 'remote';
type OfferObj = {
    offererUserName: string
    offer: RTCSessionDescriptionInit
    offerIceCandidates: RTCIceCandidateInit[]
    answererUserName: string
    answer: RTCSessionDescriptionInit
    answererIceCandidates: RTCIceCandidateInit[]
}

class ConversationStreamManager {
  videoElement: HTMLVideoElement | null = null;
  stream: MediaStream | null = null;
  type: ConversationStreamManagerType | null = null; // 'local' or 'remote'

  constructor({ type }: { type: ConversationStreamManagerType }) {
    this.type = type;
  }

  setVideoDomElement() {
    if (this.type === 'local') {
      if (this.videoElement)
        this.videoElement = document.querySelector('#local-video');
    } else {
      if (this.videoElement)
        this.videoElement = document.querySelector('#remote-video');
    }
  }

  getStream() {
    if (this.type === 'local') {
      // cogemos el stream de la camara de nuestro device
      return navigator.mediaDevices.getUserMedia({
        video: true,
        // audio: true,
      });
    } else {
      // creamos un stream vacio
      return new MediaStream();
    }
  }

  async setStream() {
    const stream: MediaStream = await this.getStream();
    this.stream = stream;
    if (this.videoElement) this.videoElement.srcObject = stream;
  }

  addTracksToConnection({
    peerConnection,
  }: {
    peerConnection: RTCPeerConnection;
  }) {
    if (!this.stream) return;
    this.stream.getTracks().forEach((track) => {
      //add localtracks so that they can be sent once the connection is established
      if (this.stream) peerConnection.addTrack(track, this.stream);
    });
  }
}

async function createPeerConnection() {
    const peerConfiguration = {
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
          },
        ],
      };
    return await new RTCPeerConnection(peerConfiguration)
}

async function init() {
    const localStreamManager = new ConversationStreamManager({ type: 'local' })
    const remoteStreamManager = new ConversationStreamManager({ type: 'remote' })
    localStreamManager.setVideoDomElement()
    await localStreamManager.setStream()
    remoteStreamManager.setVideoDomElement()
    await remoteStreamManager.setStream()
    const peerConnection = await createPeerConnection()
    return {
        localStreamManager,
        remoteStreamManager,
        peerConnection
    }
}

async function call({ socket }: { socket: any }) {
    const { peerConnection, localStreamManager } = await init()
    localStreamManager.addTracksToConnection({ peerConnection })
    const offer: RTCSessionDescriptionInit | undefined = await peerConnection.createOffer()
    if (!offer) return 
    peerConnection.setLocalDescription(offer)
    socket.emit('newOffer', offer)
}

async function answer({ offerObj, socket }: { offerObj: OfferObj, socket: any }) {
    const { peerConnection } = await init()
    const answer = await peerConnection.createAnswer()
    peerConnection.setLocalDescription(answer)
    peerConnection.setRemoteDescription(offerObj.offer);
    offerObj.answer = answer;
    // le mandamos el offerObj (con una answer que le hemos metido)
    // esperamos que nos devuelva los ice candidates
    const offerIceCandidates: RTCIceCandidateInit[] = await socket.emitWithAck('newAnswer', offerObj);
    // le metemos los iceCandidates a la peerConnection
    offerIceCandidates.forEach((c) => {
        peerConnection.addIceCandidate(c);
        console.log('======Added Ice Candidate======');
    });
}


