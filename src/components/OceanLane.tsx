import { Anchor } from 'lucide-react';
import { RaceParticipant, Ship } from '../lib/supabase';

interface OceanLaneProps {
  laneNumber: number;
  participant?: (RaceParticipant & { ships: Ship }) | null;
  isCurrentUser: boolean;
}

export function OceanLane({ laneNumber, participant, isCurrentUser }: OceanLaneProps) {
  return (
    <div className="relative h-24 bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-blue-500/30 rounded-lg border-2 border-white/20 overflow-hidden">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 px-3 py-1 rounded-full">
        <span className="font-bold text-blue-900">Lane {laneNumber}</span>
      </div>

      {participant ? (
        <>
          <div
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear"
            style={{ left: `${Math.min(participant.progress, 95)}%` }}
          >
            <div className="relative">
              {participant.ships?.image_url ? (
                <div className="relative">
                  <img
                    src={participant.ships.image_url}
                    alt={participant.ships.name}
                    className={`w-16 h-16 object-cover rounded-lg ${
                      isCurrentUser ? 'ring-4 ring-yellow-400' : 'ring-2 ring-white'
                    } shadow-xl`}
                  />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black/70 px-2 py-0.5 rounded text-white text-xs font-bold whitespace-nowrap">
                    {participant.user_id}
                  </div>
                </div>
              ) : (
                <Anchor className={`w-12 h-12 ${isCurrentUser ? 'text-yellow-400' : 'text-white'}`} />
              )}
            </div>
          </div>

          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 px-3 py-2 rounded-lg">
            <div className="text-white text-sm">
              <div className="font-bold">{participant.wpm} WPM</div>
              <div className="text-xs">{participant.progress}%</div>
            </div>
          </div>

          {isCurrentUser && (
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400 animate-pulse" />
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/50 font-semibold">Waiting for player...</span>
        </div>
      )}
    </div>
  );
}
