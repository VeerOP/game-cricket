# 16-0: The Invincibles | Cricket Draft Simulator

A cricket draft and season simulation game adapted from the viral **38-0.app** football model. Built with React 19, Vite, Tailwind CSS v4, HTML5 Canvas, Web Audio API, and Lucide icons.

---

## 🏆 The Core Objective
Achieve an unprecedented, flawless **16-0 undefeated season** in top-flight T20 cricket:
- **14 League Matches** across legendary venues (Wankhede, Chepauk, Chinnaswamy, Eden Gardens, Hyderabad, Ahmedabad)
- **Qualifier 1** (High-stakes playoff clash)
- **The Grand Final** (130,000 capacity Narendra Modi Stadium)

---

## ⚙️ Core Mechanics & Adaptations from 38-0.app

| Feature | 38-0.app (Football) | 16-0: The Invincibles (Cricket) |
| :--- | :--- | :--- |
| **Ultimate Goal** | 38-0-0 Unbeaten Premier League Season | **16-0 Undefeated IPL / World Cup Campaign** |
| **Draft Wheel** | Random Club + Season (1992–Present) | **Franchise / Nation + Iconic Year** (e.g., *RCB 2016*, *CSK 2011*, *MI 2020*, *KKR 2024*, *SRH 2016*, *GT 2022*, *RR 2008*, *India 2011/2024*, *Australia 2003*) |
| **Squad Roster** | 11 Football Positions (GK to ST) | **11 Cricket Roles**: 2 Openers, No.3 Anchor, No.4 Middle Order, No.5 Finisher, Wicketkeeper (Mandatory), Pace All-Rounder, Spin All-Rounder, Specialist Spinner, 2 Strike/Death Pacers |
| **Roster Limitation** | Positional chemistry & ratings | **Max 4 Overseas Players Limit**: Enforces authentic IPL overseas player quota |
| **Captaincy Dynamics** | None / Basic | **Captain (2.0x Multiplier)** and **Vice-Captain (1.5x Multiplier)** with clutch rating boosts |
| **Fantasy Scoring** | None | **Dream11 Scoring System**: Runs, 4s, 6s, 30/50/100 bonuses, Wickets, Bowled/LBW, Maidens, Economy rate, Catches, and Stumpings |
| **Betting & Odds Model** | Basic match win % | **Decimal Betting Odds (e.g. 1.45 vs 2.80)** and live **Win Predictor ("Wasp")** during over-by-over simulation |
| **Venue & Pitch Factors** | Generic home/away | **Pitch Conditions**: Turning tracks (Chepauk/Ekana), High-scoring highways (Chinnaswamy/Hyderabad), Seaming decks (Ahmedabad/Mullanpur) |
| **Pro IQ Mode** | Expert Mode (hidden ratings) | **Pro IQ Mode**: Ratings & stats hidden; draft using pure cricket knowledge and memory of player seasons |
| **Audio & SFX** | Static / External audio | **Zero-Dependency Web Audio API**: Bat cracks, wicket timber shatter, crowd cheers, boundary horns, and wheel tick sounds |

---

## 🚀 Running the Project

```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start the local development server
npm run dev

# 3. Open in browser:
http://localhost:5173
```

---

## 📱 Tech Stack
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 + Custom Sports Typography (`Chakra Petch`, `Inter`)
- **Animation & Canvas:** HTML5 Canvas wheel with cubic ease-out deceleration & `canvas-confetti`
- **Audio:** Web Audio API synthesized procedural sounds (no broken audio files or CORS issues)
- **Icons:** `lucide-react`
