// src/ChatRoom.tsx
import React, { useState, useEffect, useContext } from 'react';
import { UrlParams, User } from '../../types';
import { MessagesSocketContext } from '../../contexts';
import { Socket } from 'socket.io-client';
import Messages from '../../components/chatRoom/messages';
import MessageTextArea from '../../components/chatRoom/messages-text-area';
import UsersConnected from '../../components/chatRoom/users-connected';
import ConversationRequestHub from '../../components/chatRoom/conversation-request-hub';


const ChatRoom: React.FC<{ user: User; urlParams: UrlParams }> = ({
  user,
  urlParams,
}) => {
  const locationChatId = urlParams.params.id;

  const sockets = useContext(MessagesSocketContext);
  const [hasJoinedChat, setHasJoinedChat] = useState<boolean>(false);
  const locationChatSocket = sockets?.text || (null as Socket | null);
  const privateChatSocket = sockets?.video || (null as Socket | null);

  useEffect(() => {
    if (locationChatSocket) {
      async function joinChat() {
        const hasJoined = await locationChatSocket.emitWithAck(
          'location-chat:join',
          {
            locationChatId,
          }
        );
        setHasJoinedChat(hasJoined);
      }
      joinChat();
    }
  }, [locationChatSocket]);

  if (!locationChatSocket || !privateChatSocket || !hasJoinedChat)
    return 'waiting to connect';

  return (
    <div className="chat-container">
      <Messages locationChatSocket={locationChatSocket} />
      <MessageTextArea
        locationChatSocket={locationChatSocket}
      />
      <UsersConnected
        locationChatSocket={locationChatSocket}
        privateChatSocket={privateChatSocket}
        user={user}
      />
      <ConversationRequestHub privateChatSocket={privateChatSocket} />
    </div>
  );
};



export default ChatRoom;
