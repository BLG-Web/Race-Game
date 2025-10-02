import { useEffect, useRef } from 'react';
import { Car } from 'lucide-react';

interface RaceTrackProps {
  progress: number;
  opponentProgress?: number;
}

export function RaceTrack({ progress, opponentProgress = 0 }: RaceTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trackRef.current) {
      const track = trackRef.current;
      const lines = track.querySelectorAll('.road-line');

      const animate = () => {
        lines.forEach((line, index) => {
          const element = line as HTMLElement;
          const currentLeft = parseFloat(element.style.left || '0');
          const newLeft = currentLeft - 5;

          if (newLeft < -100) {
            element.style.left = `${100 + (index * 25)}%`;
          } else {
            element.style.left = `${newLeft}%`;
          }
        });

        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationId);
    }
  }, []);

  return (
    <div className="relative w-full h-64 bg-gradient-to-b from-gray-700 to-gray-800 overflow-hidden rounded-lg border-4 border-gray-900 shadow-2xl">
      <div ref={trackRef} className="absolute inset-0">
        {[0, 25, 50, 75, 100].map((position, index) => (
          <div
            key={index}
            className="road-line absolute top-1/2 w-16 h-1 bg-yellow-400"
            style={{ left: `${position}%`, transform: 'translateY(-50%)' }}
          />
        ))}
      </div>

      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-green-900 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-950 to-transparent" />

      <div
        className="absolute top-[25%] transition-all duration-200 ease-linear"
        style={{ left: `${Math.min(progress, 95)}%` }}
      >
        <div className="relative">
          <Car className="w-12 h-12 text-blue-500 drop-shadow-lg" fill="currentColor" />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-black/30 rounded-full blur-sm" />
        </div>
      </div>

      {opponentProgress > 0 && (
        <div
          className="absolute top-[60%] transition-all duration-200 ease-linear"
          style={{ left: `${Math.min(opponentProgress, 95)}%` }}
        >
          <div className="relative">
            <Car className="w-12 h-12 text-red-500 drop-shadow-lg" fill="currentColor" />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-black/30 rounded-full blur-sm" />
          </div>
        </div>
      )}

      <div className="absolute top-2 right-2 bg-black/50 px-3 py-1 rounded text-white text-sm font-bold">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
