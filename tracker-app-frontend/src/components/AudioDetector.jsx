import React, { useState } from 'react';
import axios from 'axios';

const AudioDetector = () => {
    const [songInfo, setSongInfo] = useState(null);
    const [status, setStatus] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);

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
                        setSongInfo(response.data.metadata.music[0]);
                        setStatus('');
                    } else {
                        setStatus('No song detected');
                    }
                } catch (error) {
                    setStatus('Error detecting song: ' + (error.response?.data?.status?.msg || error.message));
                    console.error('Detection Error:', error);
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
            console.error('Error:', error);
            setIsDetecting(false);
        }
    };

    const renderArtists = (artists) => {
        if (!artists) return 'Unknown Artist';
        return artists.map(artist => artist.name).join(', ');
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
            {songInfo && (
                <div className="bg-gray-100 p-4 rounded-lg shadow-inner text-gray-800 mb-6">
                    <h3 className="text-lg font-semibold text-center">
                        {songInfo.title || 'Unknown Title'}
                    </h3>
                    <p className="text-center text-gray-600">
                        {renderArtists(songInfo.artists)}
                    </p>
                    {songInfo.album && (
                        <p className="text-center text-gray-600">
                            Album: {songInfo.album.name || 'Unknown Album'}
                        </p>
                    )}
                    {/* Note: ACRCloud doesn't provide cover images directly */}
                    <img 
                        src="/api/placeholder/320/320"
                        alt="Album Cover" 
                        className="w-32 h-32 mx-auto rounded-md my-2 bg-gray-200" 
                    />
                </div>
            )}
            <div className="flex flex-row gap-2">
                <button
                    onClick={handleAudioDetection}
                    className={`w-full py-2 px-4 text-white rounded-lg text-lg font-semibold ${
                        isDetecting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'
                    }`}
                    disabled={isDetecting}
                >
                    {isDetecting ? 'Detecting...' : 'Detect Audio'}
                </button>
                <button
                    onClick={() => setSongInfo(null)}
                    className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg text-lg font-semibold"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default AudioDetector;