import React, { useState, useEffect, useRef, use } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as blazeface from '@tensorflow-models/blazeface';
import { log } from '@tensorflow/tfjs-core/dist/log';
import { useNavigate } from "react-router-dom";
import useCondidateStore from '../store/useCondidateStore';
import useWebSocket from '../hooks/useWebSocket';


const ExamProctoringSystem = () => {
  const {candidateName, candidateRoomId} = useCondidateStore();
  const [isMonitoring, setIsMonitoring] = useState(false);
  // const { isMonitoring, setIsMonitoring } = useCondidateStore();
  const [eventLog, setEventLog] = useState([]);
  const [stream1, setStream1] = useState(null)
  const [detectionState, setDetectionState] = useState({
    phoneDetected: false,
    booksDetected: false,
    devicesDetected: false,
    faceDetected: false,
    lookingAtScreen: true,
    multipleFaces: false,
    noFaceTimer: 0,
    noGazeTimer: 0
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const objectModelRef = useRef(null);
  const faceModelRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const navigate = useNavigate();
  const { alerts, sendEvent, sendStream, isConnected, status } = useWebSocket(candidateRoomId)
  


  // Initialize models
  useEffect(() => {
    const loadModels = async () => {
      try {
        // console.log("Loading models...");
        objectModelRef.current = await cocoSsd.load();
        faceModelRef.current = await blazeface.load();
        // console.log("Models loaded successfully");
        addToLog('System', 'AI Detection Setuped successfully');
      } catch (error) {
        console.error("Error Setuping Detection:", error);
        addToLog('Error', 'Failed to load Detection System. Please refresh the page.');
      }
    };

    loadModels();

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
  if (isMonitoring) {
    detectionIntervalRef.current = setInterval(() => {
      if (isMonitoring) {   // ✅ always fresh because effect re-runs
        runDetection();
          
      }
    }, 1000);
  } else {
    clearInterval(detectionIntervalRef.current);
  }

  return () => clearInterval(detectionIntervalRef.current);
}, [isMonitoring]);  // ✅ effect re-subscribes on state change


  // Start monitoring
  const startMonitoring = async () => {
    try {
    const streamInitial = await navigator.mediaDevices.getUserMedia({ video: true });
    const track = streamInitial.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    // console.log("Camera capabilities:", capabilities);
    const maxWidth = capabilities.width?.max || 1280;
    const maxHeight = capabilities.height?.max || 720;

    console.log(`Max supported resolution: ${maxWidth}x${maxHeight}`);

    track.stop();
      const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: maxWidth },
        height: { ideal: maxHeight }
      },
      audio: true
    });
    console.log(stream);
    
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
          setIsMonitoring(true);
          // detectionIntervalRef.current = setInterval(runDetection, 1000);
          
          // Start streaming after video is loaded
          sendStream(stream, videoRef.current);
          addToLog('System', 'Monitoring started');
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      addToLog('Error', 'Camera access denied. Please allow camera access to use this system.');
    }
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    addToLog('System', 'Monitoring stopped');
     navigate("/");
  };

  // Main detection function
  
  const runDetection = async () => {
    // console.log("Detection cycle running...", isMonitoring, videoRef.current);
    if (!isMonitoring || !videoRef.current) return;
    // console.log("Running detection...");
    // Run object detection
    if (objectModelRef.current) {
      const objects = await objectModelRef.current.detect(videoRef.current);
      // console.log(objects);
      processObjects(objects);
      processFaces(objects.filter((object)=> object.class === 'person')); 
    }
    
     
    // Run face detection
    // if (faceModelRef.current) {
    //   const faces = await faceModelRef.current.estimateFaces(videoRef.current, false);
    //   processFaces(faces);
    // }
    
    // Update timers and UI
    updateTimers();
  };

  // Process detected objects
  const processObjects = (objects) => {
    let phoneDetected = false;
    let booksDetected = false;
    let devicesDetected = false;
    
    objects.forEach(object => {
      const { class: className, score } = object;
      
      if (className === 'cell phone' && score > 0.5) {
        phoneDetected = true;
        addToLog('Warning', 'Mobile phone detected', true);
      }
      
      if ((className === 'book' || className === 'notebook') && score > 0.5) {
        booksDetected = true;
        addToLog('Warning', 'Book or notes detected', true);
      }
      
      if ((className === 'laptop' || className === 'tv' || className === 'remote' || className === 'clock') && score > 0.5) {
        devicesDetected = true;
        addToLog('Warning', 'Extra electronic device detected', true);
      }
    });
    
    setDetectionState(prev => ({
      ...prev,
      phoneDetected,
      booksDetected,
      devicesDetected
    }));
    
    // drawBoundingBoxes(objects);
  };

  // Process detected faces
  const processFaces = (faces) => {
    const previousFaceState = detectionState.faceDetected;
    const previousGazeState = detectionState.lookingAtScreen;
    const previousMultipleState = detectionState.multipleFaces;
    const faceDetected = faces.length > 0;
    const multipleFaces = faces.length > 1;
    //  if face is detected, assume looking at screen
    const lookingAtScreen = faces.length > 0;
    
    setDetectionState(prev => ({
      ...prev,
      faceDetected,
      lookingAtScreen,
      multipleFaces
    }));
    
    // Log face detection events
    if (previousFaceState !== faceDetected) {
      if (faceDetected) {
        addToLog('Info', 'Face detected');
      } else {
        addToLog('Warning', 'Face not detected', true);
      }
    }
    
    if (previousGazeState !== lookingAtScreen && !lookingAtScreen) {
      addToLog('Warning', 'Not looking at screen', true);
    }
    
    if (previousMultipleState !== multipleFaces && multipleFaces) {
      addToLog('Warning', 'Multiple faces detected', true);
    }
    
    // drawFaceLandmarks(faces);
  };

  // Update timers based on detection state
  const updateTimers = () => {
    setDetectionState(prev => {
      const newState = { ...prev };
      
      // Update no face timer
      if (!prev.faceDetected) {
        newState.noFaceTimer += 1;
        if (newState.noFaceTimer === 10) {
          addToLog('Violation', 'No face detected for 10 seconds', true);
        }
      } else {
        newState.noFaceTimer = 0;
      }
      
      // Update no gaze timer
      if (!prev.lookingAtScreen) {
        newState.noGazeTimer += 1;
        if (newState.noGazeTimer === 5) {
          addToLog('Violation', 'Not looking at screen for 5 seconds', true);
        }
      } else {
        newState.noGazeTimer = 0;
      }
      
      return newState;
    });
  };

  // Draw bounding boxes for detected objects
  const drawBoundingBoxes = (objects) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    objects.forEach(object => {
      const { bbox, class: className, score } = object;
      const [x, y, width, height] = bbox;
      
      if (score > 0.5) {
        // Set style based on object type
        if (className === 'cell phone') {
          ctx.strokeStyle = '#ef4444';
        } else if (className === 'book' || className === 'notebook') {
          ctx.strokeStyle = '#f59e0b';
        } else if (className === 'laptop' || className === 'tv' || className === 'remote') {
          ctx.strokeStyle = '#8b5cf6';
        } else {
          ctx.strokeStyle = '#3b82f6';
        }
        
        // Draw rectangle
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillRect(x, y - 20, className.length * 8, 20);
        
        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.fillText(`${className} (${Math.round(score * 100)}%)`, x + 5, y - 5);
      }
    });
  };

  // Draw face landmarks (simplified)
  const drawFaceLandmarks = (faces) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    faces.forEach(face => {
      // Draw face bounding box
      const [x, y, width, height] = [
        face.topLeft[0], 
        face.topLeft[1], 
        face.bottomRight[0] - face.topLeft[0], 
        face.bottomRight[1] - face.topLeft[1]
      ];
      
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw landmarks (simplified - just points)
      if (face.landmarks) {
        ctx.fillStyle = '#10b981';
        face.landmarks.forEach(landmark => {
          ctx.beginPath();
          ctx.arc(landmark[0], landmark[1], 3, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });
  };

  // Add entry to event log
  const addToLog = (type, message, isWarning = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEntry = { type, message, timestamp, isWarning };
    
    setEventLog(prevLog => {
      const updatedLog = [newEntry, ...prevLog];
      // Keep log to a reasonable size
      return updatedLog.slice(0, 50);
    });
    sendEvent({...newEntry, candidateName});
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Exam Proctoring System</h1>
          <p className="text-gray-600">AI-powered monitoring for online exams</p>
        </header>

        <main className="grid grid-cols-4 lg:grid-cols-4 gap-6">
          {/* Video and Detection Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
            <p>Candidate Name: {candidateName}</p>
            <div className="relative w-full pb-[75%]">
              <video 
                ref={videoRef} 
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg" 
                autoPlay 
                playsInline
              />
              <canvas 
                ref={canvasRef} 
                className="absolute top-0 left-0 w-full h-full" 
              />
            </div>
            
            <div className="flex justify-center mt-4 space-x-4">
              <button 
                onClick={startMonitoring}
                disabled={isMonitoring}
                className={`px-4 py-2 rounded transition ${
                  isMonitoring 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Start Exam
              </button>
              <button 
                onClick={stopMonitoring}
                disabled={!isMonitoring}
                className={`px-4 py-2 rounded transition ${
                  !isMonitoring 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Stop Exam
              </button>
            </div>
            
            
          </div>
          
          {/* Event Log Section */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detection Log</h2>
            <div className="h-96 overflow-y-auto pr-2">
              {eventLog.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No events detected yet</p>
              ) : (
                eventLog.map((entry, index) => (
                  <div 
                    key={index} 
                    className={`border-l-3 pl-2 mb-2 ${entry.isWarning ? 'border-red-500' : 'border-blue-500'}`}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{entry.type}</span>
                      <span className="text-gray-500 text-sm">{entry.timestamp}</span>
                    </div>
                    <p className="text-sm">{entry.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Object Detected Status*/}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Object Detection</h3>
                <p className={`text-sm mt-2 ${detectionState.phoneDetected ? 'text-red-600 font-bold' : ''}`}>
                  Phone: {detectionState.phoneDetected ? 'Detected!' : 'Not detected'}
                </p>
                <p className={`text-sm ${detectionState.booksDetected ? 'text-red-600 font-bold' : ''}`}>
                  Books/Notes: {detectionState.booksDetected ? 'Detected!' : 'Not detected'}
                </p>
                <p className={`text-sm ${detectionState.devicesDetected ? 'text-red-600 font-bold' : ''}`}>
                  Extra devices: {detectionState.devicesDetected ? 'Detected!' : 'Not detected'}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Face Detection</h3>
                <p className="text-sm mt-2">
                  Face: {detectionState.faceDetected ? 'Detected' : 'Not detected'}
                </p>
                <p className={`text-sm ${!detectionState.lookingAtScreen ? 'text-red-600 font-bold' : ''}`}>
                  Looking at screen: {detectionState.lookingAtScreen ? 'Yes' : 'No'}
                </p>
                <p className={`text-sm ${detectionState.multipleFaces ? 'text-red-600 font-bold' : ''}`}>
                  Multiple faces: {detectionState.multipleFaces ? 'Yes' : 'No'}
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800">Timers</h3>
                <p className="text-sm mt-2">No face: {detectionState.noFaceTimer}s</p>
                <p className="text-sm">Not looking: {detectionState.noGazeTimer}s</p>
              </div>
            </div>

        </main>
      </div>
    </div>
  );
};

export default ExamProctoringSystem;