import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Mode } from '../../pages/localChatRoom';
import { User } from '../../types';

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

const ConversationRequestHub: React.FC<{
  privateChatSocket: Socket;
  setMode: React.Dispatch<
    React.SetStateAction<{
      type: Mode;
      creator: boolean;
      target: boolean
      privateChatId: string
    }>
  >;
}> = ({ privateChatSocket, setMode }) => {
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
    privateChatSocket.on(
      'private-chat:start',
      ({ creator, target, privateChatId }: { creator: boolean; target: boolean, privateChatId: string }) => {
        console.log('private chat id: ', privateChatId)
        setMode({
          type: Mode.call,
          creator,
          target,
          privateChatId
        });
      }
    );
  }, []);

  function acceptRequest({ privateChatId }: { privateChatId: string }) {
    privateChatSocket.emit('private-chat:accept', { privateChatId });
  }

  return (
    <div>
      privata requests:
      {privateChatRequests.map(({ privateChatId, requestCreatorUserId }) => (
        <PrivateChatRequestButton
          key={privateChatId}
          privateChatId={privateChatId}
          requestCreatorUserId={requestCreatorUserId}
          onClick={() => acceptRequest({ privateChatId })}
        />
      ))}
    </div>
  );
};

export default ConversationRequestHub;
