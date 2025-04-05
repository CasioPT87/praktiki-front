import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

interface Message {
    content: string;
    created: Date;
  }

const Messages: React.FC<{
    locationChatSocket: Socket;
  }> = ({ locationChatSocket }) => {
    const [messages, setMessages] = useState<Message[]>([]);
  
    useEffect(() => {
      locationChatSocket.on('location-chat-message:get', (message: Message) => {
        setMessages((messages) => [...messages, message]);
      });
      locationChatSocket.on(
        'location-chat-messages:get',
        (messages: Message[]) => {
          setMessages(messages);
        }
      );
      locationChatSocket.emit('location-chat-messages:get');
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

  export default Messages