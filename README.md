# MicroLend Nexus — Prototype

A presentation-ready prototype for modelling connected microfinance risk and combining it with:

- Individual borrower risk assessment
- Group/network contagion simulation
- Dynamic microloan repayment planning
- Cash-flow planning and affordability checks
- What-if interventions
- Optional Hugging Face Dataset Viewer API connector

## 1. Run locally

Requirements:
- Node.js 18.18+ (Node.js 20+ recommended)
- Git

Then:

```bash
npm install
npm run dev
```

Open:

http://localhost:3000

## 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial MicroLend prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/microlend-prototype.git
git push -u origin main
```

If the repository already exists and has a remote:

```bash
git add .
git commit -m "Update prototype"
git push
```

## 3. Deploy to Vercel

Import the GitHub repository into Vercel. The project is already configured as a Next.js application.

No database is required for this prototype. The demo data is stored in the source code so the prototype works immediately.

Optional environment variables:
- `HF_DATASET_NAME`
- `HF_TOKEN`

The `/api/dataset` endpoint demonstrates how the prototype can call the Hugging Face Dataset Viewer API. For a real system, training data should be validated, licensed, versioned and processed offline rather than fetched during every user request.

## 4. Prototype architecture

Browser
  -> Next.js UI
  -> Next.js Route Handlers
      -> risk/contagion engine
      -> repayment calculator
      -> cash-flow planner
      -> Hugging Face dataset connector

The risk engine is deliberately transparent and presentation-friendly. It is NOT a production credit model and must not be used for real lending decisions.

## 5. ML extension

`scripts/train_model.py` is an optional starter training script. It shows the intended path for replacing the transparent demo scorer with a scikit-learn model after a properly licensed dataset has been obtained.

For a real deployment, the trained model should be versioned and served through a dedicated inference service or suitable model-serving platform.
