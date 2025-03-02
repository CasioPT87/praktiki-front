// src/ChatRoom.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define types for the message structure
interface Message {
  content: string;
}

const ChatRoom: React.FC = () => {
  // State to store messages and new message input
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

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
