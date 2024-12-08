type ConversationStreamManagerType = 'local' | 'remote';
type OfferObj = {
  offererUserName: string;
  offer: RTCSessionDescriptionInit;
  offerIceCandidates: RTCIceCandidateInit[];
  answererUserName: string;
  answer: RTCSessionDescriptionInit;
  answererIceCandidates: RTCIceCandidateInit[];
};

class ConversationStreamManager {
  videoElement: HTMLVideoElement | null = null;
  stream: MediaStream | null = null;
  type: ConversationStreamManagerType | null = null; // 'local' or 'remote'

  constructor({ videoElement, type }: { videoElement: HTMLVideoElement, type: ConversationStreamManagerType }) {
    this.videoElement = videoElement;
    this.type = type
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
    console.log('set stream', this.videoElement)
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
  return await new RTCPeerConnection(peerConfiguration);
}

export class ConversationManager {
  peerConnection: RTCPeerConnection | null = null;
  localStreamManager: ConversationStreamManager | null = null;
  remoteStreamManager: ConversationStreamManager | null = null;
  offers: OfferObj[] = [];
  userName: string | null = null;
  didIOffer: boolean = false;
  socket: any = null;
  localVideoElement: HTMLVideoElement | null = null
  remoteVideoElement: HTMLVideoElement | null = null

  constructor({ socket, userName, localVideoElement, remoteVideoElement }: { socket: any; userName: string, localVideoElement: HTMLVideoElement, remoteVideoElement: HTMLVideoElement }) {
    this.socket = socket;
    this.userName = userName;
    this.localVideoElement = localVideoElement
    this.remoteVideoElement = remoteVideoElement
  }

  init = async () => {
    if (!this.localVideoElement || !this.remoteVideoElement) return
    this.localStreamManager = new ConversationStreamManager({ type: 'local', videoElement: this.localVideoElement });
    this.remoteStreamManager = new ConversationStreamManager({
      type: 'remote', videoElement: this.remoteVideoElement
    });
    await this.localStreamManager.setStream();
    await this.remoteStreamManager.setStream();
    this.peerConnection = await createPeerConnection();
    this.localStreamManager.addTracksToConnection({ peerConnection: this.peerConnection })
    return this
  }

  addOffer = (offer: OfferObj) => {
    this.offers = [...this.offers, offer];
  }

  setOffers = (offers: OfferObj[]) => {
    this.offers = offers;
  }

  setSocketListeners = () => {
    this.socket.on('newOfferAwaiting', (offer: OfferObj) => {
      this.addOffer(offer);
    });
    // cuando se conecta de primeras, se trae todas la ofertas del servidor
    this.socket.on('availableOffers', (offers: OfferObj[]) => {
      this.setOffers(offers);
    });
    this.socket.on(
      'receivedIceCandidateFromServer',
      (iceCandidate: RTCIceCandidateInit) => {
        if (this.peerConnection)
          this.peerConnection.addIceCandidate(iceCandidate);
      }
    );
    this.socket.on('answerResponse', (offerObj: OfferObj) => {
      if (this.peerConnection)
        this.peerConnection.setRemoteDescription(offerObj.answer);
    });
  }

  setPeerConnectionListeners = () => {
    if (!this.peerConnection) return;
    this.peerConnection.addEventListener('icecandidate', (e) => {
      // disparado por peerConnection.setLocalDescription
      console.log('........Ice candidate found!...... did I offer: ' + true);
      if (e.candidate) {
        this.socket.emit('sendIceCandidateToSignalingServer', {
          iceCandidate: e.candidate,
          iceUserName: this.userName,
          didIOffer: this.didIOffer,
        });
      }
    });
  }

  call = async () => {
    const { socket, peerConnection, localStreamManager } = this;
    if (!localStreamManager || !peerConnection || !socket) return;
    this.didIOffer = true;
    const offer: RTCSessionDescriptionInit | undefined =
      await peerConnection.createOffer();
    if (!offer) return;
    peerConnection.setLocalDescription(offer); // esto dispara el evento 'icecandidate' que acabas de declarr arriba
    socket.emit('newOffer', offer);
  }

  answer = async ({ offerObj }: { offerObj: OfferObj }) => {
    const { socket, peerConnection } = this;
    if (!peerConnection || !socket) return;
    this.didIOffer = false
    const answer = await peerConnection.createAnswer();
    peerConnection.setLocalDescription(answer);
    peerConnection.setRemoteDescription(offerObj.offer); // esto no lo tengo claro, porque se repite luego (con lo mismo?)
    offerObj.answer = answer;
    // le mandamos el offerObj (con una answer que le hemos metido)
    // esperamos que nos devuelva los ice candidates
    const offerIceCandidates: RTCIceCandidateInit[] = await socket.emitWithAck(
      'newAnswer',
      offerObj
    );

    // le metemos los iceCandidates a la peerConnection
    offerIceCandidates.forEach((c) => {
      peerConnection.addIceCandidate(c);
    });
  }
}
