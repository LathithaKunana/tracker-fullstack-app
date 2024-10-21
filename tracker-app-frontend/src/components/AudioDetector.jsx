import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaPlay, FaPause, FaTrash } from 'react-icons/fa';

const AudioDetector = ({ startTracking }) => {
    const [songInfo, setSongInfo] = useState(null);
    const [status, setStatus] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [timer, setTimer] = useState(120);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [tracklistVisible, setTracklistVisible] = useState(false);
    const [currentSongActivity, setCurrentSongActivity] = useState(0);

    const [tracklist, setTracklist] = useState(() => {
        return JSON.parse(localStorage.getItem('tracklist')) || [];
    });

    const [detectionCount, setDetectionCount] = useState(() => {
        return parseInt(localStorage.getItem("detectionCount")) || 0;
    });

    const lastActivitySnapshot = useRef(0);

    useEffect(() => {
        if (startTracking) {
            handleAudioDetection()
          // Start step tracking logic here
          console.log("Step tracking started");
        }
      }, [startTracking]);

    const handleAudioDetection = async () => {
        setStatus('Requesting microphone access...');
        setIsDetecting(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStatus('Recording audio...');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('sample', blob, 'sample.wav');
                
                const arrayBuffer = await blob.arrayBuffer();
                formData.append('sample_bytes', arrayBuffer.byteLength.toString());

                try {
                    const response = await axios.post('https://tracker-fullstack-app.vercel.app/api/identify', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (response.data.status.code === 0 && response.data.metadata.music?.length > 0) {
                        const detectedSong = response.data.metadata.music[0];
                        
                        // If there's a previous song, save its activity to the tracklist
                        if (songInfo) {
                            const updatedTracklist = [...tracklist, {...songInfo, activityTotal: currentSongActivity}];
                            setTracklist(updatedTracklist);
                            localStorage.setItem('tracklist', JSON.stringify(updatedTracklist));
                        }
                        
                        setSongInfo(detectedSong);
                        setStatus('');
                        
                        const newDetectionCount = detectionCount + 1;
                        setDetectionCount(newDetectionCount);
                        localStorage.setItem("detectionCount", newDetectionCount);

                        // Reset the current song activity for the new song
                        setCurrentSongActivity(0);
                        setTimer(120);
                        setIsTimerRunning(true);

                        // Take a snapshot of the current total activity
                        lastActivitySnapshot.current = getTotalActivityFromComponents();

                    } else {
                        setStatus('No song detected');
                    }
                } catch (error) {
                    setStatus('Error detecting song: ' + (error.response?.data?.status?.msg || error.message));
                } finally {
                    setIsDetecting(false);
                }
            };

            recorder.start();
            setTimeout(() => {
                recorder.stop();
                source.disconnect();
                audioContext.close();
                stream.getTracks().forEach(track => track.stop());
            }, 10000);

        } catch (error) {
            setStatus('Microphone access denied or detection failed.');
            setIsDetecting(false);
        }
    };

    const getTotalActivityFromComponents = () => {
        const stepCount = parseInt(localStorage.getItem("stepCount")) || 0;
        const movementCount = parseInt(localStorage.getItem("movementCount")) || 0;
        const highestNoiseLevel = parseInt(localStorage.getItem("highestNoiseLevel")) || 0;
        const currentDetectionCount = parseInt(localStorage.getItem("detectionCount")) || 0;

        return stepCount + movementCount + highestNoiseLevel + currentDetectionCount;
    };

    useEffect(() => {
        if (isTimerRunning && timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
                
                const currentTotalActivity = getTotalActivityFromComponents();
                const activityDelta = currentTotalActivity - lastActivitySnapshot.current;
                setCurrentSongActivity((prev) => prev + activityDelta);
                lastActivitySnapshot.current = currentTotalActivity;

                if (timer - 1 === 0) {
                    handleAudioDetection();
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isTimerRunning, timer]);

    const toggleTimer = () => {
        setIsTimerRunning((prev) => !prev);
    };

    const deleteSong = (index) => {
        const updatedTracklist = tracklist.filter((_, i) => i !== index);
        setTracklist(updatedTracklist);
        localStorage.setItem('tracklist', JSON.stringify(updatedTracklist));
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                Audio Detector
            </h2>
            {status && (
                <p className="text-center text-lg font-medium text-gray-700 mb-6 animate-pulse">
                    {status}
                </p>
            )}
            <div className="text-center mb-4 flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-700 mr-4">Timer: {timer}s</span>
                {isTimerRunning ? (
                    <FaPause onClick={toggleTimer} className="text-gray-600 cursor-pointer" />
                ) : (
                    <FaPlay onClick={toggleTimer} className="text-gray-600 cursor-pointer" />
                )}
            </div>
            {songInfo && (
                <div className="bg-gray-100 p-4 rounded-lg shadow-inner text-gray-800 mb-6">
                    <h3 className="text-lg font-semibold text-center">
                        {songInfo.title || 'Unknown Title'}
                    </h3>
                    <p className="text-center text-gray-600">
                        {songInfo.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}
                    </p>
                    <p className="text-center text-gray-600">
                        Album: {songInfo.album?.name || 'Unknown Album'}
                    </p>
                    <img 
                        src="/api/placeholder/320/320"
                        alt="Album Cover" 
                        className="w-32 h-32 mx-auto rounded-md my-2 bg-gray-200" 
                    />
                    <p className="text-center mt-4 text-lg font-semibold text-indigo-600">
                        Current Song Activity: {currentSongActivity}
                    </p>
                </div>
            )}
            <p className="text-center text-lg font-semibold text-indigo-600 mb-6 cursor-pointer" onClick={() => setTracklistVisible(!tracklistVisible)}>
                Successful Detections: {detectionCount}
            </p>
            {tracklistVisible && (
                <div className="bg-gray-200 rounded-lg shadow-inner mb-4 p-4 max-h-60 overflow-y-auto">
                    <ul>
                        {tracklist.map((song, index) => (
                            <li key={index} className="border-b border-gray-300 py-2 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{song.title || 'Unknown Title'}</p>
                                    <p className="text-gray-600">{song.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist'}</p>
                                    <p className="text-indigo-600">Total Activity: {song.activityTotal}</p>
                                </div>
                                <FaTrash 
                                    className="text-red-500 cursor-pointer" 
                                    onClick={() => deleteSong(index)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <button
                onClick={handleAudioDetection}
                className={`w-full py-2 px-4 text-white rounded-lg text-lg font-semibold ${isDetecting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-700'}`}
                disabled={isDetecting}
            >
                {isDetecting ? 'Detecting...' : 'Detect Audio'}
            </button>
            <button
                onClick={() => {
                    if (songInfo) {
                        const updatedTracklist = [...tracklist, {...songInfo, activityTotal: currentSongActivity}];
                        setTracklist(updatedTracklist);
                        localStorage.setItem('tracklist', JSON.stringify(updatedTracklist));
                    }
                    setSongInfo(null);
                    setCurrentSongActivity(0);
                    setTimer(120);
                    lastActivitySnapshot.current = getTotalActivityFromComponents();
                }}
                className="mt-4 w-full py-2 px-4 bg-neutral-800 hover:bg-neutral-950 text-white rounded-lg text-lg font-semibold"
            >
                Reset
            </button>
        </div>
    );
};

export default AudioDetector;