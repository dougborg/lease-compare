import { describe, expect, it } from "vitest";
import { calcLease, defaultScenario } from "./lease";

describe("calcLease", () => {
  it("computes gross cap cost correctly", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.grossCap).toBe(s.sellingPrice + s.dealerAddons + s.acqFee);
  });

  it("computes trade credit correctly", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.tradeCredit).toBe(s.tradeValue + s.tradeTaxSavings);
  });

  it("computes net cap cost correctly", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.netCap).toBe(r.grossCap - r.tradeCredit - s.downPayment);
  });

  it("computes residual from MSRP and residual pct", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.residual).toBe(s.msrp * (s.residualPct / 100));
  });

  it("decomposes monthly payment into depreciation and rent", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.depMonthly + r.rentMonthly).toBeCloseTo(s.monthlyPayment, 6);
  });

  it("computes total payments", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.totalPayments).toBe(s.monthlyPayment * s.term);
  });

  it("computes mileage overage when actual exceeds allowed", () => {
    const s = { ...defaultScenario(), milesAllowed: 10000, milesActual: 14000 };
    const r = calcLease(s);
    const excessPerYear = 4000;
    const totalExcess = excessPerYear * (s.term / 12);
    expect(r.totalExcess).toBe(totalExcess);
    expect(r.overageTotal).toBe(totalExcess * s.overagePerMile);
  });

  it("has zero overage when actual <= allowed", () => {
    const s = { ...defaultScenario(), milesAllowed: 15000, milesActual: 10000 };
    const r = calcLease(s);
    expect(r.overageTotal).toBe(0);
    expect(r.totalExcess).toBe(0);
  });

  it("true cost includes trade equity", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.trueCost).toBe(r.totalCashOut + s.tradeValue);
  });

  it("effective monthly is true cost / term", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.effectiveMonthly).toBeCloseTo(r.trueCost / s.term, 6);
  });

  it("works with custom scenario overrides", () => {
    const s = { ...defaultScenario("Custom", 1), dealerAddons: 1499 };
    const r = calcLease(s);
    expect(r.grossCap).toBeGreaterThan(0);
    expect(r.effectiveMonthly).toBeGreaterThan(0);
  });

  it("implied APR is money factor * 2400", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.impliedApr).toBeCloseTo(r.mf * 2400, 6);
  });

  it("computes depreciation shield correctly", () => {
    const s = defaultScenario();
    const r = calcLease(s);
    expect(r.depShield).toBe(r.actualDep - r.trueCost);
  });
});
