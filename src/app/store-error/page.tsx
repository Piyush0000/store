import type { Metadata } from "next";
import StoreErrorView from "./StoreErrorView";

export const metadata: Metadata = {
  title: "Store Not Found | EvoLabs",
};

export default function StoreErrorPage() {
  return <StoreErrorView />;
}
