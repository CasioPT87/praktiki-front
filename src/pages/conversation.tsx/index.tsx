// @ts-nocheck
import React, { useState, useEffect, useContext, useRef } from 'react';
import { ConversationManager } from '../../core/messages/other';
import { MessagesSocketContext } from '../../contexts';
import { func } from 'prop-types';

const Conversation: React.FC<> = () => {
  const callElement = useRef(null);
  const localVideoElement = useRef(null);
  const remoteVideoElement = useRef(null);

  const socket = useContext(MessagesSocketContext);
  const [conversationManager, setConversationManager] =
    useState<ConversationManager>(null);

  useEffect(() => {
    async function setUpConversationManager() {
      console.log('hola', localVideoElement)
      if (socket && localVideoElement.current && remoteVideoElement.current) {
        console.log(localVideoElement);
        const cm = await new ConversationManager({
          socket,
          userName: 'sergio',
          localVideoElement: localVideoElement.current,
          remoteVideoElement: remoteVideoElement.current,
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

  return (
    <div>
      conversation
      <div className="container">
        <div className="row mb-3 mt-3 justify-content-md-center">
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

export default Conversation;
