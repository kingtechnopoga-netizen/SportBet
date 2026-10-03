import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "SportBet — Live Sports Odds", description: "Sports and esports odds dashboard powered by The Odds API" };

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}