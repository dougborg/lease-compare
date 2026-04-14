import { z } from "zod";
import { fmt, pct } from "../src/lib/format.js";
import {
  type LeaseCalc,
  type Scenario,
  calcLease,
  defaultScenario,
} from "../src/lib/lease.js";

export const scenarioSchema = {
  name: z.string().optional().describe("Name for this quote (e.g. 'Dealer A')"),
  msrp: z.number().describe("Manufacturer's suggested retail price"),
  sellingPrice: z.number().describe("Negotiated selling price before add-ons"),
  dealerAddons: z.number().default(0).describe("Dealer-installed add-ons cost"),
  acqFee: z.number().default(650).describe("Lease acquisition fee"),
  tradeValue: z.number().default(0).describe("Trade-in vehicle value"),
  tradeTaxSavings: z.number().default(0).describe("Tax savings from trade-in"),
  term: z.number().describe("Lease term in months"),
  downPayment: z.number().default(0).describe("Cash down payment at signing"),
  monthlyPayment: z.number().describe("Monthly lease payment"),
  residualPct: z.number().describe("Residual value as percentage of MSRP"),
  milesAllowed: z.number().default(10000).describe("Miles allowed per year"),
  milesActual: z
    .number()
    .default(10000)
    .describe("Estimated actual miles per year"),
  overagePerMile: z.number().default(0.2).describe("Cost per excess mile"),
  estValueAtEnd: z.number().describe("Estimated market value at lease end"),
};

export interface ScenarioInput {
  name?: string;
  msrp: number;
  sellingPrice: number;
  dealerAddons?: number;
  acqFee?: number;
  tradeValue?: number;
  tradeTaxSavings?: number;
  term: number;
  downPayment?: number;
  monthlyPayment: number;
  residualPct: number;
  milesAllowed?: number;
  milesActual?: number;
  overagePerMile?: number;
  estValueAtEnd: number;
}

interface FormattedCalc {
  raw: number;
  formatted: string;
}

interface CalculateLeaseResult {
  name: string;
  inputs: Scenario;
  results: Record<string, FormattedCalc>;
  summary: string;
}

function formatCalcField(key: keyof LeaseCalc, value: number): FormattedCalc {
  if (key === "mf") return { raw: value, formatted: value.toFixed(6) };
  if (key === "impliedApr") return { raw: value, formatted: pct(value / 100) };
  return { raw: value, formatted: fmt(value) };
}

function buildScenario(input: ScenarioInput, index: number): Scenario {
  return {
    id: Date.now() + index,
    name: input.name ?? `Scenario ${index + 1}`,
    msrp: input.msrp,
    sellingPrice: input.sellingPrice,
    dealerAddons: input.dealerAddons ?? 0,
    acqFee: input.acqFee ?? 650,
    tradeValue: input.tradeValue ?? 0,
    tradeTaxSavings: input.tradeTaxSavings ?? 0,
    term: input.term,
    downPayment: input.downPayment ?? 0,
    monthlyPayment: input.monthlyPayment,
    residualPct: input.residualPct,
    milesAllowed: input.milesAllowed ?? 10000,
    milesActual: input.milesActual ?? 10000,
    overagePerMile: input.overagePerMile ?? 0.2,
    estValueAtEnd: input.estValueAtEnd,
  };
}

