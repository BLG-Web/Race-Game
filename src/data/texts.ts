export const racingTexts = [
  "The quick brown fox jumps over the lazy dog near the racing track where speed matters most in every competition.",
  "Racing through the digital highway requires precision typing skills and lightning fast reflexes to reach the finish line first.",
  "Speed demons race across virtual landscapes pushing their limits to achieve maximum velocity and dominate the leaderboard.",
  "Professional racers know that consistency and accuracy are just as important as raw speed when competing at the highest level.",
  "The roar of engines echoes through the stadium as competitors prepare for the ultimate test of speed and skill.",
  "Champions are made through dedication practice and the relentless pursuit of perfection in every single race they enter.",
  "Victory belongs to those who master the balance between speed and precision while maintaining focus under pressure.",
  "The digital racetrack stretches ahead filled with opportunities for glory and the chance to prove your worth.",
];

export function getRandomText(): string {
  return racingTexts[Math.floor(Math.random() * racingTexts.length)];
}
