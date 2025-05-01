import { Socket } from 'socket.io-client';
import { User } from '../../types';

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
  type: ConversationStreamManagerType | null = null;

  constructor({
    videoElement,
    type,
  }: {
    videoElement: HTMLVideoElement;
    type: ConversationStreamManagerType;
  }) {
    this.videoElement = videoElement;
    this.type = type;
  }

  async getStream(): Promise<MediaStream> {
    if (this.type === 'local') {
      // cogemos el stream de la camara de nuestro device
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
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
  return await new RTCPeerConnection(peerConfiguration);
}

export class ConversationManager {
  peerConnection: RTCPeerConnection | null = null;
  localStreamManager: ConversationStreamManager | null = null;
  remoteStreamManager: ConversationStreamManager | null = null;
  offers: OfferObj[] = [];
  userName: string | null = null;
  socket: Socket | null = null;
  localVideoElement: HTMLVideoElement | null = null;
  remoteVideoElement: HTMLVideoElement | null = null;
  isCreator: boolean = false;
  privateChatId: string | null = null;

  constructor({
    socket,
    userName,
    localVideoElement,
    remoteVideoElement,
  }: {
    socket: Socket;
    userName: string;
    localVideoElement: HTMLVideoElement;
    remoteVideoElement: HTMLVideoElement;
  }) {
    this.socket = socket;
    this.userName = userName;
    this.localVideoElement = localVideoElement;
    this.remoteVideoElement = remoteVideoElement;
  }

  init = async ({
    creator,
    target,
    privateChatId,
  }: {
    creator: boolean;
    target: boolean;
    privateChatId: string;
  }) => {
    if (!this.localVideoElement || !this.remoteVideoElement) return;
    if (!privateChatId) return;
    this.privateChatId = privateChatId;
    this.isCreator = creator;
    this.localStreamManager = new ConversationStreamManager({
      type: 'local',
      videoElement: this.localVideoElement,
    });
    this.remoteStreamManager = new ConversationStreamManager({
      type: 'remote',
      videoElement: this.remoteVideoElement,
    });
    await this.localStreamManager.setStream();
    await this.remoteStreamManager.setStream();
    this.peerConnection = await createPeerConnection();
    this.localStreamManager.addTracksToConnection({
      peerConnection: this.peerConnection,
    });
    this.setSocketIceCandidateListeners();
    this.setPeerConnectionListeners();

    return this;
  };

  setSocketIceCandidateListeners = () => {
    // lo dejamos ya aqui para cuando ambas partes empiecen a mandarse ice candidates
    const { socket, peerConnection } = this;
    if (!socket || !peerConnection) return;
    socket.on('ice-candidates:create', (candidate: RTCIceCandidateInit) => {
      peerConnection.addIceCandidate(candidate);
    });
  };

  setPeerConnectionListeners = () => {
    if (!this.peerConnection) return;
    // esto es tanto para creador como el que recibe. Los dos crean ice candidates y los dos se los tienen que mandar mutuamente
    this.peerConnection.addEventListener(
      'icecandidate',
      (RTCPeerConnectionIceEvent) => {
        // disparado por peerConnection.setLocalDescription
        if (RTCPeerConnectionIceEvent.candidate && this.socket) {
          this.socket.emit('ice-candidates:create', {
            iceCandidate: RTCPeerConnectionIceEvent.candidate,
            privateChatId: this.privateChatId,
            isCreator: this.isCreator,
          });
        }
      }
    );

    // triggered when the remote peer adds a track to the connection
    this.peerConnection.addEventListener('track', (RTCTrackEvent) => {
      RTCTrackEvent.streams[0].getTracks().forEach((track) => {
        if (!this?.remoteStreamManager?.stream) return;
        this.remoteStreamManager.stream.addTrack(track);
      });
    });
  };

  call = async () => {
    const { socket, peerConnection, localStreamManager } = this;
    if (!localStreamManager || !peerConnection || !socket) return;
    const offer: RTCSessionDescriptionInit | undefined =
      await peerConnection.createOffer(); // generates an SDP offer
    if (!offer) return;
    socket.emit('offer:create', { offer, privateChatId: this.privateChatId });
    socket.on('offer:answer', (answerOffer: RTCSessionDescriptionInit) => {
      peerConnection.setLocalDescription(offer); // triggers the ICE candidate gathering process (when creating an offer). Triggers the event (icecandidate) each time an icecandidate is found.
      peerConnection.setRemoteDescription(answerOffer);
    });
  };

  answer = async () => {
    const { socket, peerConnection } = this;
    if (!socket) return

    socket.on('offer:create', async (offer: RTCSessionDescriptionInit) => {
      if (!peerConnection) return;
      peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      peerConnection.setLocalDescription(answer);

      socket.emit('offer:answer', {
        offerAnswer: answer,
        privateChatId: this.privateChatId,
      });
    });
  };

  async finish() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStreamManager) {
      (await this.localStreamManager.getStream()).getTracks().forEach(track => track.stop());
      this.localStreamManager.stream = null
      this.localStreamManager.videoElement = null
    }
    if (this.remoteStreamManager) {
      (await this.remoteStreamManager.getStream()).getTracks().forEach(track => track.stop());
      this.remoteStreamManager.stream = null
      this.remoteStreamManager.videoElement = null
    }
    this.remoteVideoElement?.remove()
    this.localVideoElement?.remove()
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }
}
