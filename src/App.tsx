import { Flag, Trophy } from 'lucide-react';
import { RaceTrack } from './components/OceanLane';
import { TypingArea } from './components/TypingArea';
import { Stats } from './components/RaceTypingArea';
import { ResultsModal } from './components/RaceResults';
import { useTypingGame } from './hooks/useTypingGame';

function App() {
  const {
    text,
    currentIndex,
    errors,
    isRaceActive,
    isRaceComplete,
    timeElapsed,
    wpm,
    accuracy,
    progress,
    handleKeyPress,
    startRace,
    restartRace,
  } = useTypingGame();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="w-12 h-12 text-yellow-400" />
            <h1 className="text-5xl font-bold text-white tracking-tight">
              Type<span className="text-blue-400">Racer</span>
            </h1>
            <Flag className="w-12 h-12 text-green-400" />
          </div>
          <p className="text-gray-300 text-lg">Race to the finish line with your typing speed!</p>
        </header>

        <Stats wpm={wpm} accuracy={accuracy} timeElapsed={timeElapsed} errors={errors} />

        <div className="mb-6">
          <RaceTrack progress={progress} />
        </div>

        <TypingArea
          text={text}
          currentIndex={currentIndex}
          onKeyPress={handleKeyPress}
          isRaceActive={isRaceActive}
        />

        <div className="mt-6 flex justify-center gap-4">
          {!isRaceActive && !isRaceComplete && (
            <button
              onClick={startRace}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-lg"
            >
              <Flag className="w-6 h-6" />
              Start Race
            </button>
          )}

          {isRaceActive && (
            <button
              onClick={restartRace}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
            >
              Restart
            </button>
          )}
        </div>

        {isRaceComplete && (
          <ResultsModal
            wpm={wpm}
            accuracy={accuracy}
            timeElapsed={timeElapsed}
            errors={errors}
            onClose={() => restartRace()}
            onRestart={restartRace}
          />
        )}

        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>Type accurately and quickly to win the race!</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
