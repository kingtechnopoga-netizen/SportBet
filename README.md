# SportBet

Premium sports and esports odds dashboard built with Next.js and The Odds API.

## Setup
1. Create a The Odds API key.
2. Add `ODDS_API_KEY` to Vercel Environment Variables and local `.env.local` for development.
3. Deploy this repository with Vercel.

The API key is server-side only and is never exposed in the browser bundle.

The sports list is dynamic, so the dashboard displays sports currently returned by The Odds API. Coverage and odds availability depend on the provider and plan.