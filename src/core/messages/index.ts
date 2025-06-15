export const getTextMessagesManager = () => {
  const TEXT_NAMESPACE = '/text'
  if (typeof document !== 'undefined') {
    return import('socket.io-client')
      .then(async ({ io }) => {
        let socket = null
        if (process.env.NODE_ENV === 'production') {
          socket = io.connect(process.env.BACKEND_URL + TEXT_NAMESPACE)
        } else {
          const token = localStorage.getItem(process.env.APP_NAME || '') || null
          socket = io.connect(process.env.BACKEND_URL + TEXT_NAMESPACE, {
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

export const getVideoMessagesManager = () => {
  const VIDEO_NAMESPACE = '/video'
  if (typeof document !== 'undefined') {
    let heartbeat: NodeJS.Timeout | null = null
    return import('socket.io-client')
      .then(async ({ io }) => {
        let socket = null
        if (process.env.NODE_ENV === 'production') {
          socket = io.connect(process.env.BACKEND_URL + VIDEO_NAMESPACE)
        } else {
          const token = localStorage.getItem(process.env.APP_NAME || '') || null
          socket = io.connect(process.env.BACKEND_URL + VIDEO_NAMESPACE, {
            auth: {
              token
            }
          });
        }

        heartbeat = setInterval(() => {
          socket.emit('heartbeat');
        }, 10_000);
        
        return socket;
      })
      .catch((e) => {
        console.error(e.message);
        if (heartbeat) clearInterval(heartbeat)
        return;
      });
  }
};
