import React, { useState, useEffect } from 'react';
import { getStoredVideos, subscribeStorage, VideoItem } from '../utils/storage';
import { Film } from 'lucide-react';

const VideoCard: React.FC<{ video: VideoItem }> = ({ video }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const rawUrl = video.url.trim();

  // YouTube check
  const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/);

  return (
    <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-lg bg-[#181311]">
      {/* Skeleton / Loading Shimmer Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#261E1A] via-[#1A1412] to-[#2E241E] animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[#8C1D18]/25 border border-[#D8C2A3]/30 flex items-center justify-center mb-3 shadow-inner">
            <Film className="w-6 h-6 text-[#D8C2A3] animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="w-20 h-1.5 bg-[#D8C2A3]/20 rounded-full overflow-hidden">
            <div className="w-full h-full bg-[#D8C2A3]/50 animate-pulse" />
          </div>
        </div>
      )}

      {ytMatch && ytMatch[1] ? (
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}`}
          title="Venue Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full border-0 transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md'
          }`}
        />
      ) : vimeoMatch && vimeoMatch[1] ? (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1`}
          title="Venue Video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full border-0 transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md'
          }`}
        />
      ) : (
        <video
          src={rawUrl}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          onCanPlay={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md'
          }`}
        >
          Your browser does not support playing this video.
        </video>
      )}
    </div>
  );
};

export const VideoShowcase: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>(() => getStoredVideos());

  useEffect(() => {
    const unsub = subscribeStorage(() => {
      setVideos(getStoredVideos());
    });
    return unsub;
  }, []);

  const activeVideos = videos.filter((v) => v.enabled !== false && v.url && v.url.trim().length > 0);

  if (activeVideos.length === 0) {
    return null;
  }

  return (
    <section className="py-6 sm:py-10 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {activeVideos.map((video) => (
            <div
              key={video.id}
              className="w-full max-w-sm sm:max-w-none sm:w-[calc(50%-0.75rem)] md:w-[calc(33.3333%-1rem)] md:max-w-[390px] flex-shrink-0"
            >
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
