import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'

const useWebSocket = (roomId) => {
  const [alerts, setAlerts] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState("idle")
  const [remoteStream, setRemoteStream] = useState(null)
  const socketRef = useRef(null)
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!roomId) return
   
    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    console.log(serverUrl,'serverUrl');
    
    socketRef.current = io(serverUrl)

    socketRef.current.on('connect', async () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      socketRef.current.emit('join_room', roomId)
      setStatus("ready")
    })

    socketRef.current.on('initial_events', (events) => setAlerts(events))
    socketRef.current.on('alert', (data) => setAlerts(prev => [...prev, data]))

   
    socketRef.current.on('video_frame', (data) => {
      const img = new Image()
      img.onload = () => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          canvasRef.current.width = img.width
          canvasRef.current.height = img.height
          ctx.drawImage(img, 0, 0)
          
        
          const stream = canvasRef.current.captureStream(30)
          setRemoteStream(stream)
        }
      }
      img.src = data.frame
    })

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
      setStatus("idle")
    })

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [roomId])


  const sendEvent = (data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('proctoring_event', { roomId, data })
    }
  }


const sendStream = async (stream, videoElement) => {
  if (!stream || !socketRef.current?.connected) return;

  try {
    
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9',
    });

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0 && socketRef.current?.connected) {
        socketRef.current.emit('stream_chunk', {
          roomId,
          chunk: event.data,
        });
      }
    };

    recorder.start(1000); 

    
    const captureFrame = () => {
      if (videoElement && videoElement.videoWidth > 0) {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = videoElement.videoWidth
        canvas.height = videoElement.videoHeight
        ctx.drawImage(videoElement, 0, 0)
        
        const frameData = canvas.toDataURL('image/jpeg', 0.7)
        socketRef.current.emit('video_frame', {
          roomId,
          frame: frameData
        })
      }
    }

   
    intervalRef.current = setInterval(captureFrame, 100)
    setStatus("streaming");
  } catch (err) {
    console.error("Error starting stream:", err);
    setStatus("error");
  }
};


  return { alerts, sendEvent, sendStream, isConnected, status, socketRef, remoteStream, canvasRef }
}

export default useWebSocket
