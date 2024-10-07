import React from 'react';
import MovementTracker from './components/MovementTracker';
import NoiseLevelTracker from './components/NoiseLevelTracker';
import StepTracker from './components/StepTracker';
import TotalMovementTracker from './components/TotalMovementTracker';

const App = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
        Movement and Noise Tracker
      </h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        <NoiseLevelTracker />
        <StepTracker />
        <MovementTracker />
        <TotalMovementTracker />
      </div>
    </div>
  );
};

export default App;
