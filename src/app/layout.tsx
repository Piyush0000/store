import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://d1311wbk6unapo.cloudfront.net" />
        <link rel="dns-prefetch" href="https://d1311wbk6unapo.cloudfront.net" />
        <link rel="preload" as="image" href="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&q=80" />
      </head>
      <body>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}