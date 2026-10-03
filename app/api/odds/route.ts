import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(req:NextRequest){
 const key=process.env.ODDS_API_KEY;
 if(!key)return NextResponse.json({error:"ODDS_API_KEY is not configured."},{status:500});
 const {searchParams}=new URL(req.url);
 const sport=searchParams.get("sport")||"upcoming";
 const regions=searchParams.get("regions")||"us";
 const markets=searchParams.get("markets")||"h2h";
 const oddsFormat=searchParams.get("oddsFormat")||"american";
 const url=new URL("https://api.the-odds-api.com/v4/sports/"+encodeURIComponent(sport)+"/odds/");
 url.searchParams.set("apiKey",key);url.searchParams.set("regions",regions);url.searchParams.set("markets",markets);url.searchParams.set("oddsFormat",oddsFormat);
 const res=await fetch(url.toString(),{cache:"no-store"});const data=await res.json();
 const quota={remaining:res.headers.get("x-requests-remaining"),used:res.headers.get("x-requests-used"),last:res.headers.get("x-requests-last")};
 if(!res.ok)return NextResponse.json({error:data?.message||"Odds API request failed.",quota},{status:res.status});
 return NextResponse.json({events:data,quota});
}