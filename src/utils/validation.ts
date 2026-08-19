const USER_ID_MAX_BYTES = 255;
const TAGS_MAX_BYTES = 4096;
const TAG_PATTERN = /^[\p{L}\p{N}_-]+$/u;

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

/**
 * Logs a console error when a tag is not letters/digits in any script (plus `_`
 * and `-`) or when the list overflows the 4 KB budget, counted as UTF-8 bytes —
 * a Cyrillic char costs 2 bytes. Invalid tags are never sent to native.
 */
export function tagsAreValid(tags: string[]): boolean {
  let valid = true;
  let bytes = 0;
  for (const tag of tags) {
    if (!TAG_PATTERN.test(tag)) {
      console.error(
        `InAppStory: tag "${tag}" is invalid, only letters, digits, underscores and dashes are allowed`
      );
      valid = false;
    }
    bytes += byteLength(tag) + 1;
  }
  if (bytes > TAGS_MAX_BYTES) {
    console.error(
      `InAppStory: tags must be at most ${TAGS_MAX_BYTES} bytes in total, got ${bytes}`
    );
    valid = false;
  }
  return valid;
}
