import WealthApp from "@/components/WealthApp";
import { assetTypes } from "@/lib/wealth";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const type = assetTypes.find((t) => t.slug === category);
  if (!type) notFound();
  return <WealthApp view="add" initialType={type.type} />;
}
