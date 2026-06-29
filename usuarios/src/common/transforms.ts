import { Transform } from 'class-transformer';

export const toLowerTrim = Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toLowerCase().trim() : value,
);

export const toLowerSingleSpace = Transform(({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value.toLowerCase().replace(/\s+/g, ' ').trim()
    : value,
);

export const trimOnly = Transform(({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value,
);
