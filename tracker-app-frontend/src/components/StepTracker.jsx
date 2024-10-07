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

    if (isTracking) {
      window.addEventListener('devicemotion', handleMotionEvent);
    } else {
      window.removeEventListener('devicemotion', handleMotionEvent);
    }

    return () => {
      window.removeEventListener('devicemotion', handleMotionEvent);
    };
  }, [isTracking]);

  const requestPermissions = async () => {
    // Request microphone permission first
    try {
      const microphoneResponse = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (microphoneResponse) {
        console.log("Microphone access granted");
      }
    } catch (err) {
      setError('Microphone permission denied: ' + err.message);
      return;
    }

    // Request motion permission
    if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const motionResponse = await DeviceMotionEvent.requestPermission();
        if (motionResponse === 'granted') {
          setIsTracking(true); // Start tracking if permission granted
        } else {
          setError('Motion permission denied.');
        }
      } catch (err) {
        setError('Error requesting motion permission: ' + err.message);
      }
    } else {
      setIsTracking(true); // Start tracking if no permission request is needed
    }
  };

  const resetTracking = () => {
    setStepCount(0);
    localStorage.setItem('stepCount', 0);
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
          {!isTracking && (
            <button
              onClick={requestPermissions}
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
        </>
      )}
    </div>
  );
};

export default StepTracker;
