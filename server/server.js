const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const fs = require('fs')
const ffmpegPath = require('ffmpeg-static')
const { spawn } = require('child_process')

const app = express()
const server = http.createServer(app)

const path = require('path')

// ensure videos directory exists
const videosDir = path.join(__dirname, 'videos')
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir)
}
console.log(process.env.FRONTEND_URL,'url');

const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "https://exam-proctor-hta4.onrender.com" || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

app.use(cors())
app.use(express.json())

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../../app/frontend/dist')))

// Handle client-side routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
  })
  

const roomEvents = {}

const roomPCs = {}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)
    socket.on('join_room', (roomId) => {
        socket.join(roomId)
        console.log(`${socket.id} joined room ${roomId}`)

       
        if (!roomEvents[roomId]) roomEvents[roomId] = []
        if (!roomPCs[roomId]) roomPCs[roomId] = {}

        // Send previous events to the newly connected client
        socket.emit('initial_events', roomEvents[roomId])
    })

    socket.on('proctoring_event', ({ roomId, data }) => {
        const event = {
            ...data,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        }

        roomEvents[roomId].push(event)
        //  console.log(data);
         
        io.to(roomId).emit('alert', event)
    })



// Handle video frames
socket.on('video_frame', ({ roomId, frame }) => {
  // Forwarding video frame to other clients in the room
  socket.to(roomId).emit('video_frame', { frame });
});

// Save video chunks to a file
socket.on('stream_chunk', ({ roomId, chunk }) => {
  const filePath = path.join(videosDir, `vid-${roomId}.webm`);
//   fs.appendFile(filePath, Buffer.from(chunk), (err) => {
//     if (err) {
//       console.error('Error saving chunk:', err);
//     }
//   });
});




    // Disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
        for (const roomId in roomPCs) {
            const pc = roomPCs[roomId][socket.id]
            if (pc) {
                pc.close()
                delete roomPCs[roomId][socket.id]
            }
        }
    })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`)
})
