const userName = 'user-' + Math.floor(Math.random() * 100000);
const password = 'x';

export const getMessagesManager = () => {
  if (typeof document !== 'undefined') {
    return import('socket.io-client')
      .then(async ({ io }) => {
        const socket = io.connect(process.env.BACKEND_URL, {
          auth: {
            userName,
            password,
          },
        });
        return socket;
      })
      .catch((e) => {
        console.error(e.message);
        return;
      });
  }
};
