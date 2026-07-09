import { escapeRegExp } from "./regex";

describe("escapeRegExp utility", () => {
  it("should escape special RegExp characters", () => {
    expect(escapeRegExp("hello.world")).toBe("hello\\.world");
    expect(escapeRegExp("hello*world")).toBe("hello\\*world");
    expect(escapeRegExp("hello+world")).toBe("hello\\+world");
    expect(escapeRegExp("hello?world")).toBe("hello\\?world");
    expect(escapeRegExp("(hello|world)")).toBe("\\(hello\\|world\\)");
    expect(escapeRegExp("[hello]")).toBe("\\[hello\\]");
    expect(escapeRegExp("{hello}")).toBe("\\{hello\\}");
  });

  it("should leave regular strings unmodified", () => {
    expect(escapeRegExp("hello world")).toBe("hello world");
    expect(escapeRegExp("12345")).toBe("12345");
  });

  it("should handle empty or non-string inputs safely", () => {
    expect(escapeRegExp("")).toBe("");
    expect(escapeRegExp(null)).toBe("");
    expect(escapeRegExp(undefined)).toBe("");
  });
});
