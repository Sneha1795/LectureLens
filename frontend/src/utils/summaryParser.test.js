import React from "react";
import { parseSummaryToReact } from "./summaryParser";
import { render } from "@testing-library/react";

describe("parseSummaryToReact summary parser utility", () => {
  it("should handle the standard uppercase prompt format with colons", () => {
    const rawText = `
SUMMARY:
This is a summary paragraph about gravity.

KEY TAKEAWAYS:
- Takeaway 1 description
- Takeaway 2 description

KEY TERMS:
- Gravity: The force that pulls objects toward each other.
- Mass: The amount of matter in an object.
    `;
    const elements = parseSummaryToReact(rawText);
    const { getByText } = render(<div>{elements}</div>);

    expect(getByText("Summary")).toBeInTheDocument();
    expect(getByText("Key Takeaways")).toBeInTheDocument();
    expect(getByText("Key Terms")).toBeInTheDocument();
    expect(getByText("This is a summary paragraph about gravity.")).toBeInTheDocument();
    expect(getByText("Takeaway 1 description")).toBeInTheDocument();
    expect(getByText("Gravity")).toHaveStyle({ fontWeight: "bold" });
    expect(getByText(": The force that pulls objects toward each other.")).toBeInTheDocument();
  });

  it("should handle markdown style headers and asterisks", () => {
    const rawText = `
## Summary
This is a markdown summary.

## Key Takeaways
* Bullet point item one
* Bullet point item two

## Key Terms
* **Velocity** - Rate of change of displacement.
    `;
    const elements = parseSummaryToReact(rawText);
    const { getByText } = render(<div>{elements}</div>);

    expect(getByText("Summary")).toBeInTheDocument();
    expect(getByText("Key Takeaways")).toBeInTheDocument();
    expect(getByText("Key Terms")).toBeInTheDocument();
    expect(getByText("This is a markdown summary.")).toBeInTheDocument();
    expect(getByText("Bullet point item one")).toBeInTheDocument();
    expect(getByText("Velocity")).toHaveStyle({ fontWeight: "bold" });
    expect(getByText(": Rate of change of displacement.")).toBeInTheDocument();
  });

  it("should handle numbered lists and dash term-definition splits", () => {
    const rawText = `
### Summary
Hello world.

### Key Terms
1. Constant - A value that does not change.
2. Variable - A value that can change.
    `;
    const elements = parseSummaryToReact(rawText);
    const { getByText } = render(<div>{elements}</div>);

    expect(getByText("Constant")).toHaveStyle({ fontWeight: "bold" });
    expect(getByText(": A value that does not change.")).toBeInTheDocument();
    expect(getByText("Variable")).toHaveStyle({ fontWeight: "bold" });
    expect(getByText(": A value that can change.")).toBeInTheDocument();
  });

  it("should handle empty or malformed inputs cleanly", () => {
    expect(parseSummaryToReact("")).toBeNull();
    expect(parseSummaryToReact(null)).toBeNull();
    expect(parseSummaryToReact(undefined)).toBeNull();
    expect(parseSummaryToReact(12345)).toBeNull();
  });
});
