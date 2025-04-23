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
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        setPoseLandmarker(landmarker);
      } catch (error) {
        console.error('Error initializing pose landmarker:', error);
      }
    };

    initializePoseLandmarker();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
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
        let evaluation = null;
        if (results.landmarks?.length) {
          if (exercise === 'squats') evaluation = evaluateSquat(results.landmarks[0]);
          else if (exercise === 'pushups') evaluation = evaluatePushup(results.landmarks[0]);
          setEvaluationResults(evaluation || null);
          drawResults(results, evaluation);
        }
      } catch (error) {
        console.error('Error detecting pose:', error);
      }
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const drawResults = (results, evaluation) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!results.landmarks?.length) return;

    const landmarks = results.landmarks[0];
    const connections = [
      [11, 12], [12, 24], [24, 23], [23, 11],
      [12, 14], [14, 16],
      [11, 13], [13, 15],
      [24, 26], [26, 28], [28, 32],
      [23, 25], [25, 27], [27, 31],
    ];

    const severityColors = { high: 'red', medium: 'orange', low: 'yellow' };
    const problematicConnections = new Map();
    const problematicLandmarks = new Set();

    evaluation?.issues.forEach((issue) => {
      issue.landmarks?.forEach((idx) => problematicLandmarks.add(idx));
      issue.connections?.forEach(([a, b]) => {
        const key = `${a}-${b}`;
        problematicConnections.set(key, severityColors[issue.severity] || 'red');
      });
    });

    connections.forEach(([start, end]) => {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      if (!p1 || !p2) return;
      const key = `${start}-${end}`;
      const reverseKey = `${end}-${start}`;
      const color = problematicConnections.get(key) || problematicConnections.get(reverseKey) || 'green';
      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.lineWidth = problematicConnections.has(key) ? 5 : 3;
      ctx.strokeStyle = color;
      ctx.stroke();
    });

    landmarks.forEach((lm, i) => {
      if (!lm) return;
      const isBad = problematicLandmarks.has(i);
      ctx.beginPath();
      ctx.arc(lm.x * canvas.width, lm.y * canvas.height, isBad ? 8 : 5, 0, 2 * Math.PI);
      ctx.fillStyle = isBad ? severityColors[evaluation?.issues.find(issue => issue.landmarks?.includes(i))?.severity] || 'red' : 'blue';
      ctx.fill();
    });
  };

  useEffect(() => {
    if (poseLandmarker && videoRef.current) {
      cancelAnimationFrame(requestRef.current);
      lastVideoTime.current = -1;
      requestRef.current = requestAnimationFrame(predictWebcam);
      setDetectionActive(true);
    }
    return () => {
      cancelAnimationFrame(requestRef.current);
      setDetectionActive(false);
    };
  }, [poseLandmarker, exercise, videoRef]);

  return (
    <>
      <div className="absolute top-0 left-0 w-full h-full">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
      </div>
      <div className="absolute bottom-0 left-0 mt-10 w-full bg-black bg-opacity-60 p-2 text-white">
        {evaluationResults?.issues?.length > 0 ? (
          evaluationResults.issues.map((issue, idx) => (
            <p key={idx} className={`font-bold ${issue.severity === 'high' ? 'text-red-400' : issue.severity === 'medium' ? 'text-orange-400' : 'text-yellow-400'}`}>
              ⚠️ {issue.message}
            </p>
          ))
        ) : detectionActive ? (
          <p className="font-bold text-green-400">✓ Good form!</p>
        ) : null}
      </div>
    </>
  );
};
