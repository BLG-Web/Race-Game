import { useEffect, useRef } from 'react';

interface TypingAreaProps {
  text: string;
  currentIndex: number;
  onKeyPress: (key: string) => void;
  isRaceActive: boolean;
}

export function TypingArea({ text, currentIndex, onKeyPress, isRaceActive }: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRaceActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRaceActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRaceActive) return;

    if (e.key.length === 1 || e.key === ' ') {
      e.preventDefault();
      onKeyPress(e.key);
    }
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = 'text-2xl font-mono ';

      if (index < currentIndex) {
        className += 'text-green-500';
      } else if (index === currentIndex) {
        className += 'text-white bg-blue-500 animate-pulse';
      } else {
        className += 'text-gray-400';
      }

      return (
        <span key={index} className={className}>
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    });
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg p-6 shadow-xl border-2 border-gray-700">
      <div className="mb-4 leading-relaxed break-words">
        {renderText()}
      </div>

      <input
        ref={inputRef}
        type="text"
        className="w-full bg-gray-800 text-white px-4 py-3 rounded border-2 border-gray-600 focus:border-blue-500 focus:outline-none text-lg font-mono"
        placeholder={isRaceActive ? "Start typing..." : "Click 'Start Race' to begin"}
        disabled={!isRaceActive}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
    </div>
  );
}
