/**
 * Simulate a network round-trip in the mock layer.
 * Range matches the handoff spec: 150–400ms.
 */
export function simulateLatency(min = 150, max = 400): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Tiny chance of a synthetic error to mimic flaky network (5%).
 * Disable by default — uncomment to test error states.
 */
export async function maybeFail(probability = 0): Promise<void> {
  await simulateLatency();
  if (probability > 0 && Math.random() < probability) {
    throw new Error("Simulated network error");
  }
}
