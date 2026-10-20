import { ArenaPlay } from "@/components/arena/play";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ArenaPlay id={id} />; }
