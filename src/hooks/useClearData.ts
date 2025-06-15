import React, { useContext, useEffect } from 'react';
import { MessagesSocketContext } from '../contexts';
import { Socket } from 'socket.io-client';

export default function useClearData(scope: Array<'locationChat' | 'privateChat'>) {
  const sockets = useContext(MessagesSocketContext);
  let locationChatSocket = sockets?.text || (null as Socket | null);
  let privateChatSocket = sockets?.video || (null as Socket | null);

  useEffect(() => {
    if (locationChatSocket && scope.includes('locationChat')) locationChatSocket.emit('location-chat:leave');
    return () => {
      locationChatSocket = null
    }
  }, [locationChatSocket]);

  useEffect(() => {
    if (privateChatSocket && scope.includes('privateChat')) privateChatSocket.emit('private-chat:end');
    return () => {
      privateChatSocket = null
    }
  }, [privateChatSocket]);
}