function formatResult(
  scenario: Scenario,
  calc: LeaseCalc,
): CalculateLeaseResult {
  const results: Record<string, FormattedCalc> = {};
  for (const [key, value] of Object.entries(calc)) {
    results[key] = formatCalcField(key as keyof LeaseCalc, value as number);
  }

  const summary = [
    `Monthly payment: ${fmt(scenario.monthlyPayment)}`,
    `Effective monthly cost: ${fmt(calc.effectiveMonthly)}`,
    `Implied APR: ${pct(calc.impliedApr / 100)}`,
    `True total cost: ${fmt(calc.trueCost)}`,
    `Residual: ${fmt(calc.residual)} (${scenario.residualPct}% of MSRP)`,
    calc.depShield > 0
      ? `Depreciation shield: ${fmt(calc.depShield)} (manufacturer absorbs)`
      : `Overpaying depreciation by: ${fmt(Math.abs(calc.depShield))}`,
    calc.overageTotal > 0
      ? `Mileage overage risk: ${fmt(calc.overageTotal)}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  return { name: scenario.name, inputs: scenario, results, summary };
}

export function calculateLease(input: ScenarioInput): CalculateLeaseResult {
  const scenario = buildScenario(input, 0);
  const calc = calcLease(scenario);
  return formatResult(scenario, calc);
}

export interface CompareResult {
  scenarios: CalculateLeaseResult[];
  comparison: {
    bestEffectiveMonthly: { name: string; value: number; formatted: string };
    bestImpliedApr: { name: string; value: number; formatted: string };
    bestDepShield: { name: string; value: number; formatted: string };
    ranking: Array<{
      name: string;
      effectiveMonthly: number;
      formatted: string;
      deltaFromBest: number;
      deltaFormatted: string;
    }>;
  };
  recommendation: string;
}

export function compareLeases(inputs: Array<ScenarioInput>): CompareResult {
  const scenarioResults = inputs.map((input, i) => {
    const scenario = buildScenario(input, i);
    const calc = calcLease(scenario);
    return { ...formatResult(scenario, calc), calc };
  });

  const sorted = [...scenarioResults].sort(
    (a, b) => a.calc.effectiveMonthly - b.calc.effectiveMonthly,
  );

  const bestEffective = sorted[0];
  const bestApr = [...scenarioResults].sort(
    (a, b) => a.calc.impliedApr - b.calc.impliedApr,
  )[0];
  const bestShield = [...scenarioResults].sort(
    (a, b) => b.calc.depShield - a.calc.depShield,
  )[0];

  const ranking = sorted.map((r) => ({
    name: r.name,
    effectiveMonthly: r.calc.effectiveMonthly,
    formatted: fmt(r.calc.effectiveMonthly),
    deltaFromBest:
      r.calc.effectiveMonthly - bestEffective.calc.effectiveMonthly,
    deltaFormatted:
      r.calc.effectiveMonthly === bestEffective.calc.effectiveMonthly
        ? "$0"
        : `+${fmt(r.calc.effectiveMonthly - bestEffective.calc.effectiveMonthly)}`,
  }));

  const delta =
    sorted.length > 1
      ? sorted[sorted.length - 1].calc.effectiveMonthly -
        bestEffective.calc.effectiveMonthly
      : 0;

  const recommendation =
    sorted.length > 1 && delta > 0
      ? `${bestEffective.name} offers the best value at ${fmt(bestEffective.calc.effectiveMonthly)}/mo effective cost, ${fmt(delta)}/mo less than ${sorted[sorted.length - 1].name}.`
      : `${bestEffective.name} has an effective monthly cost of ${fmt(bestEffective.calc.effectiveMonthly)}.`;

  return {
    scenarios: scenarioResults.map(({ calc: _calc, ...rest }) => rest),
    comparison: {
      bestEffectiveMonthly: {
        name: bestEffective.name,
        value: bestEffective.calc.effectiveMonthly,
        formatted: fmt(bestEffective.calc.effectiveMonthly),
      },
      bestImpliedApr: {
        name: bestApr.name,
        value: bestApr.calc.impliedApr,
        formatted: pct(bestApr.calc.impliedApr / 100),
      },
      bestDepShield: {
        name: bestShield.name,
        value: bestShield.calc.depShield,
        formatted: fmt(bestShield.calc.depShield),
      },
      ranking,
    },
    recommendation,
  };
}

export function getDefaultScenario(): {
  scenario: Scenario;
  fieldDescriptions: Record<string, string>;
} {
  return {
    scenario: defaultScenario(),
    fieldDescriptions: {
      msrp: "Manufacturer's suggested retail price",
      sellingPrice: "Negotiated selling price before add-ons",
      dealerAddons: "Dealer-installed add-ons cost",
      acqFee: "Lease acquisition fee",
      tradeValue: "Trade-in vehicle value",
      tradeTaxSavings: "Tax savings from trade-in",
      term: "Lease term in months",
      downPayment: "Cash down payment at signing",
      monthlyPayment: "Monthly lease payment",
      residualPct: "Residual value as percentage of MSRP",
      milesAllowed: "Miles allowed per year",
      milesActual: "Estimated actual miles per year",
      overagePerMile: "Cost per excess mile",
      estValueAtEnd: "Estimated market value at lease end",
    },
  };
}
