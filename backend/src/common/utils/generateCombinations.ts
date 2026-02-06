export function generateCombinations(
  attributes: { name: string; values: string[] }[],
) {
  if (!attributes.length) return [[]];

  return attributes.reduce<string[][]>(
    (acc, attr) =>
      acc.flatMap((prev) =>
        attr.values.map((v) => [...prev, `${attr.name}:${v}`]),
      ),
    [[]],
  );
}
