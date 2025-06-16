// src/ChatRoom.tsx
import React, { useState, useEffect, useContext } from 'react';
import { User } from '../../types';
import { MessagesSocketContext } from '../../contexts';
import { Socket } from 'socket.io-client';
import VideoConversation from '../../components/functional/videoConversation';

enum Mode {
  waitingToConnect = 'waitingToConnect',
  call = 'call',
}

const RandomVideoChat: React.FC<{ user: User }> = ({ user }) => {
  const sockets = useContext(MessagesSocketContext);
  const [mode, setMode] = useState<{
    type: Mode;
    creator: boolean;
    target: boolean;
    privateChatId: string;
  }>({
    type: Mode.waitingToConnect,
    creator: false,
    target: false,
    privateChatId: '',
  });
  const randomVideoChatSocket = sockets?.video || (null as Socket | null);

  useEffect(() => {
    if (!randomVideoChatSocket) return
    console.log('hola')
    randomVideoChatSocket.emit('private-chat-random-queue:add-user');

    randomVideoChatSocket.on(
      'private-chat-random-queue:user-match',
      ({ userId }: { userId: User['id']}) => {
        randomVideoChatSocket.emit('private-chat:create', { targetUserId: userId });
      }
    );

    randomVideoChatSocket.on(
      'private-chat:create',
      ({ privateChatId }: { privateChatId: string }) => {
        randomVideoChatSocket.emit('private-chat:accept', { privateChatId });
      }
    );

    randomVideoChatSocket.on(
      'private-chat:start',
      ({
        creator,
        target,
        privateChatId,
      }: {
        creator: boolean;
        target: boolean;
        privateChatId: string;
      }) => {
        setMode({
          type: Mode.call,
          creator,
          target,
          privateChatId,
        });
      }
    );
  }, []);

  if (!randomVideoChatSocket) return 'not connected';

  return (
    <div className="chat-container">
      {mode.type === Mode.waitingToConnect && (
        <>
          <div>Looking for a match</div>
        </>
      )}
      {mode.type === Mode.call && (
        <>
          <VideoConversation mode={mode} user={user} />
        </>
      )}
    </div>
  );
};

export default RandomVideoChat;
