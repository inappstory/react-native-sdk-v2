export function applyPlaceholders(
  text: string,
  placeholders: Record<string, string> | null | undefined
): string {
  if (!placeholders) return text;

  return Object.entries(placeholders).reduce(
    (result, [key, value]) => result.replaceAll(`%${key}%`, String(value)),
    text
  );
}
