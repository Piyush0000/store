import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

console.log('[LAYOUT] RootLayout rendering');

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('[LAYOUT] Children:', children ? 'present' : 'missing');
  console.log('[LAYOUT] Wrapping with: CartProvider > AnnouncementBar > Header > main > Footer');

  return (
    <html lang="en">
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