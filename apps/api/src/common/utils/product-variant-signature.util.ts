import { createHash } from 'crypto';

export type VariantAttributeSignaturePart = {
  attributeId: string | number;
  valueId?: string | number | null;
  customValue?: string | null;
};

export function createProductVariantSignature(
  parts: VariantAttributeSignaturePart[],
): string {
  const canonical = [...parts]
    .sort((left, right) => {
      const leftId = BigInt(left.attributeId);
      const rightId = BigInt(right.attributeId);
      return leftId < rightId ? -1 : leftId > rightId ? 1 : 0;
    })
    .map((part) => {
      const value =
        part.valueId === null || part.valueId === undefined
          ? `custom:${part.customValue ?? ''}`
          : String(part.valueId);
      return `${part.attributeId}=${value}`;
    })
    .join('|');

  return createHash('md5').update(canonical).digest('hex');
}
