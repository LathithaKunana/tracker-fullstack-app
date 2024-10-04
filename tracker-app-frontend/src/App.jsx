import React from 'react';
import StepTracker from './components/StepTracker';
import NoiseLevelTracker from './components/NoiseLevelTracker';
import MovementTracker from './components/MovementTracker';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col gap-4 items-center mt-8">
      <StepTracker />
      <NoiseLevelTracker />
      <MovementTracker />
    </div>
  );
};

export default App;
