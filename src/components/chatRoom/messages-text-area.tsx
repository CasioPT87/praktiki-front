import React, { useState } from "react";
import { Socket } from "socket.io-client";

const MessageTextArea: React.FC<{
    locationChatSocket: Socket;
  }> = ({ locationChatSocket }) => {
    const [newMessage, setNewMessage] = useState<string>('');
  
    const sendMessage = async () => {
      if (!newMessage.trim()) return; // Don't send empty messages
  
      try {
        // Send the new message to the backend
        await locationChatSocket.emit('location-chat-message:create', {
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

  export default MessageTextArea