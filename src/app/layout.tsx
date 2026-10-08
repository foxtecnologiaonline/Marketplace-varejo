import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TopBar } from "@/components/top-bar";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const metadata: Metadata = {
  title: {
    default: "Varejo Marketplace | Uniformes e moda escolar",
    template: "%s | Varejo Marketplace"
  },
  description:
    "Marketplace de uniformes escolares, esportivos e personalizados. Compre direto das lojas parceiras com frete para todo o Brasil."
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
