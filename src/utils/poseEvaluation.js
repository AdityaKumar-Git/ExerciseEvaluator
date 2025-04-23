import { calculateAngle } from './geometryUtils';

export const evaluateSquat = (landmarks) => {
  const issues = [];
  const phase = detectSquatPhase(landmarks);
  
  const backAngleIssue = checkBackAngle(landmarks);
  if (backAngleIssue) issues.push(backAngleIssue);
  
  const kneeBendIssue = checkKneeBend(landmarks, phase);
  if (kneeBendIssue) issues.push(kneeBendIssue);
  
  const kneeAlignmentIssue = checkKneeAlignment(landmarks);
  if (kneeAlignmentIssue) issues.push(kneeAlignmentIssue);
  
  const hipKneeAnkleIssue = checkHipKneeAnkleAlignment(landmarks);
  if (hipKneeAnkleIssue) issues.push(hipKneeAnkleIssue);
  
  const weightDistributionIssue = checkWeightDistribution(landmarks);
  if (weightDistributionIssue) issues.push(weightDistributionIssue);
  
  return {
    isCorrect: issues.length === 0,
    issues: issues,
    phase: phase
  };
};

export const evaluatePushup = (landmarks) => {
  const issues = [];
  const phase = detectPushupPhase(landmarks);
  
  const elbowAngleIssue = checkElbowAngle(landmarks, phase);
  if (elbowAngleIssue) issues.push(elbowAngleIssue);
  
  const backAlignmentIssue = checkBackAlignment(landmarks);
  if (backAlignmentIssue) issues.push(backAlignmentIssue);
  
  const headPositionIssue = checkHeadPosition(landmarks);
  if (headPositionIssue) issues.push(headPositionIssue);
  
  const shoulderStabilityIssue = checkShoulderStability(landmarks);
  if (shoulderStabilityIssue) issues.push(shoulderStabilityIssue);
  
  return {
    isCorrect: issues.length === 0,
    issues: issues,
    phase: phase
  };
};

function detectSquatPhase(landmarks) {
  const rightKneeAngle = calculateKneeAngle(landmarks, 'right');
  const leftKneeAngle = calculateKneeAngle(landmarks, 'left');
  const averageKneeAngle = (rightKneeAngle + leftKneeAngle) / 2;
  
  if (averageKneeAngle < 120) return 'bottom';
  if (averageKneeAngle > 160) return 'top';
  return 'descent';
}

function checkBackAngle(landmarks) {
  const hip = landmarks[24];
  const shoulder = landmarks[12];
  
  if (!hip || !shoulder) return null;
  
  const backAngle = calculateAngle(
    { x: hip.x, y: hip.y },
    { x: shoulder.x, y: shoulder.y },
    { x: hip.x, y: hip.y - 1 }
  );
  
  if (backAngle > 10) {
    return {
      message: "Keep your back more upright - chest up!",
      landmarks: [11, 12, 23, 24],
      severity: "high",
      connections: [[11, 12], [12, 24], [24, 23], [23, 11]]
    };
  }
  
  return null;
}

function checkKneeBend(landmarks, phase) {
  const rightKneeAngle = calculateKneeAngle(landmarks, 'right');
  const leftKneeAngle = calculateKneeAngle(landmarks, 'left');
  const averageKneeAngle = (rightKneeAngle + leftKneeAngle) / 2;
  
  if (phase === 'bottom') {
    if (averageKneeAngle > 95) {
      return {
        message: "Squat deeper - aim for thighs parallel to ground",
        landmarks: [23, 25, 27, 24, 26, 28],
        severity: "medium",
        connections: [[23, 25], [25, 27], [24, 26], [26, 28]]
      };
    }
  }
  else if (phase === 'top') {
    if (averageKneeAngle < 170) {
      return {
        message: "Stand up straight - fully extend your legs",
        landmarks: [23, 25, 27, 24, 26, 28],
        severity: "medium",
        connections: [[23, 25], [25, 27], [24, 26], [26, 28]]
      };
    }
  }
  
  return null;
}

