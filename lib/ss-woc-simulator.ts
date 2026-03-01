/**
 * SS-WOC: State Space War Oil Crisis Model
 * Canonical source: SS_WOC_Paper.pdf — Lee, T.H., "SS-WOC: A State Space Framework for
 * Geopolitical Oil Price Risk" (replaces any earlier ss_wpc_paper.pdf).
 * Reformulation of Ruiz Estrada et al. (2020) with Φ, Γ, β from Appendix A (Table 6).
 */

const N = 16;

// Table 5: diagonal Φii, war-shock Γi, price elasticity βi (0-indexed i = 0..15)
const PHI_DIAG = [
  0.72, 0.85, 0.78, 0.74, 0.8, 0.68, 0.76, 0.77, 0.9, 0.82, 0.75, 0.73, 0.79, 0.71, 0.74, 0.73,
];
const GAMMA = [
  -0.36, 0.6, 0.1, 0.06, -0.08, -0.12, -0.24, 0.04, 0.44, 0.2, 0.08, 0.06, 0.08, 0.28, 0.1, 0.12,
];
const BETA = [
  -0.36, 0.44, 0.2, 0.14, -0.24, -0.08, 0.28, -0.16, 0.32, 0.26, 0.18, 0.12, 0.06, 0.1, 0.16, 0.14,
];

// Off-diagonal spillovers (paper §5.2): Φ92=0.18, Φ12=-0.12, Φ72=-0.10 (row, col 0-based)
function buildPhi(): number[][] {
  const Phi: number[][] = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => (i === j ? PHI_DIAG[i]! : 0))
  );
  Phi[8]![1] = 0.18;  // war tension → speculation
  Phi[0]![1] = -0.12; // war → reserves
  Phi[6]![1] = -0.1;  // war → OPEC quota
  return Phi;
}

const PHI = buildPhi();

function matVec(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((s, a, j) => s + a * (v[j] ?? 0), 0));
}

function vecDot(a: number[], b: number[]): number {
  return a.reduce((s, x, i) => s + x * (b[i] ?? 0), 0);
}

// (I - Φ)^{-1} Γ by iteration: z_{k+1} = Γ + Φ z_k
function solveIminusPhiInvGamma(maxIter = 100): number[] {
  let z = [...GAMMA];
  for (let _ = 0; _ < maxIter; _++) {
    const next = GAMMA.map((g, i) => g + vecDot(PHI[i]!, z));
    const err = Math.max(...next.map((n, i) => Math.abs(n - (z[i] ?? 0))));
    z = next;
    if (err < 1e-10) break;
  }
  return z;
}

// Φ^τ (matrix power)
function phiPower(tau: number): number[][] {
  if (tau === 0) {
    return Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (_, j) => (i === j ? 1 : 0))
    );
  }
  let P = PHI.map((row) => [...row]);
  for (let t = 1; t < tau; t++) {
    const P2: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    for (let i = 0; i < N; i++)
      for (let k = 0; k < N; k++)
        for (let j = 0; j < N; j++) P2[i]![j]! += (P[i]![k] ?? 0) * (PHI[k]![j] ?? 0);
    P = P2;
  }
  return P;
}

// Mean log price at horizon τ with constant war intensity u: μ_τ = p0 + β'(I-Φ)^{-1}(I-Φ^τ)Γ u
function meanLogPrice(p0: number, u: number, tau: number): number {
  const invGamma = solveIminusPhiInvGamma();
  const phiTau = phiPower(tau);
  // (I - Φ^τ) invGamma = invGamma - Φ^τ invGamma
  const diff = invGamma.map((v, i) => v - vecDot(phiTau[i]!, invGamma));
  const delta = vecDot(BETA, diff) * u;
  return p0 + delta;
}

// Conditional variance: simplified σ²_τ = τ * σ₁² with σ₁ from paper (95% CI width)
const SIGMA1_SQ = 0.0225; // ~0.15^2 so 95% CI ≈ ±30% at τ=1

function varianceLogPrice(tau: number): number {
  return tau * SIGMA1_SQ;
}

// E[P(τ)] = exp(μ_τ + σ²_τ/2) for log-normal
export function expectedPrice(P0: number, u: number, tau: number): number {
  const p0 = Math.log(P0);
  const mu = meanLogPrice(p0, u, tau);
  const sigma2 = varianceLogPrice(tau);
  return Math.exp(mu + 0.5 * sigma2);
}

// 95% CI for P(τ): [exp(μ - 1.96 σ), exp(μ + 1.96 σ)]
export function priceCI95(P0: number, u: number, tau: number): [number, number] {
  const p0 = Math.log(P0);
  const mu = meanLogPrice(p0, u, tau);
  const sigma = Math.sqrt(varianceLogPrice(tau));
  const z = 1.96;
  return [Math.exp(mu - z * sigma), Math.exp(mu + z * sigma)];
}

