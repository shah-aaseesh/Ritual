# Ritual — Know what works. Build what sticks.

Ritual is an evidence-first, mobile-first consumer wellness web application designed for consumers (specifically Indian consumers aged 18–35) navigating hair, body-care, and sleep wellness.

Ritual cuts through marketing hyperbole by decoding the scientific literature behind cosmetic & supplement formulations, organizing existing products, building sustainable routines, and rescuing habits when consistency drops.

---

## 🌿 Core Features

1. **Onboarding Flow**:
   - Captures user's name, primary goal (*Improve hair health*, *Build a body-care routine*, *Sleep and recover better*), daily time commitment (*2 min*, *5 min*, *10 min*), and current product ownership status.
   - Persisted seamlessly via LocalStorage.

2. **Today Screen**:
   - Personal greeting and current wellness goal.
   - Today's routine adherence ring tracker.
   - Primary "Scan a Product" hero action card.
   - Interactive Morning & Evening routine checklist.
   - 7-Day consistency progress summary.
   - Contextual scientific insight (e.g. follicular cycle duration or BHA contact time) rather than generic motivational fluff.
   - Quick one-click switch between **Demo Profile (Aarav)** and **Clean State**.

3. **Label Lens (Hero Feature)**:
   - Front packaging scan + ingredient label scan (camera or image upload via browser OCR).
   - 3 rich sample labels across **Hair Wellness**, **Body Care**, and **Sleep Support**.
   - Manual text paste & live real-time editing.
   - **Recognized Ingredients Breakdown**: Plain-language purpose, goal relevance, evidence tier (*Strong evidence*, *Conditional evidence*, *Promising but limited*, *Supporting ingredient*, *Insufficient information*), dose disclosure evaluation, and clickable PubMed / clinical trial links.
   - **Front-Pack Claim Analysis**: Evaluates claims (*Clinically proven*, *Natural*, *Chemical-free*, *Detox*, *Dermatologist tested*, *Boosts immunity*, *Advanced formula*, *Clean*, *Doctor recommended*) with plain-language definitions, missing clinical data, and verdicts (*Supported*, *Partially supported*, *Too vague to verify*, *Marketing-heavy*).
   - **4-Pillar Evaluation Matrix** (no single misleading health score):
     - Goal Relevance
     - Evidence Quality
     - Dose Transparency
     - Claim Credibility
   - Natural language synthesis summary and prominent scientific transparency disclaimer.
   - One-click **Save to Smart Shelf**.

4. **Smart Shelf**:
   - Inventory of saved products with category, AM/PM timing, active ingredients, and evidence summaries.
   - **Active Ingredient Duplication Detector**: Neutrally alerts when multiple products contain the same active (e.g., Salicylic Acid or Melatonin) to review cumulative application.
   - Full search, category filter, manual product addition, editing, and deletion.

5. **Routine Builder & Subtle Mosaic Integration**:
   - Generates morning and evening rituals based on user goals, daily time, and Smart Shelf inventory.
   - Combines product applications with healthy non-commercial habit steps (Hydration, Scalp massage, UV shield, Screen wind-down).
   - Interactive step reordering (up/down), step editing, adding custom steps, and AM/PM switching.
   - **Subtle Mosaic Wellness Integration**: An optional section ("Products that may fit this step") displayed only after routine creation. Brand-neutral, with "Use a product I already own" prioritized first, transparent scientific explanations of why the product fits, official links to Be Bodywise, Man Matters, and Root Labs, and a Little Joys family wellness preview.

6. **Progress Journal**:
   - 7-Day interactive consistency trend chart.
   - Daily Check-In logger (Mood rating, Energy level, Subjective observation note, and optional local Progress Photo thumbnail).
   - Observation timeline using neutral wording (*"You recorded..."*, *"You observed..."*).

7. **Routine Rescue**:
   - Contextual helper triggered when adherence drops or tested via the reviewer toolbar.
   - Warm, supportive message: *"You planned a lot. Let’s make it easier."*
   - Generates a **Minimum Viable Routine (MVR)** with at most 1 morning step, 1 evening step, and 5 minutes total.

---

## 🔬 Safety & Evidence Principles

- **Brand Neutrality**: Every product and active is evaluated against the same clinical literature without brand bias.
- **Qualified Language**: Never diagnoses medical conditions, prescribes medication, or fabricates approval statistics. Uses qualified scientific phrasing (*"Evidence supports this use under certain conditions"*, *"The label does not disclose enough information to assess dose"*).
- **Respect for Ingredients**: Ingredients themselves are never termed "gimmicks"; criticism applies solely to exaggerated claims or dosage non-transparency.
- **Visible Disclaimers**: Every screen features transparent notices clarifying that Ritual provides published evidence summaries and does not replace qualified dermatological or medical consultation.

---

## 📂 Project Architecture

```
src/
├── types/
│   └── index.ts                  # Core TypeScript types & data schemas
├── data/
│   ├── ingredientsDb.ts          # 24+ validated wellness ingredients & PubMed sources
│   ├── claimsDb.ts               # Packaging claims registry & regex detection
│   ├── sampleProducts.ts         # 3 sample labels (Hair, Body, Sleep)
│   ├── mosaicProducts.ts         # Contextual Mosaic product catalog & Little Joys preview
│   └── demoState.ts              # Pre-configured demo state & missed days simulator
├── services/
│   ├── analyzer.ts               # Label Lens 4-dimension analyzer & browser OCR engine
│   └── routineGenerator.ts       # Routine creation & Routine Rescue algorithms
├── context/
│   └── AppContext.tsx            # Global state, LocalStorage sync, toast notifications
├── components/
│   ├── common/                   # Header, BottomNav, EvidenceBadge, VerdictBadge, Disclaimer
│   ├── demo/                     # Reviewer demo control bar (Demo/Clean/Rescue toggle)
│   ├── onboarding/               # 4-step onboarding flow
│   ├── today/                    # Today dashboard & routine checklist
│   ├── labellens/                # Hero Label Lens analysis view
│   ├── smartshelf/               # Smart Shelf & duplication detector
│   ├── routine/                  # Routine Builder & optional product suggestions
│   ├── progress/                 # Consistency chart & observation journal
│   └── rescue/                   # Routine Rescue simplification modal
├── App.tsx                       # Main layout with mobile/wide view switcher
└── main.tsx                      # Vite React entrypoint
```

---

## 🚀 Running the Application Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (verifies analyzer, evidence database & routine engine)
npx tsx test_suite.js

# 3. Start development server
npm run dev
```

The application will be live at `http://localhost:5173/`.

---

## 📦 Production Build & Deployment

To generate a static bundle ready for deployment on Vercel, Netlify, Cloudflare Pages, or GitHub Pages:

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The static output will be located in the `dist/` directory and requires zero backend server configuration.
