import Field from "../components/Field";
import TextInput from "../components/TextInput";
import type { Scenario } from "../lib/lease";
import { scenarioColor } from "../lib/lease";

interface ScenariosTabProps {
  scenarios: Scenario[];
  updateScenario: (
    id: number,
    field: keyof Scenario,
    value: number | string,
  ) => void;
  addScenario: () => void;
  removeScenario: (id: number) => void;
  duplicateScenario: (id: number) => void;
}

export default function ScenariosTab({
  scenarios,
  updateScenario,
  addScenario,
  removeScenario,
  duplicateScenario,
}: ScenariosTabProps) {
  return (
    <div>
      {scenarios.map((s, i) => (
        <div
          key={s.id}
          className="scenario-card"
          style={{ borderColor: `${scenarioColor(i)}33` }}
        >
          <div className="scenario-header">
            <div className="scenario-title">
              <div
                className="scenario-dot"
                style={{ background: scenarioColor(i) }}
              />
              <TextInput
                value={s.name}
                onChange={(v) => updateScenario(s.id, "name", v)}
              />
            </div>
            <div className="scenario-actions">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => duplicateScenario(s.id)}
              >
                Duplicate
              </button>
              {scenarios.length > 1 && (
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => removeScenario(s.id)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="field-grid">
            <Field
              label="MSRP"
              value={s.msrp}
              onChange={(v) => updateScenario(s.id, "msrp", v)}
            />
            <Field
              label="Selling Price"
              value={s.sellingPrice}
              onChange={(v) => updateScenario(s.id, "sellingPrice", v)}
            />
            <Field
              label="Dealer Add-ons"
              value={s.dealerAddons}
              onChange={(v) => updateScenario(s.id, "dealerAddons", v)}
            />
            <Field
              label="Acq. Fee"
              value={s.acqFee}
              onChange={(v) => updateScenario(s.id, "acqFee", v)}
            />
            <Field
              label="Trade Value"
              value={s.tradeValue}
              onChange={(v) => updateScenario(s.id, "tradeValue", v)}
            />
            <Field
              label="Trade Tax Savings"
              value={s.tradeTaxSavings}
              onChange={(v) => updateScenario(s.id, "tradeTaxSavings", v)}
            />
          </div>
          <div className="field-grid">
            <Field
              label="Term"
              value={s.term}
              onChange={(v) => updateScenario(s.id, "term", v)}
              prefix=""
              suffix="mo"
            />
            <Field
              label="Down Payment"
              value={s.downPayment}
              onChange={(v) => updateScenario(s.id, "downPayment", v)}
            />
            <Field
              label="Monthly Pmt"
              value={s.monthlyPayment}
              onChange={(v) => updateScenario(s.id, "monthlyPayment", v)}
            />
            <Field
              label="Residual %"
              value={s.residualPct}
              onChange={(v) => updateScenario(s.id, "residualPct", v)}
              prefix=""
              suffix="%"
            />
            <Field
              label="Miles Allowed/yr"
              value={s.milesAllowed}
              onChange={(v) => updateScenario(s.id, "milesAllowed", v)}
              prefix=""
            />
            <Field
              label="Miles Actual/yr"
              value={s.milesActual}
              onChange={(v) => updateScenario(s.id, "milesActual", v)}
              prefix=""
            />
          </div>
          <div className="field-grid">
            <Field
              label="Overage $/mi"
              value={s.overagePerMile}
              onChange={(v) => updateScenario(s.id, "overagePerMile", v)}
            />
            <Field
              label="Est. Value at End"
              value={s.estValueAtEnd}
              onChange={(v) => updateScenario(s.id, "estValueAtEnd", v)}
            />
          </div>
        </div>
      ))}
      <button type="button" className="btn btn--add" onClick={addScenario}>
        + Add Dealer Quote
      </button>
    </div>
  );
}
