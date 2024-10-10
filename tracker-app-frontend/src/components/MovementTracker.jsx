import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import jumpingAnimation from '../assets/JumpingAnimation - 1728058581486.json';
import dancingAnimation from '../assets/DancingAnimation - 1728058814660.json';

const MovementTracker = () => {
  const [movementType, setMovementType] = useState('None');
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTimeout, setAnimationTimeout] = useState(null);
  const [movementCount, setMovementCount] = useState(() => {
    return parseInt(localStorage.getItem('movementCount')) || 0;
  });

  useEffect(() => {
    let isTracking = true;
    const handleMotionEvent = (event) => {
      const { accelerationIncludingGravity } = event;
      setAcceleration({
        x: accelerationIncludingGravity.x || 0,
        y: accelerationIncludingGravity.y || 0,
        z: accelerationIncludingGravity.z || 0,
      });

      detectMovement(accelerationIncludingGravity);
    };

    const startTracking = () => {
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', handleMotionEvent, true);
      } else {
        setError('Device motion is not supported on this device.');
      }
    };

    const stopTracking = () => {
      window.removeEventListener('devicemotion', handleMotionEvent, true);
    };

    const detectMovement = (acceleration) => {
      const { x, y, z } = acceleration;
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

      if (totalAcceleration > 25 && !isAnimating) {
        setMovementType('Jumping');
        setMovementCount(prevCount => {
          const newCount = prevCount + 1;
          localStorage.setItem('movementCount', newCount);
          return newCount;
        });
        startAnimation();
      } else if (totalAcceleration > 15 && totalAcceleration <= 25 && !isAnimating) {
        setMovementType('Dancing');
        setMovementCount(prevCount => {
          const newCount = prevCount + 1;
          localStorage.setItem('movementCount', newCount);
          return newCount;
        });
        startAnimation();
      } else if (!isAnimating) {
        setMovementType('None');
      }
    };

    const startAnimation = () => {
      setIsAnimating(true);
      if (animationTimeout) clearTimeout(animationTimeout);
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setMovementType('None');
      }, 3000);
      setAnimationTimeout(timeout);
    };

    startTracking();

    return () => {
      stopTracking();
      if (animationTimeout) clearTimeout(animationTimeout);
    };
  }, [isAnimating, animationTimeout]);

  const resetTracking = () => {
    setMovementCount(0);
    localStorage.setItem('movementCount', 0);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        Movement Tracker
      </h2>
      {error ? (
        <p className="text-red-500 text-center mb-4">{error}</p>
      ) : (
        <>
          <p className="text-center text-lg font-medium text-gray-700 mb-4">
            Current Movement: <span className="text-indigo-600">{movementType}</span>
          </p>
          <p className="text-center text-lg font-medium text-gray-700 mb-4">
            Movement Count: <span className="text-indigo-600">{movementCount}</span>
          </p>
          <div className="mt-6 flex justify-center">
            {isAnimating && movementType === 'Jumping' && (
              <Lottie animationData={jumpingAnimation} loop={true} className="w-32 h-32" />
            )}
            {isAnimating && movementType === 'Dancing' && (
              <Lottie animationData={dancingAnimation} loop={true} className="w-32 h-32" />
            )}
            {!isAnimating && movementType === 'None' && (
              <p className="text-gray-500">No significant movement detected.</p>
            )}
          </div>
          <button
            onClick={resetTracking}
            className="mt-4 w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-950 text-white rounded-lg text-lg font-semibold"
          >
            Reset Tracking
          </button>
        </>
      )}
    </div>
  );
};

export default MovementTracker;