function checkKneeAlignment(landmarks) {
  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];
  
  if (!rightHip || !rightKnee || !rightAnkle || !leftHip || !leftKnee || !leftAnkle) return null;
  
  const expectedRightKneeX = (rightHip.x + rightAnkle.x) / 2;
  const actualRightKneeX = rightKnee.x;
  const expectedLeftKneeX = (leftHip.x + leftAnkle.x) / 2;
  const actualLeftKneeX = leftKnee.x;
  
  const rightKneeDifference = actualRightKneeX - expectedRightKneeX;
  const leftKneeDifference = expectedLeftKneeX - actualLeftKneeX;
  
  if (rightKneeDifference < -0.01 || leftKneeDifference < -0.01) {
    return {
      message: "Knees are caving in! Push them out to align with toes",
      landmarks: [25, 26, 27, 28],
      severity: "high",
      connections: [[23, 25], [25, 27], [24, 26], [26, 28]]
    };
  }
  
  const rightKneeForward = rightKnee.x - rightAnkle.x;
  const leftKneeForward = leftKnee.x - leftAnkle.x;
  
  if (rightKneeForward > 0.07 || leftKneeForward > 0.07) {
    return {
      message: "Knees are too far forward! Keep them over ankles",
      landmarks: [25, 26, 27, 28],
      severity: "high",
      connections: [[25, 27], [26, 28]]
    };
  }
  
  const rightKneeBack = rightAnkle.x - rightKnee.x;
  const leftKneeBack = leftAnkle.x - leftKnee.x;
  
  if (rightKneeBack > 0.07 || leftKneeBack > 0.07) {
    return {
      message: "Knees are too far back! Keep them over ankles",
      landmarks: [25, 26, 27, 28],
      severity: "high",
      connections: [[25, 27], [26, 28]]
    };
  }
  
  return null;
}

function detectPushupPhase(landmarks) {
  const rightElbowAngle = calculateElbowAngle(landmarks, 'right');
  const leftElbowAngle = calculateElbowAngle(landmarks, 'left');
  const averageElbowAngle = (rightElbowAngle + leftElbowAngle) / 2;
  
  if (averageElbowAngle < 90) return 'bottom';
  if (averageElbowAngle > 160) return 'top';
  return 'descent';
}

function checkElbowAngle(landmarks, phase) {
  const rightElbowAngle = calculateElbowAngle(landmarks, 'right');
  const leftElbowAngle = calculateElbowAngle(landmarks, 'left');
  const averageElbowAngle = (rightElbowAngle + leftElbowAngle) / 2;
  
  if (phase === 'bottom') {
    if (averageElbowAngle > 100) {
      return {
        message: "Lower your chest more - bend your elbows to 90°",
        landmarks: [11, 13, 15, 12, 14, 16],
        severity: "high",
        connections: [[11, 13], [13, 15], [12, 14], [14, 16]]
      };
    }
  } else if (phase === 'top') {
    if (averageElbowAngle < 160) {
      return {
        message: "Fully extend your arms at the top position",
        landmarks: [11, 13, 15, 12, 14, 16],
        severity: "medium",
        connections: [[11, 13], [13, 15], [12, 14], [14, 16]]
      };
    }
  }
  
  return null;
}

function checkBackAlignment(landmarks) {
  const shoulders = [(landmarks[11].y + landmarks[12].y) / 2, (landmarks[11].x + landmarks[12].x) / 2];
  const hips = [(landmarks[23].y + landmarks[24].y) / 2, (landmarks[23].x + landmarks[24].x) / 2];
  const knees = [(landmarks[25].y + landmarks[26].y) / 2, (landmarks[25].x + landmarks[26].x) / 2];
  
  const backAngle = Math.atan2(shoulders[0] - hips[0], shoulders[1] - hips[1]);
  const legAngle = Math.atan2(hips[0] - knees[0], hips[1] - knees[1]);
  const alignmentAngle = Math.abs(backAngle - legAngle) * (180 / Math.PI);
  
  if (alignmentAngle > 12) {
    return {
      message: "Keep your back straight and aligned with legs",
      landmarks: [11, 12, 23, 24, 25, 26],
      severity: "high",
      connections: [[11, 12], [12, 24], [24, 23], [23, 11], [24, 26], [23, 25]]
    };
  }
  
  return null;
}

