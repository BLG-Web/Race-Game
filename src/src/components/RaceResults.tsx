import { Trophy, Medal } from 'lucide-react';
import { RaceParticipant, Ship } from '../lib/supabase';

interface RaceResultsProps {
  participants: (RaceParticipant & { ships: Ship })[];
  onNewRace: () => void;
}

export function RaceResults({ participants, onNewRace }: RaceResultsProps) {
  const sortedParticipants = [...participants].sort((a, b) => {
    if (a.progress !== b.progress) {
      return b.progress - a.progress;
    }
    return (b.wpm || 0) - (a.wpm || 0);
  });

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return 'text-yellow-400';
      case 1:
        return 'text-gray-300';
      case 2:
        return 'text-orange-600';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border-2 border-yellow-500 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-3 animate-bounce" />
          <h2 className="text-4xl font-bold text-white mb-2">Race Selesai!</h2>
          <p className="text-cyan-300 text-lg">Hasil Akhir</p>
        </div>

        <div className="space-y-3 mb-8">
          {sortedParticipants.map((participant, index) => (
            <div
              key={participant.id}
              className={`bg-white/10 backdrop-blur-lg rounded-lg p-4 border-2 ${
                index === 0
                  ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                  : 'border-white/20'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getMedalColor(index)}`}>
                  {index === 0 ? (
                    <Trophy className="w-12 h-12" />
                  ) : (
                    <Medal className="w-12 h-12" />
                  )}
                </div>

                <div className="flex-shrink-0">
                  {participant.ships?.image_url && (
                    <img
                      src={participant.ships.image_url}
                      alt={participant.ships.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">{participant.user_id}</h3>
                  <p className="text-cyan-300 text-sm">{participant.ships?.name}</p>
                </div>

                <div className="text-right">
                  <div className="text-white font-bold text-2xl">{participant.wpm} WPM</div>
                  <div className="text-green-400 text-sm">{participant.progress}% Complete</div>
                  <div className="text-cyan-300 text-sm">{participant.accuracy}% Accuracy</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onNewRace}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Race Baru
        </button>
      </div>
    </div>
  );
}
