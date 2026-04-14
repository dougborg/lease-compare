import Stat from "../components/Stat";
import { fmt, pct } from "../lib/format";
import type { ScenarioWithCalc } from "../lib/lease";
import { scenarioColor } from "../lib/lease";

interface CompareRow {
  key: string;
  label: string;
  fn: (r: ScenarioWithCalc) => string;
  bold?: boolean;
}

const COMPARE_ROWS: CompareRow[] = [
  { key: "msrp", label: "MSRP", fn: (r) => fmt(r.msrp) },
  { key: "sell", label: "Selling Price", fn: (r) => fmt(r.sellingPrice) },
  {
    key: "disc",
    label: "Discount from MSRP",
    fn: (r) => fmt(r.msrp - r.sellingPrice),
  },
  { key: "addons", label: "Dealer Add-ons", fn: (r) => fmt(r.dealerAddons) },
  {
    key: "gcap",
    label: "Gross Cap Cost",
    fn: (r) => fmt(r.calc.grossCap),
  },
  {
    key: "tcred",
    label: "Trade Credit",
    fn: (r) => fmt(r.calc.tradeCredit),
  },
  { key: "down", label: "Down Payment", fn: (r) => fmt(r.downPayment) },
  {
    key: "ncap",
    label: "Net Cap Cost",
    fn: (r) => fmt(r.calc.netCap),
  },
  {
    key: "res",
    label: "Residual",
    fn: (r) => fmt(r.calc.residual),
  },
  { key: "respct", label: "Residual %", fn: (r) => `${r.residualPct}%` },
  { key: "sep1", label: "", fn: () => "" },
  {
    key: "pmt",
    label: "Monthly Payment",
    fn: (r) => fmt(r.monthlyPayment),
    bold: true,
  },
  {
    key: "depmo",
    label: "  Depreciation/mo",
    fn: (r) => fmt(r.calc.depMonthly),
  },
  {
    key: "rentmo",
    label: "  Rent Charge/mo",
    fn: (r) => fmt(r.calc.rentMonthly),
  },
  { key: "mf", label: "Money Factor", fn: (r) => r.calc.mf.toFixed(6) },
  { key: "apr", label: "Implied APR", fn: (r) => pct(r.calc.impliedApr / 100) },
  { key: "sep2", label: "", fn: () => "" },
  { key: "term", label: "Term", fn: (r) => `${r.term} mo` },
  {
    key: "miallow",
    label: "Miles Allowed/yr",
    fn: (r) => r.milesAllowed.toLocaleString(),
  },
  {
    key: "miact",
    label: "Miles Actual/yr",
    fn: (r) => r.milesActual.toLocaleString(),
  },
  {
    key: "miover",
    label: "Mileage Overage",
    fn: (r) => fmt(r.calc.overageTotal),
  },
  { key: "sep3", label: "", fn: () => "" },
  {
    key: "totpmt",
    label: "Total Payments",
    fn: (r) => fmt(r.calc.totalPayments),
  },
  {
    key: "totcash",
    label: "Total Cash Out",
    fn: (r) => fmt(r.calc.totalCashOut),
  },
  {
    key: "truecost",
    label: "True Total Cost",
    fn: (r) => fmt(r.calc.trueCost),
    bold: true,
  },
  {
    key: "effmo",
    label: "Effective $/mo",
    fn: (r) => fmt(r.calc.effectiveMonthly),
    bold: true,
  },
  { key: "sep4", label: "", fn: () => "" },
  {
    key: "actdep",
    label: "Est. Actual Depreciation",
    fn: (r) => fmt(r.calc.actualDep),
  },
  {
    key: "absorbs",
    label: "Depreciation Shield",
    fn: (r) =>
      r.calc.depShield > 0
        ? fmt(r.calc.depShield)
        : `You overpay by ${fmt(Math.abs(r.calc.depShield))}`,
  },
];

interface CompareTabProps {
  results: ScenarioWithCalc[];
  bestEffective: number;
}

export default function CompareTab({
  results,
  bestEffective,
}: CompareTabProps) {
  if (results.length === 0) {
    return <div className="empty-state">Add scenarios to compare</div>;
  }

  return (
    <div>
      {/* Summary cards */}
      <div
        className="compare-cards"
        style={{
          gridTemplateColumns: `repeat(${results.length}, 1fr)`,
        }}
      >
        {results.map((r, i) => {
          const isBest =
            r.calc.effectiveMonthly === bestEffective && results.length > 1;
          return (
            <div
              key={r.id}
              className="compare-card"
              style={{
                border: isBest
                  ? `2px solid ${scenarioColor(i)}`
                  : "1px solid #2a2a2a",
              }}
            >
              {isBest && (
                <div className="best-badge" style={{ color: scenarioColor(i) }}>
                  BEST VALUE
                </div>
              )}
              <div
                className="compare-card-name"
                style={{ color: scenarioColor(i) }}
              >
                {r.name}
              </div>

              <Stat
                label="EFFECTIVE COST/MO"
                value={fmt(r.calc.effectiveMonthly)}
                color={scenarioColor(i)}
                sub="includes trade, down, overages"
              />
              <Stat
                label="MONTHLY PAYMENT"
                value={fmt(r.monthlyPayment)}
                sub={`${r.term}mo / ${(r.milesAllowed / 1000).toFixed(0)}k mi/yr`}
              />
              <Stat
                label="TRUE TOTAL COST"
                value={fmt(r.calc.trueCost)}
                sub="cash + trade equity + overages"
              />
              <Stat
                label="IMPLIED APR"
                value={pct(r.calc.impliedApr / 100)}
                color={r.calc.impliedApr > 10 ? "#c45a47" : "#ddd"}
                sub={`MF: ${r.calc.mf.toFixed(6)}`}
              />
              <Stat
                label="RESIDUAL"
                value={fmt(r.calc.residual)}
                sub={`${r.residualPct}% of MSRP`}
              />

              {r.calc.overageTotal > 0 && (
                <div className="overage-warning">
                  Mileage overage: {fmt(r.calc.overageTotal)} (
                  {r.calc.totalExcess.toLocaleString()} excess mi)
                </div>
              )}
              {r.calc.depShield > 0 && (
                <div className="absorb-note">
                  Manufacturer absorbs ~{fmt(r.calc.depShield)} in depreciation
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="compare-table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th className="compare-th" style={{ textAlign: "left" }}>
                Metric
              </th>
              {results.map((r, i) => (
                <th
                  key={r.id}
                  className="compare-th"
                  style={{ color: scenarioColor(i) }}
                >
                  {r.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => (
              <tr
                key={row.key}
                style={{
                  borderBottom: row.label ? "1px solid #1a1a1a" : "none",
                }}
              >
                <td
                  className="compare-td"
                  style={{
                    color: row.bold ? "#bbb" : "#666",
                    fontWeight: row.bold ? 700 : 400,
                  }}
                >
                  {row.label}
                </td>
                {results.map((r) => (
                  <td
                    key={r.id}
                    className="compare-td"
                    style={{
                      textAlign: "right",
                      color: row.bold ? "#ddd" : "#999",
                      fontWeight: row.bold ? 700 : 400,
                    }}
                  >
                    {row.fn(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
