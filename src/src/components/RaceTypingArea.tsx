import { useEffect, useRef } from 'react';

interface RaceTypingAreaProps {
  text: string;
  currentIndex: number;
  onKeyPress: (key: string) => void;
  progress: number;
}

export function RaceTypingArea({ text, currentIndex, onKeyPress, progress }: RaceTypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.length === 1 || e.key === ' ') {
      e.preventDefault();
      onKeyPress(e.key);
    }
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-2xl font-mono ';

      if (index < currentIndex) {
        className += 'text-green-400 font-bold';
      } else if (index === currentIndex) {
        className += 'text-white bg-cyan-500 animate-pulse';
      } else {
        className += 'text-gray-300';
      }

      return (
        <span key={index} className={className}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-bold">Progress</span>
          <span className="text-white font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-cyan-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-6 leading-relaxed break-words bg-gray-900/50 p-6 rounded-xl">
        {renderText()}
      </div>

      <input
        ref={inputRef}
        type="text"
        className="w-full bg-white/20 text-white px-4 py-4 rounded-lg border-2 border-cyan-400 focus:border-cyan-300 focus:outline-none text-lg font-mono"
        placeholder="Ketik di sini..."
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
    </div>
  );
}
