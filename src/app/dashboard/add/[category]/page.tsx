"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic imports for each category
const categoryComponents: Record<string, React.ComponentType> = {
  banking: dynamic(() => import("../banking").then(mod => ({ default: mod.default })), { ssr: false }),
  investment: dynamic(() => import("../investment").then(mod => ({ default: mod.default })), { ssr: false }),
  crypto: dynamic(() => import("../crypto").then(mod => ({ default: mod.default })), { ssr: false }),
  "real-estate": dynamic(() => import("../realestate").then(mod => ({ default: mod.default })), { ssr: false }),
  commodity: dynamic(() => import("../commodity").then(mod => ({ default: mod.default })), { ssr: false }),
  startup: dynamic(() => import("../startup").then(mod => ({ default: mod.default })), { ssr: false }),
  other: dynamic(() => import("../other").then(mod => ({ default: mod.default })), { ssr: false }),
};

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;

  const Component = categoryComponents[category];

  if (!Component) {
    notFound();
  }

  return <Component />;
}
