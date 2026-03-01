# WOC-Simulator: Methodology & User Guide

## Methodology

The **War Oil Crisis Simulator (WOC-Simulator)** implements the framework of Ruiz Estrada, Park, Tahir & Khan (2020), *Borsa Istanbul Review* 20(1), pp. 1–12: *"Simulations of US–Iran war and its impact on global oil price behaviour"*.

### Conceptual pipeline

1. **16 variables (J1–J16)** represent growth rates of key oil-market drivers (reserves, war tension, demand, policy, speculation, transport, etc.).
2. These are arranged into a **4×4 derivative matrix A′**, where each entry is the growth-rate ratio between two periods: *a′ᵢⱼ = ∂J(t+1)/∂J(t) = J(t+1)/J(t)*.
3. The **Oil Market Price Determinant |D|** is computed as *|D| = |det(A′)| × 100* (scaled 0–100).
4. **Oil Price Formation Leaking (-Do)** is *-Do = |D|/100*.
5. **Oil Price Market Desgrowth (-do)** is *-do = -Do × 10* (so *-do = |D|/10*).
6. **Future oil price under risk (Opc)** is *Opc = Op × (1 + -do)*, where *Op* is the present oil price (e.g. US$/bbl).

Higher |D| and -do imply greater market stress; Opc shows the projected price under that stress. The model also uses a **chaos engine** (tent map) to reflect the *Omnia Mobilis* assumption that the world economy is in permanent, irregular motion—used for scenario generation rather than the single-run pipeline above.

### Variable groups (4×4 layout)

- **Row 1 (J1–J4):** Supply & demand (reserves, war tension, electricity demand, plastics demand).
- **Row 2 (J5–J8):** Energy policy (R&D, subsidies, quotas, gas production).
- **Row 3 (J9–J12):** Demand & speculation (speculation, monopoly power, non-oil demand, aviation).
- **Row 4 (J13–J16):** Environment & transport (CO₂, maritime cost, petrol, diesel).

The web app uses preset **J(t)** and **J(t+1)** scenarios (e.g. baseline vs. war escalation) to build A′, then computes |D|, -Do, -do, and Opc.

### SS-WOC (State Space model)

The **SS-WOC** (State Space War Oil Crisis) model is based on **SS_WOC_Paper.pdf** (Lee, T.H., *SS-WOC: A State Space Framework for Geopolitical Oil Price Risk*; this paper replaces any earlier ss_wpc_paper.pdf). It reformulates the same sixteen-variable setup in linear state space form: **x(t+1) = Φx(t) + Γu(t) + w(t)**, with oil price **E[P(τ)]** from a log-normal conditional distribution (Kalman propagation). It is calibrated to the 1979–80 oil crisis and yields **credible intervals** and **VaR/CVaR**-style outputs. On the app, **Original WOC** and **SS-WOC** are shown **side by side** on the same war-intensity scale (u = 0 to 1) for easy comparison; SS-WOC projections are typically more conservative than the original deterministic Opc.

---

## User Guide

### What you can do

- Set the **present oil price Op** (US$/bbl), e.g. 58.
- Run the **simulation** with a built-in **war-escalation** scenario (J2 and related variables increase).
- View the **pipeline result** and a **conflict-scenarios** table for different intensity levels.

### Step-by-step

1. **Open the app**  
   Go to the simulator URL (e.g. [woc-simulator.vercel.app](https://woc-simulator.vercel.app)).

2. **Set present oil price**  
   In **"Present oil price Op (US$/bbl)"**, enter a positive number (e.g. 58). This is the current price used as the baseline.

3. **Run simulation**  
   Click **"Run simulation"**. The app calls the backend with your *Op* and the war-escalation scenario, then displays results.

4. **Read the pipeline result**  
   - **|D|:** Oil Market Price Determinant (from the 4×4 matrix).  
   - **-Do:** Oil Price Formation Leaking.  
   - **-do:** Oil Price Market Desgrowth (drives the price multiplier).  
   - **Op:** Your input present price.  
   - **Opc:** Future price under risk, *Op × (1 + -do)*.  
   - **Price change %:** Percentage change from Op to Opc.  
   - **4×4 matrix A′:** The derivative matrix (growth-rate ratios) used to compute |D|.

5. **Use the model comparison**  
   Two tables are shown **side by side**: **Original WOC** (deterministic Opc and % change by -Do / u) and **SS-WOC** (state space: E[P(1)], 95% credible interval, and % change by u). The same war-intensity scale (u = 0 to 1) is used for easy comparison.

### Tips

- Try different *Op* values (e.g. 50, 70, 100) to see how baseline price affects Opc and % change.  
- The same methodology applies to the API: `POST /api/simulate` with body `{ "op": 58, "scenario": "war_escalation" }` returns the pipeline result and scenarios in JSON.

---

*Reference: Ruiz Estrada, M.A., Park, D., Tahir, M. & Khan, A. (2020). Simulations of US–Iran war and its impact on global oil price behaviour. Borsa Istanbul Review, 20(1), 1–12.*
