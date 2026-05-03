/**
 * GENERATE SHORT REF (4-Char)
 * Optimized for the PrintLayoutItem boxes.
 * Example outputs: "7x2a", "m9p4", "k1s2"
 */
export const generateJobRef = (): string => {
  return Math.random().toString(36).substring(2, 6).toLowerCase();
};
