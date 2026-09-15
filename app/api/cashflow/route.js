import { NextResponse } from "next/server";

export async function POST(req) {
  const { income=22000, expenses=13500, payment=4300, openingBalance=8000 } = await req.json();
  let balance = Number(openingBalance);
  const rows = [];
  for(let m=1;m<=12;m++) {
    const seasonal = Math.sin(m/12*Math.PI*2)*1000;
    const net = Number(income)+seasonal-Number(expenses)-Number(payment);
    balance += net;
    rows.push({ month:m, income:Number(income)+Math.round(seasonal), expenses:Number(expenses), payment:Number(payment), net:Math.round(net), balance:Math.round(balance) });
  }
  const minBalance = Math.min(...rows.map(x=>x.balance));
  return NextResponse.json({
    monthlyNet: Number(income)-Number(expenses)-Number(payment),
    minimumProjectedBalance: minBalance,
    stress: minBalance < 0 ? "High" : minBalance < Number(payment)*2 ? "Medium" : "Low",
    schedule: rows
  });
}
