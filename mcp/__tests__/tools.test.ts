import { describe, expect, it } from "vitest";
import { calculateLease, compareLeases, getDefaultScenario } from "../tools.js";

const sampleInput = {
  msrp: 50000,
  sellingPrice: 45000,
  dealerAddons: 500,
  acqFee: 650,
  term: 36,
  downPayment: 2000,
  monthlyPayment: 450,
  residualPct: 55,
  milesAllowed: 12000,
  milesActual: 12000,
  overagePerMile: 0.25,
  estValueAtEnd: 25000,
};

describe("calculateLease", () => {
  it("returns formatted results for a scenario", () => {
    const result = calculateLease(sampleInput);
    expect(result.name).toBe("Scenario 1");
    expect(result.inputs.msrp).toBe(50000);
    expect(result.results.grossCap).toBeDefined();
    expect(result.results.grossCap.raw).toBe(46150);
    expect(result.results.grossCap.formatted).toMatch(/^\$[\d,]+$/);
  });

  it("uses provided name", () => {
    const result = calculateLease({ ...sampleInput, name: "Test Dealer" });
    expect(result.name).toBe("Test Dealer");
  });

  it("includes a human-readable summary", () => {
    const result = calculateLease(sampleInput);
    expect(result.summary).toContain("Monthly payment:");
    expect(result.summary).toContain("Effective monthly cost:");
    expect(result.summary).toContain("Implied APR:");
    expect(result.summary).toContain("True total cost:");
  });

  it("computes money factor correctly", () => {
    const result = calculateLease(sampleInput);
    expect(result.results.mf.formatted).toMatch(/^-?\d+\.\d{6}$/);
  });

  it("handles zero trade-in", () => {
    const input = { ...sampleInput, tradeValue: 0, tradeTaxSavings: 0 };
    const result = calculateLease(input);
    expect(result.results.tradeCredit.raw).toBe(0);
  });

  it("computes mileage overage when actual exceeds allowed", () => {
    const input = { ...sampleInput, milesActual: 15000 };
    const result = calculateLease(input);
    expect(result.results.overageTotal.raw).toBeGreaterThan(0);
    expect(result.summary).toContain("Mileage overage risk:");
  });

  it("handles zero mileage overage", () => {
    const result = calculateLease(sampleInput);
    expect(result.results.overageTotal.raw).toBe(0);
    expect(result.summary).not.toContain("Mileage overage risk:");
  });
});

describe("compareLeases", () => {
  const cheaperDeal = {
    ...sampleInput,
    name: "Cheap Dealer",
    sellingPrice: 42000,
    monthlyPayment: 380,
  };
  const expensiveDeal = {
    ...sampleInput,
    name: "Pricey Dealer",
    sellingPrice: 48000,
    monthlyPayment: 550,
  };

  it("compares two scenarios and picks the best", () => {
    const result = compareLeases([cheaperDeal, expensiveDeal]);
    expect(result.scenarios).toHaveLength(2);
    expect(result.comparison.bestEffectiveMonthly.name).toBe("Cheap Dealer");
  });

  it("ranks scenarios by effective monthly cost", () => {
    const result = compareLeases([expensiveDeal, cheaperDeal]);
    expect(result.comparison.ranking[0].name).toBe("Cheap Dealer");
    expect(result.comparison.ranking[1].name).toBe("Pricey Dealer");
    expect(result.comparison.ranking[1].deltaFromBest).toBeGreaterThan(0);
  });

  it("generates a recommendation string", () => {
    const result = compareLeases([cheaperDeal, expensiveDeal]);
    expect(result.recommendation).toContain("Cheap Dealer");
    expect(result.recommendation).toContain("best value");
  });

  it("handles identical scenarios gracefully", () => {
    const result = compareLeases([
      { ...sampleInput, name: "Dealer A" },
      { ...sampleInput, name: "Dealer B" },
    ]);
    expect(result.comparison.ranking[0].deltaFromBest).toBe(0);
    expect(result.comparison.ranking[1].deltaFromBest).toBe(0);
  });

  it("identifies best APR and depreciation shield", () => {
    const result = compareLeases([cheaperDeal, expensiveDeal]);
    expect(result.comparison.bestImpliedApr.name).toBeDefined();
    expect(result.comparison.bestDepShield.name).toBeDefined();
  });

  it("each scenario includes full results", () => {
    const result = compareLeases([cheaperDeal, expensiveDeal]);
    for (const s of result.scenarios) {
      expect(s.results.effectiveMonthly).toBeDefined();
      expect(s.summary).toContain("Monthly payment:");
    }
  });
});

describe("getDefaultScenario", () => {
  it("returns a scenario with all fields", () => {
    const result = getDefaultScenario();
    expect(result.scenario.msrp).toBeGreaterThan(0);
    expect(result.scenario.term).toBeGreaterThan(0);
    expect(result.scenario.name).toBe("Dealer Quote");
  });

  it("returns field descriptions for all input fields", () => {
    const result = getDefaultScenario();
    const expectedFields = [
      "msrp",
      "sellingPrice",
      "dealerAddons",
      "acqFee",
      "tradeValue",
      "tradeTaxSavings",
      "term",
      "downPayment",
      "monthlyPayment",
      "residualPct",
      "milesAllowed",
      "milesActual",
      "overagePerMile",
      "estValueAtEnd",
    ];
    for (const field of expectedFields) {
      expect(result.fieldDescriptions[field]).toBeDefined();
      expect(typeof result.fieldDescriptions[field]).toBe("string");
    }
  });
});
