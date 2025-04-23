const ExerciseControls = ({ onStartSquats, onStartPushups, onStop, currentExercise, cameraReady }) => {
    return (
      <div className="mt-8 space-y-8">
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={onStartSquats}
            disabled={!cameraReady || currentExercise === 'squats'}
            className={`px-6 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
              currentExercise === 'squats'
                ? 'bg-green-600 text-white shadow-green-500/50'
                : cameraReady
                ? 'bg-gray-800 hover:bg-gray-700 text-white shadow-gray-700/50'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-gray-700/50'
            }`}
          >
            {currentExercise === 'squats' ? '✓ Analyzing Squats' : 'Start Squats'}
          </button>

          <button
            onClick={onStartPushups}
            disabled={!cameraReady || currentExercise === 'pushups'}
            className={`px-6 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 ${
              currentExercise === 'pushups'
                ? 'bg-green-600 text-white shadow-green-500/50'
                : cameraReady
                ? 'bg-gray-800 hover:bg-gray-700 text-white shadow-gray-700/50'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-gray-700/50'
            }`}
          >
            {currentExercise === 'pushups' ? '✓ Analyzing Push-Ups' : 'Start Push-Ups'}
          </button>

          {currentExercise && (
            <button
              onClick={onStop}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-lg shadow-lg shadow-red-500/50 transition-all duration-300 transform hover:scale-105"
            >
              Stop Analysis
            </button>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-inner max-w-2xl mx-auto border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">How to Position Yourself</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-gray-700 rounded-full p-2">
                <span className="text-gray-300 font-bold">1</span>
              </div>
              <p className="text-gray-300">Stand about 2-3 meters away from the camera</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-700 rounded-full p-2">
                <span className="text-gray-300 font-bold">2</span>
              </div>
              <p className="text-gray-300">Position yourself at a 45-degree angle to the camera</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-700 rounded-full p-2">
                <span className="text-gray-300 font-bold">3</span>
              </div>
              <p className="text-gray-300">Ensure good lighting and clear visibility of your full body</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-gray-700 rounded-full p-2">
                <span className="text-gray-300 font-bold">4</span>
              </div>
              <p className="text-gray-300">Keep your entire body within the camera frame</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ExerciseControls;