"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type SimulatorResult = {
  matrixA: number[][];
  D_val: number;
  Do: number;
  do: number;
  Op: number;
  Opc: number;
  priceChangePct: number;
};

type ScenarioRow = {
  Do: number;
  do: number;
  warIntensity: string;
  Opc: number;
  priceChangePct: number;
};

type SSWOCRow = {
  u: number;
  scenario: string;
  E_P_t1: number;
  CI95_t1: [number, number];
  priceChangePct_t1: number;
};

type ApiResponse = {
  result: SimulatorResult;
  scenarios: ScenarioRow[];
  sswocScenarios: SSWOCRow[];
};

export default function Home() {
  const [op, setOp] = useState(58);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          op,
          scenario: "war_escalation",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const json: ApiResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const r = data?.result;
  const scenarios = data?.scenarios ?? [];
  const sswoc = data?.sswocScenarios ?? [];

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          War Oil Crisis Simulator
        </h1>
        <p className="text-sm text-[#8b949e]">
          Ruiz Estrada, Park, Tahir & Khan (2020) — Borsa Istanbul Review 20-1
        </p>
      </header>

      <section className="mb-8 p-5 rounded-xl bg-[#161b22] border border-[#30363d]">
        <label className="block text-sm font-medium text-[#8b949e] mb-2">
          Present oil price Op (US$/bbl)
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="number"
            min={1}
            max={500}
            step={1}
            value={op}
            onChange={(e) => setOp(Number(e.target.value))}
            className="w-24 px-3 py-2 rounded-lg bg-[#0d1117] border border-[#30363d] text-white focus:ring-2 focus:ring-[#58a6ff] focus:border-transparent outline-none"
          />
          <button
            onClick={runSimulation}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-[#238636] text-white font-medium hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Running…" : "Run simulation"}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-[#f85149]">{error}</p>
        )}
      </section>

      {r && (
        <>
          <section className="mb-8 p-5 rounded-xl bg-[#161b22] border border-[#30363d]">
            <h2 className="text-lg font-semibold text-white mb-4">
              Pipeline result
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-[#0d1117]">
                <span className="text-[#8b949e]">|D|</span>
                <span className="ml-2 font-mono text-white">{r.D_val.toFixed(4)}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0d1117]">
                <span className="text-[#8b949e]">-Do</span>
                <span className="ml-2 font-mono text-white">{r.Do.toFixed(4)}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0d1117]">
                <span className="text-[#8b949e]">-do</span>
                <span className="ml-2 font-mono text-white">{r.do.toFixed(4)}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0d1117]">
                <span className="text-[#8b949e]">Op</span>
                <span className="ml-2 font-mono text-white">${r.Op}/bbl</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0d1117]">
                <span className="text-[#8b949e]">Opc</span>
                <span className="ml-2 font-mono text-[#7ee787]">${r.Opc}/bbl</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0d1117]">
                <span className="text-[#8b949e]">Price change</span>
                <span className="ml-2 font-mono text-[#7ee787]">{r.priceChangePct >= 0 ? "+" : ""}{r.priceChangePct}%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-[#8b949e] mb-2">4×4 derivative matrix A′</p>
              <div className="overflow-x-auto">
                <table className="text-xs font-mono border border-[#30363d] rounded-lg overflow-hidden">
                  <tbody>
                    {r.matrixA.map((row, i) => (
                      <tr key={i}>
                        {row.map((v, j) => (
                          <td
                            key={j}
                            className="px-3 py-2 border-b border-r border-[#30363d] last:border-r-0 text-right text-white"
                          >
                            {v.toFixed(4)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="p-5 rounded-xl bg-[#161b22] border border-[#30363d]">
            <h2 className="text-lg font-semibold text-white mb-2">
              Model comparison (P0 = ${r.Op}/bbl)
            </h2>
            <p className="text-xs text-[#8b949e] mb-4">
              Original WOC (deterministic) vs SS-WOC (state space, calibrated). Same war-intensity scale for easy comparison.
            </p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="overflow-x-auto">
                <p className="text-xs font-medium text-[#58a6ff] mb-2">Original WOC — Ruiz Estrada et al. (2020)</p>
                <table className="w-full text-sm border border-[#30363d] rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-[#21262d]">
                      <th className="px-2 py-2 text-left font-medium text-[#8b949e]">u</th>
                      <th className="px-2 py-2 text-left font-medium text-[#8b949e]">Intensity</th>
                      <th className="px-2 py-2 text-right font-medium text-[#8b949e]">Opc</th>
                      <th className="px-2 py-2 text-right font-medium text-[#8b949e]">Δ%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((s, i) => (
                      <tr key={i} className="border-t border-[#30363d] hover:bg-[#21262d]/50">
                        <td className="px-2 py-1.5 text-white">{s.Do}</td>
                        <td className="px-2 py-1.5 text-[#c9d1d9] text-xs">{s.warIntensity}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-[#7ee787]">${s.Opc}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-[#7ee787]">+{s.priceChangePct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="overflow-x-auto">
                <p className="text-xs font-medium text-[#a371f7] mb-2">SS-WOC — State Space (Lee)</p>
                <table className="w-full text-sm border border-[#30363d] rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-[#21262d]">
                      <th className="px-2 py-2 text-left font-medium text-[#8b949e]">u</th>
                      <th className="px-2 py-2 text-left font-medium text-[#8b949e]">Scenario</th>
                      <th className="px-2 py-2 text-right font-medium text-[#8b949e]">E[P(1)]</th>
                      <th className="px-2 py-2 text-right font-medium text-[#8b949e]">95% CI</th>
                      <th className="px-2 py-2 text-right font-medium text-[#8b949e]">Δ%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sswoc.map((s, i) => (
                      <tr key={i} className="border-t border-[#30363d] hover:bg-[#21262d]/50">
                        <td className="px-2 py-1.5 text-white">{s.u}</td>
                        <td className="px-2 py-1.5 text-[#c9d1d9] text-xs">{s.scenario}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-[#a371f7]">${s.E_P_t1}</td>
                        <td className="px-2 py-1.5 text-right font-mono text-[#8b949e] text-xs">
                          [{s.CI95_t1[0]}, {s.CI95_t1[1]}]
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-[#a371f7]">+{s.priceChangePct_t1}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="mt-12 pt-6 border-t border-[#30363d] text-xs text-[#8b949e]">
        WOC-Simulator. Mathematical framework: 16 variables (J1–J16) → 4×4 matrix
        A′ → |D| → -Do → -do → Opc = Op × (1 + -do).{" "}
        <Link href="/guide" className="text-[#58a6ff] hover:underline">
          Methodology & user guide
        </Link>
      </footer>
    </main>
  );
}
