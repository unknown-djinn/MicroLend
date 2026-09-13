"use client";

import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend
} from "recharts";

const initialBorrowers = [
  { id:"B001", name:"Asha", income:22000, expenses:13500, loan:45000, payment:4300, savings:9000, late:0, group:"G01" },
  { id:"B002", name:"Meena", income:18500, expenses:12800, loan:38000, payment:3900, savings:5000, late:1, group:"G01" },
  { id:"B003", name:"Kavya", income:26000, expenses:14500, loan:52000, payment:4800, savings:15000, late:0, group:"G01" },
  { id:"B004", name:"Rani", income:16000, expenses:11800, loan:32000, payment:3600, savings:3500, late:2, group:"G02" },
  { id:"B005", name:"Sita", income:24000, expenses:15000, loan:41000, payment:4100, savings:11000, late:0, group:"G02" },
  { id:"B006", name:"Latha", income:19500, expenses:13700, loan:30000, payment:3200, savings:6500, late:1, group:"G02" }
];

function riskFor(b, shock=0) {
  const disposable = b.income - b.expenses;
  const dti = (b.payment / Math.max(b.income,1)) * 100;
  let score = 20;
  score += Math.max(0, dti - 15) * 1.7;
  score += b.late * 12;
  score += disposable < b.payment * 1.5 ? 16 : 0;
  score += b.savings < b.payment * 1.5 ? 10 : 0;
  score += shock;
  return Math.min(99, Math.round(score));
}
function label(score) {
  if (score < 35) return "Low";
  if (score < 65) return "Medium";
  return "High";
}
function money(n) {
  return new Intl.NumberFormat("en-IN", { style:"currency", currency:"INR", maximumFractionDigits:0 }).format(n);
}

