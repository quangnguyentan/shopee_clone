const mockCases = [
  { promotedTo: [] },
  { promotedTo: null },
  { promotedTo: undefined },
  { promotedTo: [{ value: null }] },
  { promotedTo: [{ value: "" }, { value: "" }] },
  { promotedTo: [{ value: "Manager" }] },
  { promotedTo: [{ value: "Manager" }, { value: "Lead" }] },
];

mockCases.forEach((c, i) => {
  const values = Array.isArray(c.promotedTo)
    ? c.promotedTo.map((x) => x?.value).filter((v) => v)
    : [];

  console.log(`Case ${i + 1}:`, values.join(", "));
});
