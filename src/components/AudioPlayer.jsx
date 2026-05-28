import { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ audioUrl, isSent }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
    }
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      const progressPercent = (currentTime / duration) * 100;
      setProgress(progressPercent);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateWaveformBars = () => {
    const bars = [];
    const barCount = 40;
    for (let i = 0; i < barCount; i++) {
      const height = Math.random() * 12 + 4;
      bars.push(
        <div
          key={i}
          className={`w-0.5 rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            height: `${height}px`,
            backgroundColor: isSent ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 92, 75, 0.9)',
            opacity: isPlaying ? 0.9 : 0.6,
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className={`flex items-center gap-1.5 ${isSent ? 'bg-white/10' : 'bg-gray-100'} rounded-lg p-1.5`}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />

      <button
        onClick={togglePlay}
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
          isSent ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-200 hover:bg-gray-300'
        }`}
      >
        {isPlaying ? (
          <span className={`material-symbols-outlined text-sm ${isSent ? 'text-white' : 'text-gray-600'}`}>
            pause
          </span>
        ) : (
          <span className={`material-symbols-outlined text-sm ${isSent ? 'text-white' : 'text-gray-600'}`}>
            play_arrow
          </span>
        )}
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-0.25 h-4">
          {generateWaveformBars()}
        </div>
        <div className="mt-0.25 flex items-center gap-0.5">
          <div className={`flex-1 h-0.5 rounded-full ${isSent ? 'bg-white/20' : 'bg-gray-300'}`}>
            <div
              className={`h-full rounded-full transition-all duration-100 ${
                isSent ? 'bg-white' : 'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className={`text-[9px] ${isSent ? 'text-white/80' : 'text-gray-600'}`}>
            {formatTime(audioRef.current?.currentTime || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
