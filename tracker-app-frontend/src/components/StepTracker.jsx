import React, { useState, useEffect } from 'react';

const StepTracker = () => {
  const [stepCount, setStepCount] = useState(() => {
    return parseInt(localStorage.getItem('stepCount')) || 0;
  });
  const [error, setError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  let lastAcceleration = { x: 0, y: 0, z: 0 };
  let lastStepTime = 0;
  const stepThreshold = 2.0; // Higher sensitivity for step detection
  const stepCooldown = 500; // Minimum time between steps (500ms)

  useEffect(() => {
    const handleMotionEvent = (event) => {
      const acceleration = event.accelerationIncludingGravity;
      const currentTime = new Date().getTime();

      if (acceleration) {
        const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
        const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
        const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);

        const totalMovement = deltaX + deltaY + deltaZ;

        if (totalMovement > stepThreshold && currentTime - lastStepTime > stepCooldown) {
          setStepCount((prevCount) => {
            const newCount = prevCount + 1;
            localStorage.setItem('stepCount', newCount);
            return newCount;
          });
          lastStepTime = currentTime;
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

  const resetTracking = () => {
    setStepCount(0);
    localStorage.setItem('stepCount', 0);
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
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
          <div className="flex flex-row gap-2">
          {!isTracking && (
            <button
              onClick={toggleTracking}
              className="mt-4 w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-lg font-semibold"
            >
              Allow Access to Sensors
            </button>
          )}
          <button
            onClick={resetTracking}
            className="mt-4 w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg text-lg font-semibold"
          >
            Reset Tracking
          </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StepTracker;