export const SS_WOC_INTENSITY_LABELS: Record<number, string> = {
  0: "Peace",
  0.1: "Border Skirmish",
  0.2: "Limited Conflict",
  0.3: "Regional Escalation",
  0.5: "Full Conventional War",
  0.65: "High-Intensity War",
  0.75: "Near-Existential",
  1: "Nuclear / Maximum",
};

const U_LEVELS = [0, 0.1, 0.2, 0.3, 0.5, 0.65, 0.75, 1];

export interface SSWOCScenarioRow {
  u: number;
  scenario: string;
  E_P_t1: number;
  E_P_t3: number;
  CI95_t1: [number, number];
  priceChangePct_t1: number;
}

function scenarioLabel(u: number): string {
  if (u in SS_WOC_INTENSITY_LABELS) return SS_WOC_INTENSITY_LABELS[u]!;
  if (u <= 0.1) return "Peace / Low";
  if (u <= 0.3) return "Limited / Regional";
  if (u <= 0.5) return "Conventional War";
  if (u <= 0.75) return "High-Intensity";
  return "Nuclear / Max";
}

export function runSSWOCScenarios(P0: number): SSWOCScenarioRow[] {
  return U_LEVELS.map((u) => {
    const E1 = expectedPrice(P0, u, 1);
    const E3 = expectedPrice(P0, u, 3);
    const [lo, hi] = priceCI95(P0, u, 1);
    return {
      u,
      scenario: SS_WOC_INTENSITY_LABELS[u] ?? `u=${u}`,
      E_P_t1: Math.round(E1 * 100) / 100,
      E_P_t3: Math.round(E3 * 100) / 100,
      CI95_t1: [Math.round(lo * 100) / 100, Math.round(hi * 100) / 100],
      priceChangePct_t1: Math.round((E1 / P0 - 1) * 1000) / 10,
    };
  });
}

/** Same u-grid as WOC (0, 0.05, ..., 1) for direct comparison */
export interface SSWOCComparisonRow {
  u: number;
  scenario: string;
  E_P_t1: number;
  CI95_t1: [number, number];
  priceChangePct_t1: number;
}

