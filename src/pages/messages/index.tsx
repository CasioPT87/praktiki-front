import React, { useState, useContext, memo, useEffect } from 'react';
import { MessagesSocketContext } from '../../contexts';

const Messages: React.FC = () => {
  const [value, setValue] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const socket = useContext(MessagesSocketContext);

  useEffect(() => {
    if (socket) {
        socket.on('chat message', (message: string) => {
            setMessages([...message, message])
        });
    }
  }, [socket])
  

  function sendMessage() {
    socket.emit('chat message', value);
    //setValue('')
  }

  return (
    <>
      {messages.map(message => {
        return (
            <div>{message}</div>
        )
      })}
      <input
        value={value}
        onChange={(ev) => {
          const value = ev.currentTarget.value;
          setValue(value);
        }}
      ></input>
      <button onClick={sendMessage}>send message</button>
    </>
  );
};

export default Messages;
