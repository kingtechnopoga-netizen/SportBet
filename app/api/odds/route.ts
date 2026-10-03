import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ApiResult = {
  events: unknown[];
  remaining: number;
  used: number;
};

export async function GET(req: NextRequest) {
  const key = process.env.ODDS_API_KEY;
  if (!key) return NextResponse.json({ error: "ODDS_API_KEY is not configured." }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") || "upcoming";
  const sports = (searchParams.get("sports") || "").split(",").map(s => s.trim()).filter(Boolean);
  const regions = searchParams.get("regions") || "us";
  const markets = searchParams.get("markets") || "h2h";
  const oddsFormat = searchParams.get("oddsFormat") || "american";

  const keys = sports.length ? sports : [sport];

  try {
    const results = await Promise.all(keys.map(async (keyName): Promise<ApiResult> => {
      const url = new URL("https://api.the-odds-api.com/v4/sports/" + encodeURIComponent(keyName) + "/odds/");
      url.searchParams.set("apiKey", key);
      url.searchParams.set("regions", regions);
      url.searchParams.set("markets", markets);
      url.searchParams.set("oddsFormat", oddsFormat);
      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data?.message || `Odds API request failed for ${keyName} (${res.status}).`);
      return {
        events: Array.isArray(data) ? data : [],
        remaining: Number(res.headers.get("x-requests-remaining") || 0),
        used: Number(res.headers.get("x-requests-used") || 0),
      };
    }));

    const events = results.flatMap(r => r.events as any[]);
    const unique = Array.from(new Map(events.map(e => [e.id, e])).values())
      .sort((a: any, b: any) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime());

    return NextResponse.json({
      events: unique,
      quota: {
        remaining: Math.min(...results.map(r => r.remaining)),
        used: Math.max(...results.map(r => r.used)),
        calls: results.length,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load odds." }, { status: 502 });
  }
}