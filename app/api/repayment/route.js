import { NextResponse } from "next/server";

export async function POST(req) {
  const { loan=50000, annualRate=12, months=12 } = await req.json();
  const r = Number(annualRate)/100/12;
  const n = Number(months);
  const principal = Number(loan);
  const p = r === 0 ? principal/n : principal*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
  let balance = principal;
  const schedule = [];
  for (let i=1;i<=n;i++) {
    const interest = balance*r;
    const principalPart = Math.min(balance, p-interest);
    balance = Math.max(0,balance-principalPart);
    schedule.push({ month:i, payment:+p.toFixed(2), interest:+interest.toFixed(2), principal:+principalPart.toFixed(2), balance:+balance.toFixed(2) });
  }
  return NextResponse.json({ monthlyPayment:+p.toFixed(2), totalRepayment:+(p*n).toFixed(2), schedule });
}
