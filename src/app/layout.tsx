import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import CartDrawer from "@/components/CartDrawer";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import Script from "next/script";
import { Inter, Playfair_Display } from "next/font/google";
import PageLoader from "@/components/PageLoader";

import { fetchStorefront } from "@/lib/api";
import { getServerSubdomain } from "@/lib/server-utils";
import PreviewBridge from "@/components/PreviewBridge";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";
  const payuScriptUrl = isDev
    ? "https://jssdk-uat.payu.in/bolt/bolt.min.js"
    : "https://jssdk.payu.in/bolt/bolt.min.js";

  let customization = null;
  let storeName = "";
  try {
    const subdomain = await getServerSubdomain();
    const data = await fetchStorefront(subdomain);
    customization = data.customization;
    storeName = data.store?.name || "";
  } catch (err) {
    console.error("[RootLayout] Failed to fetch storefront customization:", err);
  }

  let headerStyle = customization?.headerStyle;
  if (headerStyle && typeof headerStyle === 'string') {
    try { headerStyle = JSON.parse(headerStyle); } catch (err) {}
  }

  const faviconUrl = customization?.favicon || headerStyle?.faviconUrl || "/favicon.svg";

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={faviconUrl} />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://d1311wbk6unapo.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d1311wbk6unapo.cloudfront.net" />
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80" />
      </head>
      <body className={`${inter.variable} ${playfair.variable}`}>
        <PageLoader />
        <PreviewBridge initialCustomization={customization} />
        <Script
          src={payuScriptUrl}
          strategy="afterInteractive"
          id="payu-bolt"
        />
        <WishlistProvider>
          <CartProvider>
            <CartDrawer />
            <AnnouncementBar initialCustomization={customization} />
            <Header initialCustomization={customization} storeName={storeName} />
            <main>{children}</main>
            <Footer initialCustomization={customization} storeName={storeName} />
            <BottomNav />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
