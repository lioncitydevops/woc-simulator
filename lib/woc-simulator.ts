/**
 * War Oil Crisis Simulator (WOC-Simulator) — TypeScript port
 * Based on: Ruiz Estrada et al. (2020), Borsa Istanbul Review 20-1, pp. 1-12
 */

export const VARIABLE_LABELS: Record<string, string> = {
  J1: "Oil reserves / exploitation growth rate",
  J2: "War tension growth rate",
  J3: "Household electricity demand (oil) growth rate",
  J4: "Plastics demand growth rate",
  J5: "R&D in alternative energy (solar/wind) growth rate",
  J6: "Oil consumption subsidies growth rate",
  J7: "Oil production quota growth rate",
  J8: "Gas production growth rate",
  J9: "Oil price speculation (developing markets) growth rate",
  J10: "Price monopoly of large oil producers",
  J11: "Oil demand – non-oil developed countries growth rate",
  J12: "Airplane fuel demand growth rate",
  J13: "Pollution level (CO2) growth rate",
  J14: "Heavy/maritime transportation cost growth rate",
  J15: "Petrol demand – cars & light transport growth rate",
  J16: "Diesel demand – heavy machinery growth rate",
};

const MATRIX_POSITION: [number, number, string][] = [
  [0, 0, "J1"], [0, 1, "J2"], [0, 2, "J3"], [0, 3, "J4"],
  [1, 0, "J5"], [1, 1, "J6"], [1, 2, "J7"], [1, 3, "J8"],
  [2, 0, "J9"], [2, 1, "J10"], [2, 2, "J11"], [2, 3, "J12"],
  [3, 0, "J13"], [3, 1, "J14"], [3, 2, "J15"], [3, 3, "J16"],
];

const EPS = 1e-12;

export function tentMap(Jn: number): number {
  if (Jn >= 0 && Jn <= 0.5) return 2 * Jn;
  if (Jn > 0.5 && Jn <= 1) return 2 - 2 * Jn;
  return 0;
}

export function generateChaosSeries(J0: number, nIter: number = 100): number[] {
  const series = [J0];
  let Jn = J0;
  for (let i = 0; i < nIter - 1; i++) {
    Jn = tentMap(Jn);
    series.push(Jn);
  }
  return series;
}

export type JVars = Record<string, number>;

function computeDerivativeMatrix(J_t: JVars, J_t1: JVars): number[][] {
  const A: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (const [row, col, jkey] of MATRIX_POSITION) {
    const jt = J_t[jkey] ?? 1e-9;
    const jt1 = J_t1[jkey] ?? jt;
    A[row][col] = Math.abs(jt) > EPS ? jt1 / jt : 0;
  }
  return A;
}

function det4(A: number[][]): number {
  const a = A[0][0], b = A[0][1], c = A[0][2], d = A[0][3];
  const e = A[1][0], f = A[1][1], g = A[1][2], h = A[1][3];
  const i = A[2][0], j = A[2][1], k = A[2][2], l = A[2][3];
  const m = A[3][0], n = A[3][1], o = A[3][2], p = A[3][3];
  return (
    a * (f * (k * p - l * o) - g * (j * p - l * n) + h * (j * o - k * n)) -
    b * (e * (k * p - l * o) - g * (i * p - l * m) + h * (i * o - k * m)) +
    c * (e * (j * p - l * n) - f * (i * p - l * m) + h * (i * n - j * m)) -
    d * (e * (j * o - k * n) - f * (i * o - k * m) + g * (i * n - j * m))
  );
}

function computeDDeterminant(A: number[][]): number {
  return Math.abs(det4(A)) * 100;
}

function computeDo(DVal: number): number {
  return DVal / 100;
}

function computedo(Do: number): number {
  return Do * 10;
}

export function computeOpc(Op: number, doVal: number): number {
  return Op * (1 + doVal);
}

export interface SimulatorResult {
  matrixA: number[][];
  D_val: number;
  Do: number;
  do: number;
  Op: number;
  Opc: number;
  priceChangePct: number;
}

export function runWOCSimulator(
  J_t: JVars,
  J_t1: JVars,
  Op: number
): SimulatorResult {
  const A = computeDerivativeMatrix(J_t, J_t1);
  const D_val = computeDDeterminant(A);
  const Do = computeDo(D_val);
  const doVal = computedo(Do);
  const Opc = computeOpc(Op, doVal);
  const priceChangePct = (Opc / Op - 1) * 100;
  return {
    matrixA: A,
    D_val: Math.round(D_val * 1e6) / 1e6,
    Do: Math.round(Do * 1e6) / 1e6,
    do: Math.round(doVal * 1e6) / 1e6,
    Op,
    Opc: Math.round(Opc * 100) / 100,
    priceChangePct: Math.round(priceChangePct * 100) / 100,
  };
}

export const WAR_INTENSITY_LABELS: Record<number, string> = {
  0: "Peace",
  0.05: "Low",
  0.1: "Low-Medium",
  0.2: "Medium",
  0.3: "Medium-High",
  0.4: "High",
  0.5: "High",
  0.6: "Very High",
  0.7: "Extreme",
  0.8: "Extreme",
  0.9: "Near-Nuclear",
  1: "Nuclear/Max",
};

const DO_LEVELS = [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

export interface ConflictScenarioRow {
  Do: number;
  do: number;
  warIntensity: string;
  Opc: number;
  priceChangePct: number;
}

export function runConflictScenarios(OpBase: number): ConflictScenarioRow[] {
  return DO_LEVELS.map((Do) => {
    const doVal = Math.round(Do * 10 * 1e4) / 1e4;
    const Opc = computeOpc(OpBase, doVal);
    return {
      Do,
      do: doVal,
      warIntensity: WAR_INTENSITY_LABELS[Do] ?? "—",
      Opc: Math.round(Opc * 100) / 100,
      priceChangePct: Math.round((Opc / OpBase - 1) * 1000) / 10,
    };
  });
}

export function getDefaultWarEscalationJ_t1(): JVars {
  return {
    J1: 0.85, J2: 1.85, J3: 1.06, J4: 1.03,
    J5: 1.08, J6: 0.95, J7: 0.97, J8: 1.04,
    J9: 1.25, J10: 1.15, J11: 1.05, J12: 1.03,
    J13: 1.07, J14: 1.06, J15: 1.04, J16: 1.02,
  };
}

export function getDefaultJ_t(): JVars {
  return {
    J1: 1.02, J2: 1.32, J3: 1.03, J4: 1.01,
    J5: 1.05, J6: 0.98, J7: 1.0, J8: 1.02,
    J9: 1.08, J10: 1.04, J11: 1.02, J12: 1.01,
    J13: 1.03, J14: 1.02, J15: 1.01, J16: 1.01,
  };
}

export function getDefaultJ_t1(): JVars {
  const out: JVars = {};
  for (let i = 1; i <= 16; i++) out[`J${i}`] = 1;
  return out;
}
