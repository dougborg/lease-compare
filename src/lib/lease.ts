export const COLORS = ["#c4a647", "#47a6c4", "#c45a47", "#5ac447"] as const;

export const scenarioColor = (index: number): string =>
  COLORS[index % COLORS.length];

export interface Scenario {
  id: number;
  name: string;
  msrp: number;
  sellingPrice: number;
  dealerAddons: number;
  acqFee: number;
  tradeValue: number;
  tradeTaxSavings: number;
  term: number;
  downPayment: number;
  monthlyPayment: number;
  residualPct: number;
  milesAllowed: number;
  milesActual: number;
  overagePerMile: number;
  estValueAtEnd: number;
}

export interface LeaseCalc {
  residual: number;
  grossCap: number;
  tradeCredit: number;
  netCap: number;
  depTotal: number;
  depMonthly: number;
  rentMonthly: number;
  mf: number;
  impliedApr: number;
  totalPayments: number;
  cashOut: number;
  overageTotal: number;
  totalExcess: number;
  totalCashOut: number;
  trueCost: number;
  effectiveMonthly: number;
  actualDep: number;
  depShield: number;
}

export type ScenarioWithCalc = Scenario & { calc: LeaseCalc };

export const defaultScenario = (name = "Dealer Quote", idx = 0): Scenario => ({
  id: Date.now() + idx,
  name,
  msrp: 72110,
  sellingPrice: 57110,
  dealerAddons: 0,
  acqFee: 650,
  tradeValue: 14000,
  tradeTaxSavings: 1281,
  term: 24,
  downPayment: 1000,
  monthlyPayment: 665,
  residualPct: 67,
  milesAllowed: 10000,
  milesActual: 14000,
  overagePerMile: 0.2,
  estValueAtEnd: 38000,
});

export function calcLease(s: Scenario): LeaseCalc {
  const residual = s.msrp * (s.residualPct / 100);
  const grossCap = s.sellingPrice + s.dealerAddons + s.acqFee;
  const tradeCredit = s.tradeValue + s.tradeTaxSavings;
  const netCap = grossCap - tradeCredit - s.downPayment;

  const depTotal = netCap - residual;
  const depMonthly = depTotal / s.term;
  const rentMonthly = s.monthlyPayment - depMonthly;

  const mf = netCap + residual !== 0 ? rentMonthly / (netCap + residual) : 0;
  const impliedApr = mf * 2400;

  const totalPayments = s.monthlyPayment * s.term;
  const cashOut = totalPayments + s.downPayment;

  const excessPerYear = Math.max(0, s.milesActual - s.milesAllowed);
  const totalExcess = excessPerYear * (s.term / 12);
  const overageTotal = totalExcess * s.overagePerMile;

  const totalCashOut = cashOut + overageTotal;

  const trueCost = totalCashOut + s.tradeValue;
  const effectiveMonthly = trueCost / s.term;

  const actualDep = s.sellingPrice + s.dealerAddons - s.estValueAtEnd;
  const depShield = actualDep - trueCost;

  return {
    residual,
    grossCap,
    tradeCredit,
    netCap,
    depTotal,
    depMonthly,
    rentMonthly,
    mf,
    impliedApr,
    totalPayments,
    cashOut,
    overageTotal,
    totalExcess,
    totalCashOut,
    trueCost,
    effectiveMonthly,
    actualDep,
    depShield,
  };
}
