export const TIMELINE_LOCALES = ['en', 'sr', 'mk'] as const;

export type TimelineLocale = (typeof TIMELINE_LOCALES)[number];

export type LocalizedTextValue = Record<TimelineLocale, string>;

export function isTimelineLocale(value: string): value is TimelineLocale {
  return TIMELINE_LOCALES.includes(value as TimelineLocale);
}
