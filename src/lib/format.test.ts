import { describe, expect, it } from "vitest";
import { fmt, pct } from "./format";

describe("fmt", () => {
  it("formats positive numbers with dollar sign", () => {
    expect(fmt(1000)).toBe("$1,000");
    expect(fmt(72110)).toBe("$72,110");
  });

  it("formats negative numbers with minus and dollar sign", () => {
    expect(fmt(-1500)).toBe("-$1,500");
    expect(fmt(-42)).toBe("-$42");
  });

  it("formats zero", () => {
    expect(fmt(0)).toBe("$0");
  });

  it("rounds to whole numbers", () => {
    expect(fmt(1234.56)).toBe("$1,235");
    expect(fmt(1234.4)).toBe("$1,234");
  });

  it("returns $0 for undefined", () => {
    expect(fmt(undefined)).toBe("$0");
  });

  it("returns $0 for null", () => {
    expect(fmt(null)).toBe("$0");
  });

  it("returns $0 for NaN", () => {
    expect(fmt(Number.NaN)).toBe("$0");
  });
});

describe("pct", () => {
  it("formats decimals as percentages", () => {
    expect(pct(0.05)).toBe("5.00%");
    expect(pct(0.1234)).toBe("12.34%");
  });

  it("handles zero", () => {
    expect(pct(0)).toBe("0.00%");
  });

  it("handles values over 100%", () => {
    expect(pct(1.5)).toBe("150.00%");
  });
});
