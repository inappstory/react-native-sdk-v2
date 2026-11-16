const USER_ID_MAX_BYTES = 255;
const TAGS_MAX_COUNT = 100;
const TAG_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}_-]*$/u;

/** UTF-8 byte length without TextEncoder (not guaranteed on Hermes). */
export function byteLength(value: string): number {
  return encodeURIComponent(value).replace(/%[0-9A-F]{2}/gi, ' ').length;
}

export function assertUserIdLength(userId: string): string {
  const bytes = byteLength(userId);
  if (bytes > USER_ID_MAX_BYTES) {
    throw new Error(
      `userId must be at most ${USER_ID_MAX_BYTES} bytes, got ${bytes}`
    );
  }
  return userId;
}

/** Keeps the first 100 valid tags and logs discarded input. */
export function sanitizeTags(tags: string[]): string[] {
  const validTags = tags.filter((tag) => {
    if (TAG_PATTERN.test(tag)) return true;
    console.error(
      `InAppStory: tag "${tag}" is invalid, only letters, digits, underscores and dashes are allowed`
    );
    return false;
  });
  if (validTags.length > TAGS_MAX_COUNT) {
    console.error(
      `InAppStory: tags must be at most ${TAGS_MAX_COUNT}, got ${validTags.length}`
    );
  }
  return validTags.slice(0, TAGS_MAX_COUNT);
}

/** Request-specific tag overrides still reject invalid input as a whole. */
export function tagsAreValid(tags: string[]): boolean {
  return sanitizeTags(tags).length === tags.length;
}
