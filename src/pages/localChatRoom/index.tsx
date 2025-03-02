// src/ChatRoom.tsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UrlParams, User } from '../../types';
import HttpClient from '../../client-utils/httpClient';
import { MessagesSocketContext } from '../../contexts';

// Define types for the message structure
interface Message {
  content: string;
}

const ChatRoom: React.FC<{ user: User, urlParams: UrlParams }> = ({ urlParams }) => {
  const locationRoomId = urlParams.params.id

  const [joinedRoom, setJoinedRoom] = useState<Boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const { socket } = useContext(MessagesSocketContext)

  useEffect(() => {
    joinRoom()
  }, [])

  // Fetch messages from the backend when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get<Message[]>('http://localhost:5000/messages');
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, []);

  async function joinRoom() {
    const response = await new HttpClient(process.env.BACKEND_URL).get(`/room/join/${locationRoomId}`)
    if (response.ok) setJoinedRoom(true)
  }

  // Function to handle sending a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return; // Don't send empty messages

    try {
      // Send the new message to the backend
      await axios.post('http://localhost:5000/messages', {
        content: newMessage,
      });

      // Fetch updated messages from the backend
      const response = await axios.get<Message[]>('http://localhost:5000/messages');
      setMessages(response.data);

      // Clear the input field after sending the message
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!joinedRoom) return 'waiting'

  return 'room joined!!'

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
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatRoom;
