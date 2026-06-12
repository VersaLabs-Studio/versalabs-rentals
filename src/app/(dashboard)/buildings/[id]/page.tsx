import { BuildingDetailPage } from "@/features/buildings/building-detail-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BuildingDetailPage id={id} />;
}
