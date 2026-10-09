import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TopBar } from "@/components/top-bar";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const metadata: Metadata = {
  title: {
    default: "Blue Malharia | Uniformes e moda em malha",
    template: "%s | Blue Malharia"
  },
  description:
    "Blue Malharia — uniformes escolares, esportivos e personalizados direto da malharia, com frete para todo o Brasil."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <TopBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
