import { NextResponse } from "next/server";

function score(b) {
  const disposable = Number(b.income || 0) - Number(b.expenses || 0);
  const dti = Number(b.payment || 0) / Math.max(Number(b.income || 1), 1) * 100;
  let s = 20 + Math.max(0, dti - 15) * 1.7;
  s += Number(b.late || 0) * 12;
  s += disposable < Number(b.payment || 0) * 1.5 ? 16 : 0;
  s += Number(b.savings || 0) < Number(b.payment || 0) * 1.5 ? 10 : 0;
  s += Number(b.networkShock || 0);
  s = Math.max(0, Math.min(99, Math.round(s)));
  return { score:s, risk:s < 35 ? "Low" : s < 65 ? "Medium" : "High" };
}

export async function POST(req) {
  const body = await req.json();
  return NextResponse.json({
    borrower: body,
    assessment: score(body),
    explanation: [
      "Debt-service burden is considered.",
      "Late-payment history increases estimated vulnerability.",
      "Cash-flow surplus and savings buffer reduce vulnerability.",
      "Network shock can be added separately to demonstrate contagion."
    ],
    prototypeOnly: true
  });
}
