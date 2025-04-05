import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

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

const ConversationRequestHub: React.FC<{ privateChatSocket: Socket }> = ({
    privateChatSocket,
  }) => {
    const [privateChatRequests, setPrivateChatRequests] = useState<
      { privateChatId: string; requestCreatorUserId: number }[]
    >([]);
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
    }, []);
  
    function acceptRequest({
      privateChatId,
      requestCreatorUserId,
    }: {
      privateChatId: string;
      requestCreatorUserId: number;
    }) {}
  
    return (
      <div>
        privata requests:
        {privateChatRequests.map(({ privateChatId, requestCreatorUserId }) => (
          <PrivateChatRequestButton
            key={privateChatId}
            privateChatId={privateChatId}
            requestCreatorUserId={requestCreatorUserId}
            onClick={() => acceptRequest({ privateChatId, requestCreatorUserId })}
          />
        ))}
      </div>
    );
  };

  export default ConversationRequestHub