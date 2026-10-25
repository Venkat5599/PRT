// Port of Motion One's `spring()` easing generator (as bundled in the original header chunk),
// so the header's scroll-in morph uses the exact same keyframes/durations as the original.

type SpringState = { done: boolean; hasReachedTarget: boolean; current: number; target: number };

function springGenerator(
  stiffness: number,
  damping: number,
  from: number,
  to: number,
  mass = 1,
): (t: number) => SpringState {
  const velocity = 0;
  const state: SpringState = { done: false, hasReachedTarget: false, current: from, target: to };
  const delta = to - from;
  const angular = Math.sqrt(stiffness / mass) / 1000;
  const ratio = damping / (2 * Math.sqrt(stiffness * mass));
  const small = Math.abs(delta) < 5;
  const restSpeed = small ? 0.01 : 2;
  const restDistance = small ? 0.005 : 0.5;
  let position: (t: number) => number;
  if (ratio < 1) {
    const damped = angular * Math.sqrt(1 - ratio * ratio);
    position = (t) =>
      to -
      Math.exp(-ratio * angular * t) *
        (((-velocity + ratio * angular * delta) / damped) * Math.sin(damped * t) + delta * Math.cos(damped * t));
  } else {
    position = (t) => to - Math.exp(-angular * t) * (delta + (-velocity + angular * delta) * t);
  }
  const velocityAt = (t: number, current: number) => {
    const prev = Math.max(t - 5, 0);
    const dt = t - prev;
    return dt ? (current - position(prev)) * (1000 / dt) : 0;
  };
  return (t) => {
    state.current = position(t);
    const v = t === 0 ? velocity : velocityAt(t, state.current);
    state.done = Math.abs(v) <= restSpeed && Math.abs(to - state.current) <= restDistance;
    state.hasReachedTarget = (from < to && state.current >= to) || (from > to && state.current <= to);
    return state;
  };
}

export type SpringKeyframes = { keyframes: number[]; duration: number; overshootDuration: number };

export function springKeyframes(stiffness: number, damping: number, from: number, to: number): SpringKeyframes {
  const gen = springGenerator(stiffness, damping, from, to);
  const step = 10;
  let t = step;
  let s = gen(0);
  const keyframes = [s.current];
  let reached: number | undefined;
  while (!s.done && t < 10000) {
    s = gen(t);
    keyframes.push(s.done ? s.target : s.current);
    if (reached === undefined && s.hasReachedTarget) reached = t;
    t += step;
  }
  const end = t - step;
  if (keyframes.length === 1) keyframes.push(s.current);
  return { keyframes, duration: end / 1000, overshootDuration: (reached ?? end) / 1000 };
}
