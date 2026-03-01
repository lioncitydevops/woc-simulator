import { NextRequest, NextResponse } from "next/server";
import {
  runWOCSimulator,
  runConflictScenarios,
  getDefaultJ_t,
  getDefaultJ_t1,
  getDefaultWarEscalationJ_t1,
  type JVars,
} from "@/lib/woc-simulator";
import { runSSWOCComparison, runGradeScenarios } from "@/lib/ss-woc-simulator";

export const dynamic = "force-dynamic";

type Body = {
  op?: number;
  scenario?: "default" | "war_escalation";
  J_t?: JVars;
  J_t1?: JVars;
};

export async function POST(req: NextRequest) {
  try {
    const body: Body = await req.json();
    const op = typeof body.op === "number" && body.op > 0 ? body.op : 58;
    const J_t = body.J_t ?? getDefaultJ_t();
    const J_t1 =
      body.J_t1 ??
      (body.scenario === "war_escalation"
        ? getDefaultWarEscalationJ_t1()
        : getDefaultJ_t1());

    const result = runWOCSimulator(J_t, J_t1, op);
    const scenarios = runConflictScenarios(op);
    const sswocScenarios = runSSWOCComparison(op);
    const gradeScenarios = runGradeScenarios(op, 0.5); // u=0.5 (full conventional war) for grade comparison

    return NextResponse.json({
      result,
      scenarios,
      sswocScenarios,
      gradeScenarios,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Simulation failed" },
      { status: 400 }
    );
  }
}

export async function GET() {
  const op = 58;
  const result = runWOCSimulator(
    getDefaultJ_t(),
    getDefaultWarEscalationJ_t1(),
    op
  );
  const scenarios = runConflictScenarios(op);
  const sswocScenarios = runSSWOCComparison(op);
  const gradeScenarios = runGradeScenarios(op, 0.5);
  return NextResponse.json({ result, scenarios, sswocScenarios, gradeScenarios });
}
