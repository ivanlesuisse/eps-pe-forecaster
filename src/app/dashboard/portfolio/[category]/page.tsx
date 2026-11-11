import WealthApp from "@/components/WealthApp";
import { assetTypes } from "@/lib/wealth";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const aliases: Record<string, string> = {
    stocks: "INVESTMENT",
    savings: "BANKING",
    checking: "BANKING",
    metals: "COMMODITY",
  };
  const type =
    aliases[category] || assetTypes.find((t) => t.slug === category)?.type;
  if (!type) notFound();
  return <WealthApp view="portfolio" category={type} />;
}
