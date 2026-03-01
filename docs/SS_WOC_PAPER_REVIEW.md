# Review: SS_WOC_Paper.pdf

**Document:** SS-WOC: A State Space Framework for Geopolitical Oil Price Risk  
**Author:** TzeHoung LEE (Singapore University of Social Sciences)  
**Source:** SS_WOC_Paper.pdf (canonical; replaces any earlier ss_wpc_paper.pdf)

---

## 1. Overview

The paper reformulates the War Oil Crisis Simulator (Ruiz Estrada et al., 2020) as a linear state space model (SS-WOC). It keeps the same sixteen J-variables, adds rigorous dynamics, probabilistic output, and historical calibration to the 1979–80 oil crisis. Replication code is cited as **ss_woc_model.py**.

---

## 2. Structure (35 pages)

| Section | Content |
|--------|---------|
| 1–2 | Introduction; literature (geopolitical risk, state space in energy) |
| 3 | WOC-Simulator summary and mathematical critique (Expr. 9/10, Table 1, Section 7) |
| 4 | **SS-WOC framework:** state equation (3), measurement (5)–(6), Kalman (8)–(9), IRF (11), VaR/CVaR (13)–(14), chaos (15) |
| 5 | Calibration (1979–80 target), off-diagonals Φ₉₂, Φ₁₂, Φ₇₂, process noise Q |
| 6 | Results: stability, IRF, fan charts, VaR/CVaR, Table 1 scenarios (P0=$58, u=0–1) |
| 7 | Historical back-test: 1979–80 crisis (u=0.75, τ=2; E[P(2)]≈$35.43 vs actual $37.42) |
| 8 | Comparison with original WOC (Table 3; e.g. u=1 → $112 vs $638) |
| 9 | **Temporal dynamics:** conflict trajectory (16), convolution (17), peak time τ*, half-life τ₁/₂, persistence Π, regimes (Spike/Sustained/Chronic) |
| **10** | **Crude oil grade differentiation** (new): βg by (ϕg, ∆costg), vulnerability decomposition, sweet–sour premium, crack spread, quality spread surfaces |
| 11–12 | Policy implications; conclusion |
| **Appendix A** | **Table 6:** Calibrated Φii, Γi, βi for J1–J16 (same values as prior Table 5) |
| B–C | IRF convergence; log-normal price distribution |

---

## 3. Alignment with current implementation

- **State equation:** x(t+1) = Φx(t) + Γu(t) + w(t) — implemented with Φ from Appendix A (Table 6), Γ and β from same table; off-diagonals Φ₉₂=0.18, Φ₁₂=−0.12, Φ₇₂=−0.10.
- **Mean log price:** μτ = p0 + β'(I−Φ)⁻¹(I−Φ^τ)Γ·u — implemented via (I−Φ)⁻¹Γ iteration and Φ^τ.
- **E[P(τ)]:** exp(μτ + σ²τ/2); 95% CI from log-normal. Implemented with a simplified variance proxy (full Kalman P(τ) not yet used).
- **Scenario table:** P0=$58, u=0, 0.1, 0.2, 0.3, 0.5, 0.65, 0.75, 1 with E[P(1)], E[P(3)], 95% CI — implemented; comparison grid matches WOC u-levels.

**Note:** Appendix parameter table is **Table 6** in this version of the paper (previously Table 5); numerical values are unchanged.

---

## 4. New material (Section 10) — not yet in app

Section 10 adds **grade-level** analysis:

- **βg = Dg ⊙ β** with Dg from geographic exposure ϕg and processing cost differential ∆costg (Eq. 22–23).
- **Vulnerability decomposition:** Vg = V_supply + V_financial + V_other by channel (J1,J2,J7,J14 vs J9).
- **Sweet–sour premium** δSS(τ) with refinery substitution recovery (zero-crossing ~11 yr).
- **3-2-1 crack spread** and quality spread surfaces; vulnerability matrix and scenario outcomes.

This is a natural extension for a future release (grade-specific E[P], IRFg, vulnerability by benchmark).

---

## 5. Summary

- **Core SS-WOC (Sections 1–9):** Mathematically and parametrically aligned with the deployed simulator; only the appendix table number changed (Table 6).
- **Section 10:** New; provides a structural, grade-differentiated extension (βg, vulnerability, sweet–sour, crack spread) that could be added later.
- **Reference:** Use **SS_WOC_Paper.pdf** as the single canonical source; it supersedes any earlier ss_wpc_paper.pdf.
