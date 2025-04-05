import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "../../types";

type UserConnected = {
    name: string;
    userId: number;
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
        'location-chat-users:get',
        (usersConnected: UserConnected[]) => {
          setUsersConnectedToRoom(usersConnected);
        }
      );
      locationChatSocket.emit('location-chat-users:get');
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
              key={userId}
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

  export default UsersConnected