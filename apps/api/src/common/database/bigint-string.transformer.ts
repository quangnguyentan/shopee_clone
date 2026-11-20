import { ValueTransformer } from 'typeorm';

export const bigintStringTransformer: ValueTransformer = {
  to: (value: string | null | undefined) => value,
  from: (value: string | number | null) =>
    value === null || value === undefined ? value : String(value),
};
