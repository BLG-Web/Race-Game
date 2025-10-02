import { Trophy, Zap, Target, Clock, X } from 'lucide-react';

interface ResultsModalProps {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  errors: number;
  onClose: () => void;
  onRestart: () => void;
}

export function ResultsModal({ wpm, accuracy, timeElapsed, errors, onClose, onRestart }: ResultsModalProps) {
  const getRank = (wpm: number): string => {
    if (wpm >= 80) return 'Master';
    if (wpm >= 60) return 'Expert';
    if (wpm >= 40) return 'Advanced';
    if (wpm >= 20) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-yellow-500 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-3 animate-bounce" />
          <h2 className="text-3xl font-bold text-white mb-2">Race Complete!</h2>
          <p className="text-xl text-yellow-400 font-semibold">{getRank(wpm)} Level</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span className="text-gray-300 font-semibold">Speed</span>
            </div>
            <span className="text-2xl font-bold text-white">{wpm} WPM</span>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-green-400" />
              <span className="text-gray-300 font-semibold">Accuracy</span>
            </div>
            <span className="text-2xl font-bold text-white">{accuracy}%</span>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-400" />
              <span className="text-gray-300 font-semibold">Time</span>
            </div>
            <span className="text-2xl font-bold text-white">{timeElapsed}s</span>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700">
            <div className="flex items-center gap-3">
              <X className="w-6 h-6 text-red-400" />
              <span className="text-gray-300 font-semibold">Errors</span>
            </div>
            <span className="text-2xl font-bold text-white">{errors}</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Race Again
        </button>
      </div>
    </div>
  );
}
