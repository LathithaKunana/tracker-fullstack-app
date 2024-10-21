import React, { useState } from "react";
import MovementTracker from "./components/MovementTracker";
import NoiseLevelTracker from "./components/NoiseLevelTracker";
import StepTracker from "./components/StepTracker";
import TotalMovementTracker from "./components/TotalMovementTracker";
import AudioDetector from "./components/AudioDetector";

const App = () => {
  // State to track if all trackers should start
  const [startAll, setStartAll] = useState(false);

  // Function to handle global start
  const handleStartAll = () => {
    setStartAll(true);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
        Tracker
      </h1>

      {/* Global Start Button */}
      <div className="text-center mb-4">
        <button
          onClick={handleStartAll}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded"
        >
          Start All Trackers
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <StepTracker startTracking={startAll} />
        <NoiseLevelTracker startTracking={startAll} />
        <MovementTracker startTracking={startAll} />
        <AudioDetector startTracking={startAll} />
        <TotalMovementTracker startTracking={startAll} />
      </div>
    </div>
  );
};

export default App;
