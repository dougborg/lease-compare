import type { ReactNode } from "react";
import Line from "../components/Line";
import { fmt, pct } from "../lib/format";
import type { ScenarioWithCalc } from "../lib/lease";
import { scenarioColor } from "../lib/lease";

interface DetailTabProps {
  results: ScenarioWithCalc[];
  expandedId: number | null;
  setExpandedId: (id: number) => void;
}

export default function DetailTab({
  results,
  expandedId,
  setExpandedId,
}: DetailTabProps) {
  const expandedIndex = results.findIndex((r) => r.id === expandedId);
  const expanded = expandedIndex >= 0 ? results[expandedIndex] : null;

  return (
    <div>
      <div className="detail-picker">
        {results.map((r, i) => (
          <button
            type="button"
            key={r.id}
            onClick={() => setExpandedId(r.id)}
            className="btn"
            style={{
              background: expandedId === r.id ? "#222" : "transparent",
              borderColor: expandedId === r.id ? scenarioColor(i) : "#333",
              color: expandedId === r.id ? scenarioColor(i) : "#666",
            }}
          >
            {r.name}
          </button>
        ))}
      </div>

      {expanded &&
        (() => {
          const r = expanded;
          const accent = scenarioColor(expandedIndex);
          return (
            <div key={r.id} className="detail-grid">
              <div>
                <SectionHeading color={accent}>
                  CAP COST BREAKDOWN
                </SectionHeading>
                <Line label="Selling Price" value={fmt(r.sellingPrice)} />
                <Line
                  label="+ Dealer Add-ons"
                  value={fmt(r.dealerAddons)}
                  indent
                />
                <Line label="+ Acquisition Fee" value={fmt(r.acqFee)} indent />
                <Line
                  label="= Gross Cap Cost"
                  value={fmt(r.calc.grossCap)}
                  bold
                />
                <Line
                  label="- Trade Credit"
                  value={fmt(-r.calc.tradeCredit)}
                  indent
                />
                <Line
                  label="- Down Payment"
                  value={fmt(-r.downPayment)}
                  indent
                />
                <Line
                  label="= Net Cap Cost"
                  value={fmt(r.calc.netCap)}
                  bold
                  color={accent}
                />

                <div className="section-gap" />
                <SectionHeading color={accent}>
                  PAYMENT DECOMPOSITION
                </SectionHeading>
                <Line label="Residual (buyout)" value={fmt(r.calc.residual)} />
                <Line
                  label="Depreciation (total)"
                  value={fmt(r.calc.depTotal)}
                />
                <Line
                  label="Depreciation/mo"
                  value={fmt(r.calc.depMonthly)}
                  indent
                />
                <Line
                  label="Rent Charge/mo"
                  value={fmt(r.calc.rentMonthly)}
                  indent
                />
                <Line
                  label="Money Factor"
                  value={r.calc.mf.toFixed(6)}
                  bold
                  color={accent}
                />
                <Line
                  label="Implied APR"
                  value={pct(r.calc.impliedApr / 100)}
                  bold
                  color={r.calc.impliedApr > 10 ? "#c45a47" : accent}
                />
              </div>
              <div>
                <SectionHeading color={accent}>
                  TOTAL COST OF LEASE
                </SectionHeading>
                <Line label="Payments" value={fmt(r.calc.totalPayments)} />
                <Line
                  label={`  (${r.monthlyPayment} x ${r.term}mo)`}
                  value=""
                  indent
                />
                <Line
                  label="+ Down Payment"
                  value={fmt(r.downPayment)}
                  indent
                />
                <Line
                  label="+ Mileage Overage"
                  value={fmt(r.calc.overageTotal)}
                  indent
                  color={r.calc.overageTotal > 0 ? "#c45a47" : undefined}
                />
                {r.calc.totalExcess > 0 && (
                  <Line
                    label={`  (${r.calc.totalExcess.toLocaleString()} excess mi @ $${r.overagePerMile}/mi)`}
                    value=""
                    indent
                  />
                )}
                <Line
                  label="= Cash Out of Pocket"
                  value={fmt(r.calc.totalCashOut)}
                  bold
                />
                <Line label="+ Trade Equity" value={fmt(r.tradeValue)} indent />
                <Line
                  label="= True Total Cost"
                  value={fmt(r.calc.trueCost)}
                  bold
                  color={accent}
                />
                <Line
                  label="Effective $/month"
                  value={fmt(r.calc.effectiveMonthly)}
                  bold
                  color={accent}
                />

                <div className="section-gap" />
                <SectionHeading color={accent}>
                  DEPRECIATION SHIELD
                </SectionHeading>
                <Line
                  label="Actual Depreciation (est.)"
                  value={fmt(r.calc.actualDep)}
                />
                <Line label="You Paid" value={fmt(r.calc.trueCost)} />
                <Line
                  label={
                    r.calc.depShield > 0
                      ? "Manufacturer Absorbs"
                      : "You Overpaid"
                  }
                  value={fmt(Math.abs(r.calc.depShield))}
                  bold
                  color={r.calc.depShield > 0 ? "#5a9a5a" : "#c45a47"}
                />

                <div className="section-gap" />
                <div className="detail-notes">
                  <div>
                    Net cap below residual = negative depreciation charge.
                  </div>
                  <div>Your entire payment is rent charge (interest).</div>
                  <div>
                    A high residual means the manufacturer subsidizes the lease.
                  </div>
                  <div>
                    You benefit if actual depreciation exceeds what you pay.
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      {expandedId === null && results.length > 0 && (
        <div className="empty-state">
          Select a scenario above to see detailed breakdown
        </div>
      )}
    </div>
  );
}

function SectionHeading({
  color,
  children,
}: { color: string; children: ReactNode }) {
  return (
    <div className="section-heading" style={{ color }}>
      {children}
    </div>
  );
}
