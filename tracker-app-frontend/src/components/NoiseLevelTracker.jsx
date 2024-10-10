import React, { useState, useEffect } from "react";

const NoiseLevelTracker = () => {
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [highestNoiseLevel, setHighestNoiseLevel] = useState(() => {
    return parseInt(localStorage.getItem("highestNoiseLevel")) || 0;
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    let dataArray;

    const startTracking = async () => {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        microphone.connect(analyser);

        const updateNoiseLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          const avgVolume = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
          setNoiseLevel(avgVolume);

          if (avgVolume > highestNoiseLevel) {
            setHighestNoiseLevel(avgVolume);
            localStorage.setItem("highestNoiseLevel", avgVolume);
          }

          requestAnimationFrame(updateNoiseLevel);
        };

        updateNoiseLevel();
      } catch (err) {
        setError("Microphone access denied or unavailable: " + err.message);
      }
    };

    const stopTracking = () => {
      if (audioContext) {
        audioContext.close();
      }
    };
    if (isTracking) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => {
      stopTracking();
    };
  }, [isTracking, highestNoiseLevel]);

  const resetTracking = () => {
    setHighestNoiseLevel(0);
    localStorage.setItem("highestNoiseLevel", 0);
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
        Noise Level Tracker
      </h2>
      {error ? (
        <p className="text-red-500 text-center mb-4">{error}</p>
      ) : (
        <>
          <p className="text-center text-lg font-medium text-gray-700 mb-4">
            Current Noise Level:{" "}
            <span className="text-indigo-600">{Math.round(noiseLevel)}</span>
          </p>
          <p className="text-center text-lg font-medium text-gray-700 mb-6">
            Highest Noise Level:{" "}
            <span className="text-red-600">
              {Math.round(highestNoiseLevel)}
            </span>
          </p>
          
            <button
              onClick={toggleTracking}
              className={`mt-4 w-full py-2 px-4 text-white rounded-lg text-lg font-semibold transition-colors ${
                isTracking
                  ? "bg-gray-800 hover:bg-gray-950"
                  : "bg-gray-500 hover:bg-gray-700"
              }`}
            >
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </button>
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

export default NoiseLevelTracker;
