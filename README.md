# War Oil Crisis Simulator (WOC-Simulator)

Web deployment of the WOC-Simulator (Ruiz Estrada et al., 2020 — Borsa Istanbul Review). Run oil price simulations under conflict scenarios.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy via GitHub + Vercel

1. **Create a new repo on GitHub**  
   Go to [github.com/new](https://github.com/new), name it e.g. `woc-simulator`, leave it empty (no README/license).

2. **Push this project** (from the project folder):

   ```bash
   git init
   git add .
   git commit -m "Initial commit: WOC Simulator"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/woc-simulator.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

3. **Connect to Vercel**  
   Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → **Import** your `woc-simulator` repo. Keep the default settings and click **Deploy**.

4. Your app will be live at `https://woc-simulator-xxx.vercel.app` (or your custom domain). Every push to `main` will trigger a new deployment.

### Deploy from CLI (alternative)

```bash
npm i -g vercel
vercel
```

## API

- **POST /api/simulate** — Run simulation.  
  Body: `{ "op": 58, "scenario": "war_escalation" }` (optional).  
  Returns `{ result, scenarios }`.

- **GET /api/simulate** — Returns default simulation (Op=58, war escalation scenario).
