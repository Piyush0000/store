"use client";

import dynamic from "next/dynamic";

const CustomerAiWidget = dynamic(() => import("./customer-ai-widget"), { ssr: false });

export function CustomerAiMount(props: { subdomain: string; storeName: string; brandColor?: string }) {
  return <CustomerAiWidget {...props} />;
}