export default function Home() {
  const [borrowers, setBorrowers] = useState(initialBorrowers);
  const [selected, setSelected] = useState(initialBorrowers[0]);
  const [shock, setShock] = useState(0);
  const [loan, setLoan] = useState(50000);
  const [rate, setRate] = useState(12);
  const [term, setTerm] = useState(12);
  const [income, setIncome] = useState(22000);
  const [expenses, setExpenses] = useState(13500);
  const [payment, setPayment] = useState(4300);
  const [datasetStatus, setDatasetStatus] = useState("");

  const scored = useMemo(() => borrowers.map(b => ({...b, score:riskFor(b, shock), risk:label(riskFor(b, shock))})), [borrowers, shock]);
  const avgRisk = Math.round(scored.reduce((a,b)=>a+b.score,0)/scored.length);
  const high = scored.filter(x=>x.score>=65).length;

  const repayment = useMemo(() => {
    const r = rate / 100 / 12;
    const p = r === 0 ? loan / term : loan * r * Math.pow(1+r,term) / (Math.pow(1+r,term)-1);
    let balance = loan;
    const rows = [];
    for(let m=1;m<=term;m++){
      const interest = balance*r;
      const principal = Math.min(balance, p-interest);
      balance = Math.max(0,balance-principal);
      rows.push({month:`M${m}`, payment:Math.round(p), principal:Math.round(principal), interest:Math.round(interest), balance:Math.round(balance)});
    }
    return { p, rows };
  }, [loan, rate, term]);

  const cashflow = useMemo(() => {
    let balance = 8000;
    const rows = [];
    for(let m=1;m<=12;m++){
      const seasonal = Math.sin(m/12*Math.PI*2)*1000;
      const net = income + seasonal - expenses - payment;
      balance += net;
      rows.push({month:`M${m}`, net:Math.round(net), balance:Math.round(balance)});
    }
    return rows;
  }, [income, expenses, payment]);

  function updateBorrower(id, patch) {
    setBorrowers(prev => prev.map(b => b.id===id ? {...b,...patch} : b));
    setSelected(prev => prev.id===id ? {...prev,...patch} : prev);
  }

  async function testDatasetApi() {
    setDatasetStatus("Checking dataset connector...");
    try {
      const r = await fetch("/api/dataset");
      const j = await r.json();
      setDatasetStatus(j.message || "Dataset connector responded.");
    } catch {
      setDatasetStatus("Dataset connector unavailable; demo data remains active.");
    }
  }

  return (
    <main className="container">
      <header className="header">
        <div className="brand">
          <h1>MicroLend Nexus</h1>
          <p>Connected borrower risk + dynamic repayment + cash-flow planning</p>
        </div>
        <div className="badge">PROTOTYPE • DEMO DATA</div>
      </header>

      <div className="grid">
        <div className="card span-3"><div className="label">Borrowers monitored</div><div className="metric">{borrowers.length}</div><div className="small">Across 2 connected groups</div></div>
        <div className="card span-3"><div className="label">Average risk</div><div className="metric">{avgRisk}/100</div><div className="small">Transparent prototype score</div></div>
        <div className="card span-3"><div className="label">High-risk borrowers</div><div className="metric">{high}</div><div className="small">Priority for early support</div></div>
        <div className="card span-3"><div className="label">Model status</div><div className="metric" style={{fontSize:22}}>ACTIVE</div><div className="small">Demo risk engine + network simulation</div></div>

        <section className="card span-7">
          <div className="section-title">
            <h2>Borrower & group risk map</h2>
            <button className="btn secondary" onClick={testDatasetApi}>Test dataset API</button>
          </div>
          {datasetStatus && <div className="small" style={{marginBottom:10}}>{datasetStatus}</div>}
          <div className="node-list">
            {scored.map(b => (
              <div className="node" key={b.id}>
                <button onClick={()=>setSelected(b)}>
                  <strong>{b.name}</strong> <span className="small">({b.id} • {b.group})</span>
                  <div className="progress"><div style={{width:`${b.score}%`}} /></div>
                </button>
                <span className={`risk ${b.score>=65?"high":b.score>=35?"medium":"low"}`}>{b.score} • {b.risk}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card span-5">
          <div className="section-title"><h2>Selected borrower</h2><span className="badge">{selected.group}</span></div>
          <div className="form-grid">
            <div className="field"><label>Monthly income (₹)</label><input type="number" value={selected.income} onChange={e=>updateBorrower(selected.id,{income:+e.target.value})}/></div>
            <div className="field"><label>Monthly expenses (₹)</label><input type="number" value={selected.expenses} onChange={e=>updateBorrower(selected.id,{expenses:+e.target.value})}/></div>
            <div className="field"><label>Outstanding loan (₹)</label><input type="number" value={selected.loan} onChange={e=>updateBorrower(selected.id,{loan:+e.target.value})}/></div>
            <div className="field"><label>Current payment (₹)</label><input type="number" value={selected.payment} onChange={e=>updateBorrower(selected.id,{payment:+e.target.value})}/></div>
          </div>
          <div className="actions">
            <button className="btn" onClick={()=>setShock(0)}>Reset shock</button>
            <button className="btn danger" onClick={()=>setShock(15)}>Apply 15% income shock</button>
          </div>
          <div className="alert" style={{marginTop:14}}>
            <strong>Interpretation:</strong> {selected.name}'s estimated prototype risk is {riskFor(selected,shock)}/100 ({label(riskFor(selected,shock))}). A group-linked shock can raise risk without assuming the borrower independently deteriorated.
          </div>
        </section>

        <section className="card span-6">
          <div className="section-title"><h2>Dynamic microloan repayment planner</h2></div>
          <div className="form-grid">
            <div className="field"><label>Loan amount (₹)</label><input type="number" value={loan} onChange={e=>setLoan(+e.target.value)}/></div>
            <div className="field"><label>Annual interest (%)</label><input type="number" step="0.1" value={rate} onChange={e=>setRate(+e.target.value)}/></div>
            <div className="field"><label>Term (months)</label><input type="number" min="1" max="60" value={term} onChange={e=>setTerm(+e.target.value)}/></div>
          </div>
          <div className="metric">{money(repayment.p)}<span className="label"> / month</span></div>
          <div className="small">Estimated total repayment: {money(repayment.p*term)}.</div>
          <div style={{height:220,marginTop:12}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repayment.rows}>
                <CartesianGrid strokeDasharray="3 3" opacity={.15}/>
                <XAxis dataKey="month"/><YAxis/><Tooltip/>
                <Legend/><Line type="monotone" dataKey="balance" name="Balance" dot={false}/><Line type="monotone" dataKey="interest" name="Interest" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card span-6">
          <div className="section-title"><h2>Dynamic cash-flow planner</h2></div>
          <div className="form-grid">
            <div className="field"><label>Monthly income (₹)</label><input type="number" value={income} onChange={e=>setIncome(+e.target.value)}/></div>
            <div className="field"><label>Monthly expenses (₹)</label><input type="number" value={expenses} onChange={e=>setExpenses(+e.target.value)}/></div>
            <div className="field"><label>Loan payment (₹)</label><input type="number" value={payment} onChange={e=>setPayment(+e.target.value)}/></div>
          </div>
          <div className="metric">{money(income-expenses-payment)}<span className="label"> / month net cash flow</span></div>
          <div style={{height:220,marginTop:12}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflow}>
                <CartesianGrid strokeDasharray="3 3" opacity={.15}/>
                <XAxis dataKey="month"/><YAxis/><Tooltip/><Legend/>
                <Bar dataKey="net" name="Net cash flow"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card span-12">
          <div className="section-title"><h2>What-if: connected shock and intervention</h2></div>
          <p className="small">Move the shock to demonstrate how a borrower event can propagate through a group, then compare an intervention scenario.</p>
          <div className="actions">
            <button className="btn secondary" onClick={()=>setShock(0)}>No shock</button>
            <button className="btn secondary" onClick={()=>setShock(10)}>10-point shock</button>
            <button className="btn secondary" onClick={()=>setShock(20)}>20-point shock</button>
            <button className="btn" onClick={()=>setShock(-8)}>Targeted support (-8 risk)</button>
          </div>
          <div style={{height:260,marginTop:12}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scored}>
                <CartesianGrid strokeDasharray="3 3" opacity={.15}/>
                <XAxis dataKey="name"/><YAxis domain={[0,100]}/><Tooltip/><Legend/>
                <Bar dataKey="score" name="Risk score"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card span-12">
          <div className="section-title"><h2>Borrower portfolio</h2></div>
          <table>
            <thead><tr><th>ID</th><th>Borrower</th><th>Group</th><th>Income</th><th>Payment</th><th>DTI</th><th>Risk</th></tr></thead>
            <tbody>
              {scored.map(b => <tr key={b.id}>
                <td>{b.id}</td><td>{b.name}</td><td>{b.group}</td><td>{money(b.income)}</td><td>{money(b.payment)}</td>
                <td>{Math.round(b.payment/Math.max(b.income,1)*100)}%</td>
                <td className={`risk ${b.score>=65?"high":b.score>=35?"medium":"low"}`}>{b.score} • {b.risk}</td>
              </tr>)}
            </tbody>
          </table>
        </section>
      </div>

      <div className="footer">
        Prototype only. The risk score is an educational/demo model and is not a validated credit decisioning system.
      </div>
    </main>
  );
}
