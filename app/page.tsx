"use client";
import {useCallback,useEffect,useMemo,useState} from "react";

type Sport={key:string;group:string;title:string;description?:string;active:boolean;has_outrights:boolean};
type Outcome={name:string;price:number;point?:number};
type Market={key:string;outcomes:Outcome[]};
type Bookmaker={key:string;title:string;last_update:string;markets:Market[]};
type Event={id:string;sport_key:string;sport_title:string;commence_time:string;home_team:string;away_team:string;bookmakers:Bookmaker[]};

const icons:Record<string,string>={Football:"⚽",Basketball:"🏀",Baseball:"⚾",Hockey:"🏒",Tennis:"🎾","American Football":"🏈","Aussie Rules":"🏉","Ice Hockey":"🏒",Boxing:"🥊",Cricket:"🏏",Golf:"⛳",Rugby:"🏉","Table Tennis":"🏓",Volleyball:"🏐",Motorsport:"🏎️","Mixed Martial Arts":"🥋",Esports:"🎮"};
const groups=(sports:Sport[])=>Array.from(new Set(sports.map(s=>s.group))).sort();
function formatDate(v:string){return new Date(v).toLocaleString(undefined,{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}
function marketLabel(k:string){return k==="h2h"?"Moneyline":k==="spreads"?"Spread":k==="totals"?"Totals":k.replaceAll("_"," ")}
function price(v:number){return v>0?"+"+v:String(v)}

export default function Home(){
 const [sports,setSports]=useState<Sport[]>([]);const [selected,setSelected]=useState("upcoming");const [events,setEvents]=useState<Event[]>([]);const [loading,setLoading]=useState(true);const [sportLoading,setSportLoading]=useState(true);const [error,setError]=useState("");const [query,setQuery]=useState("");const [region,setRegion]=useState("us");const [market,setMarket]=useState("h2h");const [lastUpdated,setLastUpdated]=useState<Date|null>(null);const [quota,setQuota]=useState<{remaining:string|null}>({remaining:null});
 const loadSports=useCallback(async()=>{try{setSportLoading(true);const r=await fetch("/api/sports");const d=await r.json();if(!r.ok)throw Error(d.error);setSports(d)}catch(e){setError(e instanceof Error?e.message:"Unable to load sports.")}finally{setSportLoading(false)}},[]);
 const loadOdds=useCallback(async()=>{try{setLoading(true);setError("");const r=await fetch("/api/odds?sport="+encodeURIComponent(selected)+"&regions="+region+"&markets="+market+"&oddsFormat=american",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setEvents(d.events||[]);setQuota({remaining:d.quota?.remaining??null});setLastUpdated(new Date())}catch(e){setEvents([]);setError(e instanceof Error?e.message:"Unable to load odds.")}finally{setLoading(false)}},[selected,region,market]);
 useEffect(()=>{loadSports()},[loadSports]);useEffect(()=>{loadOdds()},[loadOdds]);
 const filtered=useMemo(()=>events.filter(e=>(e.home_team+" "+e.away_team+" "+e.sport_title).toLowerCase().includes(query.toLowerCase())),[events,query]);
 const groupList=groups(sports);const selectedSport=sports.find(s=>s.key===selected);
 return <main className="shell">
  <aside className="sidebar"><div className="brand"><span className="brandMark">SB</span><div><b>SportBet</b><small>ODDS HUB</small></div></div>
   <button className={"allSport "+(selected==="upcoming"?"active":"")} onClick={()=>setSelected("upcoming")}>🔥 <span>All Upcoming</span></button>
   <div className="sportNav">{sportLoading?<div className="sideSkeleton"/>:groupList.map(g=><div key={g} className="sportGroup"><div className="groupTitle">{icons[g]||"🏆"} {g}</div>{sports.filter(s=>s.group===g).slice(0,12).map(s=><button key={s.key} className={selected===s.key?"sportBtn selected":"sportBtn"} onClick={()=>setSelected(s.key)}><span>{s.title}</span><em>{s.active?"LIVE":"—"}</em></button>)}</div>)}</div>
   <div className="sideFoot">Powered by The Odds API</div></aside>
  <section className="content"><header className="topbar"><div><span className="eyebrow">SPORTS ODDS DASHBOARD</span><h1>{selected==="upcoming"?"All Upcoming Events":selectedSport?.title||"Sports"}</h1><p>Real-time bookmaker odds, refreshed on demand.</p></div><button className="refresh" onClick={loadOdds} disabled={loading}>↻ <span>{loading?"Loading":"Refresh"}</span></button></header>
   <div className="toolbar"><div className="search">⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search teams, leagues, events..." /></div><select value={region} onChange={e=>setRegion(e.target.value)}><option value="us">🇺🇸 US Bookmakers</option><option value="uk">🇬🇧 UK Bookmakers</option><option value="eu">🇪🇺 Europe</option></select><select value={market} onChange={e=>setMarket(e.target.value)}><option value="h2h">Moneyline</option><option value="spreads">Spreads</option><option value="totals">Totals</option></select></div>
   <div className="status"><span><i/> {sports.length} sports available</span><span>{lastUpdated?"Updated "+lastUpdated.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"Waiting..."}</span>{quota.remaining&&<span>{quota.remaining} API credits left</span>}</div>
   {error&&<div className="error">⚠ {error}<button onClick={()=>{loadSports();loadOdds()}}>Retry</button></div>}
   {loading?<div className="grid">{Array.from({length:6}).map((_,i)=><div className="card skeletonCard" key={i}/>)}</div>:filtered.length===0?<div className="empty"><div>🏟️</div><h2>No odds found</h2><p>Try another sport, region, market, or search term.</p></div>:<div className="grid">{filtered.map(e=><EventCard event={e} key={e.id}/>)}</div>}
  </section>
 </main>
}
function EventCard({event}:{event:Event}){const bookmakers=event.bookmakers||[];const top=bookmakers.slice(0,4);return <article className="card"><div className="cardHead"><div><span className="league">{icons[event.sport_title]||"🏆"} {event.sport_title}</span><h2>{event.home_team}<span> vs </span>{event.away_team}</h2></div><time>{formatDate(event.commence_time)}</time></div><div className="bookies">{top.map(b=><div className="book" key={b.key}><div className="bookName">{b.title}</div>{b.markets.map(m=><div key={m.key} className="market"><label>{marketLabel(m.key)}</label><div className="oddsRow">{m.outcomes.slice(0,3).map(o=><button key={o.name} title={o.name}><span>{o.name}</span><b>{price(o.price)}</b>{o.point!==undefined&&<small>{o.point>0?"+":""}{o.point}</small>}</button>)}</div></div>)}</div>)}</div><div className="cardFoot"><span>{bookmakers.length} bookmaker{bookmakers.length===1?"":"s"}</span><span>Updated {bookmakers[0]?new Date(bookmakers[0].last_update).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"—"}</span></div></article>}