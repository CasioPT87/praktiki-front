// src/ChatRoom.tsx
import React, { useState, useEffect, useContext } from 'react';
import { UrlParams, User } from '../../types';
import { MessagesSocketContext } from '../../contexts';
import { Socket } from 'socket.io-client';

// Define types for the message structure
interface Message {
  content: string;
  created: Date;
}

type UserConnected = {
  name: string;
  userId: number;
};

const PrivateChatRequestButton: React.FC<{
  privateChatId: string;
  requestCreatorUserId: number;
  onClick: () => void;
}> = ({ requestCreatorUserId, onClick }) => {
  return (
    <div onClick={onClick} style={{ border: '1px solid red' }}>
      {'peticion de chat de: ' + requestCreatorUserId}
    </div>
  );
};

const ChatRoom: React.FC<{ user: User; urlParams: UrlParams }> = ({
  user,
  urlParams,
}) => {
  const locationChatId = urlParams.params.id;

  const [hasJoinedRoom, setHasJoinedRoom] = useState<Boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [usersConnectedToRoom, setUsersConnectedToRoom] = useState<
    UserConnected[]
  >([]);
  const [privateChatRequests, setPrivateChatRequests] = useState<
    { privateChatId: string; requestCreatorUserId: number }[]
  >([]);

  const sockets = useContext(MessagesSocketContext);
  const locationChatSocket = sockets?.text || (null as Socket | null);
  const privateChatSocket = sockets?.video || (null as Socket | null);

  useEffect(() => {
    if (locationChatSocket) joinRoom();
  }, [locationChatSocket]);

  async function joinRoom() {
    const prevMessages: Array<{ content: { text: string }; created: Date }> =
      await locationChatSocket.emitWithAck('joinLocationChat', {
        locationChatId,
      });
    locationChatSocket.on(
      'receiveMessageFromLocationChat',
      (message: { content: string; created: Date }) => {
        setMessages((messages) => [...messages, message]);
      }
    );

    const prevMsgsParsed = prevMessages.map(({ content, created }) => ({
      content: content.text,
      created,
    }));
    setMessages(prevMsgsParsed);
    setHasJoinedRoom(true);
  }

  // Function to handle sending a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Don't send empty messages

    try {
      // Send the new message to the backend
      await locationChatSocket.emit('sendMessageToLocationChat', {
        locationChatId,
        message: {
          content: newMessage,
          created: Date.now(),
        },
      });

      // Clear the input field after sending the message
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (locationChatSocket) {
    locationChatSocket.on(
      'usersConnectedToRoom',
      (usersConnected: UserConnected[]) => {
        console.log(usersConnected);
        setUsersConnectedToRoom(usersConnected);
      }
    );
  }

  if (privateChatSocket) {
    privateChatSocket.on(
      'private-chat:create',
      ({
        privateChatId,
        requestCreatorUserId,
      }: {
        privateChatId: string;
        requestCreatorUserId: number;
      }) => {
        setPrivateChatRequests((previous) => {
          const exists = previous.some(
            (req) => req.privateChatId === privateChatId
          );
          if (exists) return previous;
          return [...previous, { privateChatId, requestCreatorUserId }];
        });
      }
    );
  }

  function requestPrivateChat(userId: User['id']) {
    if (!privateChatSocket) return;
    privateChatSocket.emit('private-chat:create', { targetUserId: userId });
  }

  function acceptRequest({
    privateChatId,
    requestCreatorUserId,
  }: {
    privateChatId: string;
    requestCreatorUserId: number;
  }) {}

  if (!hasJoinedRoom) return 'waiting';

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg.content}
          </div>
        ))}
      </div>

      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.currentTarget.value)}
        placeholder="Type your message..."
      />

      <button onClick={sendMessage}>Send</button>
      <div>
        users connected:
        {usersConnectedToRoom.map(({ name, userId }) => {
          return (
            <div
              onClick={() => {
                if (userId === user.data.id) return;
                requestPrivateChat(userId);
              }}
            >
              {name}
            </div>
          );
        })}
      </div>
      <div>
        privata requests:
        {privateChatRequests.map(({ privateChatId, requestCreatorUserId }) => (
          <PrivateChatRequestButton
            privateChatId={privateChatId}
            requestCreatorUserId={requestCreatorUserId}
            onClick={() =>
              acceptRequest({ privateChatId, requestCreatorUserId })
            }
          />
        ))}
      </div>
    </div>
  );
};

const Messages: React.FC<{
  locationChatId: string;
  initialMessages: Message[];
  locationChatSocket: Socket;
}> = ({ locationChatId, initialMessages, locationChatSocket }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    locationChatSocket.on(
      'receiveMessageFromLocationChat',
      (message: { content: string; created: Date }) => {
        setMessages((messages) => [...messages, message]);
      }
    );
  }, []);

  return (
    <div className="messages">
      {messages.map((msg, index) => (
        <div key={index} className="message">
          {msg.content}
        </div>
      ))}
    </div>
  );
};

const MessageTextArea: React.FC<{
  locationChatSocket: Socket, locationChatId: string
}> = ({ locationChatSocket, locationChatId }) => {
  const [newMessage, setNewMessage] = useState<string>('');

  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Don't send empty messages

    try {
      // Send the new message to the backend
      await locationChatSocket.emit('sendMessageToLocationChat', {
        locationChatId,
        message: {
          content: newMessage,
          created: Date.now(),
        },
      });

      // Clear the input field after sending the message
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <>
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.currentTarget.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </>
  );
};

const UsersConnected: React.FC<{
  locationChatSocket: Socket;
  privateChatSocket: Socket;
  user: User;
}> = ({ locationChatSocket, privateChatSocket, user }) => {
  const [usersConnectedToRoom, setUsersConnectedToRoom] = useState<
    UserConnected[]
  >([]);

  useEffect(() => {
    locationChatSocket.on(
      'usersConnectedToRoom',
      (usersConnected: UserConnected[]) => {
        console.log(usersConnected);
        setUsersConnectedToRoom(usersConnected);
      }
    );
  }, []);

  function requestPrivateChat(userId: User['id']) {
    if (!privateChatSocket) return;
    privateChatSocket.emit('private-chat:create', { targetUserId: userId });
  }

  return (
    <div>
      users connected:
      {usersConnectedToRoom.map(({ name, userId }) => {
        return (
          <div
            onClick={() => {
              if (userId === user.data.id) return;
              requestPrivateChat(userId);
            }}
          >
            {name}
          </div>
        );
      })}
    </div>
  );
};

const ConversationRequest: React.FC<{ privateChatSocket: Socket }> = ({ privateChatSocket }) => {
useEffect(() => {
  privateChatSocket.on(
    'private-chat:create',
    ({
      privateChatId,
      requestCreatorUserId,
    }: {
      privateChatId: string;
      requestCreatorUserId: number;
    }) => {
      setPrivateChatRequests((previous) => {
        const exists = previous.some(
          (req) => req.privateChatId === privateChatId
        );
        if (exists) return previous;
        return [...previous, { privateChatId, requestCreatorUserId }];
      });
    }
  );
}, [])
}

export default ChatRoom;
