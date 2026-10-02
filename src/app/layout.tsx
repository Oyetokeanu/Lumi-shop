import "./globals.css";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/Header";
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const body = Jost({ subsets: ["latin"], variable: "--font-body" });
export const metadata = { title: "Lumi", description: "Creams, perfumes and body lotions." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body className={`${display.variable} ${body.variable}`}>
      <CartProvider><Header />{children}</CartProvider>
    </body></html>
  );
}
