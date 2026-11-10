export const ORGANIZATION_CATEGORIES = [
  'president',
  'vice-president',
  'secretary-general',
  'contact-person',
  'central-committee',
  'executive-committee',
] as const;

export type OrganizationCategory = (typeof ORGANIZATION_CATEGORIES)[number];
