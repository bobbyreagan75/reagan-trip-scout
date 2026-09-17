# Reagan Trip Scout

Private household travel desk for **Robert & Rhonda Reagan**. This is a personal prototype, not a public product.

It helps the two of you walk a trip from “where / when / constraints” into a cash or points plan, then hand a structured brief to Chief of Staff (email or paste into chat).

## What it is (and is not)

- **Award and cash numbers are pasted, not live-scraped.** Google Flights and seats.aero are opened via deep links. You paste fares, miles, taxes, and seats back into the wizard.
- **AwardWallet is import/edit only.** CSV or manual numbers. No password storage, no session scrape.
- **Household rules are original UI copy** written for this family desk. This repo does **not** contain copyrighted ebook text, charts, or third-party coaching branding.
- Live in-app assistant chat, unofficial scraping, and AwardWallet password sync are out of scope for v1.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

| Script | What it does |
| --- | --- |
| `npm run dev` | Local Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build |
| `npm test` | Unit tests for CPP, ceilings, transfers, CSV, briefs |
| `npm run lint` | Oxlint |

### Login

Shared household passphrase (hashed in the browser, stored only in `localStorage`):

- Default: `scout2026`
- Choose **Robert** or **Rhonda**, then unlock
- Change it anytime under Settings

## Product flow

1. **Where** — a city, or deal-first / anywhere luxury. Domestic U.S. is detected (and can be overridden).
2. **Timeframe** — flexible dates, ± days, 10–14 night default.
3. **Constraints** — party (default 2), cabin goal, early-flight dislike, late OK.
4. **Search**
   - **U.S. domestic → cash only** via Google Flights (ORF home). Points are not offered.
   - **International →** Google Flights (IAD positioning) **and** seats.aero deep links, with paste-back for cash and awards.
5. **Pay** — cash vs points, 1:1 transfer partners, cents-per-point vs cash (≥2¢ floor), mock-book-before-transfer checklist, Amex Membership Rewards before Bilt when both work.
6. **Stay** — Hyatt Globalist lodging bias; Bilt is protected for Hyatt.
7. **Ask Chief of Staff** — human summary + JSON brief, copy, and `mailto:bobbyreagan75@hotmail.com`.

Balances live under **Balances** (seeded from `src/data/household-profile.json`, snapshot dated 14 Sep 2026).

## Cairo SAMPLE demo

On the home desk, click **Load Cairo SAMPLE demo**. It fills:

- Cairo, Egypt · international · IAD positioning · ~12 nights in Nov 2026
- Party of 2, business/first, late OK / skip similar early flights
- **SAMPLE** editable cash paste (EgyptAir-style Google Flights placeholder)
- **SAMPLE** editable award paste (EgyptAir metal / Aeroplan-style miles + taxes — not live availability)

Replace those SAMPLE figures with real pastes before treating the trip as bookable. Mock-book any award before transferring a point.

## Household operating rules (as encoded here)

Original wording only, for this household:

- Hunt the deal first; the city is secondary; luxury in the cabin and the room is the point
- Domestic U.S. flights = cash; points for international luxury (flights + Hyatt)
- Minimum 2¢ per point; never gift cards, portals, statement credits, car rentals, or cruises with flexible points
- Cash ceilings per airborne hour (one-way): $30 / $60 / $90 (coach / premium economy / business-first); double for round-trip
- Mock-book before any transfer; 1:1 transfers only
- Prefer Amex Membership Rewards before Bilt when both reach the same partner; keep Bilt for Hyatt
- ORF domestic home; IAD international positioning; late flights OK; avoid early mornings when similar
- Avoid U.S. summer when possible; typical trip 10–14 days
- Emergency stash ~50,000 points per traveler
- Hyatt Globalist for nearly every stay

## Privacy

Everything persists in this browser (`localStorage` / `sessionStorage`). Optional seats.aero API key in Settings is local-only. Do not deploy this app on a public URL without changing the passphrase.
