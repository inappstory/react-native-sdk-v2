// Unique random tags, ~4 KB total when joined with commas — stress test for the tags param.
const unique = new Set<string>();
let bytes = 0;
while (bytes < 10096) {
  const tag = Math.random().toString(36).substring(2, 9);
  if (unique.has(tag)) continue;
  unique.add(tag);
  bytes += tag.length + 1;
}

export const TEST_TAGS: string[] = [...unique];
