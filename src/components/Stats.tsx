import { Timer, Zap, Target, Award } from 'lucide-react';

interface StatsProps {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  errors: number;
}

export function Stats({ wpm, accuracy, timeElapsed, errors }: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4 shadow-lg border border-blue-700">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="text-gray-300 text-sm font-semibold">WPM</span>
        </div>
        <div className="text-3xl font-bold text-white">{wpm}</div>
      </div>

      <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-4 shadow-lg border border-green-700">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-green-400" />
          <span className="text-gray-300 text-sm font-semibold">Accuracy</span>
        </div>
        <div className="text-3xl font-bold text-white">{accuracy}%</div>
      </div>

      <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-4 shadow-lg border border-purple-700">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-5 h-5 text-purple-400" />
          <span className="text-gray-300 text-sm font-semibold">Time</span>
        </div>
        <div className="text-3xl font-bold text-white">{timeElapsed}s</div>
      </div>

      <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg p-4 shadow-lg border border-red-700">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-red-400" />
          <span className="text-gray-300 text-sm font-semibold">Errors</span>
        </div>
        <div className="text-3xl font-bold text-white">{errors}</div>
      </div>
    </div>
  );
}