export function runSSWOCComparison(P0: number): SSWOCComparisonRow[] {
  const wocU = [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  return wocU.map((u) => {
    const E1 = expectedPrice(P0, u, 1);
    const [lo, hi] = priceCI95(P0, u, 1);
    return {
      u,
      scenario: scenarioLabel(u),
      E_P_t1: Math.round(E1 * 100) / 100,
      CI95_t1: [Math.round(lo * 100) / 100, Math.round(hi * 100) / 100],
      priceChangePct_t1: Math.round((E1 / P0 - 1) * 1000) / 10,
    };
  });
}

// Spectral radius (max |eigenvalue|) approximation via power iteration for dominant eigenvalue
export function spectralRadius(): number {
  let v = Array(N).fill(1 / Math.sqrt(N));
  for (let _ = 0; _ < 50; _++) {
    const w = matVec(PHI, v);
    const n = Math.sqrt(w.reduce((s, x) => s + x * x, 0));
    v = w.map((x) => x / n);
  }
  const lam = vecDot(matVec(PHI, v), v);
  return Math.abs(lam);
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 10: Crude Oil Grade Differentiation (SS_WOC_Paper.pdf)
// βg = Dg ⊙ β; Dg from ϕg (geographic exposure) and ∆costg (processing cost)
// ─────────────────────────────────────────────────────────────────────────────

const KAPPA_Q = 0.15; // quality amplification (paper: 0.15/bbl)
const SUPPLY_INDICES = [0, 1, 6, 13]; // J1, J2, J7, J14
const J9_INDEX = 8;

export interface GradeSpec {
  id: string;
  name: string;
  phi: number;   // geographic exposure [0,1]
  sulphur: number; // wt%
  api: number;   // API gravity
}

// Paper §10.1: ϕg from IEA/EIA; Sg, APIg typical for each benchmark
export const GRADE_SPECS: GradeSpec[] = [
  { id: "WTI", name: "WTI", phi: 0.12, sulphur: 0.2, api: 40 },
  { id: "Brent", name: "Brent", phi: 0.32, sulphur: 0.4, api: 38 },
  { id: "Urals", name: "Urals", phi: 0.55, sulphur: 1.3, api: 32 },
  { id: "Dubai", name: "Dubai/Oman", phi: 0.88, sulphur: 2.0, api: 31 },
  { id: "ArabHeavy", name: "Arab Heavy", phi: 0.95, sulphur: 2.8, api: 28 },
];

// Eq (22): ∆costg = 0.50·max(0, Sg−0.5) + 0.30·max(0, 35−APIg)
function deltaCostG(spec: GradeSpec): number {
  return 0.5 * Math.max(0, spec.sulphur - 0.5) + 0.3 * Math.max(0, 35 - spec.api);
}

// Eq (23): Dg[j] for supply channels, J9, and other
function scalingVectorDg(spec: GradeSpec): number[] {
  const deltaCost = deltaCostG(spec);
  const supplyScale = spec.phi * (1 + KAPPA_Q * deltaCost);
  const j9Scale = 0.5 + (1 - spec.phi); // financial channel: deeper futures → higher
  return BETA.map((_, j) => {
    if (SUPPLY_INDICES.includes(j)) return supplyScale;
    if (j === J9_INDEX) return j9Scale;
    return 1.0;
  });
}

// βg = Dg ⊙ β
export function gradeSensitivityBeta(spec: GradeSpec): number[] {
  const Dg = scalingVectorDg(spec);
  return BETA.map((b, j) => (b * (Dg[j] ?? 1)));
}

// β' Γ for a given beta vector (Brent used as reference in paper)
function betaGammaProduct(betaVec: number[]): number {
  return vecDot(betaVec, GAMMA);
}

const BRENT_BETA_GAMMA = (() => {
  const brent = GRADE_SPECS.find((g) => g.id === "Brent")!;
  return betaGammaProduct(gradeSensitivityBeta(brent));
})();

// Vulnerability decomposition (paper §10.2): V_supply, V_financial, V_total
export interface GradeVulnerability {
  V_supply: number;
  V_financial: number;
  V_other: number;
  V_total: number;
}

export function gradeVulnerability(spec: GradeSpec): GradeVulnerability {
  const betaG = gradeSensitivityBeta(spec);
  const total = betaGammaProduct(betaG);
  if (Math.abs(BRENT_BETA_GAMMA) < 1e-10) {
    return { V_supply: 0, V_financial: 0, V_other: 0, V_total: 0 };
  }
  const denom = BRENT_BETA_GAMMA;
  let vSupply = 0;
  for (const j of SUPPLY_INDICES) vSupply += (betaG[j] ?? 0) * (GAMMA[j] ?? 0);
  let vFinancial = (betaG[J9_INDEX] ?? 0) * (GAMMA[J9_INDEX] ?? 0);
  let vOther = 0;
  for (let j = 0; j < N; j++)
    if (!SUPPLY_INDICES.includes(j) && j !== J9_INDEX)
      vOther += (betaG[j] ?? 0) * (GAMMA[j] ?? 0);
  vSupply /= denom;
  vFinancial /= denom;
  vOther /= denom;
  return {
    V_supply: Math.round(vSupply * 1000) / 1000,
    V_financial: Math.round(vFinancial * 1000) / 1000,
    V_other: Math.round(vOther * 1000) / 1000,
    V_total: Math.round((total / denom) * 1000) / 1000,
  };
}

// Mean log price at τ with custom beta (for grade g)
function meanLogPriceWithBeta(p0: number, u: number, tau: number, betaVec: number[]): number {
  const invGamma = solveIminusPhiInvGamma();
  const phiTau = phiPower(tau);
  const diff = invGamma.map((v, i) => v - vecDot(phiTau[i]!, invGamma));
  const delta = vecDot(betaVec, diff) * u;
  return p0 + delta;
}

// E[P_g(τ)] for grade g
export function expectedPriceGrade(P0: number, u: number, tau: number, spec: GradeSpec): number {
  const p0 = Math.log(P0);
  const betaG = gradeSensitivityBeta(spec);
  const mu = meanLogPriceWithBeta(p0, u, tau, betaG);
  const sigma2 = varianceLogPrice(tau);
  return Math.exp(mu + 0.5 * sigma2);
}

export interface GradeScenarioRow {
  id: string;
  name: string;
  E_P_t1: number;
  priceChangePct: number;
  V_supply: number;
  V_financial: number;
  V_total: number;
}

export function runGradeScenarios(P0: number, u: number): GradeScenarioRow[] {
  return GRADE_SPECS.map((spec) => {
    const E1 = expectedPriceGrade(P0, u, 1, spec);
    const vuln = gradeVulnerability(spec);
    return {
      id: spec.id,
      name: spec.name,
      E_P_t1: Math.round(E1 * 100) / 100,
      priceChangePct: Math.round((E1 / P0 - 1) * 1000) / 10,
      V_supply: vuln.V_supply,
      V_financial: vuln.V_financial,
      V_total: vuln.V_total,
    };
  });
}
