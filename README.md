# Exercise Evaluation App

A real-time exercise form evaluation application that uses computer vision to analyze and provide feedback on exercise form. The app currently supports squats and push-ups, with plans to add more exercises in the future.

## Features

- Real-time pose detection using MediaPipe
- Form evaluation for squats and push-ups
- Visual feedback with color-coded body landmarks
- Detailed form correction messages
- Dark theme UI
- Responsive design

## Supported Exercises

### Squats
- Evaluates:
  - Back angle
  - Knee bend depth
  - Knee alignment
  - Weight distribution
  - Hip-knee-ankle alignment

### Push-ups
- Evaluates:
  - Elbow angle
  - Back alignment
  - Head position
  - Shoulder stability

## Technologies Used

- React
- MediaPipe Pose Landmarker
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm
- Webcam access

### Installation

1. Clone the repository:
```bash
git clone https://exercise-evaluator-murex.vercel.app/
cd exercise-evaluation-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Allow camera access when prompted
2. Select an exercise (Squats or Push-ups)
3. Follow the positioning instructions
4. Start the exercise
5. Receive real-time feedback on your form

## Feedback System

The app provides visual feedback through:
- Color-coded body landmarks (green for correct, red/orange/yellow for issues)
- Text messages indicating specific form corrections
- Severity levels for different issues (high, medium, low)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- MediaPipe for the pose detection technology
