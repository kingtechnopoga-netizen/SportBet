import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET(){
 const key=process.env.ODDS_API_KEY;
 if(!key)return NextResponse.json({error:"ODDS_API_KEY is not configured."},{status:500});
 const res=await fetch("https://api.the-odds-api.com/v4/sports/?apiKey="+encodeURIComponent(key),{cache:"no-store"});
 const data=await res.json();
 if(!res.ok)return NextResponse.json({error:data?.message||"Sports API request failed."},{status:res.status});
 return NextResponse.json(data);
}