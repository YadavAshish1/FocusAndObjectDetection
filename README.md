# 🎓 Exam Proctoring System with AI Detection

A comprehensive online exam proctoring system that uses AI-powered computer vision to monitor students during online exams, detect suspicious activities, and provide real-time monitoring for interviewers.

## 🌟 Features

### 🔍 AI-Powered Detection
- **Face Detection**: Monitors student presence and detects multiple faces
- **Object Detection**: Identifies prohibited items like phones, books, and electronic devices
- **Gaze Tracking**: Monitors if students are looking at the screen
- **Real-time Alerts**: Instant notifications for suspicious activities

### 📹 Video Management
- **Live Video Streaming**: Real-time video feed from student to interviewer
- **Video Recording**: Automatic recording of exam sessions for review
- **WebRTC Integration**: Low-latency video communication
- **Multi-format Support**: WebM video format with VP9 codec

### 👥 User Interfaces
- **Student Interface**: Clean, user-friendly exam taking experience
- **Interviewer Dashboard**: Comprehensive monitoring and analytics dashboard
- **Real-time Events**: Live event logging and filtering
- **Score Generation**: Automated integrity scoring system

### 🔒 Security & Monitoring
- **WebSocket Communication**: Secure real-time data transmission
- **Event Logging**: Detailed audit trail of all activities
- **Data Export**: CSV export functionality for reports
- **Session Management**: Secure room-based access control

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Socket.IO
- **AI/ML**: TensorFlow.js + COCO-SSD + BlazeFace
- **Database**: In-memory storage with file persistence
- **Deployment**: Docker + Render

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Student       │    │   WebSocket     │    │   Interviewer   │
│   Interface     │◄──►│   Server        │◄──►│   Dashboard     │
│                 │    │                 │    │                 │
│ • Camera Access │    │ • Real-time     │    │ • Live Video    │
│ • AI Detection  │    │   Communication│    │ • Event Logs    │
│ • Video Stream  │    │ • Video Storage │    │ • Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
FocusAndObjectDetection/
├── 📁 frontend/                    # React Frontend Application
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable UI Components
│   │   │   └── ScoreCard.jsx       # Score display component
│   │   ├── 📁 hooks/               # Custom React Hooks
│   │   │   └── useWebSocket.js     # WebSocket connection hook
│   │   ├── 📁 pages/               # Main Application Pages
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Student.jsx         # Student registration
│   │   │   ├── ExamProctoringSystem.jsx  # Main exam interface
│   │   │   ├── Interviewer.jsx     # Interviewer dashboard
│   │   │   └── InterviewerMain.jsx # Interviewer main page
│   │   ├── 📁 store/               # State Management
│   │   │   ├── useCondidateStore.js    # Student state
│   │   │   └── useInterviewerStore.js  # Interviewer state
│   │   ├── App.jsx                 # Main App component
│   │   ├── main.jsx                # Application entry point
│   │   └── index.css               # Global styles
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   └── index.html                  # HTML template
│
├── 📁 server/                      # Node.js Backend Server
│   ├── server.js                   # Main server file
│   ├── package.json                # Backend dependencies
│   └── 📁 videos/                  # Video storage directory
│       └── vid-1234.webm          # Sample recorded video
│
├── 🐳 Dockerfile                   # Single container Docker config
├── 🐳 docker-compose.yml           # Docker Compose configuration
├── 🌐 nginx.conf                   # Nginx configuration
├── 📄 .dockerignore                # Docker ignore rules
├── 🚀 deploy.bat                   # Windows deployment script
├── 🚀 deploy.ps1                   # PowerShell deployment script
├── 📖 README.md                    # This file
└── 📖 DEPLOYMENT.md                # Deployment guide
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Docker** and Docker Compose (for containerized deployment)
- **Modern web browser** with camera access
- **Webcam** and microphone

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/YadavAshish1/FocusAndObjectDetection.git
   cd FocusAndObjectDetection
   ```

2. **Deploy with Docker**
   docker-compose up -d --build
   ```

3. **Access the application**
   - **Application**: http://localhost:3001

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Start the backend server**
   ```bash
   cd server
   npm start
   # Server runs on http://localhost:3001
   ```

3. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

## 🎯 How to Use

### For Students

1. **Access the application** at http://localhost
2. **Enter your details**:
   - Candidate Name
   - Room ID (provided by interviewer)
3. **Click "Start"** to begin the exam
4. **Allow camera access** when prompted
5. **Take your exam** while being monitored
6. **Click "Stop Exam"** when finished

### For Interviewers

1. **Access the dashboard** at http://localhost
2. **Navigate to Interviewer section**
3. **Enter Room ID** to monitor specific students
4. **View live video feed** of the student
5. **Monitor real-time events** and alerts
6. **Generate integrity scores** after the exam
7. **Export event logs** for review


### Camera Settings
- **Resolution**: auto-detected or 1280x720
- **Frame Rate**: 30 FPS
- **Codec**: VP9 for video recording
- **Format**: WebM for storage

## 📊 Monitoring & Analytics

### Real-time Events
- **Face Detection**: Student presence monitoring
- **Object Detection**: Prohibited items detection
- **Gaze Tracking**: Screen attention monitoring
- **System Events**: Connection and error logging

### Event Types
- **Info**: Normal system events
- **Warning**: Suspicious activities
- **Violation**: Serious rule violations

### Scoring System
- **Integrity Score**: 0-100 based on violations
- **Duration Tracking**: Total exam time
- **Event Counts**: Violations and warnings
- **Export Options**: CSV format for reports

## 🛠️ Development

### Adding New Detection Features

1. **Update AI models** in `ExamProctoringSystem.jsx`
2. **Add detection logic** in `processObjects()` or `processFaces()`
3. **Create event handlers** in `addToLog()`
4. **Update UI components** as needed

### Customizing the UI

1. **Modify components** in `frontend/src/components/`
2. **Update styles** in `frontend/src/index.css`
3. **Add new pages** in `frontend/src/pages/`
4. **Update routing** in `App.jsx`

### Backend Extensions

1. **Add new endpoints** in `server.js`
2. **Extend WebSocket events** for real-time features
3. **Add database integration** for persistent storage
4. **Implement authentication** for security


### Privacy Features
- **Consent Required**: Camera access permission
- **Local Storage**: No external data transmission
- **User Control**: Start/stop monitoring
- **Data Retention**: Configurable video storage

## 🐛 Troubleshooting

### Common Issues

#### Camera Not Working
```bash
# Check browser permissions
# Ensure HTTPS in production
# Verify camera is not in use by other applications
```

#### WebSocket Connection Failed
```bash
# Check if backend server is running
# Verify port 3001 is available
# Check firewall settings
```

#### AI Detection Not Working
```bash
# Ensure TensorFlow.js models are loaded
# Check browser console for errors
# Verify camera stream is active
```

#### Video Recording Issues
```bash
# Check browser support for MediaRecorder
# Verify WebM codec support
# Check available disk space
```

## 📈 Performance Optimization

### Frontend
- **Code Splitting**: Lazy load components
- **Image Optimization**: Compress static assets
- **Bundle Analysis**: Use Vite bundle analyzer
- **Caching**: Implement service worker

### Backend
- **Connection Pooling**: Optimize WebSocket connections
- **Video Compression**: Optimize recording settings
- **Load Balancing**: Scale for multiple users

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test thoroughly before submitting

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and DEPLOYMENT.md
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub discussions for questions


### Backup Strategy
- **Video Files**: Regular backup of recorded videos
- **Configuration**: Backup environment settings
- **Database**: Export event logs regularly

---

**Built with ❤️ By Ashish**
