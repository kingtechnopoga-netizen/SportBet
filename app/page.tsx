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
function price(v:number){return Number(v).toFixed(2)}

export default function Home(){
 const [sports,setSports]=useState<Sport[]>([]);const [selected,setSelected]=useState("upcoming");const [events,setEvents]=useState<Event[]>([]);const [loading,setLoading]=useState(true);const [sportLoading,setSportLoading]=useState(true);const [error,setError]=useState("");const [query,setQuery]=useState("");const [region,setRegion]=useState("us");const [market,setMarket]=useState("h2h");const [lastUpdated,setLastUpdated]=useState<Date|null>(null);const [quota,setQuota]=useState<{remaining:number|null;calls:number}>({remaining:null,calls:0});const [status,setStatus]=useState<"all"|"live"|"upcoming">("all");const [bookmaker,setBookmaker]=useState("all");
 const loadSports=useCallback(async()=>{try{setSportLoading(true);const r=await fetch("/api/sports");const d=await r.json();if(!r.ok)throw Error(d.error);setSports(d)}catch(e){setError(e instanceof Error?e.message:"Unable to load sports.")}finally{setSportLoading(false)}},[]);
 const loadOdds=useCallback(async()=>{try{setLoading(true);setError("");const p=new URLSearchParams({regions:region,markets:market,oddsFormat:"decimal"});if(selected==="upcoming")p.set("sports",sports.filter(s=>s.active).map(s=>s.key).join(","));else p.set("sport",selected);const r=await fetch("/api/odds?"+p.toString(),{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setEvents(d.events||[]);setQuota({remaining:d.quota?.remaining??null,calls:d.quota?.calls??1});setLastUpdated(new Date())}catch(e){setEvents([]);setError(e instanceof Error?e.message:"Unable to load real odds.")}finally{setLoading(false)}},[selected,region,market,sports]);
 useEffect(()=>{loadSports()},[loadSports]);useEffect(()=>{if(sports.length)loadOdds()},[sports.length,selected,region,market]);
 const bookmakerNames=useMemo(()=>Array.from(new Set(events.flatMap(e=>e.bookmakers.map(b=>b.title)))).sort(),[events]);const filtered=useMemo(()=>{const q=query.toLowerCase(),now=Date.now();return events.filter(e=>{const t=new Date(e.commence_time).getTime();return (e.home_team+" "+e.away_team+" "+e.sport_title).toLowerCase().includes(q)&&(status==="all"||(status==="live"&&t<=now)||(status==="upcoming"&&t>now))&&(bookmaker==="all"||e.bookmakers.some(b=>b.title===bookmaker))})},[events,query,status,bookmaker]);
 const groupList=groups(sports);const selectedSport=sports.find(s=>s.key===selected);
 return <main className="shell">
  <aside className="sidebar"><div className="brand"><span className="brandMark">SB</span><div><b>SportBet</b><small>ODDS HUB</small></div></div>
   <button className={"allSport "+(selected==="upcoming"?"active":"")} onClick={()=>setSelected("upcoming")}>🔥 <span>All Upcoming</span></button>
   <div className="sportNav">{sportLoading?<div className="sideSkeleton"/>:groupList.map(g=><div key={g} className="sportGroup"><div className="groupTitle">{icons[g]||"🏆"} {g}</div>{sports.filter(s=>s.group===g).map(s=><button key={s.key} className={selected===s.key?"sportBtn selected":"sportBtn"} onClick={()=>setSelected(s.key)}><span>{s.title}</span><em>{s.active?"LIVE":"—"}</em></button>)}</div>)}</div>
   <div className="sideFoot">Powered by The Odds API</div></aside>
  <section className="content"><header className="topbar"><div><span className="eyebrow">SPORTS ODDS DASHBOARD</span><h1>{selected==="upcoming"?"All Sports & Games":selectedSport?.title||"Sports"}</h1><p>Real-time bookmaker odds, refreshed on demand.</p></div><button className="refresh" onClick={loadOdds} disabled={loading}>↻ <span>{loading?"Loading":"Refresh"}</span></button></header>
   <div className="toolbar"><div className="search">⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search teams, leagues, events..." /></div><select value={region} onChange={e=>setRegion(e.target.value)}><option value="us">🇺🇸 US</option><option value="uk">🇬🇧 UK</option><option value="eu">🇪🇺 Europe</option><option value="au">🇦🇺 Australia</option></select><select value={market} onChange={e=>setMarket(e.target.value)}><option value="h2h">Moneyline</option><option value="spreads">Spreads</option><option value="totals">Totals</option></select><select value={bookmaker} onChange={e=>setBookmaker(e.target.value)}><option value="all">All Bookmakers</option>{bookmakerNames.map(b=><option key={b}>{b}</option>)}</select></div><div className="tabs"><button className={status==="all"?"on":""} onClick={()=>setStatus("all")}>All <b>{events.length}</b></button><button className={status==="live"?"on":""} onClick={()=>setStatus("live")}>🔴 Live</button><button className={status==="upcoming"?"on":""} onClick={()=>setStatus("upcoming")}>Upcoming</button></div>
   <div className="status"><span><i/> {sports.length} sports available</span><span>{lastUpdated?"Updated "+lastUpdated.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):"Waiting..."}</span>{quota.remaining!==null&&<span>{quota.remaining} credits • {quota.calls} API calls</span>}</div>
   {error&&<div className="error">⚠ {error}<button onClick={()=>{loadSports();loadOdds()}}>Retry</button></div>}
   {loading?<div className="grid">{Array.from({length:6}).map((_,i)=><div className="card skeletonCard" key={i}/>)}</div>:filtered.length===0?<div className="empty"><div>🏟️</div><h2>No odds found</h2><p>Try another sport, region, market, or search term.</p></div>:<div className="grid">{filtered.map(e=><EventCard event={e} bookmaker={bookmaker} key={e.id}/>)}</div>}
  </section>
 </main>
}
function EventCard({event,bookmaker}:{event:Event;bookmaker:string}){
 const top=(event.bookmakers||[]).filter(b=>bookmaker==="all"||b.title===bookmaker);
 const h2h=top.flatMap(b=>b.markets.filter(m=>m.key==="h2h").flatMap(m=>m.outcomes));
 const favorite=h2h.length?Math.min(...h2h.map(o=>o.price)):null;
 return <article className="card bettingCard">
  <div className="cardHead"><div className="matchInfo"><span className="league">{icons[event.sport_title]||"🏆"} {event.sport_title}</span><div className="teams"><div>{event.home_team}</div><div>{event.away_team}</div></div></div><div className="matchMeta"><time>{formatDate(event.commence_time)}</time><span className="marketCount">{top.reduce((n,b)=>n+b.markets.length,0)} markets</span></div></div>
  <div className="betLabels"><span>OUTCOME</span><span>ODDS</span></div>
  <div className="bookies">{top.length===0?<div className="noBook">No bookmaker odds available for this filter.</div>:top.map(b=><div className="book" key={b.key}><div className="bookName"><span>▣ {b.title}</span><small>{new Date(b.last_update).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}</small></div>{b.markets.map(m=><div key={m.key} className="market"><label>{marketLabel(m.key)}</label><div className="oddsList">{m.outcomes.slice(0,3).map(o=><button className={m.key==="h2h"&&favorite===o.price?"favoriteOdd":""} key={o.name} title={o.name}><span className="oddName">{o.name}</span><b>{price(o.price)}</b>{o.point!==undefined&&<small>{o.point>0?"+":""}{o.point}</small>}{m.key==="h2h"&&favorite===o.price&&<em>FAV</em>}</button>)}</div></div>)}</div>)}</div>
  <div className="cardFoot"><span>{top.length} bookmaker{top.length===1?"":"s"}</span><span>Real odds • The Odds API</span></div>
 </article>
}
