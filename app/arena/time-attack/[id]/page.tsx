import { ArenaPlay } from "@/components/arena/play";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ duel?: string }> }) {
  const { id } = await params, { duel } = await searchParams;
  return <ArenaPlay id={id} duelId={typeof duel === "string" && /^[0-9a-f-]{36}$/.test(duel) ? duel : undefined} />;
}
