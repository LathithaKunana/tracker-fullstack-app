import React, { useState, useEffect } from 'react';

const NoiseLevelTracker = () => {
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [highestNoiseLevel, setHighestNoiseLevel] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    let dataArray;

    const startTracking = async () => {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
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
          }

          requestAnimationFrame(updateNoiseLevel);
        };

        updateNoiseLevel();
      } catch (err) {
        setError('Microphone access denied or unavailable: ' + err.message);
      }
    };

    startTracking();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [highestNoiseLevel]);

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
            Current Noise Level: <span className="text-indigo-600">{Math.round(noiseLevel)}</span>
          </p>
          <p className="text-center text-lg font-medium text-gray-700 mb-6">
            Highest Noise Level: <span className="text-red-600">{Math.round(highestNoiseLevel)}</span>
          </p>
        </>
      )}
    </div>
  );
};

export default NoiseLevelTracker;