function checkHeadPosition(landmarks) {
  const nose = landmarks[0];
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  
  if (!nose || !leftEar || !rightEar || !leftShoulder || !rightShoulder) return null;
  
  const earY = (leftEar.y + rightEar.y) / 2;
  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  
  if (earY > shoulderY - 0.05) {
    return {
      message: "Keep your head in line with your spine",
      landmarks: [0, 7, 8, 11, 12],
      severity: "medium",
      connections: [[7, 8], [8, 12], [12, 11], [11, 7]]
    };
  }
  
  return null;
}

function calculateKneeAngle(landmarks, side) {
  const hipIndex = side === 'right' ? 24 : 23;
  const kneeIndex = side === 'right' ? 26 : 25;
  const ankleIndex = side === 'right' ? 28 : 27;
  
  if (!landmarks[hipIndex] || !landmarks[kneeIndex] || !landmarks[ankleIndex]) return 180;
  
  return calculateAngle(
    { x: landmarks[hipIndex].x, y: landmarks[hipIndex].y },
    { x: landmarks[kneeIndex].x, y: landmarks[kneeIndex].y },
    { x: landmarks[ankleIndex].x, y: landmarks[ankleIndex].y }
  );
}

function calculateElbowAngle(landmarks, side) {
  const shoulderIndex = side === 'right' ? 12 : 11;
  const elbowIndex = side === 'right' ? 14 : 13;
  const wristIndex = side === 'right' ? 16 : 15;
  
  if (!landmarks[shoulderIndex] || !landmarks[elbowIndex] || !landmarks[wristIndex]) return 180;
  
  return calculateAngle(
    { x: landmarks[shoulderIndex].x, y: landmarks[shoulderIndex].y },
    { x: landmarks[elbowIndex].x, y: landmarks[elbowIndex].y },
    { x: landmarks[wristIndex].x, y: landmarks[wristIndex].y }
  );
}

function checkHipKneeAnkleAlignment(landmarks) {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  
  if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return null;
  
  const leftAngle = calculateAngle(
    { x: leftHip.x, y: leftHip.y },
    { x: leftKnee.x, y: leftKnee.y },
    { x: leftAnkle.x, y: leftAnkle.y }
  );
  
  const rightAngle = calculateAngle(
    { x: rightHip.x, y: rightHip.y },
    { x: rightKnee.x, y: rightKnee.y },
    { x: rightAnkle.x, y: rightAnkle.y }
  );
  
  if (Math.abs(leftAngle - rightAngle) > 12) {
    return {
      message: "Keep your legs symmetrical - both sides should move together",
      landmarks: [23, 24, 25, 26, 27, 28],
      severity: "high",
      connections: [[23, 25], [25, 27], [24, 26], [26, 28]]
    };
  }
  
  return null;
}

function checkWeightDistribution(landmarks) {
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  const leftHeel = landmarks[29];
  const rightHeel = landmarks[30];
  
  if (!leftAnkle || !rightAnkle || !leftHeel || !rightHeel) return null;
  
  const leftPressure = leftAnkle.x - leftHeel.x;
  const rightPressure = rightAnkle.x - rightHeel.x;
  
  if (Math.abs(leftPressure) > 0.05 || Math.abs(rightPressure) > 0.05) {
    return {
      message: "Keep your weight centered - don't lean too far forward or back",
      landmarks: [27, 28, 29, 30],
      severity: "medium",
      connections: [[27, 29], [28, 30]]
    };
  }
  
  return null;
}

function checkShoulderStability(landmarks) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  
  if (!leftShoulder || !rightShoulder || !leftElbow || !rightElbow) return null;
  
  const leftShoulderAngle = calculateAngle(
    { x: leftElbow.x, y: leftElbow.y },
    { x: leftShoulder.x, y: leftShoulder.y },
    { x: leftShoulder.x, y: leftShoulder.y - 1 }
  );
  
  const rightShoulderAngle = calculateAngle(
    { x: rightElbow.x, y: rightElbow.y },
    { x: rightShoulder.x, y: rightShoulder.y },
    { x: rightShoulder.x, y: rightShoulder.y - 1 }
  );
  
  if (Math.abs(leftShoulderAngle - rightShoulderAngle) > 10) {
    return {
      message: "Keep your shoulders stable and level",
      landmarks: [11, 12, 13, 14],
      severity: "high",
      connections: [[11, 13], [12, 14], [11, 12]]
    };
  }
  
  return null;
}