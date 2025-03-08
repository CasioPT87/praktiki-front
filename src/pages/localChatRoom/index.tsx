// src/ChatRoom.tsx
import React, { useState, useEffect, useContext } from 'react';
import { UrlParams, User } from '../../types';
import { MessagesSocketContext } from '../../contexts';

// Define types for the message structure
interface Message {
  content: string;
  created: Date;
}

const ChatRoom: React.FC<{ user: User, urlParams: UrlParams }> = ({ urlParams }) => {
  const locationChatId = urlParams.params.id

  const [hasJoinedRoom, setHasJoinedRoom] = useState<Boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const socket = useContext(MessagesSocketContext)

  useEffect(() => {
    if (socket) joinRoom()
  }, [socket])

  // // Fetch messages from the backend when the component mounts
  // useEffect(() => {
  //   const fetchMessages = async () => {
  //     try {
  //       const response = await axios.get<Message[]>('http://localhost:5000/messages');
  //       setMessages(response.data);
  //     } catch (error) {
  //       console.error('Error fetching messages:', error);
  //     }
  //   };

  //   //fetchMessages();
  // }, []);

  async function joinRoom() {
    socket.emit("joinLocationChat", { locationChatId })
    setHasJoinedRoom(true)
    socket.on("receiveMessageFromLocationChat", (message: { content: string, created: Date }) => {
        console.log(message)
        setMessages(messages => [...messages, message])
    });
  }

  // Function to handle sending a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Don't send empty messages

    try {
      // Send the new message to the backend
      await socket.emit("sendMessageToLocationChat", {
        locationChatId,
        message: {
          content: newMessage,
          created: Date.now()
        }
      });

      // Clear the input field after sending the message
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!hasJoinedRoom) return 'waiting'

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
    </div>
  );
};

export default ChatRoom;
