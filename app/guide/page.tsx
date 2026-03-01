import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="min-h-screen p-6 md:p-10 max-w-3xl mx-auto">
      <header className="mb-8">
        <Link
          href="/"
          className="text-sm text-[#58a6ff] hover:underline mb-4 inline-block"
        >
          ← Back to Simulator
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Methodology & User Guide
        </h1>
        <p className="text-sm text-[#8b949e] mt-1">
          WOC-Simulator · Ruiz Estrada et al. (2020)
        </p>
      </header>

      <article className="space-y-8 text-[#c9d1d9] text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">
            Methodology
          </h2>
          <p className="mb-3">
            The <strong>War Oil Crisis Simulator (WOC-Simulator)</strong> implements
            the framework of Ruiz Estrada, Park, Tahir & Khan (2020),{" "}
            <em>Borsa Istanbul Review</em> 20(1), pp. 1–12: simulations of US–Iran
            war and its impact on global oil price behaviour.
          </p>
          <h3 className="font-medium text-white mt-4 mb-2">Pipeline</h3>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>
              <strong>16 variables (J1–J16)</strong> — growth rates of oil-market
              drivers (reserves, war tension, demand, policy, speculation, transport).
            </li>
            <li>
              <strong>4×4 derivative matrix A′</strong> — each entry a′ᵢⱼ = J(t+1)/J(t).
            </li>
            <li>
              <strong>|D|</strong> — Oil Market Price Determinant: |D| = |det(A′)| × 100 (0–100).
            </li>
            <li>
              <strong>-Do</strong> — Oil Price Formation Leaking: -Do = |D|/100.
            </li>
            <li>
              <strong>-do</strong> — Oil Price Market Desgrowth: -do = -Do × 10.
            </li>
            <li>
              <strong>Opc</strong> — Future price under risk: Opc = Op × (1 + -do).
            </li>
          </ol>
          <p className="mt-3">
            Higher |D| and -do imply greater stress; Opc is the projected oil price.
            The model also uses a chaos engine (tent map) for the &quot;Omnia Mobilis&quot;
            assumption of permanent irregular motion.
          </p>
          <h3 className="font-medium text-white mt-4 mb-2">Variable groups</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Row 1 (J1–J4): Supply & demand</li>
            <li>Row 2 (J5–J8): Energy policy</li>
            <li>Row 3 (J9–J12): Demand & speculation</li>
            <li>Row 4 (J13–J16): Environment & transport</li>
          </ul>
        </section>

        <section className="pt-4 border-t border-[#30363d]">
          <h2 className="text-lg font-semibold text-white mb-3">SS-WOC (State Space) Model</h2>
          <p className="mb-3">
            The <strong>SS-WOC</strong> is based on <strong>SS_WOC_Paper.pdf</strong> (Lee; replaces earlier ss_wpc_paper.pdf). It reformulates the same 16 variables in linear state space form:
            x(t+1) = Φx(t) + Γu(t) + w(t), with E[P(τ)] from a log-normal distribution and Kalman covariance.
            It is calibrated to the 1979–80 oil crisis and produces credible intervals. On the simulator page,
            <strong> Original WOC</strong> and <strong>SS-WOC</strong> are shown side by side on the same
            war-intensity scale (u = 0 to 1) for easy comparison.
          </p>
        </section>

        <section className="pt-4 border-t border-[#30363d]">
          <h2 className="text-lg font-semibold text-white mb-3">User Guide</h2>
          <h3 className="font-medium text-white mt-3 mb-2">Steps</h3>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>
              <strong>Set present oil price (Op)</strong> — Enter current price in US$/bbl (e.g. 58).
            </li>
            <li>
              <strong>Run simulation</strong> — Click the button. The app uses a war-escalation scenario.
            </li>
            <li>
              <strong>Pipeline result</strong> — View |D|, -Do, -do, Op, Opc and price change %. The 4×4 matrix shows the derivative values.
            </li>
            <li>
              <strong>Conflict scenarios table</strong> — See Opc and % change at each war intensity (Peace → Nuclear/Max) for your Op.
            </li>
          </ol>
          <h3 className="font-medium text-white mt-4 mb-2">Tips</h3>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Try different Op values (50, 70, 100) to compare outcomes.</li>
            <li>API: <code className="bg-[#21262d] px-1 rounded">POST /api/simulate</code> with <code className="bg-[#21262d] px-1 rounded">{`{ "op": 58, "scenario": "war_escalation" }`}</code> returns JSON.</li>
          </ul>
        </section>

        <footer className="pt-4 border-t border-[#30363d] text-xs text-[#8b949e]">
          Reference: Ruiz Estrada, M.A., Park, D., Tahir, M. & Khan, A. (2020).
          Simulations of US–Iran war and its impact on global oil price behaviour.{" "}
          <em>Borsa Istanbul Review</em>, 20(1), 1–12.
        </footer>
      </article>
    </main>
  );
}
