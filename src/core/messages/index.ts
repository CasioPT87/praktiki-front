export const getMessagesManager = () => {
  if (typeof document !== 'undefined') {
    return import('socket.io-client')
      .then(async ({ io }) => {
        let socket = null
        if (process.env.NODE_ENV === 'production') {
          socket = io.connect(process.env.BACKEND_URL)
        } else {
          const token = localStorage.getItem(process.env.APP_NAME || '') || null
          socket = io.connect(process.env.BACKEND_URL, {
            auth: {
              token
            }
          });
        }
        
        return socket;
      })
      .catch((e) => {
        console.error(e.message);
        return;
      });
  }
};
