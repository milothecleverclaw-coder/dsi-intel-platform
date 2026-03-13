"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

interface Highlight {
  start: number;
  end: number;
}

interface VideoPlayerProps {
  videoUrl: string;
  highlights?: Highlight[];
  onTimeClick?: (time: number) => void;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  highlights = [],
  onTimeClick,
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  // const [volume, setVolume] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    if (Hls.isSupported() && videoUrl.includes(".m3u8")) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play();
      });

      return () => {
        hls.destroy();
      };
    } else {
      video.src = videoUrl;
      if (autoPlay) video.play();
    }
  }, [videoUrl, autoPlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    if (onTimeClick) onTimeClick(newTime);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group shadow-lg"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        playsInline
      />

      {/* Highlights Bar */}
      <div className="absolute bottom-12 left-0 right-0 h-1 bg-gray-600/50 flex cursor-pointer group-hover:h-2 transition-all">
        {highlights.map((highlight, idx) => {
          const left = (highlight.start / duration) * 100;
          const width = ((highlight.end - highlight.start) / duration) * 100;
          return (
            <div
              key={idx}
              className="absolute h-full bg-orange-500/70 hover:bg-orange-400 transition-colors z-10"
              style={{ left: `${left}%`, width: `${width}%` }}
              onClick={(e) => {
                e.stopPropagation();
                if (videoRef.current) {
                  videoRef.current.currentTime = highlight.start;
                  if (onTimeClick) onTimeClick(highlight.start);
                }
              }}
              title={`${formatTime(highlight.start)} - ${formatTime(highlight.end)}`}
            />
          );
        })}
        <div
          className="absolute h-full bg-white/30"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
        <div
          className="w-full h-full absolute top-0 left-0"
          onClick={handleTimelineClick}
        />
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4 text-white">
        <button onClick={togglePlay} className="hover:text-orange-400">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <div className="text-xs font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="flex-1" />

        <button onClick={toggleMute} className="hover:text-orange-400">
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <button onClick={toggleFullscreen} className="hover:text-orange-400">
          <Maximize size={20} />
        </button>
      </div>

      {/* Active Highlight Display */}
      {highlights.length > 0 && (
        <div className="absolute top-4 left-4 flex gap-2">
          {highlights.map((h, i) => (
            <div
              key={i}
              className={`px-2 py-1 text-[10px] rounded backdrop-blur-md cursor-pointer transition-colors ${
                currentTime >= h.start && currentTime <= h.end
                  ? "bg-orange-500 text-white"
                  : "bg-black/40 text-gray-300 hover:bg-black/60"
              }`}
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = h.start;
              }}
            >
              {formatTime(h.start)} - {formatTime(h.end)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
