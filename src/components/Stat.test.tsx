import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Stat from "./Stat";

describe("Stat", () => {
  it("renders label and value", () => {
    render(<Stat label="COST" value="$500" />);
    expect(screen.getByText("COST")).toBeInTheDocument();
    expect(screen.getByText("$500")).toBeInTheDocument();
  });

  it("renders sub text when provided", () => {
    render(<Stat label="COST" value="$500" sub="per month" />);
    expect(screen.getByText("per month")).toBeInTheDocument();
  });

  it("omits sub text when not provided", () => {
    const { container } = render(<Stat label="COST" value="$500" />);
    expect(container.querySelector(".stat-sub")).not.toBeInTheDocument();
  });

  it("applies custom color to value", () => {
    render(<Stat label="COST" value="$500" color="#ff0000" />);
    const value = screen.getByText("$500");
    expect(value).toHaveStyle({ color: "#ff0000" });
  });

  it("defaults to #ddd color", () => {
    render(<Stat label="COST" value="$500" />);
    const value = screen.getByText("$500");
    expect(value).toHaveStyle({ color: "#ddd" });
  });
});
