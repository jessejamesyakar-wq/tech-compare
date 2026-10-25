/** Asymmetric blink: fast closure, brief contact, slower reopening. */
export function blinkEnvelope(seconds: number): number {
  const smooth = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
  if (seconds < 0 || seconds >= 0.285) return 0;
  if (seconds < 0.085) return smooth(seconds / 0.085);
  if (seconds < 0.115) return 1;
  return 1 - smooth((seconds - 0.115) / 0.17);
}

export class BlinkTiming {
  private started = -100;
  private next = 3.8;
  private count = 0;
  private previousAttention = 0;
  update(time: number, attention: number, requested = false): number {
    const shifted = Math.abs(attention - this.previousAttention) > 0.85;
    this.previousAttention = attention;
    if ((time >= this.next || requested || shifted) && time - this.started > (requested ? 0.4 : 1.5)) {
      this.started = time;
      this.count++;
      // A low-discrepancy sequence avoids a metronomic repeating blink.
      this.next = time + 3.1 + ((this.count * 0.61803398875) % 1) * 3.5;
    }
    return blinkEnvelope(time - this.started);
  }
  reset() { this.started = -100; this.next = 3.8; this.count = 0; this.previousAttention = 0; }
}

export function idleAttention(seconds: number): [number, number] {
  const cues: [number, number, number][] = [
    [3.6, 0.46, -0.10], [4.9, 0.04, 0.02], [4.1, -0.55, 0.08],
    [6.2, -0.12, -0.04], [3.3, 0.28, 0.15], [5.7, 0, 0],
  ];
  let remaining = Math.max(0, seconds) % 27.8;
  for (const [duration, x, y] of cues) {
    if (remaining < duration) return [x, y];
    remaining -= duration;
  }
  return [0, 0];
}
