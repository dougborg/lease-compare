import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

function addScenario() {
  fireEvent.click(screen.getByText("+ Add Dealer Quote"));
}

describe("App", () => {
  it("renders the header", () => {
    render(<App />);
    expect(screen.getByText("Lease Comparison Tool")).toBeInTheDocument();
  });

  it("renders all three tab buttons", () => {
    render(<App />);
    expect(screen.getByText("scenarios")).toBeInTheDocument();
    expect(screen.getByText("compare")).toBeInTheDocument();
    expect(screen.getByText("detail")).toBeInTheDocument();
  });

  it("starts on the scenarios tab with empty state", () => {
    render(<App />);
    expect(screen.getByText("+ Add Dealer Quote")).toBeInTheDocument();
    expect(screen.queryByText("Duplicate")).not.toBeInTheDocument();
  });

  it("adds a new scenario with default values", () => {
    render(<App />);
    addScenario();
    expect(screen.getByDisplayValue("Dealer 1")).toBeInTheDocument();
  });

  it("adds multiple scenarios with incrementing names", () => {
    render(<App />);
    addScenario();
    addScenario();
    expect(screen.getByDisplayValue("Dealer 1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dealer 2")).toBeInTheDocument();
  });

  it("switches to compare tab with empty state", () => {
    render(<App />);
    fireEvent.click(screen.getByText("compare"));
    expect(screen.getByText("Add scenarios to compare")).toBeInTheDocument();
  });

  it("switches to compare tab with data", () => {
    render(<App />);
    addScenario();
    fireEvent.click(screen.getByText("compare"));
    expect(screen.getByText("EFFECTIVE COST/MO")).toBeInTheDocument();
  });

  it("switches to detail tab and shows prompt when scenarios exist", () => {
    render(<App />);
    addScenario();
    fireEvent.click(screen.getByText("detail"));
    expect(
      screen.getByText("Select a scenario above to see detailed breakdown"),
    ).toBeInTheDocument();
  });

  it("duplicates a scenario", () => {
    render(<App />);
    addScenario();
    fireEvent.click(screen.getByText("Duplicate"));
    expect(screen.getByDisplayValue("Dealer 1 (copy)")).toBeInTheDocument();
  });

  it("removes a scenario when more than one exists", () => {
    render(<App />);
    addScenario();
    addScenario();
    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[1]);
    expect(screen.queryByDisplayValue("Dealer 2")).not.toBeInTheDocument();
  });

  it("does not show remove button with only one scenario", () => {
    render(<App />);
    addScenario();
    expect(screen.queryByText("Remove")).not.toBeInTheDocument();
  });

  it("shows comparison data on compare tab", () => {
    render(<App />);
    addScenario();
    fireEvent.click(screen.getByText("compare"));
    expect(screen.getByText("MONTHLY PAYMENT")).toBeInTheDocument();
    expect(screen.getByText("TRUE TOTAL COST")).toBeInTheDocument();
    expect(screen.getByText("IMPLIED APR")).toBeInTheDocument();
    expect(screen.getByText("RESIDUAL")).toBeInTheDocument();
  });

  it("shows detail breakdown when a scenario is selected", () => {
    render(<App />);
    addScenario();
    fireEvent.click(screen.getByText("detail"));
    fireEvent.click(screen.getByText("Dealer 1"));
    expect(screen.getByText("CAP COST BREAKDOWN")).toBeInTheDocument();
    expect(screen.getByText("PAYMENT DECOMPOSITION")).toBeInTheDocument();
    expect(screen.getByText("TOTAL COST OF LEASE")).toBeInTheDocument();
    expect(screen.getByText("DEPRECIATION SHIELD")).toBeInTheDocument();
  });

  it("compare tab shows BEST VALUE badges with multiple scenarios", () => {
    render(<App />);
    addScenario();
    addScenario();
    fireEvent.click(screen.getByText("compare"));
    const badges = screen.getAllByText("BEST VALUE");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it("compare table shows all key metrics", () => {
    render(<App />);
    addScenario();
    fireEvent.click(screen.getByText("compare"));
    const table = screen.getByRole("table");
    const tableContent = within(table);
    expect(tableContent.getByText("MSRP")).toBeInTheDocument();
    expect(tableContent.getByText("Selling Price")).toBeInTheDocument();
    expect(tableContent.getByText("Net Cap Cost")).toBeInTheDocument();
    expect(tableContent.getByText("Money Factor")).toBeInTheDocument();
    expect(tableContent.getByText("Implied APR")).toBeInTheDocument();
  });

  it("updates a field value", () => {
    render(<App />);
    addScenario();
    const msrpInput = screen.getByDisplayValue("72110");
    fireEvent.change(msrpInput, { target: { value: "80000" } });
    expect(screen.getByDisplayValue("80000")).toBeInTheDocument();
  });
});
