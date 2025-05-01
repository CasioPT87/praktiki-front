// @ts-nocheck
import React, { useState, useEffect, useContext, useRef } from 'react';
import { ConversationManager } from '../../../core/messages/video';
import { MessagesSocketContext } from '../../../contexts';
import { Socket } from 'socket.io-client';
import { Mode } from '../../../pages/localChatRoom';
import { User } from '../../../types';

const VideoConversation: React.FC<{
  user: User;
  mode: {
    type: Mode;
    creator: boolean;
    target: boolean;
    privateChatId: string;
  };
}> = ({ mode, user }) => {
  const localVideoElement = useRef(null);
  const remoteVideoElement = useRef(null);
  const [disconnectionMessage, setDisconnectionMessage] = useState<string>('');
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
        }).init({
          creator: mode.creator,
          target: mode.target,
          privateChatId: mode.privateChatId,
        });

        if (mode.creator) cm?.call();
        else cm?.answer();
        setConversationManager(cm);
      }
    }
    setUpConversationManager();
  }, [socket, localVideoElement, remoteVideoElement]);

  useEffect(() => {
    if (!socket || !conversationManager) {
      return;
    }

    const heartbeat = setInterval(() => {
      socket.emit('heartbeat')
    }, 10_000)

    socket.on(
      'private-chat:disconnected',
      ({
        user: userDisconnected,
        reason,
      }: {
        user: User;
        reason: 'controlled' | 'uncontrolled';
      }) => {
        conversationManager.finish();

        if (user.id === userDisconnected) {
          if (reason === 'controlled') {
            setDisconnectionMessage('Has desconectado la llamada');
          } else {
            setDisconnectionMessage(
              'Has desconectado la llamada. Parece haber un problema con tu conexion'
            );
          }
        } else {
          if (reason === 'controlled') {
            setDisconnectionMessage(
              "Se ha desconectado la llamada desde el otro extremo"
            );
          } else {
            setDisconnectionMessage(
               "Se ha desconectado la llamada desde el otro extremo. Parece que ha tenido problemas con su conexion"
            );
          }
        }
      }
    );

    const handleUnload = () => {
      clearInterval(heartbeat)
      socket.emit('private-chat:end');
    };
  
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [conversationManager, socket]);

  function disconnect() {
    socket.emit('private-chat:end');
  }

  return (
    <div>
      conversation
      <div className="container">
        {disconnectionMessage && (
          <div>
            <span>{disconnectionMessage}</span>
          </div>
        )}
        {!disconnectionMessage && (
          <button onClick={disconnect}>disconnect</button>
        )}
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
