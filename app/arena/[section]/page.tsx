import { notFound } from "next/navigation";
import { ArenaPortal } from "@/components/arena/portal";
export default async function Page({ params,searchParams }: { params: Promise<{ section: string }>;searchParams:Promise<{scope?:string;season?:string}> }) {
  const { section } = await params;
  const query=await searchParams;
  const initialScope=["friends","around_me","me"].includes(query.scope || "")?query.scope!:"all";
  if (!["time-attack", "duel", "leaderboard", "friends", "profile", "ranked"].includes(section)) notFound();
  return <ArenaPortal section={section} initialScope={initialScope} initialSeason={typeof query.season==="string"?query.season:undefined}/>;
}
