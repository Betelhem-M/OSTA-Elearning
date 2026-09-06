// Standard US-style letter grade scale, based on percentage of max points.
// Centralized here so every page (student feedback, instructor grading,
// analytics, etc.) shows the same letter for the same percentage.
const SCALE = [
  { min: 97, letter: "A+" },
  { min: 93, letter: "A" },
  { min: 90, letter: "A-" },
  { min: 87, letter: "B+" },
  { min: 83, letter: "B" },
  { min: 80, letter: "B-" },
  { min: 77, letter: "C+" },
  { min: 73, letter: "C" },
  { min: 70, letter: "C-" },
  { min: 67, letter: "D+" },
  { min: 63, letter: "D" },
  { min: 60, letter: "D-" },
  { min: 0, letter: "F" },
];

/**
 * Returns a letter grade (e.g. "A", "B+", "F") for a score out of maxScore.
 * Returns null when score/maxScore aren't usable numbers yet (e.g. ungraded),
 * so callers can decide how to render "no grade yet" themselves.
 */
export function getLetterGrade(score, maxScore) {
  const numericScore = Number(score);
  const numericMax = Number(maxScore);

  if (
    !Number.isFinite(numericScore) ||
    !Number.isFinite(numericMax) ||
    numericMax <= 0
  ) {
    return null;
  }

  const pct = (numericScore / numericMax) * 100;
  const clamped = Math.max(0, Math.min(100, pct));
  const match = SCALE.find((row) => clamped >= row.min);
  return match ? match.letter : "F";
}