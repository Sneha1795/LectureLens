import React from "react";

/**
 * Parses LLM output summaries and formats them into React elements.
 * Handles headings (SUMMARY, KEY TAKEAWAYS, KEY TERMS), list items starting with -, *, or numbers,
 * and splits term-definition key-value combinations using : or - (with bold styling).
 * 
 * @param {string} text Raw markdown/text summary from LLM
 * @returns {Array|null} Array of React elements or null if empty
 */
export const parseSummaryToReact = (text) => {
  if (!text || typeof text !== "string") return null;

  const lines = text.split("\n");
  const renderedElements = [];
  let currentList = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ul key={`list-${listKey++}`} style={{ paddingLeft: 20, margin: "8px 0 16px 0", fontSize: 13, lineHeight: 1.6, listStyleType: "disc" }}>
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect headings (e.g. ## Summary, SUMMARY:, **SUMMARY**, or raw headers)
    const cleanLine = line.replace(/[#*:\[\]]/g, "").trim().toLowerCase();
    const isHeader =
      line.startsWith("#") ||
      line.endsWith(":") ||
      (line.startsWith("**") && line.endsWith("**")) ||
      ["summary", "key takeaways", "key terms", "takeaways", "terms"].includes(cleanLine);

    // Filter out list items or numbered items from matching as headers
    const isListItem = line.startsWith("-") || line.startsWith("*") || /^\d+\./.test(line);

    if (isHeader && !isListItem) {
      flushList();
      let displayText = line.replace(/[#*:]/g, "").trim();

      // Normalize display texts for consistency
      const lowerDisplay = displayText.toLowerCase();
      if (lowerDisplay === "summary") displayText = "Summary";
      else if (lowerDisplay === "key takeaways" || lowerDisplay === "takeaways") displayText = "Key Takeaways";
      else if (lowerDisplay === "key terms" || lowerDisplay === "terms") displayText = "Key Terms";

      renderedElements.push(
        <h4 key={`header-${i}`} style={{ fontSize: 14, fontWeight: 700, marginTop: 18, marginBottom: 8, color: "#111", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {displayText}
        </h4>
      );
    } else if (isListItem) {
      // Clean up item marker prefix (- or * or 1.)
      let content = line.replace(/^[-*\d.]+\s*/, "").trim();

      // Detect term-definition separations via : or - (with spaces)
      let separatorIndex = content.indexOf(":");
      let delimiterLength = 1;

      if (separatorIndex === -1) {
        const dashIndex = content.indexOf(" - ");
        if (dashIndex !== -1) {
          separatorIndex = dashIndex;
          delimiterLength = 3;
        }
      }

      if (separatorIndex !== -1) {
        const term = content.substring(0, separatorIndex).replace(/[\[\]*]/g, "").trim();
        const definition = content.substring(separatorIndex + delimiterLength).trim();

        currentList.push(
          <li key={`item-${i}`} style={{ marginBottom: 6, color: "#333" }}>
            <strong>{term}</strong>: {definition}
          </li>
        );
      } else {
        currentList.push(
          <li key={`item-${i}`} style={{ marginBottom: 6, color: "#333" }}>
            {content}
          </li>
        );
      }
    } else {
      // Standard paragraph content
      flushList();
      renderedElements.push(
        <p key={`p-${i}`} style={{ margin: "8px 0 12px 0", fontSize: 13, color: "#444", lineHeight: 1.6 }}>
          {line}
        </p>
      );
    }
  }

  flushList();
  return renderedElements;
};
