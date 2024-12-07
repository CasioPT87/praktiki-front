// @ts-nocheck
import React, { useState, useEffect, useContext } from 'react';
import { ConversationManager } from '../../core/messages/other';
import { MessagesSocketContext } from '../../contexts';


const Conversation: React.FC<> = () => {

  const socket = useContext(MessagesSocketContext);
  const [conversationManager, setConversationManager] = useState<ConversationManager>(null)

  useEffect(() => {
    async function setUpConversationManager() {
      if (socket) {
        const cm = await new ConversationManager({ socket, userName: 'sergio' }).init()
        setConversationManager(cm)
      }
    }
    setUpConversationManager()
  }, [socket])

  if (!conversationManager) return null

  return (
    <div>
      conversation
      <div className="container">
        <div className="row mb-3 mt-3 justify-content-md-center">
          <div id="user-name"></div>
          <button id="call" className="btn btn-primary col-1" onClick={conversationManager.call}>
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
              className="video-player"
              id="local-video"
              autoPlay
              playsInline
              controls
            ></video>
          </div>
          <video
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
