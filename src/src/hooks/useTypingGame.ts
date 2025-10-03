import { useState, useEffect, useCallback } from 'react';
import { getRandomText } from '../data/texts';

export function useTypingGame() {
  const [text, setText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [isRaceComplete, setIsRaceComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  useEffect(() => {
    setText(getRandomText());
  }, []);

  useEffect(() => {
    let interval: number;

    if (isRaceActive && startTime) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeElapsed(elapsed);

        const wordsTyped = currentIndex / 5;
        const minutes = elapsed / 60;
        const currentWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
        setWpm(currentWpm);

        const totalAttempts = currentIndex + errors;
        const currentAccuracy = totalAttempts > 0 ? Math.round((currentIndex / totalAttempts) * 100) : 100;
        setAccuracy(currentAccuracy);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRaceActive, startTime, currentIndex, errors]);

  const handleKeyPress = useCallback((key: string) => {
    if (!isRaceActive || isRaceComplete) return;

    if (key === text[currentIndex]) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      if (newIndex === text.length) {
        setIsRaceActive(false);
        setIsRaceComplete(true);
      }
    } else {
      setErrors(prev => prev + 1);
    }
  }, [isRaceActive, isRaceComplete, text, currentIndex]);

  const startRace = useCallback(() => {
    setIsRaceActive(true);
    setIsRaceComplete(false);
    setStartTime(Date.now());
    setCurrentIndex(0);
    setErrors(0);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
  }, []);

  const restartRace = useCallback(() => {
    setText(getRandomText());
    setIsRaceActive(false);
    setIsRaceComplete(false);
    setStartTime(null);
    setCurrentIndex(0);
    setErrors(0);
    setTimeElapsed(0);
    setWpm(0);
    setAccuracy(100);
  }, []);

  const progress = text.length > 0 ? (currentIndex / text.length) * 100 : 0;

  return {
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
  };
}
