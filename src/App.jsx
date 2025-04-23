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
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="p-6 max-w-4xl mx-auto">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl bg-gray-800">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
            style={{ display: cameraReady ? 'block' : 'none' }}
          />
          {isDetecting && cameraReady && (
            <PoseDetector 
              videoRef={videoRef} 
              exercise={exercise}
            />
          )}
        </div>

        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-300 font-medium">Accessing camera...</p>
            </div>
          </div>
        )}

        <ExerciseControls 
          onStartSquats={() => startExercise('squats')} 
          onStartPushups={() => startExercise('pushups')} 
          onStop={stopExercise}
          currentExercise={exercise}
          cameraReady={cameraReady}
        />
      </main>
    </div>
  );
}

export default App;