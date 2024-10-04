import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import jumpingAnimation from '../assets/JumpingAnimation - 1728058581486.json'; // Make sure to replace this with the correct path to your Lottie file
import dancingAnimation from '../assets/DancingAnimation - 1728058814660.json'; // Replace this with the correct path to your Lottie file

const MovementTracker = () => {
    const [movementType, setMovementType] = useState('None'); // To track the type of movement
    const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 }); // To store acceleration data
    const [isTracking, setIsTracking] = useState(false); // To control start/stop tracking
    const [error, setError] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false); // To manage animation state
  
    // Helper function to determine movement based on acceleration data
    const detectMovement = (acceleration) => {
      const { x, y, z } = acceleration;
      const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
  
      // Detect jump (based on a high acceleration threshold)
      if (totalAcceleration > 25 && !isAnimating) {
        setMovementType('Jumping');
        startAnimation();
      }
      // Detect dancing (moderate movement for dancing-like behavior)
      else if (totalAcceleration > 15 && totalAcceleration <= 25 && !isAnimating) {
        setMovementType('Dancing');
        startAnimation();
      } else {
        setMovementType('None');
      }
    };
  
    const startAnimation = () => {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setMovementType('None'); // Reset movement type after animation
      }, 10000); // Show the animation for 10 seconds
    };
  
    useEffect(() => {
      const handleMotionEvent = (event) => {
        const { accelerationIncludingGravity } = event;
        setAcceleration({
          x: accelerationIncludingGravity.x || 0,
          y: accelerationIncludingGravity.y || 0,
          z: accelerationIncludingGravity.z || 0,
        });
  
        detectMovement(accelerationIncludingGravity); // Determine movement type
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
  
      if (isTracking) {
        startTracking();
      } else {
        stopTracking();
      }
  
      return () => {
        stopTracking();
      };
    }, [isTracking]);
  
    const toggleTracking = () => {
      setIsTracking(!isTracking);
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
  
              {/* Render Lottie animations based on movement */}
              <div className="mt-6 flex justify-center">
                {isAnimating && movementType === 'Jumping' && (
                  <Lottie animationData={jumpingAnimation} className="w-32 h-32" />
                )}
                {isAnimating && movementType === 'Dancing' && (
                  <Lottie animationData={dancingAnimation} className="w-32 h-32" />
                )}
                {!isAnimating && movementType === 'None' && (
                  <p className="text-gray-500">No significant movement detected.</p>
                )}
              </div>
            </>
          )}
        </div>
     
    );
  };
  
  export default MovementTracker;