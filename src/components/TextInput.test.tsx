import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TextInput from "./TextInput";

describe("TextInput", () => {
  it("renders value", () => {
    render(<TextInput value="Test Name" onChange={() => {}} />);
    expect(screen.getByDisplayValue("Test Name")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<TextInput label="Name" value="Test" onChange={() => {}} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("omits label when not provided", () => {
    const { container } = render(
      <TextInput value="Test" onChange={() => {}} />,
    );
    expect(container.querySelector(".field-label")).not.toBeInTheDocument();
  });

  it("calls onChange with string value", () => {
    const onChange = vi.fn();
    render(<TextInput value="old" onChange={onChange} />);
    const input = screen.getByDisplayValue("old");
    fireEvent.change(input, { target: { value: "new" } });
    expect(onChange).toHaveBeenCalledWith("new");
  });
});
