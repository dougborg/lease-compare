import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Line from "./Line";

describe("Line", () => {
  it("renders label and value", () => {
    render(<Line label="Selling Price" value="$57,110" />);
    expect(screen.getByText("Selling Price")).toBeInTheDocument();
    expect(screen.getByText("$57,110")).toBeInTheDocument();
  });

  it("applies indent class when indent is true", () => {
    const { container } = render(<Line label="Sub item" value="$100" indent />);
    expect(container.firstChild).toHaveClass("line--indent");
  });

  it("applies bold weight when bold is true", () => {
    render(<Line label="Total" value="$1,000" bold />);
    const label = screen.getByText("Total");
    expect(label).toHaveStyle({ fontWeight: 700 });
  });

  it("applies custom color to value", () => {
    render(<Line label="Total" value="$1,000" color="#c4a647" />);
    const value = screen.getByText("$1,000");
    expect(value).toHaveStyle({ color: "#c4a647" });
  });

  it("uses default colors when no color provided", () => {
    render(<Line label="Item" value="$100" />);
    const value = screen.getByText("$100");
    expect(value).toHaveStyle({ color: "#bbb" });
  });
});
