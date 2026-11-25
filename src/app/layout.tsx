import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import FakeSalesPopup from "@/components/FakeSalesPopup";
import FloatingLogo from "@/components/FloatingLogo";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollObserver from "@/components/ScrollObserver";
import ScrollManager from "@/components/ScrollManager";

import { fetchCataloguePage, fetchStorefront } from "@/lib/api";
import { extractPixelId } from "@/lib/pixel";
import MetaPixel from "@/components/MetaPixel";
import { getServerSubdomain, getServerStoreId } from "@/lib/server-utils";
import Image from "next/image";
import dynamic from "next/dynamic";
import PreviewBridge from "@/components/PreviewBridge";

const FestivalExperience = dynamic(() => import("@/components/FestivalExperience"));
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { CustomerAiMount } from "@/features/customer-ai/components/customer-ai-mount";


export async function generateMetadata(): Promise<Metadata> {
  try {
    const subdomain = await getServerSubdomain();
    const storeId = await getServerStoreId();
    const data = await fetchStorefront(subdomain, storeId, { includeProducts: false, includeLegal: false });
    const store = data?.store;
    const customization = data?.customization;
    const storeName = store?.name || "Store";
    const title = customization?.metaTitle || storeName;
    const description = customization?.metaDescription || store?.description || "";
    const logoUrl = customization?.logo || "";

    return {
      title: { default: title, template: `%s | ${storeName}` },
      description,
      openGraph: {
        title,
        description,
        images: logoUrl ? [{ url: logoUrl }] : [],
      },
    };
  } catch {
    return {
      title: "Store",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let customization = null;
  let storeName = "";
  let storeSubdomain = "";
  let products: any[] = [];
  try {
    const subdomain = await getServerSubdomain();
    const storeId = await getServerStoreId();
    const data = await fetchStorefront(subdomain, storeId, { includeProducts: false, includeLegal: false });
    customization = data.customization;
    storeName = data.store?.name || "";
    storeSubdomain = data.store?.subdomain || subdomain;
    products = data.products || [];
    if (customization?.fakeSalesPopup?.enabled) {
      try {
        products = (await fetchCataloguePage(subdomain, storeId, { limit: 8 })).products;
      } catch (popupErr) {
        console.warn("[RootLayout] Failed to fetch fake sales popup products:", popupErr);
      }
    }
  } catch (err: any) {
    if (
      err &&
      (err.digest === "DYNAMIC_SERVER_USAGE" ||
        String(err.message).includes("Dynamic server usage"))
    ) {
      throw err;
    }
    console.error(
      "[RootLayout] Failed to fetch storefront customization:",
      err,
    );
    throw err;
  }

  let headerStyle = customization?.headerStyle;
  if (headerStyle && typeof headerStyle === "string") {
    try {
      headerStyle = JSON.parse(headerStyle);
    } catch (err) {}
  }

  const faviconUrl =
    customization?.favicon || headerStyle?.faviconUrl || "/favicon.svg";
  const pixelId = customization?.metaPixel
    ? extractPixelId(customization.metaPixel)
    : null;

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('scrollRestoration' in history){history.scrollRestoration='manual';}`,
          }}
        />
        <link rel="icon" href={faviconUrl} />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://d1311wbk6unapo.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d1311wbk6unapo.cloudfront.net" />
        {pixelId && (
          <noscript>
            <Image
              height={1}
              width={1}
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt="fb image"
            />
          </noscript>
        )}
      </head>
      <body>
        <ScrollManager />
        <SmoothScroll />
        <ScrollObserver />
        {pixelId && <MetaPixel pixelId={pixelId} />}
        <PreviewBridge initialCustomization={customization} />
        {customization?.festivalTheme?.enabled && (
          <FestivalExperience initialTheme={customization.festivalTheme} />
        )}
        <WishlistProvider>
          <AnalyticsProvider
            customization={customization}
            storeSubdomain={storeSubdomain}
          >
            <CartProvider>
              <CartDrawer />
              <AnnouncementBar
                initialCustomization={customization}
                storeSubdomain={storeSubdomain}
              />
              <Header
                initialCustomization={customization}
                storeName={storeName}
                storeSubdomain={storeSubdomain}
              />
              <main>{children}</main>
              {customization?.fakeSalesPopup?.enabled && (
                <FakeSalesPopup
                  config={customization.fakeSalesPopup}
                  products={products}
                />
              )}
              {customization?.floatingLogo?.enabled && (
                <FloatingLogo config={customization.floatingLogo} />
              )}
              <Footer
                initialCustomization={customization}
                storeName={storeName}
                storeSubdomain={storeSubdomain}
              />
              <BottomNav />
              <CustomerAiMount
                subdomain={storeSubdomain}
                storeName={storeName}
                brandColor={customization?.brandColors?.primary}
              />
            </CartProvider>
          </AnalyticsProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
