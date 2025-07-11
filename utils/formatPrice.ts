export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    useGrouping: true,
  }).format(value);
}
