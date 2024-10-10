import React, { useState, useEffect } from "react";

const TotalMovementTracker = () => {
  const [totalMovement, setTotalMovement] = useState(0);

  const calculateTotalMovement = () => {
    const stepCount = parseInt(localStorage.getItem("stepCount")) || 0;
    const movementCount = parseInt(localStorage.getItem("movementCount")) || 0;
    const highestNoiseLevel = parseInt(localStorage.getItem("highestNoiseLevel")) || 0;
    const detectionCount = parseInt(localStorage.getItem("detectionCount")) || 0;
    
    const total = stepCount + movementCount + highestNoiseLevel + detectionCount;
    setTotalMovement(total);
  };

  useEffect(() => {
    calculateTotalMovement();

    window.addEventListener("storage", calculateTotalMovement);

    return () => {
      window.removeEventListener("storage", calculateTotalMovement);
    };
  }, []);

  const resetTotalMovement = () => {
    localStorage.setItem("stepCount", 0);
    localStorage.setItem("movementCount", 0);
    localStorage.setItem("highestNoiseLevel", 0);
    localStorage.setItem("detectionCount", 0);
    setTotalMovement(0);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        Total Activity Tracker
      </h2>
      <p className="text-center text-lg font-medium text-gray-700 mb-6">
        Total Movement: <span className="text-indigo-600">{totalMovement}</span>
      </p>
      
        <button
          onClick={calculateTotalMovement}
          className="mt-4 w-full py-2 px-4 bg-gray-500 hover:bg-gray-700 text-white rounded-lg text-lg font-semibold"
        >
          Update Total Movement
        </button>
        <button
          onClick={resetTotalMovement}
          className="mt-4 w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-950 text-white rounded-lg text-lg font-semibold"
        >
          Reset Total Movement
        </button>
     
    </div>
  );
};

export default TotalMovementTracker;
