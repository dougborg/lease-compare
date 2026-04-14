import { useCallback, useMemo, useState } from "react";
import type { Scenario } from "./lib/lease";
import { calcLease, defaultScenario } from "./lib/lease";
import CompareTab from "./tabs/CompareTab";
import DetailTab from "./tabs/DetailTab";
import ScenariosTab from "./tabs/ScenariosTab";

const TABS = ["scenarios", "compare", "detail"] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("scenarios");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const updateScenario = useCallback(
    (id: number, field: keyof Scenario, value: number | string) => {
      setScenarios((prev) =>
        prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      );
    },
    [],
  );

  const addScenario = useCallback(() => {
    setScenarios((prev) => [
      ...prev,
      defaultScenario(`Dealer ${prev.length + 1}`, prev.length),
    ]);
  }, []);

  const removeScenario = useCallback((id: number) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const duplicateScenario = useCallback((id: number) => {
    setScenarios((prev) => {
      const source = prev.find((s) => s.id === id);
      if (!source) return prev;
      return [
        ...prev,
        { ...source, id: Date.now(), name: `${source.name} (copy)` },
      ];
    });
  }, []);

  const results = useMemo(
    () => scenarios.map((s) => ({ ...s, calc: calcLease(s) })),
    [scenarios],
  );

  const bestEffective = useMemo(() => {
    if (results.length === 0) return Number.POSITIVE_INFINITY;
    return Math.min(...results.map((r) => r.calc.effectiveMonthly));
  }, [results]);

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Lease Comparison Tool</h1>
          <p>Add dealer quotes, compare side by side, see all the math</p>
        </div>

        <div className="tab-bar">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`tab-btn ${activeTab === t ? "tab-btn--active" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === "scenarios" && (
            <ScenariosTab
              scenarios={scenarios}
              updateScenario={updateScenario}
              addScenario={addScenario}
              removeScenario={removeScenario}
              duplicateScenario={duplicateScenario}
            />
          )}
          {activeTab === "compare" && (
            <CompareTab results={results} bestEffective={bestEffective} />
          )}
          {activeTab === "detail" && (
            <DetailTab
              results={results}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
