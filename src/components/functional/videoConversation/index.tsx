// @ts-nocheck
import React, { useState, useEffect, useContext, useRef } from 'react';
import { ConversationManager } from '../../../core/messages/video';
import { MessagesSocketContext } from '../../../contexts';
import { Socket } from 'socket.io-client';

const VideoConversation: React.FC<> = () => {
  const callElement = useRef(null);
  const localVideoElement = useRef(null);
  const remoteVideoElement = useRef(null);

  const sockets = useContext(MessagesSocketContext);
  const socket = sockets?.video || null as Socket | null
  const [conversationManager, setConversationManager] =
    useState<ConversationManager>(null);
  const [offers, setOffers] = useState<any[]>([])

  useEffect(() => {
    async function setUpConversationManager() {
      if (socket && localVideoElement.current && remoteVideoElement.current) {
        const cm = await new ConversationManager({
          socket,
          userName: socket.auth.userName,
          localVideoElement: localVideoElement.current,
          remoteVideoElement: remoteVideoElement.current,
          setOffers
        }).init();
        setConversationManager(cm);
      }
    }
    setUpConversationManager();
  }, [socket, localVideoElement, remoteVideoElement]);

  function call() {
    if (conversationManager) {
      conversationManager.call()
    }
  }

  function answer(offerObj) {
    if (conversationManager) {
      conversationManager.answer({ offerObj })
    }
  }

  return (
    <div>
      conversation
      <div className="container">
        <div className="row mb-3 mt-3 justify-content-md-center">
          {offers.map(offerObj => <button onClick={() => answer(offerObj)}>{'oferta de: ' + offerObj.offererUserName || 'oferta sin nombre ?'}</button>)}
          <div id="user-name"></div>
          <button
            ref={callElement}
            id="call"
            className="btn btn-primary col-1"
            onClick={call}
          >
            Call!
          </button>
          <button id="hangup" className="col-1" className="btn btn-primary">
            Hangup
          </button>
          <div id="answer" className="col"></div>
        </div>
        <div id="videos">
          <div id="video-wrapper">
            <div id="waiting" className="btn btn-warning">
              Waiting for answer...
            </div>
            <video
              ref={localVideoElement}
              className="video-player"
              id="local-video"
              autoPlay
              playsInline
              controls
            ></video>
          </div>
          <video
            ref={remoteVideoElement}
            className="video-player"
            id="remote-video"
            autoPlay
            playsInline
            controls
          ></video>
        </div>
      </div>
    </div>
  );
};

export default VideoConversation;
