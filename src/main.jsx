import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

/*

import { useEffect, useState, useRef } from 'react';
import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { evaluateSquat, evaluatePushup } from '../utils/poseEvaluation';

export const PoseDetector = ({ videoRef, exercise }) => {
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [detectionActive, setDetectionActive] = useState(true);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const lastVideoTime = useRef(-1);

  useEffect(() => {
    const initializePoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numPoses: 1
        });
        
        setPoseLandmarker(landmarker);
        console.log("Pose landmarker initialized successfully");
      } catch (error) {
        console.error("Error initializing pose landmarker:", error);
      }
    };

    initializePoseLandmarker();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const predictWebcam = () => {
    if (!poseLandmarker || !videoRef.current || !canvasRef.current) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = videoRef.current;
    
    if (video.readyState < 2) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }
    
    if (video.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = video.currentTime;
      
      try {
        const nowInMs = performance.now();
        const results = poseLandmarker.detectForVideo(video, nowInMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
          let evaluation;
          if (exercise === 'squats') {
            evaluation = evaluateSquat(results.landmarks[0]);
          } else if (exercise === 'pushups') {
            evaluation = evaluatePushup(results.landmarks[0]);
          }
          
          if (evaluation) {
            setEvaluationResults(evaluation);
            console.log("Evaluation results:", evaluation);
          }
        } else {
          console.log("No landmarks detected");
        }
        
        // Only draw if we have landmarks
        if (results.landmarks && results.landmarks.length > 0) {
          drawResults(results);
        }
      } catch (error) {
        console.error("Error detecting pose:", error);
      }
    }
    
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const drawResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!results || !results.landmarks || results.landmarks.length === 0) {
      return;
    }
    
    const landmarks = results.landmarks[0];
    
    // Default connections to draw
    const connections = [
      [11, 12], [12, 24], [24, 23], [23, 11], // Torso
      [12, 14], [14, 16], // Right arm
      [11, 13], [13, 15], // Left arm
      [24, 26], [26, 28], [28, 32], // Right leg
      [23, 25], [25, 27], [27, 31] // Left leg
    ];
    
    // Create a map of affected connections from all issues
    const problematicConnections = new Map();
    
    // Set for tracking problematic landmarks
    const problematicLandmarks = new Set();
    
    if (evaluationResults && evaluationResults.issues && evaluationResults.issues.length > 0) {
      evaluationResults.issues.forEach(issue => {
        // Add problematic landmarks
        if (issue.landmarks) {
          issue.landmarks.forEach(landmarkIndex => {
            problematicLandmarks.add(landmarkIndex);
          });
        }
        
        // Add problematic connections
        if (issue.connections) {
          issue.connections.forEach(connection => {
            const key = `${connection[0]}-${connection[1]}`;
            problematicConnections.set(key, issue.severity === "high" ? "red" : "orange");
          });
        }
      });
    }
    
    // First draw all connections
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      if (!startPoint || !endPoint) {
        return; // Skip if landmarks don't exist
      }
      
      const connectionKey = `${start}-${end}`;
      const connectionKeyReverse = `${end}-${start}`;
      const isProblematic = problematicConnections.has(connectionKey) || 
                            problematicConnections.has(connectionKeyReverse);
      
      ctx.beginPath();
      ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
      ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
      ctx.lineWidth = isProblematic ? 5 : 3;
      
      // Choose color based on whether the connection is problematic
      if (isProblematic) {
        ctx.strokeStyle = problematicConnections.get(connectionKey) || 
                          problematicConnections.get(connectionKeyReverse) || 
                          'red';
      } else {
        ctx.strokeStyle = 'green';
      }
      
      ctx.stroke();
    });
    
    // Then draw all landmarks
    for (let i = 0; i < landmarks.length; i++) {
      const landmark = landmarks[i];
      if (!landmark) continue;
      
      const isProblematic = problematicLandmarks.has(i);
      
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvas.width,
        landmark.y * canvas.height,
        isProblematic ? 8 : 5,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = isProblematic ? 'red' : 'blue';
      ctx.fill();
    }
    
    // Draw warning text for issues
    if (evaluationResults && evaluationResults.issues && evaluationResults.issues.length > 0) {
      // Create a background for the text
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, canvas.width - 20, evaluationResults.issues.length * 30 + 15);
      
      // Add warning text
      ctx.font = 'bold 20px Arial';
      ctx.textBaseline = 'middle';
      
      evaluationResults.issues.forEach((issue, index) => {
        // Different colors for different severity levels
        if (issue.severity === "high") {
          ctx.fillStyle = 'red';
        } else if (issue.severity === "medium") {
          ctx.fillStyle = 'orange';
        } else {
          ctx.fillStyle = 'yellow';
        }
        
        ctx.fillText(`⚠ ${issue.message}`, 20, 30 + (index * 30));
      });
    } else if (detectionActive) {
      // Show "Good form!" message when no issues detected
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 40);
      
      ctx.font = 'bold 20px Arial';
      ctx.fillStyle = 'green';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓ Good form!', 20, 30);
    }
  };

  useEffect(() => {
    if (poseLandmarker && videoRef.current) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      lastVideoTime.current = -1;
      requestRef.current = requestAnimationFrame(predictWebcam);
      setDetectionActive(true);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      setDetectionActive(false);
    };
  }, [poseLandmarker, exercise, videoRef]);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};


app.jsx:
import { useState, useEffect, useRef } from 'react';
import { PoseDetector } from './components/PoseDetector';
import ExerciseControls from './components/ExerciseControls';
import Header from './components/Header';
import './App.css';

function App() {
  const [exercise, setExercise] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startExercise = (type) => {
    setExercise(type);
    setIsDetecting(true);
  };

  const stopExercise = () => {
    setIsDetecting(false);
    setExercise(null);
  };

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true);
          };
        }
      } catch (error) {
        console.error('Error accessing webcam:', error);
      }
    };

    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    


      


      
        


          
          {isDetecting && cameraReady && (
            
          )}
        



        {!cameraReady && (
          


            


              


              

Accessing camera...


            


          


        )}

         startExercise('squats')} 
          onStartPushups={() => startExercise('pushups')} 
          onStop={stopExercise}
          currentExercise={exercise}
          cameraReady={cameraReady}
        />
      
    


  );
}

export default App;


instead of consoling warnings of posture show it just below footage in text warning.. and also control color of joints/lines based on posture if possible

*/