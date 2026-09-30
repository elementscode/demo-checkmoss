export const K_FACTOR = 32;

/** Elo change for white; black's is the negation. score is 1, 0.5 or 0 from white's side. */
export function ratingDelta(whiteRating: number, blackRating: number, score: number): number {
  let expected = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
  return Math.round(K_FACTOR * (score - expected));
}
