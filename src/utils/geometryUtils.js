export const calculateAngle = (p1, p2, p3) => {
    const vector1 = {
      x: p1.x - p2.x,
      y: p1.y - p2.y
    };
    
    const vector2 = {
      x: p3.x - p2.x,
      y: p3.y - p2.y
    };
    
    const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
    
    const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
    
    const angleRadians = Math.acos(dotProduct / (magnitude1 * magnitude2));
    
    const angleDegrees = angleRadians * (180 / Math.PI);
    
    return angleDegrees;
  };
  
  // Calculate distance between two points
  export const calculateDistance = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  // Check if a point is inside a triangle
  export const pointInTriangle = (pt, v1, v2, v3) => {
    const d1 = sign(pt, v1, v2);
    const d2 = sign(pt, v2, v3);
    const d3 = sign(pt, v3, v1);
    
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    
    return !(hasNeg && hasPos);
  };
  
  const sign = (p1, p2, p3) => {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  };