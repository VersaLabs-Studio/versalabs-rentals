import { LeaseDetailPage } from "@/features/leases/lease-detail-page";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeaseDetailPage id={id} />;
}
