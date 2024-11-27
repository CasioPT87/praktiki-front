export const getMessagesManager = () => {
  if (typeof document !== 'undefined') {
    return import('socket.io-client').then(({ io }) => {
      console.log('holiiiiiiiiii')
      const socket = io(process.env.BACKEND_URL);
    
      socket.on('connect', () => {
        console.log('websocket conectado!', socket.id);
      });
      
      socket.emit('chat message', 'rojo que te quiero verde');
      return socket
    }).catch(e => {
      console.error(e.message)
      return
    })
  
    
  }
}



