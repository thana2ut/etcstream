import { notFound } from "next/navigation";
import { ArenaPortal } from "@/components/arena/portal";
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[A-Za-z0-9]{6,16}$/.test(code)) notFound();
  return <ArenaPortal section="player" playerCode={code.toUpperCase()} />;
}
