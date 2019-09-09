export function createCorrelationId(): string {
  return (
    "c-" +
    Math.random()
      .toString(36)
      .substr(2, 16)
  );
}
