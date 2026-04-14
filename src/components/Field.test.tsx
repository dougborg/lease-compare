import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Field from "./Field";

describe("Field", () => {
  it("renders label and value", () => {
    render(<Field label="MSRP" value={72110} onChange={() => {}} />);
    expect(screen.getByText("MSRP")).toBeInTheDocument();
    expect(screen.getByDisplayValue("72110")).toBeInTheDocument();
  });

  it("renders default dollar prefix", () => {
    render(<Field label="Price" value={100} onChange={() => {}} />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("renders custom prefix", () => {
    render(<Field label="Rate" value={5} onChange={() => {}} prefix="%" />);
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("hides prefix when empty string", () => {
    render(<Field label="Term" value={24} onChange={() => {}} prefix="" />);
    expect(screen.queryByText("$")).not.toBeInTheDocument();
  });

  it("renders suffix when provided", () => {
    render(
      <Field
        label="Term"
        value={24}
        onChange={() => {}}
        prefix=""
        suffix="mo"
      />,
    );
    expect(screen.getByText("mo")).toBeInTheDocument();
  });

  it("calls onChange with numeric value", () => {
    const onChange = vi.fn();
    render(<Field label="Price" value={100} onChange={onChange} />);
    const input = screen.getByDisplayValue("100");
    fireEvent.change(input, { target: { value: "200" } });
    expect(onChange).toHaveBeenCalledWith(200);
  });

  it("calls onChange with 0 for non-numeric input", () => {
    const onChange = vi.fn();
    render(<Field label="Price" value={100} onChange={onChange} />);
    const input = screen.getByDisplayValue("100");
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(0);
  });
});
