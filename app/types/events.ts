export const EVENTS = ['pushup_60s', 'pullup_max'] as const;
export type Event = (typeof EVENTS)[number];

export const EVENT_LABELS: Record<Event, string> = {
  pushup_60s: 'Push-ups (60s)',
  pullup_max: 'Pull-ups (Max)',
};
