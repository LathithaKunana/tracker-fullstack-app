import React from 'react';
import StepTracker from './components/StepTracker';
import NoiseLevelTracker from './components/NoiseLevelTracker';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col gap-4 items-center mt-8">
      <StepTracker />
      <NoiseLevelTracker />
    </div>
  );
};

export default App;
