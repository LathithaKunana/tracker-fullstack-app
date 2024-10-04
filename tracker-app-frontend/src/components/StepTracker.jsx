import React, { useState, useEffect } from 'react';

const StepTracker = () => {
  const [stepCount, setStepCount] = useState(() => {
    const savedSteps = localStorage.getItem('stepCount');
    return savedSteps ? parseInt(savedSteps) : 0;
  });
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  let lastAcceleration = { x: 0, y: 0, z: 0 };
  let stepThreshold = 1.2; // Lower threshold to increase sensitivity

  useEffect(() => {
    const handleMotionEvent = (event) => {
      const acceleration = event.accelerationIncludingGravity;
      if (acceleration) {
        const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
        const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
        const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);

        if (deltaX + deltaY + deltaZ > stepThreshold) {
          setStepCount((prevCount) => {
            const newCount = prevCount + 1;
            localStorage.setItem('stepCount', newCount);
            return newCount;
          });
        }

        lastAcceleration = {
          x: acceleration.x,
          y: acceleration.y,
          z: acceleration.z,
        };
      }
    };

    const checkDeviceMotionSupport = () => {
      if (typeof DeviceMotionEvent === 'undefined') {
        setError('DeviceMotion not supported on this device or browser.');
        return;
      }
      if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
        // For iOS devices, request permission
        DeviceMotionEvent.requestPermission()
          .then((response) => {
            if (response === 'granted') {
              window.addEventListener('devicemotion', handleMotionEvent);
            }
          })
          .catch((err) => setError('Permission denied: ' + err.message));
      } else {
        window.addEventListener('devicemotion', handleMotionEvent);
      }
    };

    if (isTracking) {
      checkDeviceMotionSupport();
    } else {
      window.removeEventListener('devicemotion', handleMotionEvent);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotionEvent);
    };
  }, [isTracking]);

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
          Step Tracker
        </h2>
        {error ? (
          <p className="text-red-500 text-center mb-4">{error}</p>
        ) : (
          <>
            <p className="text-center text-lg font-medium text-gray-700 mb-6">
              Step Count: <span className="text-indigo-600">{stepCount}</span>
            </p>
            <button
              onClick={toggleTracking}
              className={`w-full py-2 px-4 text-white rounded-lg text-lg font-semibold transition-colors ${
                isTracking
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-indigo-500 hover:bg-indigo-600'
              }`}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StepTracker;
