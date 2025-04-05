// @ts-nocheck
import React, { useState, useEffect, useContext, useRef } from 'react';
import { ConversationManager } from '../../../core/messages/video';
import { MessagesSocketContext } from '../../../contexts';
import { Socket } from 'socket.io-client';
import { Mode } from '../../../pages/localChatRoom';

const VideoConversation: React.FC<{ mode: { type: Mode, creator: boolean, target: boolean, privateChatId: string }}> = ({ mode }) => {
  const callElement = useRef(null);
  const localVideoElement = useRef(null);
  const remoteVideoElement = useRef(null);

  const sockets = useContext(MessagesSocketContext);
  const socket = sockets?.video || (null as Socket | null);
  const [conversationManager, setConversationManager] =
    useState<ConversationManager>(null);

  useEffect(() => {
    async function setUpConversationManager() {
      if (socket && localVideoElement.current && remoteVideoElement.current) {
        const cm = await new ConversationManager({
          socket,
          userName: socket.auth.userName,
          localVideoElement: localVideoElement.current,
          remoteVideoElement: remoteVideoElement.current,
        }).init({ creator: mode.creator, target: mode.target, privateChatId: mode.privateChatId });
        setConversationManager(cm);
      }
    }
    setUpConversationManager();
  }, [socket, localVideoElement, remoteVideoElement]);

  return (
    <div>
      conversation
      <div className="container">
        <div>
          <button id="hangup" className="col-1" className="btn btn-primary">
            Hangup
          </button>
        </div>
        <div id="videos">
          <div id="video-wrapper">
            <video
              ref={localVideoElement}
              className="video-player"
              id="local-video"
              autoPlay
              playsInline
              controls
            ></video>
          </div>
          <div id="video-wrapper">
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
    </div>
  );
};

export default VideoConversation;
