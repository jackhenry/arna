export function getRandomFloatBounded(min: number, max: number): number {
  return Math.random() * (min - max) + max;
}