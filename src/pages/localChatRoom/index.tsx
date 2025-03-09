// src/ChatRoom.tsx
import React, { useState, useEffect, useContext } from 'react';
import { UrlParams, User } from '../../types';
import { MessagesSocketContext } from '../../contexts';

// Define types for the message structure
interface Message {
  content: string;
  created: Date;
}

type UserConnected = {
  name: string;
  userId: number;
};

const ChatRoom: React.FC<{ user: User; urlParams: UrlParams }> = ({
  urlParams,
}) => {
  const locationChatId = urlParams.params.id;

  const [hasJoinedRoom, setHasJoinedRoom] = useState<Boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [usersConnectedToRoom, setUsersConnectedToRoom] = useState<
    UserConnected[]
  >([]);

  const socket = useContext(MessagesSocketContext);

  useEffect(() => {
    if (socket) joinRoom();
  }, [socket]);

  async function joinRoom() {
    const prevMessages: Array<{ content: { text: string }; created: Date }> =
      await socket.emitWithAck('joinLocationChat', { locationChatId });
    socket.on(
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
      await socket.emit('sendMessageToLocationChat', {
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

  if (socket) {
    socket.on('usersConnectedToRoom', (usersConnected: UserConnected[]) => {
      console.log(usersConnected)
      setUsersConnectedToRoom(usersConnected);
    });
  }

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
        {usersConnectedToRoom.map(({ name, id }) => {
          return <div>{name}</div>;
        })}
      </div>
    </div>
  );
};

export default ChatRoom;
