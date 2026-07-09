import { findActiveSegmentIndex } from "./search";

describe("findActiveSegmentIndex binary search utility", () => {
  const mockTranscript = [
    { start: 0.0, end: 5.5, text: "First segment text." },
    { start: 6.0, end: 12.1, text: "Second segment text." },
    { start: 12.2, end: 20.0, text: "Third segment text." }
  ];

  it("should find the correct segment inside interval bounds", () => {
    expect(findActiveSegmentIndex(mockTranscript, 2.5)).toBe(0);
    expect(findActiveSegmentIndex(mockTranscript, 8.0)).toBe(1);
    expect(findActiveSegmentIndex(mockTranscript, 15.0)).toBe(2);
  });

  it("should match exactly at boundary limits", () => {
    // Exact start checks
    expect(findActiveSegmentIndex(mockTranscript, 0.0)).toBe(0);
    expect(findActiveSegmentIndex(mockTranscript, 6.0)).toBe(1);
    expect(findActiveSegmentIndex(mockTranscript, 12.2)).toBe(2); // boundary edge

    // Exact end checks
    expect(findActiveSegmentIndex(mockTranscript, 5.5)).toBe(0);
    expect(findActiveSegmentIndex(mockTranscript, 12.2)).toBe(2); // Since segment 2 starts exactly at 12.2, it takes precedence
    expect(findActiveSegmentIndex(mockTranscript, 20.0)).toBe(2);
  });

  it("should return -1 when time falls in gaps between segments", () => {
    expect(findActiveSegmentIndex(mockTranscript, 5.8)).toBe(-1);
  });

  it("should return -1 for out of bounds values", () => {
    expect(findActiveSegmentIndex(mockTranscript, -10.0)).toBe(-1);
    expect(findActiveSegmentIndex(mockTranscript, 25.5)).toBe(-1);
  });

  it("should handle empty or malformed inputs gracefully", () => {
    expect(findActiveSegmentIndex([], 5.0)).toBe(-1);
    expect(findActiveSegmentIndex(null, 5.0)).toBe(-1);
    expect(findActiveSegmentIndex(undefined, 5.0)).toBe(-1);
  });
});
