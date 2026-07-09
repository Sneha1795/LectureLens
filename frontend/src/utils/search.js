/**
 * Finds the index of the transcript segment containing the current player play time.
 * Uses binary search since transcript segments are strictly ordered by start time.
 * Complexity: O(log N)
 * 
 * @param {Array} transcript Array of segment objects { start, end, text }
 * @param {number} currentTime Current play time in seconds
 * @returns {number} The index of the active segment, or -1 if none matches
 */
export function findActiveSegmentIndex(transcript, currentTime) {
  if (!transcript || transcript.length === 0) return -1;

  let low = 0;
  let high = transcript.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const seg = transcript[mid];

    if (currentTime >= seg.start && currentTime <= seg.end) {
      return mid;
    } else if (currentTime < seg.start) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return -1;
}
